import { NextResponse } from 'next/server';
import { getDividendCooldownInfo, stageManualDividendSettlement } from '@/services/settlementService';

export async function GET() {
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
