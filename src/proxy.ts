import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const nextAction = request.headers.get('next-action');

  // 攔截長度異常過短的惡意掃描 Bot (如 next-action: "x" 或 "action")
  // 正常的 Next.js Server Action ID 為編譯器產生的長雜湊字串 (通常 >= 32 字元)
  if (nextAction && nextAction.length < 16) {
    return new NextResponse('Bad Request: Invalid Server Action', { status: 400 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 匹配所有頁面與 API 路由，排除靜態資產
    '/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)',
  ],
};
