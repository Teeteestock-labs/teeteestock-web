export const HOLO_KOUSHIEN_EVENT_ID = 'holo_koushien_2026';
export const JUMP_KING_EVENT_ID = 'jump_king_holorace';
export const YUBI_SUMO_EVENT_ID = 'yubi_sumo_tournament';
export const HOLO_TRIATHLON_EVENT_ID = 'holo_triathlon_2026';

export const HOLO_TRIATHLON_TITLE = 'ホロドリトライアスロン 三連單';

export const JUMP_KING_LIVE_URL = 'https://www.youtube.com/watch?v=b6mcVgI0JjY';
export const YUBI_SUMO_LIVE_URL: string | null = null; // 官方直播連結公布後更新
export const HOLO_TRIATHLON_LIVE_URL: string | null = null;

export interface TriathlonContestant {
  id: string;
  jp: string;
  en: string;
}

export const TRIATHLON_CONTESTANTS: readonly TriathlonContestant[] = [
  { id: 'roboco', jp: 'ロボ子さん', en: 'Roboco-san' },
  { id: 'fubuki', jp: '白上フブキ', en: 'Shirakami Fubuki' },
  { id: 'noel', jp: '白銀ノエル', en: 'Shirogane Noel' },
  { id: 'laplus', jp: 'ラプラス・ダークネス', en: 'La+ Darknesss' },
  { id: 'ollie', jp: 'クレイジー・オリー', en: 'Kureiji Ollie' },
  { id: 'anya', jp: 'アーニャ・メルフィッサ', en: 'Anya Melfissa' },
  { id: 'kaela', jp: 'カエラ・コヴァルスキア', en: 'Kaela Kovalskia' },
  { id: 'kobo', jp: 'こぼ・かなえる', en: 'Kobo Kanaeru' },
  { id: 'calliope', jp: '森カリオペ', en: 'Mori Calliope' },
  { id: 'baelz', jp: 'ハコス・ベールズ', en: 'Hakos Baelz' },
  { id: 'fuwawa', jp: 'フワワ・アビスガード', en: 'Fuwawa Abyssgard' },
  { id: 'chihaya', jp: '輪堂千速', en: 'Rindo Chihaya' },
  { id: 'tsuzuri', jp: '鈴鳴つづり', en: 'Suzuna Tsuzuri' },
] as const;

export const TRIATHLON_PRIZE_TIERS = {
  EXACT_ALL: 15000,
  ANY_ORDER_ALL: 7500,
  FIRST_ONLY: 2500,
} as const;

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

export const YUBI_SUMO_PRIORITY_CHOICE = 'PekoViVi決賽對決（優先選項）';

// ゆび相撲大会 賽事預測選項（選項 5、6 對調，第 6 項為特殊優先選項）
export const YUBI_SUMO_CHOICES: readonly string[] = [
  '兎田ぺこら1勝',
  '兎田ぺこら2勝',
  '兎田ぺこら3勝',
  '兎田ぺこら冠軍',
  '兎田ぺこら初戰敗退',
  'PekoViVi決賽對決（優先選項）',
];

export type SchoolChoice = typeof VALID_SCHOOL_CHOICES[number];
export type JumpKingChoice = typeof JUMP_KING_CHOICES[number];
export type YubiSumoChoice = string;

/**
 * 標準化特別企劃選項名稱（相容輸入法選字、同音字或前綴編號）
 */
export function normalizeEventChoice(choice: string | null | undefined): string {
  if (!choice) return '';
  const trimmed = choice.trim();
  if (trimmed === '兎田ぺこら初戰敗隊') {
    return '兎田ぺこら初戰敗退';
  }
  // 移除如 "1. " 或 "1." 的前綴編號
  const stripped = trimmed.replace(/^[0-9]+[.\s、\s]*/, '');
  if (YUBI_SUMO_CHOICES.includes(stripped)) {
    return stripped;
  }
  return trimmed;
}

export const TRIATHLON_CONTESTANT_NAMES: readonly string[] = TRIATHLON_CONTESTANTS.map((c) => c.jp);

function resolveTriathlonContestantName(raw: string): string | null {
  const trimmed = raw.trim();
  const match = TRIATHLON_CONTESTANTS.find(
    (c) => c.jp === trimmed || c.en.toLowerCase() === trimmed.toLowerCase() || c.id === trimmed.toLowerCase()
  );
  return match ? match.jp : null;
}

/**
 * 解析三連單選擇（必須為 3 位不重複的合法參賽者，順序為 [1st, 2nd, 3rd]）
 */
export function parseTriathlonTrifecta(
  input: string | readonly string[] | null | undefined
): [string, string, string] | null {
  if (!input) return null;

  let rawParts: string[] = [];
  if (Array.isArray(input)) {
    rawParts = input.map((v) => String(v));
  } else if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          rawParts = parsed.map((v) => String(v));
        }
      } catch {
        return null;
      }
    } else {
      rawParts = trimmed.split(/\s*(?:\/|\||｜|>|→|,)\s*/);
    }
  }

  if (rawParts.length !== 3) return null;

  const resolved: string[] = [];
  for (const part of rawParts) {
    const jp = resolveTriathlonContestantName(part);
    if (!jp || resolved.includes(jp)) {
      return null;
    }
    resolved.push(jp);
  }

  return [resolved[0], resolved[1], resolved[2]];
}

/**
 * 格式化三連單選擇為資料庫儲存格式 ("1st / 2nd / 3rd")
 */
export function formatTriathlonTrifecta(picks: readonly [string, string, string]): string {
  return `${picks[0]} / ${picks[1]} / ${picks[2]}`;
}

export type TriathlonPayoutTier = 'EXACT_ALL' | 'ANY_ORDER_ALL' | 'FIRST_ONLY' | 'NONE';

export interface TriathlonPayoutResult {
  tier: TriathlonPayoutTier;
  amount: number;
  label: string;
}

/**
 * 依三連單階級規則計算單一玩家應領獎金（採最高符合階級單一發放、不重複疊加）
 * - 三名順序全中：15,000 $TEE
 * - 三名全中但順序錯誤：7,500 $TEE
 * - 第一名猜中且未達三名全中（含 ABX、AXB、AXY 等）：2,500 $TEE
 */
export function evaluateTriathlonPayout(
  predictionChoice: string | null | undefined,
  winningChoice: string | null | undefined
): TriathlonPayoutResult {
  const pred = parseTriathlonTrifecta(predictionChoice);
  const win = parseTriathlonTrifecta(winningChoice);
  if (!pred || !win) {
    return { tier: 'NONE', amount: 0, label: '未中獎' };
  }

  if (pred[0] === win[0] && pred[1] === win[1] && pred[2] === win[2]) {
    return {
      tier: 'EXACT_ALL',
      amount: TRIATHLON_PRIZE_TIERS.EXACT_ALL,
      label: '三名順序全中',
    };
  }

  const winSet = new Set<string>(win);
  if (winSet.has(pred[0]) && winSet.has(pred[1]) && winSet.has(pred[2])) {
    return {
      tier: 'ANY_ORDER_ALL',
      amount: TRIATHLON_PRIZE_TIERS.ANY_ORDER_ALL,
      label: '三名全中（順序不同）',
    };
  }

  if (pred[0] === win[0]) {
    return {
      tier: 'FIRST_ONLY',
      amount: TRIATHLON_PRIZE_TIERS.FIRST_ONLY,
      label: '猜中第一名',
    };
  }

  return { tier: 'NONE', amount: 0, label: '未中獎' };
}

/**
 * 取得指定特別企劃的合法選項清單
 */
export function getValidChoicesForEvent(eventId: string = HOLO_TRIATHLON_EVENT_ID): readonly string[] {
  if (eventId === HOLO_TRIATHLON_EVENT_ID) {
    return TRIATHLON_CONTESTANT_NAMES;
  }
  if (eventId === YUBI_SUMO_EVENT_ID) {
    return YUBI_SUMO_CHOICES;
  }
  if (eventId === HOLO_KOUSHIEN_EVENT_ID) {
    return VALID_SCHOOL_CHOICES;
  }
  return JUMP_KING_CHOICES;
}

/**
 * 計算特別企劃（JUMP KING / ゆび相撲大会）動態獎金池
 * 基礎獎金 5000，每超過 10 人增加 5000
 * (1~10人: 5000 / 11~20人: 10000 / 21~30人: 15000 ...)
 */
export function calculateDynamicEventPool(participantCount: number): number {
  if (participantCount <= 10) {
    return 5000;
  }
  return 5000 + Math.floor((participantCount - 1) / 10) * 5000;
}

// 保持向下相容
export const calculateJumpKingPool = calculateDynamicEventPool;

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
