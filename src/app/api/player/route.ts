import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserChoice } from '@/types/enums';

const DEFAULT_PLAYER_ID = 'default_player';
const DEFAULT_BALANCE = 10000;

export async function GET() {
  try {
    // 取得或建立預設玩家帳戶
    let account = await prisma.userAccount.findUnique({
      where: { userId: DEFAULT_PLAYER_ID },
    });

    if (!account) {
      account = await prisma.userAccount.create({
        data: {
          userId: DEFAULT_PLAYER_ID,
          balance: DEFAULT_BALANCE,
        },
      });
    }

    // 取得玩家的持股 portfolios
    const portfolios = await prisma.userPortfolios.findMany({
      where: { userId: DEFAULT_PLAYER_ID },
    });

    const settlementLogs = await prisma.settlementLog.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // 取得玩家買進與賣出各股票的所有歷史交易，用以重建各個歷史結算點的實際持股
    const userAllTrades = await prisma.trades.findMany({
      where: {
        OR: [
          { buyerId: DEFAULT_PLAYER_ID },
          { sellerId: DEFAULT_PLAYER_ID }
        ]
      },
      select: { pairId: true, buyerId: true, sellerId: true, volume: true, createdAt: true },
      orderBy: { createdAt: 'asc' }
    });

    const firstBoughtMap: Record<string, string> = {};
    userAllTrades.forEach(t => {
      if (t.buyerId === DEFAULT_PLAYER_ID) {
        const p = t.pairId.toLowerCase();
        if (!firstBoughtMap[p]) {
          firstBoughtMap[p] = t.createdAt.toISOString();
        }
      }
    });

    const mappedSettlementLogs = settlementLogs.map(l => {
      const settleTime = l.createdAt.getTime();
      const p = l.pairId.toLowerCase();

      // 累計截至該除息結算時間點為止的玩家淨持股數量
      let buyVol = 0;
      let sellVol = 0;
      userAllTrades.forEach(t => {
        if (t.pairId.toLowerCase() === p && t.createdAt.getTime() <= settleTime) {
          if (t.buyerId === DEFAULT_PLAYER_ID) buyVol += t.volume;
          if (t.sellerId === DEFAULT_PLAYER_ID) sellVol += t.volume;
        }
      });

      let userSharesAtSettle = Math.max(0, buyVol - sellVol);

      // 若截至結算時間無撮合交易紀錄但玩家買進時間點早於結算時間且現有持股 > 0，取現有持股為保底
      if (userSharesAtSettle === 0 && firstBoughtMap[p]) {
        const firstBoughtTime = new Date(firstBoughtMap[p]).getTime();
        if (firstBoughtTime <= settleTime + 60000) {
          const currentHolding = portfolios.find(h => h.pairId.toLowerCase() === p);
          if (currentHolding) {
            userSharesAtSettle = Number(currentHolding.shares_owned);
          }
        }
      }

      const userPayout = parseFloat((userSharesAtSettle * (l.dividendPerShare || 0)).toFixed(2));

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

    return NextResponse.json({
      player: {
        id: account.userId,
        name: account.userId,
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
      settlementLogs: mappedSettlementLogs
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

