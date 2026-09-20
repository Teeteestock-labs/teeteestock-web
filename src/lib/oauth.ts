import { prisma } from './prisma';

export function getBaseUrl(request: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
  }
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
  const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export function getGoogleAuthUrl(redirectUri: string, state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'select_account'
  });
  return `${rootUrl}?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string, redirectUri: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Google Token Exchange Error]:', errorText);
    throw new Error(`Google Token Exchange Failed: ${response.statusText}`);
  }

  return response.json() as Promise<{
    access_token: string;
    id_token: string;
    expires_in: number;
    token_type: string;
  }>;
}

export async function getGoogleUserProfile(accessToken: string) {
  const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Google user profile');
  }

  return response.json() as Promise<{
    sub: string;
    email: string;
    name?: string;
    picture?: string;
    email_verified?: boolean;
  }>;
}
