'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ReviewStatus } from '@/types/enums';

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch (error) {
    // Ignore error if run from CLI or standalone scripts where Next.js context is absent
  }
}


export async function approveEvent(id: string, type: string, reason: string) {
  if (!reason || reason.trim() === '') {
    throw new Error('審查核可必須填寫理由！');
  }
  const event = await prisma.teeteeEvents.findUnique({ where: { id } });
  if (!event || event.status !== ReviewStatus.PENDING) return;

  await prisma.$transaction(async (tx) => {
    // 1. 更新事件狀態、類型與理由
    await tx.teeteeEvents.update({
      where: { id },
      data: { 
        status: ReviewStatus.APPROVED,
        type: type,
        reason: reason.trim()
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

export async function rejectEvent(id: string, reason: string) {
  if (!reason || reason.trim() === '') {
    throw new Error('審查拒絕必須填寫理由！');
  }
  await prisma.teeteeEvents.update({
    where: { id },
    data: { 
      status: ReviewStatus.REJECTED,
      reason: reason.trim()
    }
  });
  safeRevalidatePath('/admin');
  safeRevalidatePath('/admin/review');
}


export async function triggerSettlement() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/cron/settle`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ADMIN_SECRET || 'secret'}` // basic auth
    }
  });
  
  if (!response.ok) {
    throw new Error('Settlement failed');
  }
  
  safeRevalidatePath('/admin');
  safeRevalidatePath('/admin/review');
  return true;
}

export async function updateAdminAdjust(pairId: string, value: number, reason: string) {
  if (value !== 0 && (!reason || reason.trim() === '')) {
    throw new Error('行政干預微調必須填寫理由！');
  }
  await prisma.cpPairs.update({
    where: { id: pairId },
    data: { 
      adminAdjust: value,
      adminAdjustReason: value === 0 ? "" : reason.trim()
    }
  });
  safeRevalidatePath('/admin');
  safeRevalidatePath('/admin/review');
}

export async function approveOneAndRejectOthers(approvedId: string, rejectIds: string[], type: string, approvedReason: string, rejectReason: string) {
  if (!approvedReason || approvedReason.trim() === '') {
    throw new Error('審查核可必須填寫理由！');
  }
  if (!rejectReason || rejectReason.trim() === '') {
    throw new Error('審查拒絕必須填寫理由！');
  }
  await prisma.$transaction(async (tx) => {
    // 1. Approve the selected event and update its type and reason
    const event = await tx.teeteeEvents.findUnique({ where: { id: approvedId } });
    if (event && event.status === ReviewStatus.PENDING) {
      await tx.teeteeEvents.update({
        where: { id: approvedId },
        data: {
          status: ReviewStatus.APPROVED,
          type: type,
          reason: approvedReason.trim()
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
          reason: rejectReason.trim()
        }
      });
    }
  });

  safeRevalidatePath('/admin');
  safeRevalidatePath('/admin/review');
}

export async function rejectMultipleEvents(ids: string[], reason: string) {
  if (!reason || reason.trim() === '') {
    throw new Error('審查拒絕必須填寫理由！');
  }
  await prisma.teeteeEvents.updateMany({
    where: { id: { in: ids } },
    data: { 
      status: ReviewStatus.REJECTED,
      reason: reason.trim()
    }
  });
  safeRevalidatePath('/admin');
  safeRevalidatePath('/admin/review');
}

