import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[API Auth Me Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
