export const HOLO_KOUSHIEN_EVENT_ID = 'holo_koushien_2026';

export const VALID_SCHOOL_CHOICES = [
  'WAOOON高校',
  '白銀学園高校',
  'AHOY高校',
  'ポルポル高校',
  'こんこよ高校',
  '壁咲高校',
] as const;

export type SchoolChoice = typeof VALID_SCHOOL_CHOICES[number];

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
