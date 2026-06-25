import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
    const { orderId } = body as { orderId: string };

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    // Find the order in the database
    const order = await prisma.orderBook.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Delete the order
    await prisma.orderBook.delete({
      where: { id: orderId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
