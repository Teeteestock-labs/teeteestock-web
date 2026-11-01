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
    const { name, avatar } = body as { name?: string; avatar?: string | null };

    const dataToUpdate: { name?: string; avatar?: string | null } = {};

    // 1. 交易暱稱校驗 (若有傳入)
    if (name !== undefined) {
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

      dataToUpdate.name = trimmedName;
    }

    // 2. 個人頭像校驗 (若有傳入)
    if (avatar !== undefined) {
      if (avatar === null || avatar === '') {
        dataToUpdate.avatar = null;
      } else if (typeof avatar === 'string') {
        const trimmedAvatar = avatar.trim();

        // 驗證格式：支援 http/https URL、本機相對路徑、或是 data:image/... base64 格式
        const isUrl = /^https?:\/\/.+/i.test(trimmedAvatar);
        const isDataUrl = /^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,/i.test(trimmedAvatar);
        const isRelative = trimmedAvatar.startsWith('/');

        if (!isUrl && !isDataUrl && !isRelative) {
          return NextResponse.json(
            { success: false, error: '頭像格式不正確，請提供有效的圖片網址或上傳圖片。' },
            { status: 400 }
          );
        }

        // 避免超大 payload (限制約 700KB 字元，壓縮後 256x256 WebP 約 20KB~50KB)
        if (trimmedAvatar.length > 700000) {
          return NextResponse.json(
            { success: false, error: '圖片檔案過大，請選擇較小的圖片或壓縮後再上傳。' },
            { status: 400 }
          );
        }

        dataToUpdate.avatar = trimmedAvatar;
      } else {
        return NextResponse.json(
          { success: false, error: '頭像資料格式無效。' },
          { status: 400 }
        );
      }
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { success: false, error: '未提供任何需要更新的資料。' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: dataToUpdate,
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
