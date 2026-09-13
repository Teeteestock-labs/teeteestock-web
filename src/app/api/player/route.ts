import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserChoice } from '@/types/enums';
import { getAuthenticatedUser } from '@/lib/auth';

const DEFAULT_PLAYER_ID = 'default_player';
const DEFAULT_BALANCE = 10000;

export async function GET(request: Request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    const targetUserId = authUser?.id || DEFAULT_PLAYER_ID;
    const displayName = authUser?.name || targetUserId;

    // 取得或建立玩家帳戶
    let account = await prisma.userAccount.findUnique({
      where: { userId: targetUserId },
    });

    if (!account) {
      account = await prisma.userAccount.create({
        data: {
          userId: targetUserId,
          balance: DEFAULT_BALANCE,
        },
      });
    }

    // 取得玩家的持股 portfolios
    const portfolios = await prisma.userPortfolios.findMany({
      where: { userId: targetUserId },
    });

    const settlementLogs = await prisma.settlementLog.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const userDividendLogs = await prisma.userDividendLog.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: 'desc' }
    });

    // 取得玩家買進與賣出各股票的所有歷史交易，用以重建各個歷史結算點的實際持股
    const userAllTrades = await prisma.trades.findMany({
      where: {
        OR: [
          { buyerId: targetUserId },
          { sellerId: targetUserId }
        ]
      },
      select: { pairId: true, buyerId: true, sellerId: true, volume: true, createdAt: true },
      orderBy: { createdAt: 'asc' }
    });

    const firstBoughtMap: Record<string, string> = {};
    userAllTrades.forEach(t => {
      if (t.buyerId === targetUserId) {
        const p = t.pairId.toLowerCase();
        if (!firstBoughtMap[p]) {
          firstBoughtMap[p] = t.createdAt.toISOString();
        }
      }
    });

    const mappedSettlementLogs = settlementLogs.map(l => {
      const settleTime = l.createdAt.getTime();
      const p = l.pairId.toLowerCase();

      // Check UserDividendLog first for exact recorded payout
      const exactLog = userDividendLogs.find(
        d => d.pairId.toLowerCase() === p && Math.abs(d.createdAt.getTime() - settleTime) < 300000
      );

      let userSharesAtSettle = exactLog ? Number(exactLog.sharesOwned) : 0;
      let userPayout = exactLog ? exactLog.totalPayout : 0;

      if (!exactLog) {
        // 沒有 UserDividendLog 精確記錄 = 該期未參與配息，不使用現在持股反推
        // （歷史結算在加入 UserDividendLog 功能之前的資料將自然隱藏）
      }

      return {
        id: l.id,
        pairId: l.pairId,
        dividendPerShare: l.dividendPerShare,
        newNV: l.newNV,
        createdAt: l.createdAt.toISOString(),
        userSharesAtSettle,
        userPayout
      };
    });

    const mappedDividendLogs = userDividendLogs.map(d => ({
      id: d.id,
      pairId: d.pairId,
      sharesOwned: Number(d.sharesOwned),
      dividendPerShare: d.dividendPerShare,
      totalPayout: d.totalPayout,
      createdAt: d.createdAt.toISOString()
    }));

    return NextResponse.json({
      player: {
        id: account.userId,
        name: displayName,
        balance: account.balance,
        holdings: portfolios.map((h) => {
          const p = h.pairId.toLowerCase();
          return {
            pairId: h.pairId,
            shares: Number(h.shares_owned), // 安全轉為 Number 以免 JSON 序列化錯誤
            avgCost: h.average_cost,
            firstBoughtAt: firstBoughtMap[p] || null,
          };
        }),
      },
      settlementLogs: mappedSettlementLogs,
      dividendLogs: mappedDividendLogs
    });
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { balance, holdings } = body as {
      balance: number;
      holdings: { pairId: string; shares: number; avgCost: number }[];
    };

    await prisma.$transaction(async (tx) => {
      // 1. 更新或建立帳戶餘額
      await tx.userAccount.upsert({
        where: { userId: DEFAULT_PLAYER_ID },
        update: { balance },
        create: {
          userId: DEFAULT_PLAYER_ID,
          balance,
        },
      });

      // 2. 刪除原有持股
      await tx.userPortfolios.deleteMany({
        where: { userId: DEFAULT_PLAYER_ID },
      });

      // 3. 寫入新持股
      if (holdings && holdings.length > 0) {
        // 因 portfolios 在 postgresql 中需要有外鍵對應到存在於 CpPairs 的紀錄
        // 為防止外鍵衝突，我們過濾掉不存在於 CpPairs 中的 pairId
        const validPairs = await tx.cpPairs.findMany({
          select: { id: true }
        });
        const validPairIds = new Set(validPairs.map(p => p.id));

        const dataToInsert = holdings
          .filter(h => validPairIds.has(h.pairId))
          .map((h) => ({
            userId: DEFAULT_PLAYER_ID,
            pairId: h.pairId,
            shares_owned: BigInt(h.shares), // 寫入資料庫為 BigInt
            average_cost: h.avgCost,
            initial_choice: UserChoice.CASH_ONLY,
          }));

        if (dataToInsert.length > 0) {
          await tx.userPortfolios.createMany({
            data: dataToInsert,
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

