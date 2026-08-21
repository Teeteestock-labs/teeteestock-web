import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTaipeiTime } from '@/utils/marketHours';

const DEFAULT_USER_ID = 'default_player';

// 獎勵配置 (週三到週日)
const REWARD_SCHEDULE: Record<string, { dayName: string; amount: number; dayIndex: number }> = {
  WED: { dayName: '週三', amount: 50, dayIndex: 3 },
  THU: { dayName: '週四', amount: 50, dayIndex: 4 },
  FRI: { dayName: '週五', amount: 100, dayIndex: 5 },
  SAT: { dayName: '週六', amount: 100, dayIndex: 6 },
  SUN: { dayName: '週日', amount: 100, dayIndex: 0 },
};

const DAY_INDEX_TO_KEY: Record<number, string> = {
  3: 'WED',
  4: 'THU',
  5: 'FRI',
  6: 'SAT',
  0: 'SUN',
};

// 輔助函數：計算 ISO 週數與年份 (以台北時間為準)
function getTaipeiYearAndWeek(now: Date = new Date()) {
  const tz = getTaipeiTime(now);
  const d = new Date(Date.UTC(tz.year, tz.month - 1, tz.day));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo, dayOfWeek: tz.dayOfWeek };
}

export async function GET() {
  try {
    const now = new Date();
    const { year, week, dayOfWeek } = getTaipeiYearAndWeek(now);
    const todayKey = DAY_INDEX_TO_KEY[dayOfWeek] || null;

    // 查詢使用者當週已領取的所有獎勵紀錄
    const claimedRecords = await prisma.userLoginReward.findMany({
      where: {
        userId: DEFAULT_USER_ID,
        rewardYearInt: year,
        rewardWeekInt: week,
      },
    });

    const claimedSet = new Set(claimedRecords.map((r) => r.rewardDay));

    const todayConfig = todayKey ? REWARD_SCHEDULE[todayKey] : null;
    const isTodayClaimed = todayKey ? claimedSet.has(todayKey) : true;
    const isTodayClaimable = !!todayConfig && !isTodayClaimed;

    const daysProgress = Object.keys(REWARD_SCHEDULE).map((key) => ({
      key,
      label: key, // 'WED', 'THU', 'FRI', 'SAT', 'SUN'
      dayName: REWARD_SCHEDULE[key].dayName,
      amount: REWARD_SCHEDULE[key].amount,
      claimed: claimedSet.has(key),
      isToday: key === todayKey,
    }));

    return NextResponse.json({
      success: true,
      todayKey,
      isTodayClaimable,
      todayAmount: todayConfig ? todayConfig.amount : 0,
      daysProgress,
    });
  } catch (error) {
    console.error('Error fetching login reward info:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const now = new Date();
    const { year, week, dayOfWeek } = getTaipeiYearAndWeek(now);
    const todayKey = DAY_INDEX_TO_KEY[dayOfWeek];

    if (!todayKey || !REWARD_SCHEDULE[todayKey]) {
      return NextResponse.json(
        { error: '今日（週一/週二）非登入獎勵發放日' },
        { status: 400 }
      );
    }

    const { amount } = REWARD_SCHEDULE[todayKey];

    // 原子化檢查與匯入資產
    const result = await prisma.$transaction(async (tx) => {
      // 檢查當天是否已領取
      const existing = await tx.userLoginReward.findUnique({
        where: {
          userId_rewardYearInt_rewardWeekInt_rewardDay: {
            userId: DEFAULT_USER_ID,
            rewardYearInt: year,
            rewardWeekInt: week,
            rewardDay: todayKey,
          },
        },
      });

      if (existing) {
        throw new Error('ALREADY_CLAIMED');
      }

      // 1. 紀錄領取歷史
      const rewardRecord = await tx.userLoginReward.create({
        data: {
          userId: DEFAULT_USER_ID,
          rewardDay: todayKey,
          rewardYearInt: year,
          rewardWeekInt: week,
          amount,
        },
      });

      // 2. 即時更新/匯入玩家資產 (balance + amount)
      const updatedAccount = await tx.userAccount.upsert({
        where: { userId: DEFAULT_USER_ID },
        update: { balance: { increment: amount } },
        create: { userId: DEFAULT_USER_ID, balance: 10000.0 + amount },
      });

      return { rewardRecord, newBalance: updatedAccount.balance };
    });

    return NextResponse.json({
      success: true,
      message: `成功領取今日登入獎勵 +${amount} $TEE`,
      amount,
      newBalance: result.newBalance,
      claimedDay: todayKey,
    });
  } catch (error: any) {
    if (error?.message === 'ALREADY_CLAIMED') {
      return NextResponse.json(
        { error: '今日登入獎勵已領取過，請勿重複領取' },
        { status: 400 }
      );
    }
    console.error('Error claiming login reward:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
