import { prisma } from '@/lib/prisma';
import { HOLO_KOUSHIEN_EVENT_ID } from '@/utils/eventDeadline';

let isSchemaPatched = false;

/**
 * 確保線上 SQLite 資料表安全相容 isArchived 欄位
 */
export async function patchSpecialEventSchemaIfNeeded() {
  if (isSchemaPatched) return;
  try {
    // 若線上資料庫尚未執行 prisma db push，自動補齊 isArchived 欄位
    await prisma.$executeRawUnsafe(
      'ALTER TABLE SpecialEvent ADD COLUMN isArchived BOOLEAN NOT NULL DEFAULT 1;'
    );
  } catch {
    // 欄位已存在或非 SQLite，忽略
  }
  isSchemaPatched = true;
}

/**
 * 取得特別企劃資料，並保證甲子園2026 (holo_koushien_2026) 在線上環境自動同步為結束/折疊狀態
 */
export async function getOrSyncSpecialEvent(eventId: string = HOLO_KOUSHIEN_EVENT_ID) {
  await patchSpecialEventSchemaIfNeeded();

  let specialEvent: any = null;
  try {
    specialEvent = await prisma.specialEvent.findUnique({
      where: { id: eventId },
    });
  } catch (err) {
    console.warn('[SpecialEvent] findUnique failed:', err);
  }

  // 1. 若資料庫尚無此企劃紀錄，自動初始化並預設為已結束(折疊)與截止
  if (!specialEvent) {
    try {
      specialEvent = await prisma.specialEvent.create({
        data: {
          id: eventId,
          title: 'ホロライブ甲子園2026 冠軍預測',
          prize: 500.0,
          isLocked: true,
          isArchived: true,
        },
      });
    } catch {
      specialEvent = {
        id: eventId,
        title: 'ホロライブ甲子園2026 冠軍預測',
        prize: 500.0,
        winningChoice: null,
        isLocked: true,
        lockedAt: null,
        isSettled: false,
        settledAt: null,
        totalPayout: 0,
        winnerCount: 0,
        isArchived: true,
      };
    }
  } else if (!specialEvent.isArchived && specialEvent.id === HOLO_KOUSHIEN_EVENT_ID) {
    // 2. 若線上既有資料庫尚未標記為結束，自動自癒同步為已結束(折疊)與鎖定
    try {
      specialEvent = await prisma.specialEvent.update({
        where: { id: eventId },
        data: {
          isArchived: true,
          isLocked: true,
        },
      });
    } catch {
      specialEvent = {
        ...specialEvent,
        isArchived: true,
        isLocked: true,
      };
    }
  }

  return specialEvent;
}
