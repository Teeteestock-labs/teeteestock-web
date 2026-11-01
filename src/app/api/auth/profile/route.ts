import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: '未授權或登入已逾期，請先登入。' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { name } = body as { name?: string };

    if (typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: '請提供有效的交易暱稱。' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      return NextResponse.json(
        { success: false, error: '交易暱稱不可為空白。' },
        { status: 400 }
      );
    }

    if (trimmedName.length > 20) {
      return NextResponse.json(
        { success: false, error: '交易暱稱長度上限為 20 個字元。' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name: trimmedName },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        provider: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        provider: updatedUser.provider,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[API Auth Profile PATCH Error]:', error);
    return NextResponse.json(
      { success: false, error: '更新失敗，伺服器內部錯誤。' },
      { status: 500 }
    );
  }
}
