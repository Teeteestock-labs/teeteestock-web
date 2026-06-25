import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EventType, ReviewStatus } from '@/types/enums';

const PAIR_ID_MAP: Record<string, string> = {
  'micomet': 'MCMT',
  'okakoro': 'OKKR',
  'pekomarin': 'PKMR',
  'noefure': 'NEFL',
  'soraz': 'SRAZ',
  'fubumio': 'FBMO',
  'shishiwata': 'SSWT',
  'subaruna': 'SBRN',
  'aziro': 'AZIR'
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('Authorization');
    const crawlerToken = process.env.CRAWLER_TOKEN;

    const token = body.token || authHeader;

    if (!token || token !== crawlerToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Expected fields with fallback support:
    const pairId = body.pairId;
    if (!pairId) {
      return NextResponse.json({ error: 'Missing pairId' }, { status: 400 });
    }
    const dbPairId = PAIR_ID_MAP[pairId.toLowerCase()] || pairId.toUpperCase();
    const url = body.url;
    const eventType = body.eventType || body.type;
    const rawText = body.rawText || body.title;
    const timestamp = body.timestamp;

    if (!dbPairId || !eventType || !url || !rawText) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Check if the URL already exists (Deduplication)
    const existingEvent = await prisma.teeteeEvents.findUnique({
      where: { url }
    });

    if (existingEvent) {
      return NextResponse.json({ success: true, message: 'Already exists, skipped' }, { status: 200 });
    }

    // 映射舊 eventType 字串至 EventType Enum
    let type: EventType = EventType.STREAM;
    if (eventType === 'new_song' || eventType === 'video' || eventType === 'VIDEO') {
      type = EventType.VIDEO;
    } else if (eventType === 'STREAM_3D' || eventType === 'large_event') {
      type = EventType.STREAM_3D;
    }

    let status = ReviewStatus.PENDING;
    if (body.status === ReviewStatus.APPROVED || body.status === ReviewStatus.REJECTED || body.status === ReviewStatus.PENDING) {
      status = body.status;
    }

    const event = await prisma.teeteeEvents.create({
      data: {
        pairId: dbPairId,
        url,
        type,
        title: rawText,
        timestamp: timestamp || null,
        reporter: 'CRAWLER',
        status,
      }
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error('Error inserting staging event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

