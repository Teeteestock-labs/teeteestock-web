import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { hashPassword, checkRateLimit } from '@/lib/auth';

/**
 * GET: 預先驗證 Token 有效性（供前端頁面載入時檢查）
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token')?.trim();

    if (!token) {
      return NextResponse.json(
        { valid: false, error: '缺少驗證權杖 (Token)。' },
        { status: 400 }
      );
    }

    // 安全加強：將收到的 Token 雜湊後再查詢（DB 中存的是 SHA-256 雜湊值）
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const record = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
    });

    if (!record) {
      return NextResponse.json(
        { valid: false, error: '此重設密碼連結不存在或已失效。' },
        { status: 400 }
      );
    }

    if (record.used) {
      return NextResponse.json(
        { valid: false, error: '此重設密碼連結已使用過，無法重複使用。' },
        { status: 400 }
      );
    }

    if (new Date() > record.expiresAt) {
      return NextResponse.json(
        { valid: false, error: '此重設密碼連結已逾期（有效時效為 15 分鐘），請重新申請。' },
        { status: 400 }
      );
    }

    // 安全修復：回傳遮罩版 email，避免完整信箱洩漏
    const [localPart, domain] = record.email.split('@');
    const maskedEmail = localPart.length > 2
      ? `${localPart[0]}${'*'.repeat(Math.min(localPart.length - 2, 6))}${localPart[localPart.length - 1]}@${domain}`
      : `${localPart[0]}***@${domain}`;

    return NextResponse.json({
      valid: true,
      email: maskedEmail,
    });
  } catch (error) {
    console.error('[/api/auth/reset-password GET] Error:', error);
    return NextResponse.json(
      { valid: false, error: '伺服器檢驗異常，請稍候再試。' },
      { status: 500 }
    );
  }
}

/**
 * POST: 執行密碼重設
 */
export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown_ip';

    // 1. IP 速率限制：單一 IP 在 1 分鐘內最多 10 次嘗試
    const rateLimit = checkRateLimit(`reset_ip_${ip}`, 10, 60000);
    if (!rateLimit.allowed) {
      const waitSeconds = Math.ceil(rateLimit.resetMs / 1000);
      return NextResponse.json(
        { error: `嘗試頻率過高，請於 ${waitSeconds} 秒後再試。` },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    let { token, password } = body as { token?: string; password?: string };
    token = token?.trim();

    if (!token) {
      return NextResponse.json(
        { error: '缺少重設密碼權杖 (Token)。' },
        { status: 400 }
      );
    }

    // 2. 密碼強度檢驗 (與註冊相同標準：8 碼以上、含英文與數字)
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: '新密碼長度需至少 8 碼以上。' },
        { status: 400 }
      );
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: '新密碼需同時包含英文字母與數字組合。' },
        { status: 400 }
      );
    }

    // 3. 查詢 Token 記錄（以 SHA-256 雜湊值比對）
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const record = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
    });

    if (!record) {
      return NextResponse.json(
        { error: '此重設密碼連結不存在或已被刪除。' },
        { status: 400 }
      );
    }

    if (record.used) {
      return NextResponse.json(
        { error: '此重設密碼連結已使用過，請重新申請。' },
        { status: 400 }
      );
    }

    if (new Date() > record.expiresAt) {
      return NextResponse.json(
        { error: '此重設密碼連結已超過 15 分鐘時效，已失效。請重新申請重設密碼。' },
        { status: 400 }
      );
    }

    // 4. 查詢對應使用者
    const user = await prisma.user.findUnique({
      where: { email: record.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: '找不到該帳號使用者。' },
        { status: 404 }
      );
    }

    // 5. 雜湊新密碼並於事務中更新
    const newPasswordHash = await hashPassword(password);

    await prisma.$transaction([
      // 更新使用者密碼
      prisma.user.update({
        where: { id: user.id },
        data: { password_hash: newPasswordHash },
      }),
      // 將 Token 標記為已使用
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: '密碼已成功重設！請使用新密碼重新登入。',
    });
  } catch (error: any) {
    console.error('[/api/auth/reset-password POST] Error:', error);
    return NextResponse.json(
      { error: '伺服器處理異常，無法重設密碼。' },
      { status: 500 }
    );
  }
}
