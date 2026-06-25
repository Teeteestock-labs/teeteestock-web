import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MarketStatus, EventType, ReviewStatus } from '@/types/enums';
import { alignToTick } from '@/utils/validatePrice';

// ── Settlement Constants ──
const WARNING_LINE = 10;          // 警戒線
const DELISTING_LINE = 5;         // 下市線
const MIN_VALUE = 0.1;            // 淨值/價格最低值

interface SettlementResult {
  pairId: string;
  newPrice: number;
  statusAfter: string;
  wasDelisted: boolean;
}

export async function POST(request: Request) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // ── Step 0: 取得所有未下市的 CP 組合 ──
      const pairs = await tx.cpPairs.findMany({
        where: { status: { not: MarketStatus.DELISTED } }
      });

      const results: SettlementResult[] = [];
      const delistedPairIds: string[] = [];

      for (const pair of pairs) {
        const statusBefore = pair.status;
        const currentNV = pair.netValue;
        const lastPrice = pair.currentPrice;

        // ── Step 1: 計算本週 Collab_Bonus_Sum ──
        const approvedEvents = await tx.teeteeEvents.findMany({
          where: {
            pairId: pair.id,
            status: ReviewStatus.APPROVED,
            isSettled: false
          }
        });

        const collabBonusSum = approvedEvents.reduce(
          (sum, evt) => {
            if (evt.type === EventType.STREAM) return sum + 0.09;
            if (evt.type === EventType.STREAM_3D) return sum + 0.15;
            if (evt.type === EventType.VIDEO) return sum + 0.30;
            return sum;
          },
          0
        );

        // ── Step 2: 計算本週結算新淨值（基本面結算）──
        const settledNV = currentNV * (1 + collabBonusSum) + (pair.adminAdjust || 0.0);

        // ── Step 3: 計算股利發放 ──
        const dividendPerShare = parseFloat((settledNV * 0.08).toFixed(2));

        // ── Step 4: 下一週起點隱藏淨值與除息市價修正 ──
        let nextWeekNV = settledNV * 0.92;
        nextWeekNV = Math.max(MIN_VALUE, parseFloat(nextWeekNV.toFixed(2)));

        const rawOpeningPrice = lastPrice - dividendPerShare;
        const newPrice = alignToTick(Math.max(MIN_VALUE, rawOpeningPrice));

        // ── Step 5: 下市檢查與狀態決定 ──
        let wasDelisted = false;
        let statusAfter = statusBefore as MarketStatus;

        if (nextWeekNV < DELISTING_LINE) {
          statusAfter = MarketStatus.DELISTED;
          wasDelisted = true;
          delistedPairIds.push(pair.id);
        } else {
          statusAfter = nextWeekNV <= WARNING_LINE ? MarketStatus.WARNING : MarketStatus.NORMAL;
        }

        const warningWeeks = statusAfter === MarketStatus.WARNING
          ? (pair.warningWeeks + 1)
          : 0;

        // ── Step 6: 更新 DB ──
        await tx.cpPairs.update({
          where: { id: pair.id },
          data: {
            netValue: nextWeekNV,
            currentPrice: newPrice,
            openingPrice: newPrice, // 寫入本週開盤參考價
            status: statusAfter,
            warningWeeks: warningWeeks,
            adminAdjust: 0.0, // 結算完成自動歸零
            adminAdjustReason: "", // 結算完成理由自動歸零
            lastSettledAt: new Date()
          }
        });

        // ── Step 7: 發放股利及下市強制清算（DB 層面）──
        const holdings = await tx.userPortfolios.findMany({
          where: { pairId: pair.id }
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

        // ── Step 8: 移入歷史表並將事件標記為已結算，但不刪除 (保留至週二凌晨清理) ──
        for (const evt of approvedEvents) {
          const exists = await tx.archivedEvents.findUnique({ where: { url: evt.url } });
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
                createdAt: evt.createdAt,
                reason: evt.reason || ""
              }
            });
          }

          await tx.teeteeEvents.update({
            where: { id: evt.id },
            data: { isSettled: true }
          });
        }

        // 也將本週被拒絕的情報標記為 isSettled: true，供週二大掃除一併清除
        await tx.teeteeEvents.updateMany({
          where: {
            pairId: pair.id,
            status: ReviewStatus.REJECTED,
            isSettled: false
          },
          data: {
            isSettled: true
          }
        });

        // ── Step 9: 寫入結算日誌 ──
        await tx.settlementLog.create({
          data: {
            pairId: pair.id,
            previousNV: currentNV,
            newNV: nextWeekNV,
            collabBonusSum,
            dividendPerShare,
            previousPrice: lastPrice,
            newPrice,
            statusBefore,
            statusAfter,
            wasDelisted,
            adminAdjustReason: pair.adminAdjustReason || ""
          }
        });

        results.push({
          pairId: pair.id,
          newPrice,
          statusAfter,
          wasDelisted
        });
      }

      return { results, delistedPairIds };
    }); // end $transaction

    return NextResponse.json({
      success: true,
      message: 'Settlement completed',
      results: result.results,
      delistedPairs: result.delistedPairIds
    }, { status: 200 });

  } catch (error) {
    console.error('Settlement error:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
