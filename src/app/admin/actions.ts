'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ReviewStatus } from '@/types/enums';
import { runPoll } from '@/cron/crawler';
import { runDailyRolloverOrSettlement } from '@/services/settlementService';

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch (_error) {
    // Ignore error if run from CLI or standalone scripts where Next.js context is absent
  }
}


export async function approveEvent(id: string, type: string, reason?: string) {
  const event = await prisma.teeteeEvents.findUnique({ where: { id } });
  if (!event || event.status !== ReviewStatus.PENDING) return;

  await prisma.$transaction(async (tx) => {
    // 1. 更新事件狀態、類型與理由
    await tx.teeteeEvents.update({
      where: { id },
      data: { 
        status: ReviewStatus.APPROVED,
        type: type,
        reason: reason ? reason.trim() : ""
      }
    });

    // 2. 懸賞結算邏輯
    if (event.reporter && event.reporter !== 'CRAWLER' && event.reporter !== 'SYSTEM') {
      // 從系統公積金扣除 500 $TEE
      await tx.userAccount.upsert({
        where: { userId: 'MARKET_MAKER' },
        update: { balance: { decrement: 500 } },
        create: { userId: 'MARKET_MAKER', balance: 999999999.0 - 500 }
      });

      // 充值 500 $TEE 到回報玩家的帳戶中
      await tx.userAccount.upsert({
        where: { userId: event.reporter },
        update: { balance: { increment: 500 } },
        create: { userId: event.reporter, balance: 10000.0 + 500 }
      });
    }
  });

  safeRevalidatePath('/admin');
  safeRevalidatePath('/admin/review');
}

export async function rejectEvent(id: string, reason?: string) {
  await prisma.teeteeEvents.update({
    where: { id },
    data: { 
      status: ReviewStatus.REJECTED,
      reason: reason ? reason.trim() : ""
    }
  });
  safeRevalidatePath('/admin');
  safeRevalidatePath('/admin/review');
}


export async function triggerSettlement() {
  try {
    await runDailyRolloverOrSettlement({ forceAction: 'settle' });
    safeRevalidatePath('/admin');
    safeRevalidatePath('/admin/review');
    return true;
  } catch (error) {
    console.error('Direct settlement failed:', error);
    throw new Error('Settlement failed: ' + (error instanceof Error ? `${error.message}\n${error.stack}` : String(error)));
  }
}

export async function triggerCrawler() {
  try {
    const result = await runPoll();
    safeRevalidatePath('/admin');
    safeRevalidatePath('/admin/review');
    return result;
  } catch (error) {
    console.error('Direct crawler run failed:', error);
    throw new Error('Crawler trigger failed: ' + (error instanceof Error ? `${error.message}\n${error.stack}` : String(error)));
  }
}

export async function updateAdminAdjust(pairId: string, value: number, reason: string, url: string) {
  if (value === 0) {
    throw new Error('微調加成百分比不能為 0！');
  }
  if (!reason || reason.trim() === '') {
    throw new Error('行政理由必須填寫！');
  }
  if (!url || url.trim() === '') {
    throw new Error('網址必須填寫！');
  }

  // 1. 每週能重複進行，因此不刪除先前的行政干預事件，直接新增一筆獨立的已核可情報
  const overrideVal = value / 100; // 5 -> 0.05
  
  let uniqueUrl = url.trim();
  const existing = await prisma.teeteeEvents.findUnique({
    where: { pairId_url: { pairId, url: uniqueUrl } }
  });
  if (existing) {
    const separator = uniqueUrl.includes('?') ? '&' : '?';
    uniqueUrl = `${uniqueUrl}${separator}_t=${Date.now()}`;
  }

  await prisma.teeteeEvents.create({
    data: {
      pairId,
      title: reason.trim(), // 不要 [行政干預] 字眼
      url: uniqueUrl,
      type: `OVERRIDE:${overrideVal}`,
      reporter: 'ADMIN',
      status: 'APPROVED',
      isSettled: false
    }
  });

  // 2. 同時清除 CpPairs 表上的舊暫存欄位，確保資料乾淨
  await prisma.cpPairs.update({
    where: { id: pairId },
    data: {
      adminAdjust: 0.0,
      adminAdjustReason: ""
    }
  });

  safeRevalidatePath('/admin');
  safeRevalidatePath('/admin/review');
}

export async function approveOneAndRejectOthers(approvedId: string, rejectIds: string[], type: string, approvedReason?: string, rejectReason?: string) {
  await prisma.$transaction(async (tx) => {
    // 1. Approve the selected event and update its type and reason
    const event = await tx.teeteeEvents.findUnique({ where: { id: approvedId } });
    if (event && event.status === ReviewStatus.PENDING) {
      await tx.teeteeEvents.update({
        where: { id: approvedId },
        data: {
          status: ReviewStatus.APPROVED,
          type: type,
          reason: approvedReason ? approvedReason.trim() : ""
        }
      });
      
      // Pay player bounty if reported by a player
      if (event.reporter && event.reporter !== 'CRAWLER' && event.reporter !== 'SYSTEM') {
        await tx.userAccount.upsert({
          where: { userId: 'MARKET_MAKER' },
          update: { balance: { decrement: 500 } },
          create: { userId: 'MARKET_MAKER', balance: 999999999.0 - 500 }
        });
        await tx.userAccount.upsert({
          where: { userId: event.reporter },
          update: { balance: { increment: 500 } },
          create: { userId: event.reporter, balance: 10000.0 + 500 }
        });
      }
    }

    // 2. Reject all other events in the group
    for (const rId of rejectIds) {
      await tx.teeteeEvents.update({
        where: { id: rId },
        data: { 
          status: ReviewStatus.REJECTED,
          reason: rejectReason ? rejectReason.trim() : ""
        }
      });
    }
  });

  safeRevalidatePath('/admin');
  safeRevalidatePath('/admin/review');
}

export async function rejectMultipleEvents(ids: string[], reason?: string) {
  await prisma.teeteeEvents.updateMany({
    where: { id: { in: ids } },
    data: { 
      status: ReviewStatus.REJECTED,
      reason: reason ? reason.trim() : ""
    }
  });
  safeRevalidatePath('/admin');
  safeRevalidatePath('/admin/review');
}

export async function updateProcessedEvent(
  id: string,
  title: string,
  url: string,
  type: string,
  status: string,
  reason: string
) {
  if (!title || title.trim() === '') {
    throw new Error('標題不能為空！');
  }
  if (!url || url.trim() === '') {
    throw new Error('網址不能為空！');
  }

  if (type.startsWith('OVERRIDE:')) {
    const valStr = type.split(':')[1];
    const val = parseFloat(valStr);
    if (isNaN(val) || val === 0) {
      throw new Error('行政微調加成百分比不能為 0！');
    }
  } else if (type !== 'STREAM' && type !== 'STREAM_3D' && type !== 'VIDEO') {
    throw new Error('不支援的情報類型！');
  }

  if (status !== 'APPROVED' && status !== 'REJECTED') {
    throw new Error('無效的審核狀態！');
  }

  const currentEvent = await prisma.teeteeEvents.findUnique({ where: { id } });
  if (!currentEvent) {
    throw new Error('找不到該情報！');
  }

  let uniqueUrl = url.trim();
  if (uniqueUrl !== currentEvent.url) {
    const existing = await prisma.teeteeEvents.findFirst({
      where: { 
        pairId: currentEvent.pairId, 
        url: uniqueUrl,
        id: { not: id }
      }
    });
    if (existing) {
      const separator = uniqueUrl.includes('?') ? '&' : '?';
      uniqueUrl = `${uniqueUrl}${separator}_t=${Date.now()}`;
    }
  }

  await prisma.teeteeEvents.update({
    where: { id },
    data: {
      title: title.trim(),
      url: uniqueUrl,
      type,
      status,
      reason: reason.trim()
    }
  });

  safeRevalidatePath('/admin');
  safeRevalidatePath('/admin/review');
}

export async function deleteProcessedEvent(id: string) {
  await prisma.teeteeEvents.delete({
    where: { id }
  });
  safeRevalidatePath('/admin');
  safeRevalidatePath('/admin/review');
}

export async function dispatchEventToCP(eventId: string, targetPairId: string) {
  await prisma.teeteeEvents.update({
    where: { id: eventId },
    data: {
      pairId: targetPairId,
      status: ReviewStatus.PENDING
    }
  });

  safeRevalidatePath('/admin');
  safeRevalidatePath('/admin/review');
}

