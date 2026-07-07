import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as fs from 'fs';
import * as path from 'path';

puppeteer.use(StealthPlugin());

const COOKIE_PATH = path.join(__dirname, 'cookies.json');

async function run() {
  console.log('正在啟動瀏覽器進行 X 登入...');
  const browser = await puppeteer.launch({
    headless: false, // 必須開啟視窗讓使用者手動登入
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://x.com/login', { waitUntil: 'networkidle2' });

  console.log('====================================================');
  console.log('請在彈出的瀏覽器視窗中完成 X (Twitter) 的登入手續！');
  console.log('包含雙重驗證 (2FA) 等流程。');
  console.log('完成登入，並看到首頁 (Home) 出現後，請在這按下任意鍵儲存 Cookie...');
  console.log('====================================================');

  // 等待使用者在終端機按下任意鍵
  process.stdin.setRawMode(true);
  process.stdin.resume();
  await new Promise<void>((resolve) => {
    process.stdin.once('data', () => resolve());
  });
  process.stdin.setRawMode(false);

  console.log('正在儲存登入憑證 (Cookies)...');
  const cookies = await page.cookies();
  fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies, null, 2));
  console.log(`✅ 成功儲存 Cookie 至 ${COOKIE_PATH}`);
  
  await browser.close();
  console.log('瀏覽器已關閉。日後爬蟲將自動使用此 Cookie 免密碼登入！');
  process.exit(0);
}

run().catch(console.error);
