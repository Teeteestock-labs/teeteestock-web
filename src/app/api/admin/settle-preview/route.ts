import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MarketStatus, EventType, ReviewStatus } from '@/types/enums';

const WARNING_LINE = 10;          // 警戒線
const DELISTING_LINE = 5;         // 下市線
const MIN_VALUE = 0.1;            // 淨值/價格最低值

export async function GET() {
  try {
    const pairs = await prisma.cpPairs.findMany({
      where: { status: { not: MarketStatus.DELISTED } }
    });

    const previews = [];

    for (const pair of pairs) {
      const statusBefore = pair.status;
      const currentNV = pair.netValue;
      const adminAdjust = pair.adminAdjust;

      // ── Step 1: 計算本週 Collab_Bonus_Sum ──
      const approvedEvents = await prisma.teeteeEvents.findMany({
        where: {
          pairId: pair.id,
          status: ReviewStatus.APPROVED,
          isSettled: false
        }
      });

      const collabBonusSum = approvedEvents.reduce(
        (sum, evt) => {
          if (evt.type === EventType.STREAM) return sum + 0.09;
          if (evt.type === EventType.STREAM_3D) return sum + 0.15;
          if (evt.type === EventType.VIDEO) return sum + 0.30;
          return sum;
        },
        0
      );

      // ── Step 2: 計算 New_NV ──
      const settledNV = currentNV * (1 + collabBonusSum) + (adminAdjust || 0.0);
      const collabBonus = currentNV * collabBonusSum;
      const decay = parseFloat((settledNV * 0.08).toFixed(2));
      
      let nextWeekNV = settledNV * 0.92;
      nextWeekNV = Math.max(MIN_VALUE, parseFloat(nextWeekNV.toFixed(2)));

      let wasDelisted = false;
      let statusAfter = statusBefore as MarketStatus;

      if (nextWeekNV < DELISTING_LINE) {
        statusAfter = MarketStatus.DELISTED;
        wasDelisted = true;
      } else {
        statusAfter = nextWeekNV <= WARNING_LINE ? MarketStatus.WARNING : MarketStatus.NORMAL;
      }

      previews.push({
        pairId: pair.id,
        name: pair.name,
        currentNV,
        collabBonusSum,
        collabBonus,
        decay,
        adminAdjust,
        predictedNV: nextWeekNV,
        statusBefore,
        statusAfter,
        wasDelisted
      });
    }

    return NextResponse.json({
      success: true,
      previews
    });
  } catch (error) {
    console.error('Error fetching settle preview:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
