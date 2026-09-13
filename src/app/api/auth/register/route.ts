import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, AUTH_COOKIE_NAME, checkRateLimit } from '@/lib/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    // 取得客戶端 IP 執行頻率限制 (1 分鐘內最多 10 次嘗試)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown_ip';
    const rateLimit = checkRateLimit(`register_${ip}`, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: '嘗試註冊過於頻繁，請於 1 分鐘後再試。' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    let { email, password, name } = body as {
      email?: string;
      password?: string;
      name?: string;
    };

    email = email?.trim().toLowerCase();
    name = name?.trim();

    // 1. 輸入校驗
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: '請輸入有效的電子郵件格式。' }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ error: '密碼長度需至少 8 碼以上。' }, { status: 400 });
    }

    // 密碼需同時包含英文與數字
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json({ error: '密碼需包含英文字母與數字組合。' }, { status: 400 });
    }

    // 2. 檢查 Email 唯一性
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '此電子郵件帳號已被註冊，請直接登入或使用其他信箱。' },
        { status: 409 }
      );
    }

    // 3. 密碼安全性雜湊
    const passwordHash = await hashPassword(password);
    const finalName = name || email.split('@')[0];

    // 4. 資料庫事務寫入：建立 User 並初始化 UserAccount (初始資金 10,000 $TEE)
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          name: finalName,
          password_hash: passwordHash,
          role: 'user',
        },
      });

      // 初始化專屬資產帳戶
      await tx.userAccount.upsert({
        where: { userId: newUser.id },
        update: {},
        create: {
          userId: newUser.id,
          balance: 10000.0,
        },
      });

      return newUser;
    });

    // 5. 簽發 JWT Token (預設 7 天有效)
    const token = await signToken(
      {
        userId: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
      },
      '7d'
    );

    // 6. 設定 HttpOnly 安全 Cookie
    const response = NextResponse.json(
      {
        success: true,
        message: '註冊成功！已自動為您登入並發放 10,000 $TEE 初始資產。',
        user: {
          id: result.id,
          email: result.email,
          name: result.name,
          role: result.role,
        },
      },
      { status: 201 }
    );

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 天
    });

    return response;
  } catch (error) {
    console.error('[API Register Error]:', error);
    return NextResponse.json({ error: '伺服器發生未預期錯誤，請稍後再試。' }, { status: 500 });
  }
}
