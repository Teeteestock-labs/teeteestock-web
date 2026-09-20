import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken, AUTH_COOKIE_NAME, checkRateLimit } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown_ip';

    const body = await request.json().catch(() => ({}));
    let { email, password, rememberMe } = body as {
      email?: string;
      password?: string;
      rememberMe?: boolean;
    };

    email = email?.trim().toLowerCase();

    if (!email || !password) {
      return NextResponse.json({ error: '請輸入電子郵件與密碼。' }, { status: 400 });
    }

    // 防暴力破解：限制單一 IP 或帳號在 1 分鐘內最多嘗試 5 次
    const rateLimitKey = `login_${email}_${ip}`;
    const rateLimit = checkRateLimit(rateLimitKey, 5, 60000);
    if (!rateLimit.allowed) {
      const waitSeconds = Math.ceil(rateLimit.resetMs / 1000);
      return NextResponse.json(
        { error: `密碼嘗試次數過多，為保障帳戶安全，請於 ${waitSeconds} 秒後再試。` },
        { status: 429 }
      );
    }

    // 1. 查詢使用者
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 2. 比對密碼（找不到使用者或密碼不符均回傳同一模糊錯誤訊息，防帳號探測）
    if (!user) {
      return NextResponse.json(
        { error: '電子郵件或密碼錯誤，請重新確認。' },
        { status: 401 }
      );
    }

    if (!user.password_hash) {
      return NextResponse.json(
        { error: `此帳號係使用第三方（${user.provider}）快速登入建立，請點擊下方第三方按鈕登入。` },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { error: '電子郵件或密碼錯誤，請重新確認。' },
        { status: 401 }
      );
    }

    // 確保使用者有對應的 UserAccount (若舊帳戶或手動註冊缺失時自動補齊)
    await prisma.userAccount.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, balance: 10000.0 },
    });

    // 3. 依據 rememberMe 決定 Token 有效期
    const expiresIn = rememberMe ? '30d' : '2h';
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 2 * 60 * 60;

    const token = await signToken(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      expiresIn
    );

    // 4. 設定 HttpOnly Cookie
    const response = NextResponse.json({
      success: true,
      message: '登入成功！',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return response;
  } catch (error) {
    console.error('[API Login Error]:', error);
    return NextResponse.json({ error: '伺服器發生未預期錯誤，請稍後再試。' }, { status: 500 });
  }
}
