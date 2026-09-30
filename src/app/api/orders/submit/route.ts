import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderSide } from '@/types/enums';
import { alignToTick } from '@/utils/validatePrice';
import { checkAndTickMarketStatus } from '@/services/settlementService';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const now = new Date();
    const marketStatus = await checkAndTickMarketStatus(now);

    if (marketStatus === 'CLOSED' || marketStatus === 'SETTLING' || marketStatus === 'CLOSED_SETTLED') {
      return NextResponse.json(
        { error: `交易所目前處於非營運清算狀態 (${marketStatus})，拒絕任何掛單寫入。` },
        { status: 403 }
      );
    }
    if (marketStatus === 'MAINTENANCE') {
      return NextResponse.json(
        { error: '系統維護中，全面禁止任何交易操作。' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { pairId, side, price, volume, userId } = body as {
      pairId: string;
      side: string;
      price: number;
      volume: number;
      userId?: string;
      orderType?: string;
      type?: string;
    };

    if (marketStatus === 'PRE_MARKET') {
      const orderType = (body.orderType || body.type || 'LIMIT').toUpperCase();
      const isMarketOrder = orderType === 'MARKET' || orderType === 'MARKET_ORDER';
      if (isMarketOrder) {
        return NextResponse.json(
          { error: '盤前純掛單期禁止市價單搶跑' },
          { status: 400 }
        );
      }
    }

    if (!pairId || !side || !price || !volume) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cleanSide = side.toUpperCase();
    if (cleanSide !== OrderSide.BUY && cleanSide !== OrderSide.SELL) {
      return NextResponse.json({ error: 'Invalid side (must be BUY or SELL)' }, { status: 400 });
    }

    if (!Number.isFinite(price) || !Number.isFinite(volume) || price <= 0 || volume <= 0) {
      return NextResponse.json({ error: 'Price and volume must be valid positive numbers' }, { status: 400 });
    }

    if (!Number.isInteger(volume)) {
      return NextResponse.json({ error: 'Volume must be a whole number' }, { status: 400 });
    }

    const cleanPairId = pairId.toUpperCase();

    // 取得該股當日的開盤參考價 CpPairs.openingPrice
    const pair = await prisma.cpPairs.findUnique({
      where: { id: cleanPairId }
    });

    if (!pair) {
      return NextResponse.json({ error: 'CP Pair not found' }, { status: 404 });
    }

    const openingPrice = pair.openingPrice;
    const ceiling = alignToTick(openingPrice * 1.20);
    const floor = alignToTick(openingPrice * 0.80);

    // API 價格攔截 (精確到小數點下兩位)
    if (price > ceiling || price < floor) {
      return NextResponse.json({ error: "委託價格超出今日漲跌停限制區間。" }, { status: 400 });
    }

    const alignedPrice = alignToTick(price);
    if (Math.abs(alignedPrice - price) > 0.001) {
      return NextResponse.json({ error: '委託價格不符合最小跳動單位（tick size）規則。' }, { status: 400 });
    }

    const authUser = await getAuthenticatedUser(request);
    // 安全修復：未驗證的請求一律強制使用 default_player，不信任 body.userId
    const targetUserId = authUser?.id || 'default_player';

    // 保留帳號保護：禁止透過 API 以系統帳號身分下單
    const RESERVED_IDS = ['MARKET_MAKER', 'SYSTEM_MM', 'SYSTEM'];
    if (RESERVED_IDS.includes(targetUserId) || targetUserId.startsWith('TEST_BOT_')) {
      return NextResponse.json({ error: '禁止使用系統保留帳號下單。' }, { status: 403 });
    }

    // ── Self-Match Prevention (API-Level Defense) ──
    const isBot = false; // 用戶端 API 永遠不是 bot
    if (!isBot) {
      let hasOppositeOrder = false;
      if (cleanSide === OrderSide.BUY) {
        // New buy order: check if there are pending sells <= new price
        const opp = await prisma.orderBook.findFirst({
          where: {
            userId: targetUserId,
            pairId: pair.id,
            side: OrderSide.SELL,
            price: { lte: price }
          }
        });
        hasOppositeOrder = !!opp;
      } else {
        // New sell order: check if there are pending buys >= new price
        const opp = await prisma.orderBook.findFirst({
          where: {
            userId: targetUserId,
            pairId: pair.id,
            side: OrderSide.BUY,
            price: { gte: price }
          }
        });
        hasOppositeOrder = !!opp;
      }

      if (hasOppositeOrder) {
        return NextResponse.json(
          { error: "不允許自買自賣。您在該價位已有反向的未結委託在排隊，請先至下方的未結委託區手動撤單。" },
          { status: 400 }
        );
      }
    }

    // ── 資產與庫存安全檢查 + 委託寫入（原子性交易，防止 TOCTOU race condition）──
    const order = await prisma.$transaction(async (tx) => {
      if (cleanSide === OrderSide.BUY) {
        // 取得所有未成交的買單金額
        const pendingBuyOrders = await tx.orderBook.findMany({
          where: { userId: targetUserId, side: OrderSide.BUY }
        });
        const pendingCost = pendingBuyOrders.reduce((sum, o) => sum + o.price * o.volume, 0);

        const account = await tx.userAccount.findUnique({
          where: { userId: targetUserId }
        });
        const balance = account ? account.balance : 10000;

        if (balance - pendingCost < price * volume) {
          throw new Error('可用餘額不足（已扣除其他委託中買單金額）');
        }
      } else {
        // 取得所有未成交的賣單股數
        const pendingSellOrders = await tx.orderBook.findMany({
          where: { userId: targetUserId, side: OrderSide.SELL, pairId: pair.id }
        });
        const pendingShares = pendingSellOrders.reduce((sum, o) => sum + o.volume, 0);

        const portfolio = await tx.userPortfolios.findUnique({
          where: { userId_pairId: { userId: targetUserId, pairId: pair.id } }
        });
        const sharesOwned = portfolio ? Number(portfolio.shares_owned) : 0;

        if (sharesOwned - pendingShares < volume) {
          throw new Error('可賣庫存不足（已扣除其他委託中賣單股數）');
        }
      }

      // 寫入 DB OrderBook（在同一 transaction 內，確保原子性）
      return await tx.orderBook.create({
        data: {
          userId: targetUserId,
          pairId: pair.id,
          side: cleanSide,
          price,
          volume,
        }
      });
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: any) {
    // 將 transaction 內的業務錯誤回傳給前端
    if (error?.message?.includes('餘額不足') || error?.message?.includes('庫存不足')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Error submitting order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
