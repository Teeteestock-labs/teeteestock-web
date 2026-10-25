import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import Link from 'next/link';
import AdminLoginForm from '../AdminLoginForm';
import AdminLogoutButton from '../AdminLogoutButton';
import { AUTH_COOKIE_NAME, getExpectedAuthToken } from '@/app/api/admin-auth/route';
import {
  HOLO_KOUSHIEN_EVENT_ID,
  JUMP_KING_EVENT_ID,
  JUMP_KING_LIVE_URL,
  JUMP_KING_CHOICES,
  VALID_SCHOOL_CHOICES,
  calculateJumpKingPool,
} from '@/utils/eventDeadline';
import { getOrSyncSpecialEvent } from '@/lib/specialEvent';
import AdminEventsClient, { type EventData } from './AdminEventsClient';

export const dynamic = 'force-dynamic';

async function loadEventData(
  eventId: string,
  choices: readonly string[],
  isDynamic: boolean = false,
  liveUrl?: string | null
): Promise<EventData> {
  const specialEvent = await getOrSyncSpecialEvent(eventId);

  const allPredictions = await prisma.eventPrediction.findMany({
    where: { eventId },
    orderBy: { createdAt: 'desc' },
  });

  const totalPredictions = allPredictions.length;

  const countsMap = new Map<string, number>();
  for (const choice of choices) {
    countsMap.set(choice, 0);
  }
  for (const p of allPredictions) {
    countsMap.set(p.choice, (countsMap.get(p.choice) || 0) + 1);
  }

  const options = choices.map((choiceName) => {
    const count = countsMap.get(choiceName) || 0;
    const percentage = totalPredictions > 0 ? Math.round((count / totalPredictions) * 100) : 0;
    return {
      name: choiceName,
      count,
      percentage,
    };
  });

  const recentPredictions = allPredictions.slice(0, 50).map((p) => ({
    userId: p.userId,
    choice: p.choice,
    createdAt: p.createdAt.toISOString(),
  }));

  const totalPool = isDynamic
    ? calculateJumpKingPool(totalPredictions)
    : specialEvent.totalPayout || specialEvent.prize || 500.0;

  return {
    id: specialEvent.id,
    title: specialEvent.title,
    prize: specialEvent.prize,
    totalPool,
    isDynamicPool: isDynamic,
    liveStreamUrl: liveUrl || null,
    isLocked: specialEvent.isLocked,
    lockedAt: specialEvent.lockedAt?.toISOString() || null,
    isSettled: specialEvent.isSettled,
    isArchived: Boolean(specialEvent.isArchived),
    winningChoice: specialEvent.winningChoice,
    settledAt: specialEvent.settledAt?.toISOString() || null,
    winnerCount: specialEvent.winnerCount,
    totalPayout: specialEvent.totalPayout,
    totalPredictions,
    options,
    recentPredictions,
  };
}

export default async function AdminEventsPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = sessionToken === getExpectedAuthToken();

  if (!isAuthenticated) {
    return <AdminLoginForm />;
  }

  // 1. 取得 JUMP KING HOLORACE（進行中企劃）
  const jumpKingData = await loadEventData(
    JUMP_KING_EVENT_ID,
    JUMP_KING_CHOICES,
    true,
    JUMP_KING_LIVE_URL
  );

  // 2. 取得甲子園 2026（歷屆已結束企劃）
  const holoKoushienData = await loadEventData(
    HOLO_KOUSHIEN_EVENT_ID,
    VALID_SCHOOL_CHOICES,
    false,
    null
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8 font-sans select-none selection:bg-pink-500/30 selection:text-pink-200">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation & Logout */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/quantum-nexus-77/review"
              className="text-sm font-semibold text-gray-400 hover:text-pink-400 flex items-center gap-1 transition-colors"
            >
              ← 返回情報審查中樞
            </Link>
            <span className="text-gray-700">|</span>
            <Link
              href="/events"
              target="_blank"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              前台企劃頁面 ↗
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-600 hidden sm:inline">
              台北時間: {new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}
            </span>
            <AdminLogoutButton />
          </div>
        </div>

        {/* Header */}
        <header className="bg-gray-900/40 border border-gray-800/80 p-6 rounded-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400 tracking-tight">
              特別企劃管理中樞
            </h1>
            <p className="text-xs text-gray-400 mt-1 font-mono">
              社群重大賽事預測 · JUMP KING HOLORACE &amp; 歷屆企劃派彩管理
            </p>
          </div>
        </header>

        {/* Client Interface */}
        <AdminEventsClient events={[jumpKingData, holoKoushienData]} />
      </div>
    </div>
  );
}
