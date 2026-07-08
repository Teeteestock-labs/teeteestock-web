import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runDailyRolloverOrSettlement } from '@/services/settlementService';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const adminSecret = process.env.ADMIN_SECRET || 'secret';
  if (authHeader !== `Bearer ${adminSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Parse query params or body for forced action or override date
    const url = new URL(request.url);
    const forceActionParam = url.searchParams.get('action'); // 'settle' or 'rollover'
    const dateParam = url.searchParams.get('date'); // 'YYYY-MM-DD' or ISO format
    
    let forceAction: 'settle' | 'rollover' | undefined = undefined;
    if (forceActionParam === 'settle' || forceActionParam === 'rollover') {
      forceAction = forceActionParam;
    }
    
    let targetDate: Date | undefined = undefined;
    if (dateParam) {
      const parsed = Date.parse(dateParam);
      if (!isNaN(parsed)) {
        targetDate = new Date(parsed);
      }
    }
    
    // Support JSON body as well
    try {
      const body = await request.clone().json();
      if (body.action === 'settle' || body.action === 'rollover') {
        forceAction = body.action;
      }
      if (body.date) {
        const parsed = Date.parse(body.date);
        if (!isNaN(parsed)) {
          targetDate = new Date(parsed);
        }
      }
    } catch {
      // ignore json parse error if not provided
    }

    const isSettle = forceAction === 'settle' || (!forceAction && targetDate && (new Date(targetDate).getDay() === 2 || new Date(targetDate).getDay() === 1));

    if (isSettle) {
      await prisma.systemConfig.update({
        where: { id: 1 },
        data: { marketStatus: 'SETTLING' }
      });
    }

    const serviceResult = await runDailyRolloverOrSettlement({
      forceAction,
      targetDate
    });

    await prisma.systemConfig.update({
      where: { id: 1 },
      data: { marketStatus: serviceResult.actionExecuted === 'settle' ? 'SETTLING' : 'CLOSED' }
    });

    return NextResponse.json({
      success: true,
      action: serviceResult.actionExecuted,
      message: serviceResult.message,
      results: serviceResult.results,
      delistedPairs: serviceResult.delistedPairs || []
    }, { status: 200 });

  } catch (error) {
    console.error('Settlement route error:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
