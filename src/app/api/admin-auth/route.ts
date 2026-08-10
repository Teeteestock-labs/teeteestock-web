import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'teetee_admin_super_secret_2026';
export const AUTH_COOKIE_NAME = 'teetee_admin_session';

export function getExpectedAuthToken() {
  return crypto.createHash('sha256').update(`${ADMIN_SECRET}_auth_token_v1`).digest('hex');
}

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = session === getExpectedAuthToken();
  return NextResponse.json({ authenticated: isAuthenticated });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;
    if (password === ADMIN_SECRET) {
      const token = getExpectedAuthToken();
      const cookieStore = await cookies();
      cookieStore.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });
      return NextResponse.json({ success: true, message: '管理權限驗證成功！' });
    } else {
      return NextResponse.json({ success: false, error: '通行密碼錯誤，拒絕存取管理後台！' }, { status: 401 });
    }
  } catch (error) {
    console.error('Admin Auth Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  return NextResponse.json({ success: true, message: '已成功登出管理員後台。' });
}
