'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, getExpectedAuthToken } from '@/app/api/admin-auth/route';
import {
  HOLO_KOUSHIEN_EVENT_ID,
  JUMP_KING_EVENT_ID,
  YUBI_SUMO_EVENT_ID,
  getValidChoicesForEvent,
  calculateDynamicEventPool,
  calculateJumpKingPool,
  calculatePrizePerWinner,
  normalizeEventChoice,
} from '@/utils/eventDeadline';
import { revalidatePath } from 'next/cache';
import { patchSpecialEventSchemaIfNeeded } from '@/lib/specialEvent';

/**
 * 管理員確認冠軍並發放獎金
 */
export async function settleChampionAction(eventId: string = YUBI_SUMO_EVENT_ID, champion: string) {
  // 1. 驗證管理員身份
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (sessionToken !== getExpectedAuthToken()) {
    return { success: false, error: '未授權的管理員操作。' };
  }

  // 2. 驗證選項（相容前綴或別名）
  const normalizedChampion = normalizeEventChoice(champion);
  const validChoices = getValidChoicesForEvent(eventId);
  if (!validChoices.includes(normalizedChampion)) {
    return { success: false, error: `無效的優勝選項：${champion}` };
  }

  // 3. 事務處理：防重複結算、發放獎金、紀錄日誌
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 檢查是否已結算
      const existing = await tx.specialEvent.findUnique({
        where: { id: eventId },
      });

      if (existing && existing.isSettled) {
        throw new Error(`該企劃已於 ${existing.settledAt?.toLocaleString('zh-TW')} 結算公佈，無法重複結算。`);
      }

      const isSpecialPriorityChoice =
        eventId === YUBI_SUMO_EVENT_ID &&
        normalizedChampion === 'PekoViVi決賽對決（優先選項）';

      // 找出所有獲獎者：若開出優先選項，則為所有參與預測者；否則為猜中該選項者（相容校正前之選字）
      const winningPredictions = isSpecialPriorityChoice
        ? await tx.eventPrediction.findMany({
            where: { eventId },
          })
        : await tx.eventPrediction.findMany({
            where: {
              eventId,
              OR: [
                { choice: normalizedChampion },
                ...(normalizedChampion === '兎田ぺこら初戰敗退' ? [{ choice: '兎田ぺこら初戰敗隊' }] : []),
              ],
            },
          });

      const winnerCount = winningPredictions.length;
      let prizePerUser = 0;
      let totalPayout = 0;

      if (isSpecialPriorityChoice) {
        // 開出優先選項時參加者全員給予 1,000 $TEE
        prizePerUser = 1000.0;
        totalPayout = winnerCount * 1000.0;
      } else if (eventId === YUBI_SUMO_EVENT_ID || eventId === JUMP_KING_EVENT_ID) {
        const totalPredictions = await tx.eventPrediction.count({ where: { eventId } });
        const totalPool = calculateDynamicEventPool(totalPredictions);
        prizePerUser = calculatePrizePerWinner(totalPool, winnerCount);
        totalPayout = winnerCount * prizePerUser;
      } else {
        prizePerUser = existing?.prize || 500.0;
        totalPayout = winnerCount * prizePerUser;
      }

      // 發放獎金給每位猜中者 (若 prizePerUser > 0)
      if (prizePerUser > 0) {
        for (const pred of winningPredictions) {
          // 加值使用者的 UserAccount
          await tx.userAccount.upsert({
            where: { userId: pred.userId },
            create: {
              userId: pred.userId,
              balance: 10000.0 + prizePerUser,
            },
            update: {
              balance: { increment: prizePerUser },
            },
          });

          // 記錄發放日誌 (具備 @@unique([eventId, userId]) 防重複發放)
          await tx.eventRewardLog.upsert({
            where: {
              eventId_userId: {
                eventId,
                userId: pred.userId,
              },
            },
            create: {
              eventId,
              userId: pred.userId,
              amount: prizePerUser,
              choice: normalizedChampion,
            },
            update: {
              amount: prizePerUser,
              choice: normalizedChampion,
            },
          });
        }
      }

      const defaultTitle = eventId === YUBI_SUMO_EVENT_ID
        ? 'ゆび相撲大会 預測'
        : eventId === JUMP_KING_EVENT_ID
        ? 'JUMP KING HOLORACE 優勝者到達地點預測'
        : 'ホロライブ甲子園2026 冠軍預測';

      // 更新 SpecialEvent 狀態
      const settledEvent = await tx.specialEvent.upsert({
        where: { id: eventId },
        create: {
          id: eventId,
          title: existing?.title || defaultTitle,
          prize: prizePerUser,
          winningChoice: normalizedChampion,
          isSettled: true,
          settledAt: new Date(),
          winnerCount,
          totalPayout,
        },
        update: {
          winningChoice: normalizedChampion,
          prize: prizePerUser,
          isSettled: true,
          settledAt: new Date(),
          winnerCount,
          totalPayout,
        },
      });

      return {
        winnerCount,
        totalPayout,
        winningChoice: champion,
        settledAt: settledEvent.settledAt,
      };
    });

    revalidatePath('/events');
    revalidatePath('/quantum-nexus-77/events');

    return {
      success: true,
      data: result,
    };
  } catch (err: any) {
    console.error('[Admin Settle Champion Error]:', err);
    return {
      success: false,
      error: err.message || '結算發放過程中發生錯誤。',
    };
  }
}

/**
 * 管理員手動開關企劃截止鎖定
 */
export async function toggleEventLockAction(eventId: string = YUBI_SUMO_EVENT_ID, lock: boolean) {
  // 1. 驗證管理員身份
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (sessionToken !== getExpectedAuthToken()) {
    return { success: false, error: '未授權的管理員操作。' };
  }

  try {
    const existing = await prisma.specialEvent.findUnique({
      where: { id: eventId },
    });

    if (existing && existing.isSettled) {
      return { success: false, error: '該企劃已結算，無法再變更鎖定狀態。' };
    }

    const defaultTitle = eventId === YUBI_SUMO_EVENT_ID
      ? 'ゆび相撲大会 預測'
      : eventId === JUMP_KING_EVENT_ID
      ? 'JUMP KING HOLORACE 優勝者到達地點預測'
      : 'ホロライブ甲子園2026 冠軍預測';

    const updated = await prisma.specialEvent.upsert({
      where: { id: eventId },
      create: {
        id: eventId,
        title: existing?.title || defaultTitle,
        isLocked: lock,
        lockedAt: lock ? new Date() : null,
      },
      update: {
        isLocked: lock,
        lockedAt: lock ? new Date() : null,
      },
    });

    revalidatePath('/events');
    revalidatePath('/quantum-nexus-77/events');

    return {
      success: true,
      isLocked: updated.isLocked,
      lockedAt: updated.lockedAt,
    };
  } catch (err: any) {
    console.error('[Admin Toggle Lock Error]:', err);
    return {
      success: false,
      error: err.message || '更新鎖定狀態時發生錯誤。',
    };
  }
}

/**
 * 管理員切換特別企劃歸檔狀態
 */
export async function toggleEventArchiveAction(eventId: string = YUBI_SUMO_EVENT_ID, archive: boolean) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (sessionToken !== getExpectedAuthToken()) {
    return { success: false, error: '未授權的管理員操作。' };
  }

  try {
    await patchSpecialEventSchemaIfNeeded();

    const existing = await prisma.specialEvent.findUnique({
      where: { id: eventId },
    });

    const defaultTitle = eventId === YUBI_SUMO_EVENT_ID
      ? 'ゆび相撲大会 預測'
      : eventId === JUMP_KING_EVENT_ID
      ? 'JUMP KING HOLORACE 優勝者到達地點預測'
      : 'ホロライブ甲子園2026 冠軍預測';

    const updated = await prisma.specialEvent.upsert({
      where: { id: eventId },
      create: {
        id: eventId,
        title: existing?.title || defaultTitle,
        isLocked: archive ? true : false,
        isArchived: archive,
      },
      update: {
        isArchived: archive,
        ...(archive ? { isLocked: true } : {}),
      },
    });

    revalidatePath('/events');
    revalidatePath('/quantum-nexus-77/events');
    revalidatePath('/quantum-nexus-77/review');

    return {
      success: true,
      isArchived: updated.isArchived,
      isLocked: updated.isLocked,
    };
  } catch (err: any) {
    console.error('[Admin Toggle Archive Error]:', err);
    return {
      success: false,
      error: err.message || '更新歸檔狀態時發生錯誤。',
    };
  }
}

