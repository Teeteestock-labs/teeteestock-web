import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderSide } from '@/types/enums';
import { alignToTick } from '@/utils/validatePrice';
import { isMarketOpen } from '@/utils/marketHours';

export async function POST(request: Request) {
  try {
    if (!isMarketOpen()) {
      return NextResponse.json(
        { error: '交易所目前處於非營運時段，開盤時間為 18:00 - 24:00。' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { pairId, side, price, volume, userId } = body as {
      pairId: string;
      side: string;
      price: number;
      volume: number;
      userId?: string;
    };

    if (!pairId || !side || !price || !volume) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cleanSide = side.toUpperCase();
    if (cleanSide !== OrderSide.BUY && cleanSide !== OrderSide.SELL) {
      return NextResponse.json({ error: 'Invalid side (must be BUY or SELL)' }, { status: 400 });
    }

    if (price <= 0 || volume <= 0) {
      return NextResponse.json({ error: 'Price and volume must be greater than zero' }, { status: 400 });
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

    const targetUserId = userId || 'default_player';

    // ── 資產與庫存安全檢查 ──
    if (cleanSide === OrderSide.BUY) {
      // 取得所有未成交的買單金額
      const pendingBuyOrders = await prisma.orderBook.findMany({
        where: { userId: targetUserId, side: OrderSide.BUY }
      });
      const pendingCost = pendingBuyOrders.reduce((sum, o) => sum + o.price * o.volume, 0);

      const account = await prisma.userAccount.findUnique({
        where: { userId: targetUserId }
      });
      const balance = account ? account.balance : 10000;

      if (balance - pendingCost < price * volume) {
        return NextResponse.json({ error: '可用餘額不足（已扣除其他委託中買單金額）' }, { status: 400 });
      }
    } else {
      // 取得所有未成交的賣單股數
      const pendingSellOrders = await prisma.orderBook.findMany({
        where: { userId: targetUserId, side: OrderSide.SELL, pairId: pair.id }
      });
      const pendingShares = pendingSellOrders.reduce((sum, o) => sum + o.volume, 0);

      const portfolio = await prisma.userPortfolios.findUnique({
        where: { userId_pairId: { userId: targetUserId, pairId: pair.id } }
      });
      const sharesOwned = portfolio ? Number(portfolio.shares_owned) : 0;

      if (sharesOwned - pendingShares < volume) {
        return NextResponse.json({ error: '可賣庫存不足（已扣除其他委託中賣單股數）' }, { status: 400 });
      }
    }

    // 寫入 DB OrderBook
    const order = await prisma.orderBook.create({
      data: {
        userId: targetUserId,
        pairId: pair.id,
        side: cleanSide,
        price,
        volume,
      }
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error('Error submitting order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
