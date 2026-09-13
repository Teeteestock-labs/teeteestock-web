import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { prisma } from './prisma';

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'teeteestock_jwt_secret_key_super_secure_2026_@#';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export const AUTH_COOKIE_NAME = 'auth_token';

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
  name?: string | null;
}

/**
 * 密碼安全性雜湊 (bcrypt cost factor: 10)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * 密碼比對
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * 簽發 JWT Token (使用 jose，相容 Node.js 與 Edge Runtime)
 */
export async function signToken(
  payload: AuthPayload,
  expiresIn: string = '2h'
): Promise<string> {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

/**
 * 驗證 JWT Token
 */
export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: (payload.role as string) || 'user',
      name: (payload.name as string) || null,
    };
  } catch {
    return null;
  }
}

/**
 * 從請求中讀取 Cookie 或 Authorization 標頭中的 Token
 */
export function extractTokenFromRequest(request: Request): string | null {
  // 1. 優先從 Cookie 中讀取
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader
      .split(';')
      .map((c) => c.trim().split('='))
      .filter(([k]) => Boolean(k))
  );

  if (cookies[AUTH_COOKIE_NAME]) {
    return decodeURIComponent(cookies[AUTH_COOKIE_NAME]);
  }

  // 2. 備用語法：從 Authorization: Bearer <token> 讀取
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * 取得當前已驗證之使用者資料
 */
export async function getAuthenticatedUser(request: Request) {
  const token = extractTokenFromRequest(request);
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || !payload.userId) return null;

  // 查詢資料庫確保該使用者真實存在且狀態正常
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
}

// ── 簡易記憶體級防暴力破解速率限制器 (Rate Limiter) ──
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(key: string, maxAttempts = 5, windowMs = 60000): {
  allowed: boolean;
  remaining: number;
  resetMs: number;
} {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetMs: windowMs };
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetMs: record.resetTime - now };
  }

  record.count += 1;
  return { allowed: true, remaining: maxAttempts - record.count, resetMs: record.resetTime - now };
}
