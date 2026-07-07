import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import { parseStringPromise } from 'xml2js';
import dotenv from 'dotenv';

// 載入環境變數
dotenv.config();

// ── 頻道對照表與關鍵字矩陣 ──

interface ChannelConfig {
  channelId: string;
  name: string;
  // 比對對方成員特徵的正規表達式（若在自己的頻道影片中發現對方的特徵，則判定連動）
  targetKeywords: RegExp[];
}

interface CPConfig {
  pairId: string;
  channels: ChannelConfig[];
  // 通用的 CP 專屬標籤或名稱（若在任何一個成員頻道內發現此標籤，亦判定命中該 CP）
  generalKeywords: RegExp[];
}

const CP_CONFIGS: CPConfig[] = [
  {
    pairId: 'AZIR',
    generalKeywords: [/あずいろ/i, /AZIro/i, /aziro/i],
    channels: [
      {
        channelId: 'UC0TXe_LYZ4scaW2XMyi5_kw', // AZKi
        name: 'AZKi',
        targetKeywords: [/風真/i, /いろは/i, /Iroha/i, /風真伊呂波/i, /ござる/i]
      },
      {
        channelId: 'UC_vMYWcDjmfdpH6r4TTn1MQ', // 風真伊呂波 (Iroha)
        name: 'Kazama Iroha',
        targetKeywords: [/AZKi/i, /あずき/i, /Azki/i]
      }
    ]
  },
  {
    pairId: 'FBMO',
    generalKeywords: [/フブミオ/i, /FubuMio/i, /fubumio/i],
    channels: [
      {
        channelId: 'UCdn5BQ06XqgXoAxIhbqw5Rg', // 白上吹雪 (Fubuki)
        name: 'Shirakami Fubuki',
        targetKeywords: [/ミオ/i, /Mio/i, /大神ミオ/i, /Mio-sha/i, /ミオしゃ/i]
      },
      {
        channelId: 'UCp-5t9SrOQwXMU7iIjQfARg', // 大神澪 (Mio)
        name: 'Ookami Mio',
        targetKeywords: [/フブキ/i, /Fubuki/i, /白上/i, /吹雪/i]
      }
    ]
  },
  {
    pairId: 'MCMT',
    generalKeywords: [/みこめっと/i, /miComet/i, /micomet/i],
    channels: [
      {
        channelId: 'UC-hM6YJuNYVAmUWxeIr9FeA', // 櫻巫女 (Miko)
        name: 'Sakura Miko',
        targetKeywords: [/星街/i, /すいせい/i, /Suisei/i, /彗星/i, /Sui-chan/i, /すいちゃん/i]
      },
      {
        channelId: 'UC5CwaMl1eIgY8h02uZw7u8A', // 星街彗星 (Suisei)
        name: 'Hoshimachi Suisei',
        targetKeywords: [/櫻巫女/i, /さくらみこ/i, /みこ/i, /Miko/i, /みこち/i, /Mikochi/i, /さくら/i]
      }
    ]
  },
  {
    pairId: 'NEFL',
    generalKeywords: [/ノエフレ/i, /NoeFure/i, /noefure/i],
    channels: [
      {
        channelId: 'UCdyqAaZDKHXg4Ahi7VENThQ', // 白銀諾艾爾 (Noel)
        name: 'Shirogane Noel',
        targetKeywords: [/フレア/i, /Flare/i, /芙蕾雅/i, /不知火/i, /ふーたん/i]
      },
      {
        channelId: 'UCvInZx9h3jC2JzsIzoOebWg', // 不知火芙蕾雅 (Flare)
        name: 'Shiranui Flare',
        targetKeywords: [/ノエル/i, /Noel/i, /白銀/i, /諾艾爾/i, /団長/i, /Danchou/i]
      }
    ]
  },
  {
    pairId: 'OKKR',
    generalKeywords: [/おかころ/i, /OkaKoro/i, /okakoro/i],
    channels: [
      {
        channelId: 'UCvaTdHTWBGv3MKj3KVqJVCw', // 貓又小粥 (Okayu)
        name: 'Nekomata Okayu',
        targetKeywords: [/ころね/i, /沁音/i, /Korone/i, /麵包狗/i]
      },
      {
        channelId: 'UChAnqc_AY5_I3Px5dig3X1Q', // 戌神沁音 (Korone)
        name: 'Inugami Korone',
        targetKeywords: [/おかゆ/i, /小粥/i, /Okayu/i, /小粥貓/i]
      }
    ]
  },
  {
    pairId: 'PKMR',
    generalKeywords: [/ぺこまり/i, /PekoMarin/i, /pekomarin/i],
    channels: [
      {
        channelId: 'UC1DCedRgGHBdm81E1llLhOQ', // 兔田佩克拉 (Pekora)
        name: 'Usada Pekora',
        targetKeywords: [/マリン/i, /Marine/i, /船長/i, /寶鐘/i, /宝鐘/i]
      },
      {
        channelId: 'UCCzUftO8KOVkV4wQG1vkUvg', // 寶鐘瑪琳 (Marine)
        name: 'Houshou Marine',
        targetKeywords: [/ぺこら/i, /Pekora/i, /兔田/i, /ぺこちゃん/i]
      }
    ]
  },
  {
    pairId: 'SSWT',
    generalKeywords: [/ししわた/i, /ShiShiWata/i, /shishiwata/i],
    channels: [
      {
        channelId: 'UCUKD-uaobj9jiqB-VXt71mA', // 獅白牡丹 (Botan)
        name: 'Shishiro Botan',
        targetKeywords: [/わため/i, /Watame/i, /角卷/i, /角巻/i, /綿芽/i, /わためぇ/i]
      },
      {
        channelId: 'UCqm3BQLlJfvkTsX_hvm0UmA', // 角卷綿芽 (Watame)
        name: 'Tsunomaki Watame',
        targetKeywords: [/ぼたん/i, /Botan/i, /獅白/i, /牡丹/i, /ししろ/i, /ししろん/i]
      }
    ]
  },
  {
    pairId: 'SRAZ',
    generalKeywords: [/SorAZ/i, /soraz/i],
    channels: [
      {
        channelId: 'UCp6993wxpyDPHUpavwDFqgg', // 時乃空 (Sora)
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
    pairId: 'SBRN',
    generalKeywords: [/スバルな/i, /SubaRuna/i, /subaruna/i],
    channels: [
      {
        channelId: 'UCvzGlP9oQwU--Y0r9id_jnA', // 大空昴 (Subaru)
        name: 'Oozora Subaru',
        targetKeywords: [/ルーナ/i, /Luna/i, /姬森/i, /璐娜/i, /Runa/i, /姬森ルーナ/i]
      },
      {
        channelId: 'UCa9Y57gfeY0Zro_noHRVrnw', // 姬森璐娜 (Luna)
        name: 'Himemori Luna',
        targetKeywords: [/スバル/i, /Subaru/i, /大空/i, /Subaru-senpai/i]
      }
    ]
  }
];

// ── 檔案路徑定義 ──
const CACHE_FILE = path.join(__dirname, 'youtube-cache.json');
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const CRAWLER_TOKEN = process.env.CRAWLER_TOKEN || 'crawler_secret_token_123';
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

// ── 快取讀寫機制 ──

function loadCache(): string[] {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8');
      return JSON.parse(data) as string[];
    }
  } catch (error) {
    console.error('讀取快取檔案失敗，重設為空：', error);
  }
  return [];
}

function saveCache(cache: string[]) {
  try {
    // 限制快取大小，最多保留最新 500 筆，避免快取無限變大
    const trimmed = cache.slice(-500);
    fs.writeFileSync(CACHE_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
  } catch (error) {
    console.error('寫入快取檔案失敗：', error);
  }
}

// ── 抓取影片資料引擎 ──

// 模式一：YouTube Data API (如果配置了 API Key)
async function fetchVideosFromAPI(channelId: string): Promise<VideoFeed[]> {
  const uploadsPlaylistId = channelId.substring(0, 1) + 'U' + channelId.substring(2);
  const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=5&key=${YOUTUBE_API_KEY}`;
  
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) {
      throw new Error(`YouTube API returned status ${res.status}`);
    }
    const data = await res.json() as any;
    const items = data.items || [];
    if (items.length === 0) return [];

    const videoIds = items.map((item: any) => item.snippet?.resourceId?.videoId).filter(Boolean).join(',');
    if (!videoIds) return [];

    const detailUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    const detailRes = await fetch(detailUrl);
    if (!detailRes.ok) {
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
    console.warn(`[YouTube API 錯誤] 頻道 ${channelId} 獲取失敗，將後備使用 RSS Feed：`, error);
    return fetchVideosFromRSS(channelId);
  }
}

// 模式二：YouTube RSS XML Feed (免 API Key 且免費 fallback 方案)
async function fetchVideosFromRSS(channelId: string): Promise<VideoFeed[]> {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  
  try {
    const res = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    if (!res.ok) {
      throw new Error(`YouTube RSS returned status ${res.status}`);
    }
    const xml = await res.text();
    const result = await parseStringPromise(xml);

    if (!result.feed || !result.feed.entry) return [];

    // 抓取前 5 筆
    const entries = result.feed.entry.slice(0, 5);
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
        tags: []
      };
    });
  } catch (error) {
    console.error(`[YouTube RSS 錯誤] 頻道 ${channelId} 讀取失敗：`, error);
    return [];
  }
}

function isYesterdayInTaipei(dateInput: string | Date, executionDate: Date = new Date()): boolean {
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

function isCached(pairId: string, url: string, cache: string[]): boolean {
  return cache.includes(`${pairId}:${url}`) || cache.includes(url);
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runPoll() {
  console.log(`[${new Date().toLocaleString()}] 啟動 Yesterday Fact-Based YouTube 輪詢排程...`);
  
  const cache = loadCache();
  const newProcessedCacheKeys: string[] = [];

  for (const cpConfig of CP_CONFIGS) {
    for (const channelInfo of cpConfig.channels) {
      const channelId = channelInfo.channelId;
      console.log(`正在掃描頻道 [${channelInfo.name}] (${channelId}) 對應 CP: ${cpConfig.pairId}...`);

      // 每次抓取間隔 1.5 秒，防止被 YouTube RSS 封鎖
      await delay(1500);

      // 根據是否有 API KEY 決定抓取引擎，出錯會自動 fallback 到 RSS
      let videos: VideoFeed[] = [];
      if (YOUTUBE_API_KEY) {
        videos = await fetchVideosFromAPI(channelId);
      } else {
        videos = await fetchVideosFromRSS(channelId);
      }

      console.log(`成功抓取到 ${videos.length} 部影片。`);

      for (const video of videos) {
        // Date check: actualStartTime or scheduledStartTime must fall strictly in "yesterday Taipei Time"
        const startTimeStr = video.actualStartTime || video.scheduledStartTime || video.publishedAt;
        if (!isYesterdayInTaipei(startTimeStr)) {
          continue;
        }

        // 快取防重 (基於 pairId:url 複合鍵)
        const cacheKey = `${cpConfig.pairId}:${video.url}`;
        if (isCached(cpConfig.pairId, video.url, cache) || newProcessedCacheKeys.includes(cacheKey)) {
          continue;
        }

        console.log(`昨日直播被偵測： CP組=${cpConfig.pairId} | 標題=${video.title} | 時間=${startTimeStr}`);

        // 送往中繼站 API (強制 PENDING)
        try {
          const res = await fetch(`${BASE_URL}/api/staging`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': CRAWLER_TOKEN
            },
            body: JSON.stringify({
              token: CRAWLER_TOKEN,
              pairId: cpConfig.pairId,
              url: video.url,
              type: 'STREAM',
              title: video.title,
              timestamp: '00:00:00',
              reporter: 'CRAWLER',
              status: 'PENDING',
              createdAt: startTimeStr // 傳遞開播時間以精確寫入資料庫
            })
          });

          if (res.ok) {
            console.log(`✅ 成功向中繼站送出連動事件！CP: ${cpConfig.pairId}`);
            newProcessedCacheKeys.push(cacheKey);
          } else {
            const errBody = await res.text();
            console.error(`❌ 中繼站 API 傳回錯誤 (${res.status})：`, errBody);
          }
        } catch (apiError) {
          console.error(`❌ 連接中繼站 API 失敗：`, apiError);
        }
      }
    }
  }

  // 將新處理的網址加入快取並寫回檔案
  if (newProcessedCacheKeys.length > 0) {
    const updatedCache = [...cache, ...newProcessedCacheKeys];
    saveCache(updatedCache);
    console.log(`已將 ${newProcessedCacheKeys.length} 個新 CP 複合鍵寫入快取防重。`);
  }

  console.log(`輪詢完成。`);
}

// ── 啟動進入點 ──

const isOnceMode = process.argv.includes('--once');

if (isOnceMode) {
  // 單次執行模式 (適用於 CLI 測試或 GitHub Actions 定時觸發)
  runPoll().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error('排程腳本異常終止：', err);
    process.exit(1);
  });
} else {
  // 背景 daemon 輪詢模式 (配合改進，每日 01:00 台北時間執行一次)
  // 啟動時先立即跑一次
  runPoll().catch((err) => console.error('啟動初次輪詢失敗：', err));

  // 每日 01:00 台北時間執行 (Cron 表示法： 0 1 * * *)
  const cronExpression = '0 1 * * *';
  cron.schedule(cronExpression, () => {
    runPoll().catch((err) => console.error('定時輪詢執行失敗：', err));
  }, {
    timezone: 'Asia/Taipei'
  });
  
  console.log(`定時排程引擎已啟動，每日 01:00 台北時間將自動輪詢。 (Cron: ${cronExpression})`);
}
