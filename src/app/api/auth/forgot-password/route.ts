import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/mail';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown_ip';

    // 1. IP 速率限制：單一 IP 在 1 分鐘內最多 5 次請求
    const ipRateLimit = checkRateLimit(`forgot_ip_${ip}`, 5, 60000);
    if (!ipRateLimit.allowed) {
      const waitSeconds = Math.ceil(ipRateLimit.resetMs / 1000);
      return NextResponse.json(
        { error: `請求過於頻繁，請於 ${waitSeconds} 秒後再試。` },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    let { email } = body as { email?: string };
    email = email?.trim().toLowerCase();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: '請輸入有效的電子郵件地址。' },
        { status: 400 }
      );
    }

    // 2. 信箱速率限制：同一信箱在 1 分鐘內最多 3 次請求
    const emailRateLimit = checkRateLimit(`forgot_email_${email}`, 3, 60000);
    if (!emailRateLimit.allowed) {
      const waitSeconds = Math.ceil(emailRateLimit.resetMs / 1000);
      return NextResponse.json(
        { error: `該信箱請求過於頻繁，請於 ${waitSeconds} 秒後再試。` },
        { status: 429 }
      );
    }

    // 3. 查詢使用者
    const user = await prisma.user.findUnique({
      where: { email },
    });

    const genericSuccessMsg = '若此電子郵件已註冊，密碼重設驗證信已寄出，請於 15 分鐘內至信箱查收。';

    // 安全性防探測 (Anti-Enumeration)：即使帳號不存在，亦回傳成功訊息，防止探測註冊名單
    if (!user) {
      return NextResponse.json({
        success: true,
        message: genericSuccessMsg,
      });
    }

    // 安全修復：若為純第三方帳號（無密碼雜湊），統一回傳成功訊息，不透露帳號資訊
    if (!user.password_hash) {
      return NextResponse.json({
        success: true,
        message: genericSuccessMsg,
      });
    }

    // 4. 產生加密隨機 Token 與 15 分鐘到期時間
    const token = crypto.randomBytes(32).toString('hex');
    // 安全加強：DB 中僅存 SHA-256 雜湊，防止資料庫外洩時 Token 被直接使用
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 分鐘時效

    // 將該信箱過去尚未使用的舊 Token 全數標記失效
    await prisma.passwordResetToken.updateMany({
      where: {
        email,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // 建立新 Token（存入雜湊值）
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: tokenHash,
        expiresAt,
      },
    });

    // 5. 構建重設網址
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${proto}://${host}`;
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // 6. 發送電子郵件
    const mailResult = await sendPasswordResetEmail(email, resetUrl);

    // 安全修復：僅在開發環境回傳 devResetUrl，正式環境絕不透露 Token
    const isDev = process.env.NODE_ENV === 'development';

    return NextResponse.json({
      success: true,
      message: genericSuccessMsg,
      isDevFallback: isDev && mailResult.isDevFallback,
      devResetUrl: isDev && mailResult.isDevFallback ? resetUrl : undefined,
    });
  } catch (error: any) {
    console.error('[/api/auth/forgot-password] Error:', error);
    return NextResponse.json(
      { error: '伺服器處理異常，請稍候再試。' },
      { status: 500 }
    );
  }
}
