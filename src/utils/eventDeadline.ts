export const HOLO_KOUSHIEN_EVENT_ID = 'holo_koushien_2026';
export const JUMP_KING_EVENT_ID = 'jump_king_holorace';
export const JUMP_KING_LIVE_URL = 'https://www.youtube.com/watch?v=b6mcVgI0JjY';

export const VALID_SCHOOL_CHOICES = [
  'WAOOON高校',
  '白銀学園高校',
  'AHOY高校',
  'ポルポル高校',
  'こんこよ高校',
  '壁咲高校',
] as const;

export const JUMP_KING_CHOICES = [
  'Redcrown Woods紅冠林',
  'Colossal Drain巨型排水管',
  "False King's Keep偽王的城堡",
  '(Bargainburg巴根堡/Great Frontier廣闊的邊境/Stormwall Pass風暴牆的關隘)',
  '(Chapel Perilous危險教堂/Blue Ruin深藍廢墟/The Tower塔樓)',
  '成功通關',
] as const;

export type SchoolChoice = typeof VALID_SCHOOL_CHOICES[number];
export type JumpKingChoice = typeof JUMP_KING_CHOICES[number];

/**
 * 取得指定特別企劃的合法選項清單
 */
export function getValidChoicesForEvent(eventId: string = JUMP_KING_EVENT_ID): readonly string[] {
  if (eventId === HOLO_KOUSHIEN_EVENT_ID) {
    return VALID_SCHOOL_CHOICES;
  }
  return JUMP_KING_CHOICES;
}

/**
 * 計算 JUMP KING HOLORACE 當前動態獎金池
 * 基礎獎金 5000，每超過 10 人增加 5000
 * (1~10人: 5000 / 11~20人: 10000 / 21~30人: 15000 ...)
 */
export function calculateJumpKingPool(participantCount: number): number {
  if (participantCount <= 10) {
    return 5000;
  }
  return 5000 + Math.floor((participantCount - 1) / 10) * 5000;
}

/**
 * 計算單一獲獎者均分獎金（取至十位數，無條件捨去）
 */
export function calculatePrizePerWinner(totalPool: number, winnerCount: number): number {
  if (winnerCount <= 0) return 0;
  const rawShare = totalPool / winnerCount;
  return Math.floor(rawShare / 10) * 10;
}

export interface PredictionLockStatus {
  isLocked: boolean;
  message: string;
}

/**
 * 檢查特別企劃是否已經截止鎖定
 * 依使用者最新需求：取消時間自動鎖定，改由後台管理員手動開關控制。
 *
 * @param manualLocked 後台資料庫中記錄之手動鎖定狀態
 * @param allowTestUnlock 是否允許測試解除鎖定（僅限非生產環境帶入 test_unlock 時生效）
 */
export function isEventPredictionLocked(
  manualLocked: boolean = false,
  allowTestUnlock: boolean = false
): PredictionLockStatus {
  // 開發環境除錯測試解鎖支援（生產環境強制失效）
  if (process.env.NODE_ENV !== 'production' && allowTestUnlock) {
    return {
      isLocked: false,
      message: '【測試模式】目前已手動解除鎖定。',
    };
  }

  // 依後台手動鎖定狀態判定
  if (manualLocked) {
    return {
      isLocked: true,
      message: '🔒 本企劃預測已截止',
    };
  }

  return {
    isLocked: false,
    message: '🟢 企劃預測開放中（尚未截止，可自由選擇與變更）',
  };
}
