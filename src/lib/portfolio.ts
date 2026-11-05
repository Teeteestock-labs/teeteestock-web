export interface TradeRecord {
  pairId: string;
  buyerId: string;
  sellerId: string;
  volume: number;
  price: number;
  createdAt: Date;
}

export interface DividendRecord {
  pairId: string;
  sharesOwned: bigint | number;
  dividendPerShare: number;
  totalPayout: number;
  createdAt: Date;
}

export interface HoldingInput {
  pairId: string;
  shares: number;
  avgCost: number;
}

export interface AdjustedCostResult {
  adjustedAvgCost: number;
  effectiveDividendPerShare: number;
  cycleStart: Date | null;
}

/**
 * 計算特定持股在當前持股週期的真實還原成本（Adjusted Cost Basis）
 * 遵循金融移動加權平均與持倉週期歸零（Cycle Reset）原則：
 * 1. 依時序重構持股歷程，若持股曾減至 0（清倉賣光），則結束舊週期，新買進為獨立新持股週期。
 * 2. 舊部位領過的股息與歷史除息，絕不扣減新持股的成本。
 * 3. 當前週期內若有除息或加碼買進，按移動加權平均計算折抵後的還原均價。
 */
export function calculateHoldingAdjustedCost(
  userId: string,
  holding: HoldingInput,
  allTrades: TradeRecord[],
  dividendLogs: DividendRecord[]
): AdjustedCostResult {
  if (holding.shares <= 0) {
    return {
      adjustedAvgCost: 0,
      effectiveDividendPerShare: 0,
      cycleStart: null,
    };
  }

  const p = holding.pairId.toLowerCase();

  // 1. 篩選出該標的所有相關交易，依時間由舊到新排序
  const pairTrades = (allTrades || [])
    .filter(t => t.pairId.toLowerCase() === p && (t.buyerId === userId || t.sellerId === userId))
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  // 2. 篩選出該標的所有相關個人除息紀錄，依時間由舊到新排序
  const pairDivs = (dividendLogs || [])
    .filter(d => d.pairId.toLowerCase() === p)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  // 3. 追蹤持股週期：找出當前持股是在哪個時間點開始建立的（上一次庫存為 0 之後的第一次買進）
  let runningShares = 0;
  let cycleStartIndex = -1;

  for (let i = 0; i < pairTrades.length; i++) {
    const t = pairTrades[i];
    if (t.buyerId === userId) {
      if (runningShares <= 0) {
        cycleStartIndex = i;
        runningShares = 0;
      }
      runningShares += t.volume;
    } else if (t.sellerId === userId) {
      runningShares -= t.volume;
      if (runningShares <= 0) {
        runningShares = 0;
        cycleStartIndex = -1; // 部位清空平倉
      }
    }
  }

  // 判斷當前持倉週期的起點
  const cycleStartTime = cycleStartIndex >= 0 ? pairTrades[cycleStartIndex].createdAt : null;

  // 4. 篩選出當前週期內實際經歷的除息紀錄
  const activeDivs = cycleStartTime
    ? pairDivs.filter(d => d.createdAt.getTime() >= cycleStartTime.getTime())
    : pairDivs;

  // 組合當前週期內的事件序列 (Trades + Dividends)
  type TimelineEvent =
    | { type: 'BUY'; volume: number; price: number; time: number }
    | { type: 'SELL'; volume: number; price: number; time: number }
    | { type: 'DIVIDEND'; dividendPerShare: number; time: number };

  const events: TimelineEvent[] = [];

  const activeTrades = cycleStartIndex >= 0 ? pairTrades.slice(cycleStartIndex) : pairTrades;
  activeTrades.forEach(t => {
    if (t.buyerId === userId) {
      events.push({ type: 'BUY', volume: t.volume, price: t.price, time: t.createdAt.getTime() });
    } else if (t.sellerId === userId) {
      events.push({ type: 'SELL', volume: t.volume, price: t.price, time: t.createdAt.getTime() });
    }
  });

  activeDivs.forEach(d => {
    events.push({
      type: 'DIVIDEND',
      dividendPerShare: d.dividendPerShare,
      time: d.createdAt.getTime(),
    });
  });

  events.sort((a, b) => a.time - b.time);

  // 如果當前週期內完全沒有買賣事件（例如舊持股的交易已超過清理天數），則以 holding.avgCost 為基準扣除 activeDivs
  if (events.length === 0 || !events.some(e => e.type === 'BUY')) {
    const totalDivPerShare = activeDivs.reduce((sum, d) => sum + d.dividendPerShare, 0);
    const adjusted = Math.max(0, holding.avgCost - totalDivPerShare);
    return {
      adjustedAvgCost: parseFloat(adjusted.toFixed(4)),
      effectiveDividendPerShare: parseFloat(totalDivPerShare.toFixed(4)),
      cycleStart: cycleStartTime,
    };
  }

  // 5. 按照金融加權移動平均依序推進
  let currentShares = 0;
  let currentAvgCost = 0;
  let currentAdjCost = 0;

  for (const e of events) {
    if (e.type === 'BUY') {
      const newShares = currentShares + e.volume;
      if (newShares > 0) {
        currentAvgCost = (currentShares * currentAvgCost + e.volume * e.price) / newShares;
        currentAdjCost = (currentShares * currentAdjCost + e.volume * e.price) / newShares;
      }
      currentShares = newShares;
    } else if (e.type === 'DIVIDEND') {
      if (currentShares > 0) {
        currentAdjCost = Math.max(0, currentAdjCost - e.dividendPerShare);
      }
    } else if (e.type === 'SELL') {
      currentShares = Math.max(0, currentShares - e.volume);
      if (currentShares <= 0) {
        currentShares = 0;
        currentAvgCost = 0;
        currentAdjCost = 0;
      }
    }
  }

  let finalAdjCost = currentAdjCost;
  if (currentAvgCost > 0 && Math.abs(currentShares - holding.shares) > 0.001) {
    const diff = Math.max(0, currentAvgCost - currentAdjCost);
    finalAdjCost = Math.max(0, holding.avgCost - diff);
  }

  // 還原成本不可高於原始買入成本
  finalAdjCost = Math.min(finalAdjCost, holding.avgCost);
  const effectiveDiv = Math.max(0, holding.avgCost - finalAdjCost);

  return {
    adjustedAvgCost: parseFloat(finalAdjCost.toFixed(4)),
    effectiveDividendPerShare: parseFloat(effectiveDiv.toFixed(4)),
    cycleStart: cycleStartTime,
  };
}
