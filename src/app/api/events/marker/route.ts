import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTaipeiTime } from '@/utils/marketHours';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id') || url.searchParams.get('pairId');
    if (!id) {
      return NextResponse.json({ error: 'Missing pair id parameter' }, { status: 400 });
    }
    const pairId = id.toUpperCase();

    // Query all approved events for this pair
    const events = await prisma.teeteeEvents.findMany({
      where: {
        pairId,
        status: 'APPROVED'
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const markers = events.map(evt => {
      const tz = getTaipeiTime(evt.createdAt);
      // Pre-calculate timezone-aligned labels matching getX in the chart
      const label1m = `${String(tz.hour).padStart(2, '0')}:${String(tz.minute).padStart(2, '0')}`;
      const label1D = `${String(tz.month).padStart(2, '0')}/${String(tz.day).padStart(2, '0')}`;
      const label1M = `${tz.year}/${String(tz.month).padStart(2, '0')}`;

      return {
        id: evt.id,
        title: evt.title,
        type: evt.type,
        url: evt.url,
        labels: [label1m, label1D, label1M]
      };
    });

    return NextResponse.json({ success: true, markers });
  } catch (error) {
    console.error('Error fetching markers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
