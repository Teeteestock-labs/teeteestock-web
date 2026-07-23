import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { isMarketOpen } from '../src/utils/marketHours';
import { alignToTick } from '../src/utils/validatePrice';

// Load environment variables from .env
dotenv.config();

const prisma = new PrismaClient();

// List of bot IDs TEST_BOT_01 to TEST_BOT_50
const BOT_IDS = Array.from({ length: 50 }, (_, i) => `TEST_BOT_${(i + 1).toString().padStart(2, '0')}`);

// Helper to sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function runChaosIteration() {
  const timestamp = new Date().toISOString();
  
  // Step 1: Operating hours guard
  if (!isMarketOpen()) {
    console.log(`[${timestamp}] [🤖 ChaosBot] Market is closed. Standing by quietly...`);
    return;
  }

  // Step 2: Regular cleanup of far/old orders (30% chance)
  if (Math.random() < 0.30) {
    const oneMinuteAgo = new Date(Date.now() - 60000);
    try {
      const deleted = await prisma.orderBook.deleteMany({
        where: {
          userId: { startsWith: 'TEST_BOT_' },
          createdAt: { lt: oneMinuteAgo }
        }
      });
      if (deleted.count > 0) {
        console.log(`[${timestamp}] [🤖 ChaosBot] Cleaned up ${deleted.count} pending test bot orders older than 1 minute.`);
      }
    } catch (err) {
      console.error(`[${timestamp}] [🤖 ChaosBot] Failed to clean up old bot orders:`, err);
    }
  }

  try {
    // Fetch active stocks (exclude delisted ones)
    const activePairs = await prisma.cpPairs.findMany({
      where: {
        status: { not: 'DELISTED' },
        id: { not: 'hololive' }
      }
    });

    if (activePairs.length === 0) {
      console.log(`[${timestamp}] [🤖 ChaosBot] No active trading pairs found.`);
      return;
    }

    // Randomly select 10% to 20% of the bots (5 to 10 bots)
    const wakeCount = Math.floor(Math.random() * 6) + 5; // 5 to 10
    const selectedBots = shuffleArray(BOT_IDS).slice(0, wakeCount);

    console.log(`[${timestamp}] [🤖 ChaosBot] Waking up ${wakeCount} test bots: ${selectedBots.join(', ')}`);

    for (const botId of selectedBots) {
      // Pick a random stock
      const pair = activePairs[Math.floor(Math.random() * activePairs.length)];
      
      const currentPrice = pair.currentPrice;
      const openingPrice = pair.openingPrice;
      const ceiling = alignToTick(openingPrice * 1.20);
      const floor = alignToTick(openingPrice * 0.80);

      // Determine personality based on weights (70% Leek, 20% Fan, 10% Panic Speculator)
      const r = Math.random();
      let side: 'BUY' | 'SELL' | null = null;
      let rawPrice = 0;
      let volume = 0;
      let personalityName = '';

      if (r < 0.70) {
        // --- 1. Follow-the-trend Leek (跟風韭菜) ---
        personalityName = 'Leek';
        const randomPercent = (Math.random() * 10 - 5) / 100; // -5% to +5%
        rawPrice = currentPrice * (1 + randomPercent);
        side = Math.random() < 0.5 ? 'BUY' : 'SELL';
        volume = Math.floor(Math.random() * 91) + 10; // 10 to 100
      } else if (r < 0.90) {
        // --- 2. Crazy Fan (瘋狂粉絲) ---
        personalityName = 'Crazy Fan';
        // Get approved weekly info count
        const approvedCount = await prisma.teeteeEvents.count({
          where: {
            pairId: pair.id,
            status: 'APPROVED',
            isSettled: false
          }
        });

        if (approvedCount > 0) {
          side = 'BUY';
          // 50% chance ceiling price, 50% chance currentPrice + 15%
          rawPrice = Math.random() < 0.5 ? ceiling : currentPrice * 1.15;
          volume = Math.floor(Math.random() * 801) + 200; // 200 to 1000
        }
      } else {
        // --- 3. Panic Speculator (恐慌投機客) ---
        personalityName = 'Panic Speculator';
        const dropPercent = (currentPrice - openingPrice) / openingPrice;
        
        if (dropPercent <= -0.10) {
          side = 'SELL';
          // 50% chance floor price, 50% chance currentPrice - 15%
          rawPrice = Math.random() < 0.5 ? floor : currentPrice * 0.85;
          volume = Math.floor(Math.random() * 801) + 200; // 200 to 1000
        }
      }

      // If personality logic generated an order
      if (side !== null && rawPrice > 0 && volume > 0) {
        // Align price to tick
        let finalPrice = alignToTick(rawPrice);
        // Clamp to daily limits
        finalPrice = Math.max(floor, Math.min(ceiling, finalPrice));

        // Submit order to database
        await prisma.orderBook.create({
          data: {
            userId: botId,
            pairId: pair.id,
            side: side,
            price: finalPrice,
            volume: volume
          }
        });

        console.log(`[${timestamp}] [🤖 ChaosBot] Bot ${botId} (${personalityName}) placed order: ${side} ${volume} shares of ${pair.id} @ ${finalPrice} (raw: ${rawPrice.toFixed(2)})`);
      }
    }
  } catch (error) {
    console.error(`[${timestamp}] [🤖 ChaosBot] Error during chaos iteration:`, error);
  }
}

async function main() {
  console.log('[🤖 ChaosBot] Initializing Chaos Bot Cluster Daemon...');
  console.log(`[🤖 ChaosBot] Controlled bots: TEST_BOT_01 to TEST_BOT_50`);
  
  // Offset startup by 1.5 seconds to stagger from matching engine ticks
  console.log('[🤖 ChaosBot] Waiting 1.5 seconds for offset spacing...');
  await sleep(1500);

  console.log('[🤖 ChaosBot] Starting loop. Running iteration every 3 seconds...');
  
  // Infinite execution loop
  while (true) {
    const startTime = Date.now();
    await runChaosIteration();
    const elapsed = Date.now() - startTime;
    const waitTime = Math.max(0, 3000 - elapsed);
    await sleep(waitTime);
  }
}

main().catch(err => {
  console.error('[🤖 ChaosBot] Fatal daemon crash:', err);
  process.exit(1);
});
