import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAndTickMarketStatus } from '@/services/settlementService';

export async function POST(request: Request) {
  try {
    const now = new Date();
    const marketStatus = await checkAndTickMarketStatus(now);

    if (marketStatus === 'MAINTENANCE') {
      return NextResponse.json(
        { error: '系統維護中，全面禁止任何撤單操作。' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId, userId = 'default_player' } = body as { orderId: string; userId?: string };

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

    // Prevent cancelling MARKET_MAKER orders
    if (order.userId === 'MARKET_MAKER') {
      return NextResponse.json({ error: '無法撤銷造市商委託單。' }, { status: 403 });
    }

    // Verify the requesting user owns the order
    if (order.userId !== userId) {
      return NextResponse.json({ error: '您無權撤銷此委託單。' }, { status: 403 });
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
