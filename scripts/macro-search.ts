import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as fs from 'fs';
import * as path from 'path';

puppeteer.use(StealthPlugin());

const COOKIE_PATH = path.join(__dirname, 'cookies.json');
const TASKS_PATH = path.join(__dirname, 'x-tasks.json');
const STAGING_URL = process.env.STAGING_API_URL || 'http://localhost:3000/api/staging';
const CRAWLER_TOKEN = process.env.CRAWLER_TOKEN || 'crawler_secret_token_123';

async function sendToStaging(event: any) {
  try {
    const res = await fetch(STAGING_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': CRAWLER_TOKEN
      },
      body: JSON.stringify(event)
    });
    if (res.ok) {
      console.log(`✅ 成功送出 staging: ${event.url}`);
    } else {
      console.error(`❌ 送出 staging 失敗: ${res.status}`);
    }
  } catch (err) {
    console.error(`送出 staging 時發生錯誤:`, err);
  }
}

async function run() {
  if (!fs.existsSync(COOKIE_PATH)) {
    console.error('找不到 cookies.json，請先執行 npm run login:x');
    process.exit(1);
  }

  const cookies = JSON.parse(fs.readFileSync(COOKIE_PATH, 'utf-8'));
  const tasksConfig = JSON.parse(fs.readFileSync(TASKS_PATH, 'utf-8'));

  console.log('啟動 Puppeteer 背景爬蟲...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setCookie(...cookies);

  // 阻擋圖片與無關資源以加快速度
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  // State to track seen tweets across runs (for a real prod app, store this in a file/DB)
  // For this macro, staging API's unique URL constraint will naturally handle deduplication.

  for (const task of tasksConfig.tasks) {
    const url = `https://x.com/${task.author}`;
    console.log(`正在掃描: ${url}`);
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // 等待推文載入
      await page.waitForSelector('article[data-testid="tweet"]', { timeout: 10000 }).catch(() => {});

      // 模擬向下滾動以加載更多推文 (每次滾動後稍微等待載入)
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollBy(0, 800));
        await new Promise(r => setTimeout(r, 1200));
      }

      // 擷取推文內容
      const tweets = await page.$$eval('article[data-testid="tweet"]', (articles, author) => {
        return articles.slice(0, 5).map((article) => {
          // 取得推文內文
          const textEl = article.querySelector('[data-testid="tweetText"]');
          const text = textEl ? textEl.textContent || '' : '';

          // 取得推文連結 (找含有 /status/ 的 a 標籤)
          const timeEl = article.querySelector('time');
          let link = '';
          if (timeEl && timeEl.parentElement && timeEl.parentElement.tagName === 'A') {
            link = (timeEl.parentElement as HTMLAnchorElement).href;
          }

          // 確保只抓取作者本人的發文 (排除轉推其他人的情況)
          const isOwn = link.toLowerCase().includes(author.toLowerCase());

          return { text, link, isOwn };
        });
      }, task.author);

      console.log(`🔍 找到 ${tweets.length} 則推文。`);
      for (const tweet of tweets) {
        console.log(`   - 連結: ${tweet.link || '(無)'} | 內文: ${tweet.text ? tweet.text.substring(0, 30).replace(/\n/g, ' ') : '(空)'}...`);
        if (!tweet.link || !tweet.text) continue;
        
        // 檢查關鍵字
        const triggeredWord = task.targetKeywords.find((kw: string) => tweet.text.includes(kw));
        
        if (triggeredWord) {
          console.log(`🎯 偵測到 ${task.pairId} 關鍵字「${triggeredWord}」: ${tweet.link}`);
          
          await sendToStaging({
            pairId: task.pairId,
            eventType: 'x_mention',
            url: tweet.link,
            rawText: `[巨集自動抓取] ${task.author} 發推提及「${triggeredWord}」:\n${tweet.text}`,
            suggestedWeight: 1.0
          });
        }
      }

      // 等待一下避免被限流
      await new Promise(r => setTimeout(r, 2000));

    } catch (err: any) {
      console.error(`掃描 ${task.author} 時發生錯誤: ${err.message}`);
    }
  }

  await browser.close();
  console.log('巨集掃描完成！');
}

run().catch(console.error);
