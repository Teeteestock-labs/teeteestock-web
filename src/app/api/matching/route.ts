import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MarketStatus, OrderSide, UserChoice } from '@/types/enums';
import { alignToTick } from '@/utils/validatePrice';
import { getActiveTradingDay, getTaipeiSessionRange } from '@/utils/marketHours';
import { checkAndTickMarketStatus } from '@/services/settlementService';

// Helper to recursively serialize BigInt values to Numbers/Strings for JSON safety
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return Number(obj);
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key of Object.keys(obj)) {
      newObj[key] = serializeBigInt(obj[key]);
    }
    return newObj;
  }
  return obj;
}

export async function POST(request: Request) {
  try {
    const now = new Date();
    const marketStatus = await checkAndTickMarketStatus(now);

    if (marketStatus !== 'OPEN') {
      return NextResponse.json({
        success: false,
        error: '撮合引擎保持凍結，僅在開盤狀態開放。',
        details: `當前市場狀態為 ${marketStatus}，必須為 OPEN 才能執行撮合。`
      }, { status: 200 });
    }

    const results = await new Promise<any[]>((resolve, reject) => {
      setImmediate(async () => {
        try {
          const txResults = await prisma.$transaction(async (tx) => {
            // 1. 撈取目前所有未下市的 CP 組合
            const pairs = await tx.cpPairs.findMany({
              where: { status: { not: MarketStatus.DELISTED } },
            });

      const matchedPairsLog: any[] = [];

      for (const pair of pairs) {
        // 2. 撈取特定 pairId 的所有未成交委託單 (此時已包含 17:45 時 MARKET_MAKER 部署的委託單)，依據 createdAt ASC 排序以執行時間優先原則
        const dbOrders = await tx.orderBook.findMany({
          where: { pairId: pair.id },
          orderBy: {
            createdAt: 'asc'
          }
        });

        if (dbOrders.length === 0) {
          continue; // 沒有委託單，直接看下一個 CP
        }

        // 分離為買單與賣單
        const buyOrders = dbOrders.filter(o => o.side === OrderSide.BUY);
        const sellOrders = dbOrders.filter(o => o.side === OrderSide.SELL);

        // BuyOrders：依 price 由高到低排序；若價格相同，真實玩家優先（MARKET_MAKER 讓步）；若身份也相同，依 createdAt 由早到晚排序（時間優先）。
        buyOrders.sort((a, b) => {
          if (b.price !== a.price) return b.price - a.price;
          
          const aIsMM = a.userId === 'MARKET_MAKER';
          const bIsMM = b.userId === 'MARKET_MAKER';
          if (aIsMM && !bIsMM) return 1;  // a is MM, yield to player (b goes first)
          if (!aIsMM && bIsMM) return -1; // b is MM, yield to player (a goes first)
          
          return a.createdAt.getTime() - b.createdAt.getTime();
        });

        // SellOrders：依 price 由低到高排序；若價格相同，依 createdAt 由早到晚排序（時間優先）。
        sellOrders.sort((a, b) => {
          if (a.price !== b.price) return a.price - b.price;
          return a.createdAt.getTime() - b.createdAt.getTime();
        });

        // 收集所有出現過的相異報價，組成價格陣列 P_Set
        const priceSet = new Set<number>();
        for (const o of dbOrders) {
          priceSet.add(o.price);
        }
        const p_Set = Array.from(priceSet).sort((a, b) => a - b);

        // 遍歷 P_Set，計算供需矩陣
        const evaluations = p_Set.map(p => {
          const accumBuy = buyOrders
            .filter(o => o.price >= p)
            .reduce((sum, o) => sum + o.volume, 0);
          const accumSell = sellOrders
            .filter(o => o.price <= p)
            .reduce((sum, o) => sum + o.volume, 0);
          const matchVolume = Math.min(accumBuy, accumSell);
          return { price: p, accumBuy, accumSell, matchVolume };
        });

        // 取出 MatchVolume 最大值
        const maxVolume = Math.max(...evaluations.map(e => e.matchVolume), 0);

        // 防禦機制：若本輪 MatchVolume 最大值為 0，則判定流標，直接結束該組合撮合
        if (maxVolume === 0) {
          matchedPairsLog.push({
            pairId: pair.id,
            status: 'NO_MATCH',
            message: '流標：買賣盤口無價格交集或無委託單。',
          });
          continue;
        }

        // 取出 MatchVolume 最大值對應的價格候選
        let candidates = evaluations.filter(e => e.matchVolume === maxVolume);
        let finalPrice: number;

        if (candidates.length === 1) {
          finalPrice = candidates[0].price;
        } else {
          // 【多重價格黃金過濾盾牌】
          // 規則一：選擇未成交殘單差額 |AccumBuy - AccumSell| 最小的價格
          const minImbalance = Math.min(...candidates.map(c => Math.abs(c.accumBuy - c.accumSell)));
          candidates = candidates.filter(c => Math.abs(c.accumBuy - c.accumSell) === minImbalance);

          if (candidates.length === 1) {
            finalPrice = candidates[0].price;
          } else {
            // 規則二：選擇最接近「上一盤最後成交價（CpPairs.currentPrice）」的價格
            const lastPrice = pair.currentPrice;
            const minDistance = Math.min(...candidates.map(c => Math.abs(c.price - lastPrice)));
            candidates = candidates.filter(c => Math.abs(c.price - lastPrice) === minDistance);

            if (candidates.length === 1) {
              finalPrice = candidates[0].price;
            } else {
              // 規則三：若波動距離亦相同，直接取這組價格的「中間值（Median）」
              // N 為偶數時取 Candidates[Math.floor((N - 1) / 2)]，此時已由價格小到大排序
              finalPrice = candidates[Math.floor((candidates.length - 1) / 2)].price;
            }
          }
        }

        // 每日漲跌幅限制硬性夾擠 (Clamp)
        const openingPrice = pair.openingPrice;
        const ceiling = alignToTick(openingPrice * 1.20);
        const floor = alignToTick(openingPrice * 0.80);

        if (finalPrice > ceiling) {
          finalPrice = ceiling;
        } else if (finalPrice < floor) {
          finalPrice = floor;
        }

        // 3. 資產交割與帳本寫入
        // 篩選參與撮合的委託單 (買單 >= finalPrice，賣單 <= finalPrice)
        const eligibleBuys = buyOrders.filter(o => o.price >= finalPrice);
        const eligibleSells = sellOrders.filter(o => o.price <= finalPrice);

        const buyQueue = eligibleBuys.map(o => ({ ...o, remainingVolume: o.volume, isCancelled: false }));
        const sellQueue = eligibleSells.map(o => ({ ...o, remainingVolume: o.volume, isCancelled: false }));

        let buyIdx = 0;
        let sellIdx = 0;
        let remainingVolume = maxVolume;

        const tradesCreated: any[] = [];
        const orderUpdates: { id: string; action: 'DELETE' | 'UPDATE'; volume?: number }[] = [];

        while (remainingVolume > 0 && buyIdx < buyQueue.length && sellIdx < sellQueue.length) {
          const bOrder = buyQueue[buyIdx];
          const sOrder = sellQueue[sellIdx];

          // ── Self-Match Prevention (SMP Layer) ──
          if (bOrder.userId === sOrder.userId) {
            // Cancel the older order (Cancel Oldest strategy)
            const isBuyOlder = bOrder.createdAt.getTime() < sOrder.createdAt.getTime();
            if (isBuyOlder) {
              await tx.orderBook.delete({ where: { id: bOrder.id } });
              console.log(`[🛡️ SMP] Self-match detected for user ${bOrder.userId} on ${pair.id}. Cancelled older BUY order ${bOrder.id}`);
              bOrder.isCancelled = true;
              buyIdx++;
            } else {
              await tx.orderBook.delete({ where: { id: sOrder.id } });
              console.log(`[🛡️ SMP] Self-match detected for user ${sOrder.userId} on ${pair.id}. Cancelled older SELL order ${sOrder.id}`);
              sOrder.isCancelled = true;
              sellIdx++;
            }
            continue;
          }

          const matchVol = Math.min(bOrder.remainingVolume, sOrder.remainingVolume, remainingVolume);

          if (matchVol > 0) {
            const buyerId = bOrder.userId;
            const sellerId = sOrder.userId;

            // 確保買賣雙方帳戶 UserAccount 存在 (防禦機制)
            await tx.userAccount.upsert({
              where: { userId: buyerId },
              update: {},
              create: { userId: buyerId, balance: 10000.0 },
            });

            await tx.userAccount.upsert({
              where: { userId: sellerId },
              update: {},
              create: { userId: sellerId, balance: 10000.0 },
            });

            // 計算金額
            // 買方實扣金額 = finalPrice * matchVol
            const buyerCost = parseFloat((finalPrice * matchVol).toFixed(2));
            await tx.userAccount.update({
              where: { userId: buyerId },
              data: { balance: { decrement: buyerCost } },
            });

            // 賣方實拿現金 = (finalPrice * matchVol) * (1 - 0.003)，強制扣 0.3% 證交稅
            const grossCash = finalPrice * matchVol;
            const taxPaid = parseFloat((grossCash * 0.003).toFixed(2));
            const sellerNetCash = parseFloat((grossCash - taxPaid).toFixed(2));

            await tx.userAccount.update({
              where: { userId: sellerId },
              data: { balance: { increment: sellerNetCash } },
            });

            // 股份移轉
            // 賣方扣除股份：由於賣方下單時，前端已先行扣除或此為後端撮合核心
            // 我們仍須對資料庫中的庫存 UserPortfolios 進行交割更新
            const sellerPortfolio = await tx.userPortfolios.findUnique({
              where: { userId_pairId: { userId: sellerId, pairId: pair.id } },
            });

            if (!sellerPortfolio || Number(sellerPortfolio.shares_owned) < matchVol) {
              throw new Error(
                `賣方庫存不足以進行交割！賣方: ${sellerId}, 組合: ${pair.id}, 持有: ${sellerPortfolio?.shares_owned ?? 0}, 撮合需求: ${matchVol}`
              );
            }

            const newSellerShares = Number(sellerPortfolio.shares_owned) - matchVol;
            if (newSellerShares <= 0) {
              await tx.userPortfolios.delete({
                where: { id: sellerPortfolio.id },
              });
            } else {
              await tx.userPortfolios.update({
                where: { id: sellerPortfolio.id },
                data: { shares_owned: newSellerShares },
              });
            }

            // 買方增加股份，並更新平均持股成本 (average_cost)
            const buyerPortfolio = await tx.userPortfolios.findUnique({
              where: { userId_pairId: { userId: buyerId, pairId: pair.id } },
            });

            if (buyerPortfolio) {
              const oldShares = Number(buyerPortfolio.shares_owned);
              const oldCost = buyerPortfolio.average_cost;
              const newShares = oldShares + matchVol;
              // 平均成本 = (舊股份 * 舊成本 + 新股份 * 成交價) / 總股份
              const newAvgCost = parseFloat(((oldShares * oldCost + matchVol * finalPrice) / newShares).toFixed(4));

              await tx.userPortfolios.update({
                where: { id: buyerPortfolio.id },
                data: {
                  shares_owned: newShares,
                  average_cost: newAvgCost,
                },
              });
            } else {
              await tx.userPortfolios.create({
                data: {
                  userId: buyerId,
                  pairId: pair.id,
                  shares_owned: matchVol,
                  average_cost: finalPrice,
                  initial_choice: UserChoice.CASH_ONLY,
                },
              });
            }

            // 產生歷史成交紀錄 Trades
            const trade = await tx.trades.create({
              data: {
                pairId: pair.id,
                buyerId,
                sellerId,
                price: finalPrice,
                volume: matchVol,
                taxPaid,
              },
            });
            tradesCreated.push(trade);

            // 更新佇列中委託單剩餘量
            bOrder.remainingVolume -= matchVol;
            sOrder.remainingVolume -= matchVol;
            remainingVolume -= matchVol;

            // 移動佇列指標
            if (bOrder.remainingVolume === 0) {
              orderUpdates.push({ id: bOrder.id, action: 'DELETE' });
              buyIdx++;
            }
            if (sOrder.remainingVolume === 0) {
              orderUpdates.push({ id: sOrder.id, action: 'DELETE' });
              sellIdx++;
            }
          }
        }

        // 清理單倉與剩餘未成交量更新 (OrderBook 批次更新)
        // 為了確保佇列指針更新的順序，我們處理剩餘尚未完全成交但有部分成交且未被撤銷的單
        for (const bo of buyQueue) {
          if (!bo.isCancelled && bo.remainingVolume !== bo.volume) {
            if (bo.remainingVolume === 0) {
              await tx.orderBook.delete({ where: { id: bo.id } });
            } else {
              await tx.orderBook.update({
                where: { id: bo.id },
                data: { volume: bo.remainingVolume },
              });
            }
          }
        }

        for (const so of sellQueue) {
          if (!so.isCancelled && so.remainingVolume !== so.volume) {
            if (so.remainingVolume === 0) {
              await tx.orderBook.delete({ where: { id: so.id } });
            } else {
              await tx.orderBook.update({
                where: { id: so.id },
                data: { volume: so.remainingVolume },
              });
            }
          }
        }

        // 同步將 CpPairs.currentPrice 更新為 Final_CurrentPrice
        await tx.cpPairs.update({
          where: { id: pair.id },
          data: { currentPrice: finalPrice },
        });

        // 4. 更新/插入 1分 K 線歷史數據 (KLineHistory)
        const now = new Date();
        const timestamp = new Date(now);
        timestamp.setSeconds(0);
        timestamp.setMilliseconds(0);

        const existingKLine = await tx.kLineHistory.findFirst({
          where: {
            pairId: pair.id,
            timestamp: timestamp
          }
        });

        const actualTradedVolume = tradesCreated.reduce((sum, t) => sum + t.volume, 0);

        if (existingKLine) {
          if (actualTradedVolume > 0) {
            await tx.kLineHistory.update({
              where: { id: existingKLine.id },
              data: {
                high: Math.max(existingKLine.high, finalPrice),
                low: Math.min(existingKLine.low, finalPrice),
                close: finalPrice,
                volume: existingKLine.volume + BigInt(actualTradedVolume)
              }
            });
          }
        } else {
          const lastKLine = await tx.kLineHistory.findFirst({
            where: { pairId: pair.id },
            orderBy: { timestamp: 'desc' }
          });
          
          // Check if there are K-lines today to determine if this is the first trade of the session
          const activeTrading = getActiveTradingDay(now);
          const { startUTC, endUTC } = getTaipeiSessionRange(activeTrading.year, activeTrading.month, activeTrading.day);
          const todayKLinesCount = await tx.kLineHistory.count({
            where: {
              pairId: pair.id,
              timestamp: {
                gte: startUTC,
                lte: endUTC
              }
            }
          });

          const prevClose = todayKLinesCount === 0 ? pair.openingPrice : (lastKLine ? lastKLine.close : pair.currentPrice);

          await tx.kLineHistory.create({
            data: {
              pairId: pair.id,
              timestamp: timestamp,
              open: prevClose,
              high: actualTradedVolume > 0 ? Math.max(prevClose, finalPrice) : prevClose,
              low: actualTradedVolume > 0 ? Math.min(prevClose, finalPrice) : prevClose,
              close: actualTradedVolume > 0 ? finalPrice : prevClose,
              volume: BigInt(actualTradedVolume)
            }
          });
        }

        matchedPairsLog.push({
          pairId: pair.id,
          status: 'SUCCESS',
          finalPrice,
          totalVolume: actualTradedVolume,
          tradesCount: tradesCreated.length,
        });
      }

          return matchedPairsLog;
        });
        resolve(txResults);
      } catch (err) {
        reject(err);
      }
    });
  });

  return NextResponse.json(serializeBigInt({
    success: true,
    message: '撮合執行完成',
    results,
  }), { status: 200 });

  } catch (error) {
    console.error('[Matching Engine Error]:', error);
    return NextResponse.json({
      success: false,
      error: '撮合交割失敗，已全數回滾。',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
