import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import { parseStringPromise } from 'xml2js';
import dotenv from 'dotenv';
import { prisma } from '../lib/prisma';
import { EventType, ReviewStatus } from '../types/enums';
import { runDailyRolloverOrSettlement } from '../services/settlementService';

// Load environment variables
dotenv.config();

// ── Channels & Keyword Matrix ──

interface ChannelConfig {
  channelId: string;
  name: string;
  // Match keyword regex for the partner member in the title/description
  targetKeywords: RegExp[];
}

interface CPConfig {
  pairId: string;
  channels: ChannelConfig[];
  // CP specific labels or hashtags
  generalKeywords: RegExp[];
}

const CP_CONFIGS: CPConfig[] = [
  {
    pairId: 'AZIR', // AZKi x Kazama Iroha
    generalKeywords: [/あずいろ/i, /AZIro/i, /aziro/i],
    channels: [
      {
        channelId: 'UC0TXe_LYZ4scaW2XMyi5_kw', // AZKi
        name: 'AZKi',
        targetKeywords: [/風真/i, /いろは/i, /Iroha/i, /風真伊呂波/i, /ござる/i]
      },
      {
        channelId: 'UC_vMYWcDjmfdpH6r4TTn1MQ', // Kazama Iroha
        name: 'Kazama Iroha',
        targetKeywords: [/AZKi/i, /あずき/i, /Azki/i]
      }
    ]
  },
  {
    pairId: 'FBMO', // FubuMio
    generalKeywords: [/フブミオ/i, /FubuMio/i, /fubumio/i],
    channels: [
      {
        channelId: 'UCdn5BQ06XqgXoAxIhbqw5Rg', // Shirakami Fubuki
        name: 'Shirakami Fubuki',
        targetKeywords: [/ミオ/i, /Mio/i, /大神ミオ/i, /Mio-sha/i, /ミオしゃ/i]
      },
      {
        channelId: 'UCp-5t9SrOQwXMU7iIjQfARg', // Ookami Mio
        name: 'Ookami Mio',
        targetKeywords: [/フブキ/i, /Fubuki/i, /白上/i, /吹雪/i]
      }
    ]
  },
  {
    pairId: 'MCMT', // miComet
    generalKeywords: [/みこめっと/i, /miComet/i, /micomet/i],
    channels: [
      {
        channelId: 'UC-hM6YJuNYVAmUWxeIr9FeA', // Sakura Miko
        name: 'Sakura Miko',
        targetKeywords: [/星街/i, /すいせい/i, /Suisei/i, /彗星/i, /Sui-chan/i, /すいちゃん/i]
      },
      {
        channelId: 'UC5CwaMl1eIgY8h02uZw7u8A', // Hoshimachi Suisei
        name: 'Hoshimachi Suisei',
        targetKeywords: [/櫻巫女/i, /さくらみこ/i, /みこ/i, /Miko/i, /みこち/i, /Mikochi/i, /さくら/i]
      }
    ]
  },
  {
    pairId: 'NEFL', // NoelFlare
    generalKeywords: [/ノエフレ/i, /NoeFure/i, /noefure/i],
    channels: [
      {
        channelId: 'UCdyqAaZDKHXg4Ahi7VENThQ', // Shirogane Noel
        name: 'Shirogane Noel',
        targetKeywords: [/フレア/i, /Flare/i, /芙蕾雅/i, /不知火/i, /ふーたん/i]
      },
      {
        channelId: 'UCvInZx9h3jC2JzsIzoOebWg', // Shiranui Flare
        name: 'Shiranui Flare',
        targetKeywords: [/ノエル/i, /Noel/i, /白銀/i, /諾艾爾/i, /団長/i, /Danchou/i]
      }
    ]
  },
  {
    pairId: 'OKKR', // OkaKoro
    generalKeywords: [/おかころ/i, /OkaKoro/i, /okakoro/i],
    channels: [
      {
        channelId: 'UCvaTdHTWBGv3MKj3KVqJVCw', // Nekomata Okayu
        name: 'Nekomata Okayu',
        targetKeywords: [/ころね/i, /沁音/i, /Korone/i, /麵包狗/i]
      },
      {
        channelId: 'UChAnqc_AY5_I3Px5dig3X1Q', // Inugami Korone
        name: 'Inugami Korone',
        targetKeywords: [/おかゆ/i, /小粥/i, /Okayu/i, /小粥貓/i]
      }
    ]
  },
  {
    pairId: 'PKMR', // PekoMarin
    generalKeywords: [/ぺこまり/i, /PekoMarin/i, /pekomarin/i],
    channels: [
      {
        channelId: 'UC1DCedRgGHBdm81E1llLhOQ', // Usada Pekora
        name: 'Usada Pekora',
        targetKeywords: [/マリン/i, /Marine/i, /船長/i, /寶鐘/i, /宝鐘/i]
      },
      {
        channelId: 'UCCzUftO8KOVkV4wQG1vkUvg', // Houshou Marine
        name: 'Houshou Marine',
        targetKeywords: [/ぺこら/i, /Pekora/i, /兔田/i, /ぺこちゃん/i]
      }
    ]
  },
  {
    pairId: 'SSWT', // ShiShiWata
    generalKeywords: [/ししわた/i, /ShiShiWata/i, /shishiwata/i],
    channels: [
      {
        channelId: 'UCUKD-uaobj9jiqB-VXt71mA', // Shishiro Botan
        name: 'Shishiro Botan',
        targetKeywords: [/わため/i, /Watame/i, /角卷/i, /角巻/i, /綿芽/i, /わためぇ/i]
      },
      {
        channelId: 'UCqm3BQLlJfvkTsX_hvm0UmA', // Tsunomaki Watame
        name: 'Tsunomaki Watame',
        targetKeywords: [/ぼたん/i, /Botan/i, /獅白/i, /牡丹/i, /ししろ/i, /ししろん/i]
      }
    ]
  },
  {
    pairId: 'SRAZ', // SorAZ
    generalKeywords: [/SorAZ/i, /soraz/i],
    channels: [
      {
        channelId: 'UCp6993wxpyDPHUpavwDFqgg', // Tokino Sora
        name: 'Tokino Sora',
        targetKeywords: [/AZKi/i, /あずき/i, /Azki/i]
      },
      {
        channelId: 'UC0TXe_LYZ4scaW2XMyi5_kw', // AZKi
        name: 'AZKi',
        targetKeywords: [/そら/i, /Sora/i, /ときのそら/i, /空媽/i]
      }
    ]
  },
  {
    pairId: 'SBRN', // SubaRuna
    generalKeywords: [/スバルな/i, /SubaRuna/i, /subaruna/i],
    channels: [
      {
        channelId: 'UCvzGlP9oQwU--Y0r9id_jnA', // Oozora Subaru
        name: 'Oozora Subaru',
        targetKeywords: [/ルーナ/i, /Luna/i, /姬森/i, /璐娜/i, /Runa/i, /姬森ルーナ/i]
      },
      {
        channelId: 'UCa9Y57gfeY0Zro_noHRVrnw', // Himemori Luna
        name: 'Himemori Luna',
        targetKeywords: [/スバル/i, /Subaru/i, /大空/i, /Subaru-senpai/i]
      }
    ]
  }
];

const CACHE_FILE = path.join(process.cwd(), 'youtube-cache.json');
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

interface VideoFeed {
  url: string;
  title: string;
  description: string;
  publishedAt: string;
  actualStartTime?: string;
  scheduledStartTime?: string;
  tags?: string[];
}

// ── Cache Mechanism ──

function loadCache(): string[] {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8');
      return JSON.parse(data) as string[];
    }
  } catch (error) {
    console.error('Failed to load cache file, returning empty array:', error);
  }
  return [];
}

function saveCache(cache: string[]) {
  try {
    const trimmed = cache.slice(-500); // Max 500 entries in cache
    fs.writeFileSync(CACHE_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save cache file:', error);
  }
}

function isCached(pairId: string, url: string, cache: string[]): boolean {
  return cache.includes(`${pairId}:${url}`) || cache.includes(url);
}

// ── Date Helpers ──

export function isYesterdayInTaipei(dateInput: string | Date, executionDate: Date = new Date()): boolean {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  
  const yesterday = new Date(executionDate);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const yesterdayParts = formatter.formatToParts(yesterday);
  const getYesterdayPart = (type: string) => parseInt(yesterdayParts.find(p => p.type === type)?.value || '0', 10);
  
  const yestYear = getYesterdayPart('year');
  const yestMonth = getYesterdayPart('month');
  const yestDay = getYesterdayPart('day');
  
  const startStr = `${yestYear}-${String(yestMonth).padStart(2, '0')}-${String(yestDay).padStart(2, '0')}T00:00:00`;
  const endStr = `${yestYear}-${String(yestMonth).padStart(2, '0')}-${String(yestDay).padStart(2, '0')}T23:59:59.999`;
  
  const startMs = Date.parse(`${startStr}+08:00`);
  const endMs = Date.parse(`${endStr}+08:00`);
  
  const targetMs = typeof dateInput === 'string' ? Date.parse(dateInput) : dateInput.getTime();
  
  if (isNaN(targetMs)) return false;
  return targetMs >= startMs && targetMs <= endMs;
}

// ── Crawl Handlers ──

async function fetchVideosFromAPI(channelId: string): Promise<VideoFeed[]> {
  const uploadsPlaylistId = channelId.substring(0, 1) + 'U' + channelId.substring(2);
  const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=10&key=${YOUTUBE_API_KEY}`;
  
  try {
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      throw new Error(`YouTube API returned status ${res.status}`);
    }
    const data = await res.json() as any;
    const items = data.items || [];
    if (items.length === 0) return [];

    const videoIds = items.map((item: any) => item.snippet?.resourceId?.videoId).filter(Boolean).join(',');
    if (!videoIds) return [];

    // Query video details batch to fetch descriptions, tags and liveStreamingDetails
    const detailUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    const detailRes = await fetch(detailUrl, { signal: AbortSignal.timeout(10000) });
    if (!detailRes.ok) {
      // Fallback to playlistItems
      return items.map((item: any) => {
        const snippet = item.snippet || {};
        const videoId = snippet.resourceId?.videoId || '';
        return {
          url: `https://www.youtube.com/watch?v=${videoId}`,
          title: snippet.title || '',
          description: snippet.description || '',
          publishedAt: snippet.publishedAt || new Date().toISOString(),
          tags: []
        };
      });
    }

    const detailData = await detailRes.json() as any;
    const details = detailData.items || [];

    return details.map((video: any) => {
      const snippet = video.snippet || {};
      const liveDetails = video.liveStreamingDetails || {};
      return {
        url: `https://www.youtube.com/watch?v=${video.id}`,
        title: snippet.title || '',
        description: snippet.description || '',
        publishedAt: snippet.publishedAt || new Date().toISOString(),
        actualStartTime: liveDetails.actualStartTime,
        scheduledStartTime: liveDetails.scheduledStartTime,
        tags: snippet.tags || []
      };
    });
  } catch (error) {
    console.warn(`[YouTube API Error] Channel ${channelId} fetch failed, falling back to RSS Feed:`, error);
    return fetchVideosFromRSS(channelId);
  }
}

async function fetchVideosFromRSS(channelId: string): Promise<VideoFeed[]> {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  
  try {
    const res = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) {
      throw new Error(`YouTube RSS returned status ${res.status}`);
    }
    const xml = await res.text();
    const result = await parseStringPromise(xml);

    if (!result.feed || !result.feed.entry) return [];

    const entries = result.feed.entry.slice(0, 10);
    return entries.map((entry: any) => {
      const videoId = entry['yt:videoId']?.[0] || '';
      const title = entry.title?.[0] || '';
      const mediaGroup = entry['media:group']?.[0] || {};
      const description = mediaGroup['media:description']?.[0] || '';
      const published = entry.published?.[0] || new Date().toISOString();

      return {
        url: `https://www.youtube.com/watch?v=${videoId}`,
        title,
        description,
        publishedAt: published,
        tags: [] // RSS has no tags list
      };
    });
  } catch (error) {
    console.error(`[YouTube RSS Error] Channel ${channelId} fetch failed:`, error);
    return [];
  }
}

// ── Notification Trigger ──

async function sendNotification(newEventCount: number) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('[Crawler Alert] Warning: DISCORD_WEBHOOK_URL is not configured in .env. Skipping notification.');
    return;
  }

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
  
  const payload = {
    content: `📱 【teeteeStock 交易所廣播】\n報告主理人！YouTube 採集工頭剛剛在線路上挖到 ${newEventCount} 筆潛在的香香聯動情報！\n目前狀態皆為：PENDING（待審查）\n🔗 👉 [點此進入管理員後台一鍵審查](${BASE_URL}/admin)`
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      console.log(`[Crawler Alert] Discord notification sent successfully for ${newEventCount} new events.`);
    } else {
      const errText = await res.text();
      console.error(`[Crawler Alert] Discord webhook returned error status ${res.status}:`, errText);
    }
  } catch (error) {
    console.error('[Crawler Alert] Failed to send Discord notification:', error);
  }
}

// ── Main Job ──

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function runPoll(options?: { targetDate?: Date }) {
  const executionDate = options?.targetDate || new Date();
  console.log(`[${new Date().toLocaleString()}] Starting Yesterday Fact-Based YouTube Crawler job...`);
  
  const cache = loadCache();
  const newProcessedCacheKeys: string[] = [];
  let newEventsInsertedCount = 0;

  // 1. Gather all unique channels to query each exactly once
  const uniqueChannels = new Map<string, { name: string; channelId: string }>();
  for (const cpConfig of CP_CONFIGS) {
    for (const channelInfo of cpConfig.channels) {
      uniqueChannels.set(channelInfo.channelId, channelInfo);
    }
  }

  // 2. Fetch all channels in parallel with concurrent requests
  console.log(`Fetching videos for ${uniqueChannels.size} unique channels in parallel...`);
  const channelVideosMap = new Map<string, VideoFeed[]>();
  
  await Promise.all(
    Array.from(uniqueChannels.values()).map(async (ch) => {
      try {
        let videos: VideoFeed[] = [];
        if (YOUTUBE_API_KEY) {
          videos = await fetchVideosFromAPI(ch.channelId);
        } else {
          videos = await fetchVideosFromRSS(ch.channelId);
        }
        channelVideosMap.set(ch.channelId, videos);
        console.log(`Fetched ${videos.length} videos from ${ch.name} (${ch.channelId})`);
      } catch (err) {
        console.error(`Failed to fetch videos for channel ${ch.name} (${ch.channelId}):`, err);
      }
    })
  );

  // 3. Process the results for each CP configuration
  for (const cpConfig of CP_CONFIGS) {
    for (const channelInfo of cpConfig.channels) {
      const channelId = channelInfo.channelId;
      const videos = channelVideosMap.get(channelId) || [];

      for (const video of videos) {
        // Date check: actualStartTime or scheduledStartTime must fall strictly in "yesterday Taipei Time"
        const startTimeStr = video.actualStartTime || video.scheduledStartTime || video.publishedAt;
        if (!isYesterdayInTaipei(startTimeStr, executionDate)) {
          continue;
        }

        // Cache deduplication (fast check on compound key)
        const cacheKey = `${cpConfig.pairId}:${video.url}`;
        if (isCached(cpConfig.pairId, video.url, cache) || newProcessedCacheKeys.includes(cacheKey)) {
          continue;
        }

        console.log(`Yesterday stream detected: pair=${cpConfig.pairId} | title=${video.title} | url=${video.url} | start=${startTimeStr}`);

        // Database deduplication (strict check on compound key)
        const existingEvent = await prisma.teeteeEvents.findUnique({
          where: {
            pairId_url: {
              pairId: cpConfig.pairId,
              url: video.url
            }
          }
        });

        if (existingEvent) {
          // Already in DB, add to cache and skip
          newProcessedCacheKeys.push(cacheKey);
          continue;
        }

        // Create new TeeteeEvent (All yesterday streams are force-pushed as PENDING)
        try {
          const streamDate = new Date(startTimeStr);
          await prisma.teeteeEvents.create({
            data: {
              pairId: cpConfig.pairId,
              url: video.url,
              type: EventType.STREAM,
              title: video.title,
              timestamp: '00:00:00',
              reporter: 'CRAWLER',
              status: ReviewStatus.PENDING,
              createdAt: streamDate
            }
          });
          newProcessedCacheKeys.push(cacheKey);
          newEventsInsertedCount++;
          console.log(`✅ Successfully inserted PENDING event for ${cpConfig.pairId} (URL: ${video.url})`);
        } catch (dbError) {
          console.error(`[DB Error] Failed to create event for URL ${video.url}:`, dbError);
        }
      }
    }
  }

  // Save new URLs to cache
  if (newProcessedCacheKeys.length > 0) {
    const updatedCache = [...cache, ...newProcessedCacheKeys];
    saveCache(updatedCache);
    console.log(`Added ${newProcessedCacheKeys.length} new compound keys to cache.`);
  }

  console.log(`Crawler job completed. Inserted ${newEventsInsertedCount} new events.`);

  // Notification Engine Trigger
  if (newEventsInsertedCount > 0) {
    await sendNotification(newEventsInsertedCount);
  } else {
    console.log('No new events inserted. Notification skipped.');
  }

  return { insertedCount: newEventsInsertedCount };
}

// ── Startup Entry Point ──

const isOnceMode = process.argv.includes('--once');
const isDirectRun = process.argv[1] && (process.argv[1].endsWith('crawler.ts') || process.argv[1].endsWith('crawler.js'));

if (isOnceMode) {
  runPoll()
    .then(() => {
      console.log('Single poll execution finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Crawler failed in single run mode:', err);
      process.exit(1);
    });
} else if (isDirectRun) {
  // Run poll immediately on startup
  runPoll().catch((err) => console.error('Initial crawler run failed:', err));

  // Schedule daily crawler at 01:00:00 Taipei time (0 1 * * *).
  const crawlerCronExpression = '0 1 * * *';
  cron.schedule(crawlerCronExpression, () => {
    runPoll().catch((err) => console.error('Scheduled crawler run failed:', err));
  }, {
    timezone: 'Asia/Taipei'
  });

  console.log(`Cron scheduler started. Crawler will wake up daily at 01:00 Taipei time. (Cron: ${crawlerCronExpression})`);

  // Schedule Tuesday 02:00:00 Taipei time cleanup job: 0 2 * * 2
  const cleanupCronExpression = '0 2 * * 2';
  cron.schedule(cleanupCronExpression, async () => {
    console.log('[Cleanup Cron] Starting Tuesday 02:00:00 history events cleanup...');
    try {
      const result = await prisma.teeteeEvents.deleteMany({
        where: {
          status: { in: [ReviewStatus.APPROVED, ReviewStatus.REJECTED] },
          isSettled: true
        }
      });
      console.log(`[Cleanup Cron] Successfully cleaned up ${result.count} history events.`);
    } catch (err) {
      console.error('[Cleanup Cron] Failed to clean up history events:', err);
    }
  }, {
    timezone: 'Asia/Taipei'
  });

  console.log(`Cleanup cron scheduler started. Will run every Tuesday at 02:00 Taipei time. (Cron: ${cleanupCronExpression})`);

  // Schedule daily rollover / settlement at exactly 18:30:00 Taipei time (30 18 * * *).
  const settlementCronExpression = '30 18 * * *';
  cron.schedule(settlementCronExpression, async () => {
    console.log('[Daily Settle/Rollover Cron] Triggering daily rollover or weekly settlement...');
    try {
      const serviceResult = await runDailyRolloverOrSettlement();
      console.log(`[Daily Settle/Rollover Cron] Completed: action=${serviceResult.actionExecuted}, message=${serviceResult.message}`);
    } catch (err) {
      console.error('[Daily Settle/Rollover Cron] Execution failed:', err);
    }
  }, {
    timezone: 'Asia/Taipei'
  });

  console.log(`Daily Settle/Rollover cron scheduler started. Will run every day at 18:30 Taipei time. (Cron: ${settlementCronExpression})`);
}
