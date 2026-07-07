import { NextResponse } from 'next/server';
import { runPoll } from '@/cron/crawler';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const adminSecret = process.env.ADMIN_SECRET || 'secret';
    
    // Simple authorization check
    if (authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await runPoll();
    return NextResponse.json({
      success: true,
      message: 'Crawler triggered successfully',
      result
    });
  } catch (error) {
    console.error('Crawler API error:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
