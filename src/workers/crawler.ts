import 'dotenv/config';
import { cpList } from './cpList';
import { TwitterApi } from 'twitter-api-v2';

// Environment variable for authorization
const CRAWLER_TOKEN = process.env.CRAWLER_TOKEN || 'crawler_secret_token_123';
const STAGING_API_URL = process.env.STAGING_API_URL || 'http://localhost:3000/api/staging';

// Initialize Twitter API Client (Requires read-only App Bearer Token)
const twitterClient = process.env.TWITTER_BEARER_TOKEN 
  ? new TwitterApi(process.env.TWITTER_BEARER_TOKEN) 
  : null;

// State management to prevent crawling the same tweets repeatedly
const latestTweetIds: Record<string, string> = {};
const usernameToIdCache: Record<string, string> = {};
/**
 * Standardized format to send to staging API
 */
interface TeeteeEvent {
  pairId: string;
  eventType: 'x_mention' | 'live_collab' | 'video' | 'totsumachi';
  url: string;
  rawText: string;
  suggestedWeight: number;
}

/**
 * Send an event to the Next.js staging backend
 */
async function sendToStaging(event: TeeteeEvent) {
  try {
    const res = await fetch(STAGING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': CRAWLER_TOKEN
      },
      body: JSON.stringify(event)
    });

    if (!res.ok) {
      console.error(`Failed to send event: ${res.statusText}`);
    } else {
      console.log(`Successfully sent event for ${event.pairId}`);
    }
  } catch (err) {
    console.error(`Error sending event:`, err);
  }
}

/**
 * 1. X Tracker (Twitter API v2 Implementation)
 * 掃描每位成員的最新推文，對比是否出現其 CP 組合對象的關鍵字。
 */
async function scanX() {
  if (!twitterClient) {
    console.warn('[X Crawler] 警告：未設定 TWITTER_BEARER_TOKEN，略過 X 掃描。請在 .env 中設定。');
    return;
  }

  console.log('[X Crawler] 開始掃描 X (Twitter) 最新動態...');

  try {
    // 1. 收集所有成員的 Username
    const usernames = new Set<string>();
    for (const cp of cpList) {
      const match1 = cp.member1.xUrl.match(/x\.com\/([^/]+)/);
      const match2 = cp.member2.xUrl.match(/x\.com\/([^/]+)/);
      if (match1) usernames.add(match1[1]);
      if (match2) usernames.add(match2[1]);
    }

    const usernameArray = Array.from(usernames);
    const usersToFetch = usernameArray.filter(u => !usernameToIdCache[u]);

    // 2. 批次查詢缺少的 User IDs (API 一次最多查 100 筆，非常省 Request)
    if (usersToFetch.length > 0) {
      const usersRes = await twitterClient.v2.usersByUsernames(usersToFetch);
      if (usersRes.data) {
        usersRes.data.forEach(user => {
          usernameToIdCache[user.username.toLowerCase()] = user.id;
        });
      }
    }

    // 3. 掃描每位使用者的最新推文
    for (const username of usernameArray) {
      const userId = usernameToIdCache[username.toLowerCase()];
      if (!userId) continue;

      const queryParams: any = { max_results: 5 }; // 每次檢查最新 5 篇
      if (latestTweetIds[username]) {
        queryParams.since_id = latestTweetIds[username];
      }

      const timeline = await twitterClient.v2.userTimeline(userId, queryParams);
      const tweets = timeline.data?.data || [];

      if (tweets.length === 0) continue;

      // 更新最新 Tweet ID
      latestTweetIds[username] = tweets[0].id;

      // 4. 分析推文內容是否觸發 CP 關鍵字
      for (const tweet of tweets) {
        // 找出這個發文者所屬的所有 CP
        const involvedCPs = cpList.filter(cp => 
          cp.member1.xUrl.toLowerCase().includes(username.toLowerCase()) || 
          cp.member2.xUrl.toLowerCase().includes(username.toLowerCase())
        );

        for (const cp of involvedCPs) {
          const isMember1 = cp.member1.xUrl.toLowerCase().includes(username.toLowerCase());
          const otherMember = isMember1 ? cp.member2 : cp.member1;
          const author = isMember1 ? cp.member1 : cp.member2;

          const triggers = [...otherMember.keywords, ...otherMember.emojis, ...cp.pairKeywords];
          const triggeredWord = triggers.find(keyword => tweet.text.includes(keyword));

          if (triggeredWord) {
            console.log(`[X Crawler] 偵測到 ${cp.id} 貼貼！發文者: ${author.name}, 觸發字: ${triggeredWord}`);
            
            await sendToStaging({
              pairId: cp.id,
              eventType: 'x_mention',
              url: `https://x.com/${username}/status/${tweet.id}`,
              rawText: `${author.name} 在推文中提及「${triggeredWord}」：\n${tweet.text}`,
              suggestedWeight: 1.0 // 提及流程預設 +1%
            });
          }
        }
      }
    }
    console.log('[X Crawler] 掃描完成。');
  } catch (error) {
    console.error('[X Crawler] 發生錯誤:', error);
  }
}

/**
 * 2. YT Schedule Scanner (Mock Implementation)
 */
async function scanYTSchedules() {
  console.log('Scanning YouTube schedules...');
  // TODO: Implement YouTube Data API to check upcoming live streams
  // Regex check for member names in titles/descriptions.
}

/**
 * 3. YT Chat Listener (Totsumachi) 
 * 偵測聊天室中是否出現對方的關鍵字或 Emoji，作為聯動的「預警」送交後台審查。
 */
async function processChatMessage(channelId: string, channelOwner: string, message: string) {
  for (const cp of cpList) {
    // 判斷當前直播台是誰的
    let otherMember = null;
    let isMember1 = false;
    
    if (channelId === cp.member1.ytUrl || channelOwner === cp.member1.name) {
      otherMember = cp.member2;
      isMember1 = true;
    } else if (channelId === cp.member2.ytUrl || channelOwner === cp.member2.name) {
      otherMember = cp.member1;
      isMember1 = false;
    }

    if (!otherMember) continue;

    // 檢查聊天室訊息是否包含「另一位成員的關鍵字」、「另一位成員的 Emoji」或「CP 名稱」
    const triggers = [...otherMember.keywords, ...otherMember.emojis, ...cp.pairKeywords];
    
    const triggeredWord = triggers.find(keyword => message.includes(keyword));
    
    if (triggeredWord) {
      console.log(`[YT Chat] 偵測到 ${cp.id} 潛在聯動！台主: ${channelOwner}, 觸發字: ${triggeredWord}`);
      
      // 送出預警給管理員審查
      await sendToStaging({
        pairId: cp.id,
        eventType: 'totsumachi',
        url: `https://www.youtube.com/watch?v=${channelId}&t=3600s`, // Example with timestamp
        rawText: `${channelOwner} 的直播聊天室出現關鍵字「${triggeredWord}」。原始訊息：「${message}」`,
        suggestedWeight: 8.0 // 突發聯動權重 +8%
      });
      
      // 實務上可以加上 Cooldown 避免同一次洗版傳送太多筆，這裡暫不實作複雜的冷卻邏輯
    }
  }
}

async function listenYTChat() {
  console.log('Starting YT Chat listeners...');
  // TODO: 實作與 YouTube Live Chat API 或 websocket 的連線
  // 當收到訊息時，呼叫 processChatMessage(channelId, channelOwner, message);
}

/**
 * Main Crawler Execution
 */
async function runCrawler() {
  console.log('Starting TeeTee Background Crawler...');
  
  // Setup periodic polling
  setInterval(scanX, 1000 * 60 * 15); // every 15 mins
  setInterval(scanYTSchedules, 1000 * 60 * 30); // every 30 mins
  
  // Start chat listener process
  listenYTChat();
  
  // Run once immediately
  scanX();
  scanYTSchedules();
}

// Execute if run directly
if (require.main === module) {
  runCrawler();
}
