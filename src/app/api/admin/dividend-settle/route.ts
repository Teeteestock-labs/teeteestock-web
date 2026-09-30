import { NextResponse } from 'next/server';
import { getDividendCooldownInfo, stageManualDividendSettlement } from '@/services/settlementService';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, getExpectedAuthToken } from '@/app/api/admin-auth/route';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (session !== getExpectedAuthToken()) {
    return false;
  }
  return true;
}

export async function GET() {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }
  try {
    const cooldown = await getDividendCooldownInfo();
    return NextResponse.json({
      success: true,
      cooldown
    });
  } catch (error) {
    console.error('Error fetching dividend cooldown info:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST() {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }
  try {
    const result = await stageManualDividendSettlement();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error executing manual dividend settlement:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal Server Error'
    }, { status: 400 });
  }
}

export async function DELETE() {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }
  try {
    await prisma.systemConfig.upsert({
      where: { id: 1 },
      update: {
        lastDividendTriggeredAt: null,
        pendingDividendSettle: false
      },
      create: {
        id: 1,
        marketStatus: 'CLOSED',
        lastDividendTriggeredAt: null,
        pendingDividendSettle: false
      }
    });

    const cooldown = await getDividendCooldownInfo();
    return NextResponse.json({
      success: true,
      message: '已重置除息冷卻時間與暫存狀態。',
      cooldown
    });
  } catch (error) {
    console.error('Error resetting dividend cooldown:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
