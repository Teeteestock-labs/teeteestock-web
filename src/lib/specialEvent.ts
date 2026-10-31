import { prisma } from '@/lib/prisma';
import { HOLO_KOUSHIEN_EVENT_ID, JUMP_KING_EVENT_ID } from '@/utils/eventDeadline';

let isSchemaPatched = false;

/**
 * 確保線上 SQLite 資料表安全相容 isArchived 欄位
 */
export async function patchSpecialEventSchemaIfNeeded() {
  if (isSchemaPatched) return;
  try {
    // 若線上資料庫尚未執行 prisma db push，自動補齊 isArchived 欄位
    await prisma.$executeRawUnsafe(
      'ALTER TABLE SpecialEvent ADD COLUMN isArchived BOOLEAN NOT NULL DEFAULT 0;'
    );
  } catch {
    // 欄位已存在或非 SQLite，忽略
  }
  isSchemaPatched = true;
}

/**
 * 取得特別企劃資料，並針對甲子園 2026 自動同步結束折疊，針對 JUMP KING HOLORACE 初始化開放中狀態
 */
export async function getOrSyncSpecialEvent(eventId: string = JUMP_KING_EVENT_ID) {
  await patchSpecialEventSchemaIfNeeded();

  let specialEvent: any = null;
  try {
    specialEvent = await prisma.specialEvent.findUnique({
      where: { id: eventId },
    });
  } catch (err) {
    console.warn('[SpecialEvent] findUnique failed:', err);
  }

  const isJumpKing = eventId === JUMP_KING_EVENT_ID;
  const defaultTitle = isJumpKing ? 'JUMP KING HOLORACE 優勝者到達地點預測' : 'ホロライブ甲子園2026 冠軍預測';
  const defaultPrize = isJumpKing ? 5000.0 : 500.0;
  const defaultLocked = true;
  const defaultArchived = true;

  // 1. 若資料庫尚無此企劃紀錄，自動初始化
  if (!specialEvent) {
    try {
      specialEvent = await prisma.specialEvent.create({
        data: {
          id: eventId,
          title: defaultTitle,
          prize: defaultPrize,
          isLocked: defaultLocked,
          isArchived: defaultArchived,
        },
      });
    } catch {
      specialEvent = {
        id: eventId,
        title: defaultTitle,
        prize: defaultPrize,
        winningChoice: null,
        isLocked: defaultLocked,
        lockedAt: null,
        isSettled: false,
        settledAt: null,
        totalPayout: 0,
        winnerCount: 0,
        isArchived: defaultArchived,
      };
    }
  } else if (!specialEvent.isArchived && (specialEvent.id === HOLO_KOUSHIEN_EVENT_ID || specialEvent.id === JUMP_KING_EVENT_ID)) {
    // 2. 若線上既有資料庫活動尚未標記為結束，自動同步為已結束(折疊)與鎖定
    try {
      specialEvent = await prisma.specialEvent.update({
        where: { id: eventId },
        data: {
          isArchived: true,
          isLocked: true,
          ...(specialEvent.title !== defaultTitle && !specialEvent.isSettled ? { title: defaultTitle } : {})
        },
      });
    } catch {
      specialEvent = {
        ...specialEvent,
        isArchived: true,
        isLocked: true,
        title: defaultTitle,
      };
    }
  } else if (isJumpKing && specialEvent && specialEvent.title !== defaultTitle && !specialEvent.isSettled) {
    // 3. 若為 JUMP KING 且尚未結算，自動同步新標題
    try {
      specialEvent = await prisma.specialEvent.update({
        where: { id: eventId },
        data: {
          title: defaultTitle,
        },
      });
    } catch {
      specialEvent = {
        ...specialEvent,
        title: defaultTitle,
      };
    }
  }

  return specialEvent;
}
