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

    return NextResponse.json({
      player: {
        id: account.userId,
        name: account.userId,
        balance: account.balance,
        holdings: portfolios.map((h) => ({
          pairId: h.pairId,
          shares: Number(h.shares_owned), // 安全轉為 Number 以免 JSON 序列化錯誤
          avgCost: h.average_cost,
        })),
      },
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

