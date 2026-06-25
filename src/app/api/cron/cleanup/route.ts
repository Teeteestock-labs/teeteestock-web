import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ReviewStatus } from '@/types/enums';

export async function POST(request: Request) {
  try {
    const result = await prisma.teeteeEvents.deleteMany({
      where: {
        status: { in: [ReviewStatus.APPROVED, ReviewStatus.REJECTED] },
        isSettled: true
      }
    });

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${result.count} history events.`,
      count: result.count
    }, { status: 200 });
  } catch (error) {
    console.error('Cleanup cron error:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
