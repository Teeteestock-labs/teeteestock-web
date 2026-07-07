import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EventType, ReviewStatus } from '@/types/enums';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pairId, eventType, url, rawText, userId } = body;

    if (!pairId || !eventType || !url || !rawText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Deduplication logic
    const existingEvent = await prisma.teeteeEvents.findUnique({
      where: {
        pairId_url: {
          pairId,
          url
        }
      }
    });

    if (existingEvent) {
      return NextResponse.json({ 
        success: true, 
        message: 'Duplicate report merged', 
        event: existingEvent 
      }, { status: 200 });
    }

    // Determine EventType Enum based on input string
    let type: EventType = EventType.STREAM;
    if (eventType === 'new_song' || eventType === 'video' || eventType === 'VIDEO') {
      type = EventType.VIDEO;
    } else if (eventType === 'STREAM_3D' || eventType === 'large_event') {
      type = EventType.STREAM_3D;
    }

    // Create new crowdsourced event
    const event = await prisma.teeteeEvents.create({
      data: {
        pairId,
        url,
        type,
        title: rawText,
        reporter: userId || 'USER_ID',
        status: ReviewStatus.PENDING,
        createdAt: body.createdAt ? new Date(body.createdAt) : undefined
      }
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error('Error inserting crowdsource event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

