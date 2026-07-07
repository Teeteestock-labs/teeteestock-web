import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAndTickMarketStatus } from '@/services/settlementService';

export async function POST(request: Request) {
  try {
    const now = new Date();
    const marketStatus = await checkAndTickMarketStatus(now);

    if (marketStatus === 'CLOSED' || marketStatus === 'SETTLING') {
      return NextResponse.json(
        { error: `交易所目前處於非營運清算狀態 (${marketStatus})，拒絕撤單操作。` },
        { status: 403 }
      );
    }
    if (marketStatus === 'MAINTENANCE') {
      return NextResponse.json(
        { error: '系統維護中，全面禁止任何撤單操作。' },
        { status: 403 }
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
