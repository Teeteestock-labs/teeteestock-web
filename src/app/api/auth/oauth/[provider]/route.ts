import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getBaseUrl, getGoogleAuthUrl } from '@/lib/oauth';

export async function GET(
  request: Request,
  props: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await props.params;
    const url = new URL(request.url);
    const redirectTarget = url.searchParams.get('redirect') || '/';

    const baseUrl = getBaseUrl(request);
    const redirectUri = `${baseUrl}/api/auth/callback/${provider}`;

    // CSRF 防護隨機 state
    const state = crypto.randomBytes(16).toString('hex');

    if (provider === 'google') {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!clientId) {
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent('Google 登入服務尚未配置 Client ID')}`, baseUrl)
        );
      }

      const googleAuthUrl = getGoogleAuthUrl(redirectUri, state);
      const response = NextResponse.redirect(googleAuthUrl);

      // 儲存 state 與重定向目標至 Cookie（有效期 10 分鐘）
      response.cookies.set('oauth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 600
      });

      response.cookies.set('oauth_redirect', redirectTarget, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 600
      });

      return response;
    }

    if (provider === 'discord' || provider === 'github') {
      return NextResponse.redirect(
        new URL(
          `/login?notice=${encodeURIComponent(`目前已優先啟用 Google 快速登入，${provider === 'discord' ? 'Discord' : 'GitHub'} 即將開放！`)}`,
          baseUrl
        )
      );
    }

    return NextResponse.redirect(new URL('/login', baseUrl));
  } catch (error) {
    console.error('[OAuth Init Error]:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
  }
}
