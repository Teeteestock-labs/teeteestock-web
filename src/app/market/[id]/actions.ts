'use server';

import { prisma } from '@/lib/prisma';
import { ReviewStatus } from '@/types/enums';

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

export async function getTeeTeeNews(pairId: string) {
  try {
    const dbPairId = PAIR_ID_MAP[pairId.toLowerCase()] || pairId;
    console.log(`[getTeeTeeNews] Fetching news for pairId: "${pairId}" (Mapped to: "${dbPairId}")`);
    const events = await prisma.teeteeEvents.findMany({
      where: {
        pairId: dbPairId,
        status: ReviewStatus.APPROVED,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20, // Get latest 20 news
    });

    console.log(`[getTeeTeeNews] Found ${events.length} events in DB for "${dbPairId}".`);

    const mapped = events.map(event => {
      let typeLabel = "日常連動";
      let percentStr = "9%";
      if (event.type === 'VIDEO') {
        typeLabel = "新曲/MV";
        percentStr = "30%";
      } else if (event.type === 'STREAM_3D') {
        typeLabel = "大型/3D";
        percentStr = "15%";
      }
      
      const formattedTitle = `[${event.pairId}] ${event.title}`;

      return {
        id: event.id,
        pairId: event.pairId,
        url: event.url,
        eventType: event.type === 'VIDEO'
          ? 'new_song'
          : event.type === 'STREAM_3D'
            ? 'large_event'
            : 'live_collab',
        weight: 0, // 隱藏加成常數，防止外流
        rawText: formattedTitle,
        createdAt: event.createdAt
      };
    });
    
    return mapped;
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

