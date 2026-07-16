import { prisma } from '../lib/prisma';
import { MarketStatus, EventType, ReviewStatus, OrderSide } from '../types/enums';
import { alignToTick, getTickSize } from '../utils/validatePrice';
import { getTaipeiTime } from '../utils/marketHours';

const WARNING_LINE = 10;          // 警戒線
const DELISTING_LINE = 5;         // 下市線
const MIN_VALUE = 0.1;            // 淨值/價格最低值

/**
 * Acquire a row-level lock on a CpPairs row to defend against late-arriving transactions.
 * Postgres/MySQL will execute SELECT ... FOR UPDATE. SQLite will execute a dummy update to force a write/reserved lock.
 */
async function lockCpPairRow(tx: any, pairId: string) {
  const provider = (prisma as any)._activeProvider;
  
  if (provider === 'postgresql' || provider === 'postgres') {
    await tx.$executeRawUnsafe(`SELECT 1 FROM "CpPairs" WHERE "id" = $1 FOR UPDATE`, pairId);
  } else if (provider === 'mysql') {
    await tx.$executeRawUnsafe(`SELECT 1 FROM CpPairs WHERE id = ? FOR UPDATE`, pairId);
  } else {
    // For SQLite, perform a dummy update to immediately lock the row
    await tx.cpPairs.update({
      where: { id: pairId },
      data: { updatedAt: new Date() }
    });
  }
}

/**
 * Expire all pending orders in the OrderBook for a given trading pair.
 * No database refunds are needed because order placement does not deduct balance/shares from the database.
 */
async function expireAndRefundOrders(tx: any, pairId: string) {
  // Delete all orders for this pair
  await tx.orderBook.deleteMany({
    where: { pairId }
  });
}

/**
 * 部署影子造市商（Market Maker）委託單 - 依據玩家持股比例或警戒模式執行控盤演算法
 */
async function deployMarketMakerOrders(tx: any, pair: any, openingPrice: number, alertPairIds: string[]) {
  // 1. 全面撤銷對應交易對舊的造市委託單
  await tx.orderBook.deleteMany({
    where: {
      pairId: pair.id,
      userId: 'MARKET_MAKER'
    }
  });

  const isAlertMode = alertPairIds.includes(pair.id);

  if (isAlertMode) {
    // ── 進入 警戒模式：【現金全壓 ── 鋼鐵護城河佈單】 ──
    const alertPrice = pair.netValue * 0.08;
    console.log(`[🚨 AlertMode] ${pair.id} 觸發警戒模式！限價防線 Alert_Price: ${alertPrice.toFixed(2)}`);

    // 取得造市商的可用現金
    const mmAccount = await tx.userAccount.findUnique({
      where: { userId: 'MARKET_MAKER' }
    });
    const totalMMCash = mmAccount ? Number(mmAccount.balance) : 999999999.0;
    
    // 依據進入警戒模式的交易對總數，平均分配可用現金
    const alertCount = Math.max(1, alertPairIds.length);
    const allocatedCash = totalMMCash / alertCount;

    // 產生 [Alert_Price - 2檔] 至 [Alert_Price + 8檔] 之間的價格檔位
    const centerPrice = alignToTick(alertPrice);
    
    // 往下找 2 檔
    let currentPrice = centerPrice;
    const priceListDown: number[] = [];
    for (let i = 0; i < 2; i++) {
      const tickSize = getTickSize(currentPrice);
      currentPrice = alignToTick(currentPrice - tickSize);
      priceListDown.push(currentPrice);
    }
    priceListDown.reverse();

    // 往上找 8 檔
    currentPrice = centerPrice;
    const priceListUp: number[] = [];
    for (let i = 0; i < 8; i++) {
      const tickSize = getTickSize(currentPrice);
      currentPrice = alignToTick(currentPrice + tickSize);
      priceListUp.push(currentPrice);
    }

    const targetPrices = [...priceListDown, centerPrice, ...priceListUp];

    // 分組 (使用精準的模數運算，避免 toFixed(1) 四捨五入造成判定失準)
    const dotZeroPrices = targetPrices.filter(p => Math.abs(p % 1) < 1e-9);
    const dotFivePrices = targetPrices.filter(p => Math.abs(p % 1 - 0.5) < 1e-9);
    const otherPrices = targetPrices.filter(p => Math.abs(p % 1) >= 1e-9 && Math.abs(p % 1 - 0.5) >= 1e-9);

    // 分配權重籌碼
    let dotZeroCash = 0;
    let dotFiveCash = 0;
    let otherCash = 0;

    if (dotZeroPrices.length > 0) {
      dotZeroCash = allocatedCash * 0.537;
    }
    if (dotFivePrices.length > 0) {
      dotFiveCash = allocatedCash * 0.267;
    }
    otherCash = allocatedCash - (dotZeroPrices.length > 0 ? dotZeroCash : 0) - (dotFivePrices.length > 0 ? dotFiveCash : 0);

    // 開始掛買單
    // 1. 尾數為 .0 的主要主力價位 (53.7% 現金)
    if (dotZeroPrices.length > 0) {
      const cashPerPrice = dotZeroCash / dotZeroPrices.length;
      for (const p of dotZeroPrices) {
        const vol = Math.floor(cashPerPrice / p);
        if (vol > 0) {
          await tx.orderBook.create({
            data: { userId: 'MARKET_MAKER', pairId: pair.id, side: OrderSide.BUY, price: p, volume: vol }
          });
        }
      }
    }

    // 2. 尾數為 .5 的次要防線價位 (26.7% 現金)
    if (dotFivePrices.length > 0) {
      const cashPerPrice = dotFiveCash / dotFivePrices.length;
      for (const p of dotFivePrices) {
        const vol = Math.floor(cashPerPrice / p);
        if (vol > 0) {
          await tx.orderBook.create({
            data: { userId: 'MARKET_MAKER', pairId: pair.id, side: OrderSide.BUY, price: p, volume: vol }
          });
        }
      }
    }

    // 3. 其他尾數的價位 (19.6% 現金，隨機打散分配)
    if (otherPrices.length > 0) {
      const weights = otherPrices.map(() => Math.random());
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      
      for (let i = 0; i < otherPrices.length; i++) {
        const p = otherPrices[i];
        const cashForPrice = (weights[i] / totalWeight) * otherCash;
        const vol = Math.floor(cashForPrice / p);
        if (vol > 0) {
          await tx.orderBook.create({
            data: { userId: 'MARKET_MAKER', pairId: pair.id, side: OrderSide.BUY, price: p, volume: vol }
          });
        }
      }
    }

    console.log(`[🤖 MarketMaker] ${pair.id} 成功部署【警戒模式 ALERT】鋼鐵護城河防線，共掛入 ${targetPrices.length} 檔限價買單。`);
    return;
  }

  // 2. 計算「當前交易對的玩家總持股比例 = 玩家總股數 / 全市場發行總股數」
  const portfolioSum = await tx.userPortfolios.aggregate({
    where: {
      pairId: pair.id,
      userId: { notIn: ['MARKET_MAKER', 'SYSTEM'] }
    },
    _sum: {
      shares_owned: true
    }
  });
  const playerShares = Number(portfolioSum._sum.shares_owned || BigInt(0));
  const totalShares = Number(pair.total_shares || BigInt(1000000));
  const ratio = playerShares / totalShares;

  console.log(`[🤖 MarketMaker] ${pair.id} 進行盤前驚醒。玩家總股數: ${playerShares}, 全市場發行總股數: ${totalShares}, 持股比例: ${(ratio * 100).toFixed(2)}%`);

  // 3. 依據持股比例執行控盤策略
  if (ratio < 0.20) {
    // 比例 < 20%（初期）：【流動性注入模式】
    // 以 openingPrice 為中心，左右 2% 內掛滿大額買賣單（每檔 5,000 股），溫和供給籌碼。
    const buyPrice1 = alignToTick(openingPrice * 0.99);
    const buyPrice2 = alignToTick(openingPrice * 0.98);
    const sellPrice1 = alignToTick(openingPrice * 1.01);
    const sellPrice2 = alignToTick(openingPrice * 1.02);

    await tx.orderBook.create({
      data: { userId: 'MARKET_MAKER', pairId: pair.id, side: OrderSide.BUY, price: buyPrice1, volume: 5000 }
    });
    await tx.orderBook.create({
      data: { userId: 'MARKET_MAKER', pairId: pair.id, side: OrderSide.BUY, price: buyPrice2, volume: 5000 }
    });
    await tx.orderBook.create({
      data: { userId: 'MARKET_MAKER', pairId: pair.id, side: OrderSide.SELL, price: sellPrice1, volume: 5000 }
    });
    await tx.orderBook.create({
      data: { userId: 'MARKET_MAKER', pairId: pair.id, side: OrderSide.SELL, price: sellPrice2, volume: 5000 }
    });
    console.log(`[🤖 MarketMaker] ${pair.id} 啟動【流動性注入模式】：掛出中心價左右 2% 內四檔委託各 5,000 股。`);
  } else if (ratio >= 0.20 && ratio <= 0.70) {
    // 比例處於 20% ~ 70%（中期）：【野性波動模式】
    // 撤出盤口中央，Spread 放寬至 10%（左右各 5%），每檔掛 1,000 股。
    const buyPrice = alignToTick(openingPrice * 0.95);
    const sellPrice = alignToTick(openingPrice * 1.05);

    await tx.orderBook.create({
      data: { userId: 'MARKET_MAKER', pairId: pair.id, side: OrderSide.BUY, price: buyPrice, volume: 1000 }
    });
    await tx.orderBook.create({
      data: { userId: 'MARKET_MAKER', pairId: pair.id, side: OrderSide.SELL, price: sellPrice, volume: 1000 }
    });
    console.log(`[🤖 MarketMaker] ${pair.id} 啟動【野性波動模式】：盤口 Spread 放寬至 10% 雙向各 1,000 股。`);
  } else {
    // 比例 > 70%（後期）：【終極護盤與欺敵模式】
    // 在當日跌停限制線（Limit Down，-20%）精準掛出基本面淨值清算保底買單（10,000 股）。
    const buyPrice = alignToTick(openingPrice * 0.80);

    await tx.orderBook.create({
      data: { userId: 'MARKET_MAKER', pairId: pair.id, side: OrderSide.BUY, price: buyPrice, volume: 10000 }
    });
    console.log(`[🤖 MarketMaker] ${pair.id} 啟動【終極護盤與欺敵模式】：於今日跌停限制線 ${buyPrice} 掛出保底買單 10,000 股。`);
  }
}

export interface SettlementServiceResult {
  actionExecuted: 'settle' | 'rollover' | 'none';
  results: any[];
  delistedPairs?: string[];
  message: string;
}

/**
 * Main service to handle either daily close price inheritance (rollover) or Sunday dividend settlement.
 */
export async function runDailyRolloverOrSettlement(options?: {
  forceAction?: 'settle' | 'rollover';
  targetDate?: Date;
}): Promise<SettlementServiceResult> {
  const now = options?.targetDate || new Date();
  const tzTime = getTaipeiTime(now);

  // Determine the logical trading day ending.
  const logicalDayOfWeek = (tzTime.dayOfWeek - 1 + 7) % 7;

  // Determine action:
  // 0 is Sunday. End of Sunday logical day (Sunday 24:00 / Monday 00:00) = Weekly Settlement.
  // Other days (Tuesday to Sunday close) = Daily Rollover.
  let action: 'settle' | 'rollover' = 'rollover';

  if (options?.forceAction) {
    action = options.forceAction;
  } else {
    if (logicalDayOfWeek === 0) {
      action = 'settle';
    } else {
      action = 'rollover';
    }
  }

  // Guard against duplicate settlement
  if (action === 'settle') {
    const anyPair = await prisma.cpPairs.findFirst({
      where: { lastSettledAt: { not: null } },
      orderBy: { lastSettledAt: 'desc' }
    });
    if (anyPair?.lastSettledAt) {
      const hoursSinceLastSettlement = (now.getTime() - anyPair.lastSettledAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastSettlement < 48) {
        console.log(`[Settlement] Skipping: last settlement was ${hoursSinceLastSettlement.toFixed(1)} hours ago (< 48h guard).`);
        return {
          actionExecuted: 'none' as any,
          results: [],
          message: `Settlement skipped: already settled ${hoursSinceLastSettlement.toFixed(1)} hours ago.`
        };
      }
    }
  }

  if (action === 'rollover') {
    // ── Scenario 1: Weekday Rollover (Tue-Sat 24:00) ──
    const results = await prisma.$transaction(async (tx) => {
      const pairs = await tx.cpPairs.findMany({
        where: { status: { not: MarketStatus.DELISTED } }
      });

      const rolloverLogs = [];

      for (const pair of pairs) {
        // Lock row to prevent race conditions
        await lockCpPairRow(tx, pair.id);

        // Fetch latest state after lock
        const latestPair = await tx.cpPairs.findUnique({
          where: { id: pair.id }
        });
        if (!latestPair) continue;

        const closingPrice = latestPair.currentPrice;

        // Expire all pending orders first
        await expireAndRefundOrders(tx, pair.id);

        // Delete all trades for this pair to clear the transaction history for the new day
        await tx.trades.deleteMany({
          where: { pairId: pair.id }
        });

        // Write closingPrice directly to last_close_price and next_open_price, and reset todayOpenPrice
        await tx.cpPairs.update({
          where: { id: pair.id },
          data: {
            last_close_price: closingPrice,
            next_open_price: closingPrice,
            todayOpenPrice: null
          }
        });

        rolloverLogs.push({
          pairId: pair.id,
          closingPrice,
          openingPrice: latestPair.openingPrice
        });
      }

      return rolloverLogs;
    }, { timeout: 15000 });

    return {
      actionExecuted: 'rollover',
      results,
      message: `Daily close price inheritance (rollover) completed successfully for ${results.length} pairs.`
    };
  } else {
    // ── Scenario 2: Sunday Settlement (Sun 24:00) ──
    const result = await prisma.$transaction(async (tx) => {
      const pairs = await tx.cpPairs.findMany({
        where: { status: { not: MarketStatus.DELISTED } }
      });

      const settlementLogs: any[] = [];
      const delistedPairIds: string[] = [];

      for (const pair of pairs) {
        // Lock row to prevent race conditions
        await lockCpPairRow(tx, pair.id);

        // Fetch latest state after lock
        const latestPair = await tx.cpPairs.findUnique({
          where: { id: pair.id }
        });
        if (!latestPair) continue;

        const statusBefore = latestPair.status;
        const currentNV = latestPair.netValue;
        const lastPrice = latestPair.currentPrice;

        // 1. Calculate Collab_Bonus_Sum from approved events
        const approvedEvents = await tx.teeteeEvents.findMany({
          where: {
            pairId: latestPair.id,
            status: ReviewStatus.APPROVED,
            isSettled: false
          }
        });

        const activeOverrides = approvedEvents.filter(e => e.type.startsWith('OVERRIDE:'));
        const adminAdjustReason = activeOverrides.map(e => e.title.replace('[行政干預] ', '')).join(', ');

        const collabBonusSum = approvedEvents.reduce(
          (sum: number, evt: any) => {
            if (evt.type === EventType.STREAM) return sum + 0.09;
            if (evt.type === EventType.STREAM_3D) return sum + 0.15;
            if (evt.type === EventType.VIDEO) return sum + 0.30;
            if (evt.type.startsWith('OVERRIDE:')) {
              const val = parseFloat(evt.type.split(':')[1]) || 0;
              return sum + val;
            }
            return sum;
          },
          0
        );

        // 2. Calculate weekly new Net Value
        const settledNV = currentNV * (1 + collabBonusSum);

        // 3. Calculate 8% dividend payout per share
        const dividendPerShare = parseFloat((settledNV * 0.08).toFixed(2));

        // 4. Next week start Net Value (silent deduction of 8%)
        let nextWeekNV = settledNV * 0.92;
        nextWeekNV = Math.max(MIN_VALUE, parseFloat(nextWeekNV.toFixed(2)));

        // 5. Ex-dividend price deduction and Taiwanese tick size alignment
        const rawOpeningPrice = lastPrice - dividendPerShare;
        const newPrice = alignToTick(Math.max(MIN_VALUE, rawOpeningPrice));

        // 6. Delisting check
        let wasDelisted = false;
        let statusAfter = statusBefore as MarketStatus;

        if (nextWeekNV < DELISTING_LINE) {
          statusAfter = MarketStatus.DELISTED;
          wasDelisted = true;
          delistedPairIds.push(latestPair.id);
        } else {
          statusAfter = nextWeekNV <= WARNING_LINE ? MarketStatus.WARNING : MarketStatus.NORMAL;
        }

        const warningWeeks = statusAfter === MarketStatus.WARNING
          ? (latestPair.warningWeeks + 1)
          : 0;

        // 7. Expire all pending orders first (refunds to players)
        await expireAndRefundOrders(tx, latestPair.id);

        // Delete all trades for this pair to clear the transaction history for the new week
        await tx.trades.deleteMany({
          where: { pairId: latestPair.id }
        });

        // 8. Update CP Pair in database (write to last_close_price, next_open_price, and reset todayOpenPrice)
        const _updatedPair = await tx.cpPairs.update({
          where: { id: latestPair.id },
          data: {
            netValue: nextWeekNV,
            last_close_price: lastPrice,
            next_open_price: newPrice,
            todayOpenPrice: null,
            status: statusAfter,
            warningWeeks: warningWeeks,
            adminAdjust: 0.0,
            adminAdjustReason: "",
            lastSettledAt: new Date()
          }
        });

        // 9. Pay dividend & liquidation return to players
        const holdings = await tx.userPortfolios.findMany({
          where: { pairId: latestPair.id }
        });

        for (const holding of holdings) {
          const shares = Number(holding.shares_owned);
          if (shares > 0) {
            const dividendCash = parseFloat((shares * dividendPerShare).toFixed(2));
            let cashTotal = dividendCash;

            if (wasDelisted) {
              const liquidationReturn = parseFloat((shares * nextWeekNV).toFixed(2));
              cashTotal += liquidationReturn;
            }

            if (cashTotal > 0) {
              await tx.userAccount.upsert({
                where: { userId: holding.userId },
                update: { balance: { increment: cashTotal } },
                create: { userId: holding.userId, balance: 10000.0 + cashTotal }
              });
            }

            if (wasDelisted) {
              await tx.userPortfolios.delete({
                where: { id: holding.id }
              });
            }
          }
        }

        // 10. Archive approved events
        for (const evt of approvedEvents) {
          const exists = await tx.archivedEvents.findUnique({
            where: {
              pairId_url: {
                pairId: evt.pairId,
                url: evt.url
              }
            }
          });
          if (!exists) {
            await tx.archivedEvents.create({
              data: {
                id: evt.id,
                pairId: evt.pairId,
                url: evt.url,
                type: evt.type,
                title: evt.title,
                timestamp: evt.timestamp,
                reporter: evt.reporter,
                status: 'APPROVED',
                createdAt: evt.createdAt,
                reason: evt.reason || ""
              }
            });
          }

          await tx.teeteeEvents.delete({
            where: { id: evt.id }
          });
        }

        // Archive unapplied events (PENDING & REJECTED)
        const unappliedEvents = await tx.teeteeEvents.findMany({
          where: {
            pairId: latestPair.id,
            status: { in: [ReviewStatus.PENDING, ReviewStatus.REJECTED] }
          }
        });

        for (const evt of unappliedEvents) {
          const exists = await tx.archivedEvents.findUnique({
            where: {
              pairId_url: {
                pairId: evt.pairId,
                url: evt.url
              }
            }
          });
          if (!exists) {
            await tx.archivedEvents.create({
              data: {
                id: evt.id,
                pairId: evt.pairId,
                url: evt.url,
                type: evt.type,
                title: evt.title,
                timestamp: evt.timestamp,
                reporter: evt.reporter,
                status: evt.status, // Preserve PENDING or REJECTED
                createdAt: evt.createdAt,
                reason: evt.reason || ""
              }
            });
          }

          await tx.teeteeEvents.delete({
            where: { id: evt.id }
          });
        }

        // 11. Record Settlement Log
        await tx.settlementLog.create({
          data: {
            pairId: latestPair.id,
            previousNV: currentNV,
            newNV: nextWeekNV,
            collabBonusSum,
            dividendPerShare,
            previousPrice: lastPrice,
            newPrice,
            statusBefore,
            statusAfter,
            wasDelisted,
            adminAdjustReason: adminAdjustReason
          }
        });

        settlementLogs.push({
          pairId: latestPair.id,
          newPrice,
          statusAfter,
          wasDelisted
        });
      }

      return { results: settlementLogs, delistedPairIds };
    }, { timeout: 25000 });

    return {
      actionExecuted: 'settle',
      results: result.results,
      delistedPairs: result.delistedPairIds,
      message: `Weekly Sunday settlement and dividend payout completed successfully for ${result.results.length} pairs.`
    };
  }
}

export async function runPreMarketMMDeployment(_now: Date = new Date()) {
  const result = await prisma.$transaction(async (tx) => {
    const pairs = await tx.cpPairs.findMany({
      where: { status: { not: MarketStatus.DELISTED } }
    });

    const updatedPairs = [];
    for (const pair of pairs) {
      const nextOpen = pair.next_open_price;
      const updated = await tx.cpPairs.update({
        where: { id: pair.id },
        data: {
          currentPrice: nextOpen,
          openingPrice: nextOpen
        }
      });
      updatedPairs.push(updated);
    }

    const alertPairIds: string[] = [];
    for (const p of updatedPairs) {
      const alertPrice = p.netValue * 0.08;
      const limitDownPrice = p.currentPrice * 0.80;
      if (limitDownPrice < alertPrice) {
        alertPairIds.push(p.id);
      }
    }

    for (const pair of updatedPairs) {
      await deployMarketMakerOrders(tx, pair, pair.openingPrice, alertPairIds);
    }

    return updatedPairs;
  }, { timeout: 15000 });

  return result;
}

export async function checkAndTickMarketStatus(now: Date = new Date()): Promise<string> {
  const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
  if (!config) return 'CLOSED';

  if (config.marketStatus === 'MAINTENANCE') {
    return 'MAINTENANCE';
  }

  const tz = getTaipeiTime(now);
  const totalMinutes = tz.hour * 60 + tz.minute;

  let clockStatus: 'CLOSED' | 'ROLLOVER' | 'PRE_MARKET' | 'OPEN' | 'SETTLING' = 'CLOSED';
  
  if (tz.dayOfWeek === 1) {
    // Monday: Holiday (SETTLING), but ROLLOVER occurs at 18:30 - 18:45
    if (totalMinutes >= 1110 && totalMinutes < 1125) {
      clockStatus = 'ROLLOVER';
    } else {
      clockStatus = 'SETTLING';
    }
  } else if (tz.dayOfWeek === 2) {
    // Tuesday: SETTLING until 18:30, ROLLOVER at 18:30 - 18:45, PRE_MARKET at 18:45 - 19:00, OPEN at 19:00 - 24:00
    if (totalMinutes < 1110) {
      clockStatus = 'SETTLING';
    } else if (totalMinutes >= 1110 && totalMinutes < 1125) {
      clockStatus = 'ROLLOVER';
    } else if (totalMinutes >= 1125 && totalMinutes < 1140) {
      clockStatus = 'PRE_MARKET';
    } else {
      clockStatus = 'OPEN';
    }
  } else {
    // Wednesday to Sunday: CLOSED until 18:30, ROLLOVER at 18:30 - 18:45, PRE_MARKET at 18:45 - 19:00, OPEN at 19:00 - 24:00
    if (totalMinutes < 1110) {
      clockStatus = 'CLOSED';
    } else if (totalMinutes >= 1110 && totalMinutes < 1125) {
      clockStatus = 'ROLLOVER';
    } else if (totalMinutes >= 1125 && totalMinutes < 1140) {
      clockStatus = 'PRE_MARKET';
    } else {
      clockStatus = 'OPEN';
    }
  }

  const currentStatus = config.marketStatus || 'CLOSED';

  // 1. Transition from OPEN to CLOSED/SETTLING (Session end at 24:00)
  // We preserve all orders, trades, and board data until 18:30 rollover!
  if (currentStatus === 'OPEN' && (clockStatus === 'CLOSED' || clockStatus === 'SETTLING')) {
    const nextStatus = clockStatus === 'SETTLING' ? 'SETTLING' : 'CLOSED';
    await prisma.systemConfig.updateMany({
      where: { id: 1, marketStatus: currentStatus },
      data: { marketStatus: nextStatus }
    });
    console.log(`[State Machine] Transitioning OPEN -> ${nextStatus} at 24:00 (Data preserved)`);
    return nextStatus;
  }

  // 2. Transition from CLOSED/SETTLING to CLOSED_SETTLED (Daily Rollover / Weekly Settlement at 18:30)
  if ((currentStatus === 'CLOSED' || currentStatus === 'SETTLING') && clockStatus === 'ROLLOVER') {
    console.log(`[State Machine] Transitioning ${currentStatus} -> CLOSED_SETTLED (Executing Rollover/Settlement) at ${now.toISOString()}`);
    
    // Atomic check-and-set
    const updatedSettled = await prisma.systemConfig.updateMany({
      where: { id: 1, marketStatus: currentStatus },
      data: { marketStatus: 'CLOSED_SETTLED' }
    });
    
    if (updatedSettled.count > 0) {
      try {
        // Monday 18:30 triggers Weekly Sunday Settlement, other days trigger Daily Rollover
        const action: 'settle' | 'rollover' = tz.dayOfWeek === 1 ? 'settle' : 'rollover';
        await runDailyRolloverOrSettlement({ forceAction: action, targetDate: now });
      } catch (err) {
        console.error('[Rollover/Settlement Error]:', err);
      }
      return 'CLOSED_SETTLED';
    }
  }

  // 3. Transition from CLOSED_SETTLED to PRE_MARKET (18:45)
  if (currentStatus === 'CLOSED_SETTLED' && clockStatus === 'PRE_MARKET') {
    console.log(`[State Machine] Transitioning CLOSED_SETTLED -> PRE_MARKET at ${now.toISOString()}`);
    const updatedPre = await prisma.systemConfig.updateMany({
      where: { id: 1, marketStatus: currentStatus },
      data: { marketStatus: 'PRE_MARKET' }
    });
    if (updatedPre.count > 0) {
      await runPreMarketMMDeployment(now);
    }
    return 'PRE_MARKET';
  }

  // 4. Transition from PRE_MARKET to OPEN (19:00)
  if (currentStatus === 'PRE_MARKET' && clockStatus === 'OPEN') {
    console.log(`[State Machine] Transitioning PRE_MARKET -> OPEN at ${now.toISOString()}`);
    await prisma.systemConfig.updateMany({
      where: { id: 1, marketStatus: currentStatus },
      data: { marketStatus: 'OPEN' }
    });
    return 'OPEN';
  }

  // 5. Missed Transition Recovery logic
  if (clockStatus === 'PRE_MARKET' && (currentStatus === 'CLOSED' || currentStatus === 'SETTLING')) {
    // Rollover was missed
    console.log(`[State Machine] Recovering missed Rollover at PRE_MARKET.`);
    const updatedRecover = await prisma.systemConfig.updateMany({
      where: { id: 1, marketStatus: currentStatus },
      data: { marketStatus: 'CLOSED_SETTLED' }
    });
    if (updatedRecover.count > 0) {
      try {
        const action: 'settle' | 'rollover' = tz.dayOfWeek === 2 ? 'settle' : 'rollover'; // If Monday was missed, Tue 18:45 is Weekly Settlement
        await runDailyRolloverOrSettlement({ forceAction: action, targetDate: now });
      } catch (err) {
        console.error(err);
      }
      await prisma.systemConfig.updateMany({
        where: { id: 1, marketStatus: 'CLOSED_SETTLED' },
        data: { marketStatus: 'PRE_MARKET' }
      });
      await runPreMarketMMDeployment(now);
    }
    return 'PRE_MARKET';
  }

  if (clockStatus === 'OPEN' && (currentStatus === 'CLOSED' || currentStatus === 'SETTLING' || currentStatus === 'CLOSED_SETTLED' || currentStatus === 'PRE_MARKET')) {
    console.log(`[State Machine] Recovering missed open transition.`);
    let finalStatus = currentStatus;
    if (finalStatus === 'CLOSED' || finalStatus === 'SETTLING') {
      // Run missed rollover first
      const updatedRecover = await prisma.systemConfig.updateMany({
        where: { id: 1, marketStatus: finalStatus },
        data: { marketStatus: 'CLOSED_SETTLED' }
      });
      if (updatedRecover.count > 0) {
        try {
          const action: 'settle' | 'rollover' = tz.dayOfWeek === 2 ? 'settle' : 'rollover';
          await runDailyRolloverOrSettlement({ forceAction: action, targetDate: now });
        } catch (err) {
          console.error(err);
        }
        finalStatus = 'CLOSED_SETTLED';
      }
    }
    if (finalStatus === 'CLOSED_SETTLED') {
      const updatedPre = await prisma.systemConfig.updateMany({
        where: { id: 1, marketStatus: finalStatus },
        data: { marketStatus: 'PRE_MARKET' }
      });
      if (updatedPre.count > 0) {
        await runPreMarketMMDeployment(now);
      }
      finalStatus = 'PRE_MARKET';
    }
    if (finalStatus === 'PRE_MARKET') {
      await prisma.systemConfig.updateMany({
        where: { id: 1, marketStatus: finalStatus },
        data: { marketStatus: 'OPEN' }
      });
    }
    return 'OPEN';
  }

  return currentStatus;
}
