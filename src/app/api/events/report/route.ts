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
    const { pairId, url, userId } = body as { pairId: string; url: string; userId?: string };

    if (!pairId || !url) {
      return NextResponse.json({ error: 'Missing pairId or url' }, { status: 400 });
    }

    const dbPairId = PAIR_ID_MAP[pairId.toLowerCase()] || pairId;

    // Basic URL validation matching frontend patterns
    const lowerUrl = url.toLowerCase().trim();
    const isValidPlatform = 
      lowerUrl.includes('youtube.com') || 
      lowerUrl.includes('youtu.be') || 
      lowerUrl.includes('x.com') || 
      lowerUrl.includes('twitter.com');

    if (!isValidPlatform) {
      return NextResponse.json({ error: 'Only YouTube or X/Twitter URLs are allowed' }, { status: 400 });
    }

    // Check if CpPair exists
    const pair = await prisma.cpPairs.findUnique({
      where: { id: dbPairId }
    });
    if (!pair) {
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

    // Determine default EventType (default to STREAM as a placeholder)
    const type = EventType.STREAM;

    const reporterId = userId || 'default_player';

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
