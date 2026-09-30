import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAndTickMarketStatus } from '@/services/settlementService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const dbId = resolvedParams.id.toUpperCase();
    const marketStatus = await checkAndTickMarketStatus(new Date());

    const pair = await prisma.cpPairs.findUnique({
      where: { id: dbId }
    });

    if (!pair || dbId === 'HOLOLIVE') {
      return NextResponse.json({ error: 'Pair not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: pair.id,
      name: pair.name,
      currentPrice: pair.currentPrice,
      openingPrice: pair.openingPrice,
      todayOpenPrice: pair.todayOpenPrice,
      status: pair.status,
      warningWeeks: pair.warningWeeks,
      marketStatus
    });
  } catch (error) {
    console.error('Error fetching market detail:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
