import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import {
  HOLO_KOUSHIEN_EVENT_ID,
  JUMP_KING_EVENT_ID,
  YUBI_SUMO_EVENT_ID,
  JUMP_KING_LIVE_URL,
  YUBI_SUMO_LIVE_URL,
  getValidChoicesForEvent,
  calculateDynamicEventPool,
  isEventPredictionLocked,
  normalizeEventChoice,
} from '@/utils/eventDeadline';
import { getOrSyncSpecialEvent } from '@/lib/specialEvent';

const RESERVED_USER_IDS = ['MARKET_MAKER', 'SYSTEM_MM', 'SYSTEM'];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const allowTestUnlock = searchParams.get('test_unlock') === 'true';
    const targetEventId = searchParams.get('eventId') || YUBI_SUMO_EVENT_ID;

    // 取得使用者身分 (未登入者為 null，避免回傳 default_player 資料)
    const authUser = await getAuthenticatedUser(request);
    const clientUserId = searchParams.get('userId') || request.headers.get('x-user-id');
    const targetUserId = authUser?.id || clientUserId || null;

    // 查詢此使用者的預測紀錄
    const prediction = targetUserId
      ? await prisma.eventPrediction.findUnique({
          where: {
            userId_eventId: {
              userId: targetUserId,
              eventId: targetEventId,
            },
          },
        })
      : null;

    // 查詢特別企劃狀態 (若未初始化則自動初始化)
    const specialEvent = await getOrSyncSpecialEvent(targetEventId);

    const isManualLocked = specialEvent ? specialEvent.isLocked : false;
    const lockStatus = isEventPredictionLocked(isManualLocked, allowTestUnlock);
    const isSettled = specialEvent?.isSettled || false;
    const winningChoice = specialEvent?.winningChoice || null;
    const isSpecialPriorityWinner = isSettled && targetEventId === YUBI_SUMO_EVENT_ID && winningChoice === 'PekoViVi決賽對決（優先選項）' && Boolean(prediction);
    const hasWon = isSettled && prediction ? (isSpecialPriorityWinner || prediction.choice === winningChoice) : null;
    const isArchived = specialEvent ? Boolean(specialEvent.isArchived) : false;

    // 計算總參與人數與動態獎金池
    const totalPredictions = await prisma.eventPrediction.count({
      where: { eventId: targetEventId },
    });

    const isDynamicPool = targetEventId === YUBI_SUMO_EVENT_ID || targetEventId === JUMP_KING_EVENT_ID;
    const totalPool = isDynamicPool
      ? calculateDynamicEventPool(totalPredictions)
      : specialEvent?.totalPayout || specialEvent?.prize || 500.0;

    return NextResponse.json({
      eventId: targetEventId,
      title: specialEvent?.title || '特別企劃',
      choice: prediction?.choice || null,
      isLocked: isSettled ? true : lockStatus.isLocked,
      message: isSettled
        ? `🏆 本企劃已結算，最終結果為【${winningChoice}】`
        : lockStatus.message,
      isSettled,
      isArchived,
      winningChoice,
      hasWon,
      prize: specialEvent?.prize || 5000.0,
      totalPool,
      totalPredictions,
      choices: getValidChoicesForEvent(targetEventId),
      liveStreamUrl: targetEventId === JUMP_KING_EVENT_ID
        ? JUMP_KING_LIVE_URL
        : targetEventId === YUBI_SUMO_EVENT_ID
        ? YUBI_SUMO_LIVE_URL
        : null,
      settledAt: specialEvent?.settledAt || null,
      userId: targetUserId,
      updatedAt: prediction?.updatedAt || null,
    });
  } catch (error) {
    console.error('[API Events Prediction GET Error]:', error);
    return NextResponse.json(
      { error: '伺服器內部錯誤，無法取得預測資料。' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const allowTestUnlock = searchParams.get('test_unlock') === 'true';

    const body = await request.json().catch(() => ({}));
    const { choice, eventId } = body;
    const targetEventId = eventId || YUBI_SUMO_EVENT_ID;

    // ── 後端安全防禦：先檢查是否已結算或後台手動截止 ──
    const specialEvent = await getOrSyncSpecialEvent(targetEventId);

    if (specialEvent && (specialEvent.isSettled || specialEvent.isArchived)) {
      return NextResponse.json(
        { error: '本企劃活動已圓滿落幕，無法修改選擇。' },
        { status: 403 }
      );
    }

    const isManualLocked = specialEvent?.isLocked || false;
    const lockStatus = isEventPredictionLocked(isManualLocked, allowTestUnlock);
    if (lockStatus.isLocked) {
      return NextResponse.json(
        { error: '本企劃預測已截止，無法修改選擇。' },
        { status: 403 }
      );
    }

    // 檢查選項合法性（支援標準化與相容性）
    const validChoices = getValidChoicesForEvent(targetEventId);
    if (validChoices.length === 0) {
      return NextResponse.json(
        { error: '大會參賽名單籌備中，尚未開放預測選項，敬請期待名單公布！' },
        { status: 400 }
      );
    }
    const normalizedChoice = normalizeEventChoice(choice);
    if (!normalizedChoice || !validChoices.includes(normalizedChoice)) {
      return NextResponse.json(
        { error: '請選擇有效的預測選項。' },
        { status: 400 }
      );
    }
    if (targetEventId === YUBI_SUMO_EVENT_ID && normalizedChoice === 'PekoViVi決賽對決（優先選項）') {
      return NextResponse.json(
        { error: '【PekoViVi決賽對決（優先選項）】為全員特殊加碼條件，無法單獨選取預測。' },
        { status: 400 }
      );
    }

    // 取得使用者身分：未登入者禁止提交預測，避免覆蓋 default_player
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: '請先登入後再進行預測，以確保獎金能發放至您的帳戶' },
        { status: 401 }
      );
    }
    const targetUserId = authUser.id;

    // 阻擋系統保留帳號
    if (RESERVED_USER_IDS.includes(targetUserId) || targetUserId.startsWith('TEST_BOT_')) {
      return NextResponse.json(
        { error: '系統保留帳號無法參與預測活動。' },
        { status: 403 }
      );
    }

    // 將預測選擇持久化存入資料庫
    const prediction = await prisma.eventPrediction.upsert({
      where: {
        userId_eventId: {
          userId: targetUserId,
          eventId: targetEventId,
        },
      },
      create: {
        userId: targetUserId,
        eventId: targetEventId,
        choice: normalizedChoice,
      },
      update: {
        choice: normalizedChoice,
      },
    });

    return NextResponse.json({
      success: true,
      eventId: targetEventId,
      choice: prediction.choice,
      updatedAt: prediction.updatedAt,
    });
  } catch (error) {
    console.error('[API Events Prediction POST Error]:', error);
    return NextResponse.json(
      { error: '伺服器內部錯誤，無法儲存預測選擇。' },
      { status: 500 }
    );
  }
}
