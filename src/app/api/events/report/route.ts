import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EventType, ReviewStatus } from '@/types/enums';
import { getAuthenticatedUser } from '@/lib/auth';

const PAIR_ID_MAP: Record<string, string> = {
  'micomet': 'MCMT',
  'okakoro': 'OKKR',
  'pekomarin': 'PKMR',
  'pekomarine': 'PKMR',    // cpList uses 'PekoMarine'
  'noefure': 'NEFL',
  'noelflare': 'NEFL',      // cpList uses 'NoelFlare'
  'soraz': 'SRAZ',
  'fubumio': 'FBMO',
  'shishiwata': 'SSWT',
  'subaruna': 'SBRN',
  'aziro': 'AZIR'
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pairId, url, userId, type: reportType } = body as { pairId: string; url: string; userId?: string; type?: string };

    if (!pairId || !url) {
      return NextResponse.json({ error: 'Missing pairId or url' }, { status: 400 });
    }

    const dbPairId = PAIR_ID_MAP[pairId.toLowerCase()] || pairId;

    // URL 驗證：解析 hostname 防止 .includes() 繞過（如 evil.com?ref=youtube.com）
    let isValidPlatform = false;
    try {
      const parsedUrl = new URL(url.trim());
      const hostname = parsedUrl.hostname.toLowerCase();
      const ALLOWED_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'x.com', 'twitter.com', 'www.twitter.com', 'mobile.twitter.com'];
      isValidPlatform = ALLOWED_HOSTS.some(h => hostname === h || hostname.endsWith('.' + h));
    } catch {
      // URL 解析失敗
    }

    if (!isValidPlatform) {
      return NextResponse.json({ error: 'Only YouTube or X/Twitter URLs are allowed' }, { status: 400 });
    }

    // Check if CpPair exists
    const pair = await prisma.cpPairs.findUnique({
      where: { id: dbPairId }
    });
    if (!pair || dbPairId === 'hololive') {
      return NextResponse.json({ error: 'Invalid CP Pair ID' }, { status: 400 });
    }

    // Unique URL check (prevent spam/duplicate submissions for the same CP pair)
    const existingEvent = await prisma.teeteeEvents.findUnique({
      where: {
        pairId_url: {
          pairId: dbPairId,
          url
        }
      }
    });

    if (existingEvent) {
      return NextResponse.json({ 
        success: false, 
        error: '此情報連結已被回報過，請勿重複遞交！' 
      }, { status: 400 });
    }

    // Determine EventType from request body, default to STREAM
    let type = EventType.STREAM;
    if (reportType === 'VIDEO' || reportType === 'new_song') {
      type = EventType.VIDEO;
    } else if (reportType === 'STREAM_3D' || reportType === 'large_event') {
      type = EventType.STREAM_3D;
    }

    const authUser = await getAuthenticatedUser(request);
    const reporterId = authUser?.id || (userId && userId !== 'default_player' ? userId : 'default_player');

    // Insert as PENDING
    const event = await prisma.teeteeEvents.create({
      data: {
        pairId: dbPairId,
        url,
        type,
        title: `股民懸賞回報 (組合: ${dbPairId})`,
        reporter: reporterId,
        status: ReviewStatus.PENDING,
      }
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error('Error in player report API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
