import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { 
  getBaseUrl, 
  exchangeGoogleCode, 
  getGoogleUserProfile,
  exchangeDiscordCode,
  getDiscordUserProfile
} from '@/lib/oauth';

export async function GET(
  request: Request,
  props: { params: Promise<{ provider: string }> }
) {
  const baseUrl = getBaseUrl(request);

  try {
    const { provider } = await props.params;
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const errorParam = url.searchParams.get('error');

    if (errorParam) {
      console.warn(`[OAuth Callback] Provider returned error: ${errorParam}`);
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('第三方授權已被取消或拒絕')}`, baseUrl));
    }

    if (!code) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('無效的授權請求：未取得授權碼')}`, baseUrl));
    }

    // 驗證 CSRF state
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader
        .split(';')
        .map((c) => c.trim().split('='))
        .filter(([k]) => Boolean(k))
    );

    const savedState = cookies['oauth_state'];
    if (!savedState || savedState !== state) {
      console.warn('[OAuth Callback] State mismatch or expired');
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('登入逾時或安全校驗未通過，請重新嘗試')}`, baseUrl));
    }

    const redirectTarget = cookies['oauth_redirect'] ? decodeURIComponent(cookies['oauth_redirect']) : '/';

    let profileData: {
      provider: string;
      providerId: string;
      email: string;
      name: string;
      avatar: string | null;
    };

    if (provider === 'google') {
      const redirectUri = `${baseUrl}/api/auth/callback/google`;
      const tokenData = await exchangeGoogleCode(code, redirectUri);
      const profile = await getGoogleUserProfile(tokenData.access_token);

      if (!profile.email) {
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('無法自 Google 取得電子郵件地址')}`, baseUrl));
      }

      profileData = {
        provider: 'google',
        providerId: profile.sub,
        email: profile.email.toLowerCase().trim(),
        name: profile.name || profile.email.split('@')[0],
        avatar: profile.picture || null
      };
    } else if (provider === 'discord') {
      const redirectUri = `${baseUrl}/api/auth/callback/discord`;
      const tokenData = await exchangeDiscordCode(code, redirectUri);
      const profile = await getDiscordUserProfile(tokenData.access_token);

      const email = (profile.email || `${profile.id}@discord.teeteestock.com`).toLowerCase().trim();

      profileData = {
        provider: 'discord',
        providerId: profile.id,
        email,
        name: profile.name || profile.username || `Discord_${profile.id.slice(-4)}`,
        avatar: profile.avatar || null
      };
    } else {
      return NextResponse.redirect(new URL('/login', baseUrl));
    }

    const { provider: finalProvider, providerId, email, name: displayName, avatar } = profileData;

    // 1. 優先以 (provider, providerId) 尋找既有綁定帳號
    let user = await prisma.user.findFirst({
      where: {
        provider: finalProvider,
        providerId
      }
    });

    // 2. 若未綁定，以 email 尋找（例如先前用 Email 註冊過相同信箱的使用者）
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email }
      });

      if (user) {
        // 自動關聯第三方帳號與頭像
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            provider: finalProvider,
            providerId,
            avatar: avatar || user.avatar
          }
        });
      }
    }

    // 3. 若為全新使用者，自動創建 User 帳戶
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: displayName,
          provider: finalProvider,
          providerId,
          avatar,
          role: 'user'
        }
      });
    }

    // 4. 確保使用者有對應的 UserAccount，並給予初始 10,000 $TEE 資產
    await prisma.userAccount.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, balance: 10000.0 }
    });

    // 5. 簽發 JWT Token（第三方登入預設給予 30 天長效 Session）
    const token = await signToken(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      '30d'
    );

    // 6. 設定 Cookie 並導回使用者原本目標頁面
    const safeRedirect = redirectTarget.startsWith('/') ? redirectTarget : '/';
    const response = NextResponse.redirect(new URL(safeRedirect, baseUrl));

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    });

    // 清除臨時 state Cookie
    response.cookies.delete('oauth_state');
    response.cookies.delete('oauth_redirect');

    return response;

    return NextResponse.redirect(new URL('/login', baseUrl));
  } catch (error: any) {
    console.error('[OAuth Callback Error]:', error);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message || '第三方登入處理失敗，請稍後再試')}`, baseUrl)
    );
  }
}
