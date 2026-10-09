import { PrismaClient } from '@prisma/client';
import { generateMMFiveBidsAndAsks } from '../src/utils/validatePrice';

const prisma = new PrismaClient();

const CP_PAIR_IDS = [
  'MCMT', 'OKKR', 'PKMR', 'NEFL', 'SRAZ', 'FBMO', 'SSWT', 'SBRN', 'AZIR',
  'PKVV', 'TKMR', 'BARS',
];

async function main() {
  console.log('--- Deploying / Refreshing MARKET_MAKER 8-Tier Liquidity Orders (499 shares/tier) ---');

  // Clear existing MARKET_MAKER orders
  const deleted = await prisma.orderBook.deleteMany({
    where: { userId: 'MARKET_MAKER' }
  });
  console.log(`Cleared ${deleted.count} old MARKET_MAKER orders.`);

  for (const pairId of CP_PAIR_IDS) {
    const pair = await prisma.cpPairs.findUnique({ where: { id: pairId } });
    const refPrice = pair ? pair.currentPrice : 100.0;

    // 確保 MARKET_MAKER 擁有庫存記錄可供交割（若無則初始化 500,000 股，耗盡不補足）
    const mmPort = await prisma.userPortfolios.upsert({
      where: {
        userId_pairId: {
          userId: 'MARKET_MAKER',
          pairId: pairId,
        }
      },
      update: {},
      create: {
        userId: 'MARKET_MAKER',
        pairId: pairId,
        shares_owned: BigInt(500000),
        average_cost: refPrice,
        initial_choice: 'CASH_ONLY',
      }
    });

    const { bids, asks } = generateMMFiveBidsAndAsks(refPrice);

    for (const b of bids) {
      await prisma.orderBook.create({
        data: {
          userId: 'MARKET_MAKER',
          pairId: pairId,
          side: 'BUY',
          price: b.price,
          volume: b.volume,
        },
      });
    }

    let availableToSell = Number(mmPort.shares_owned);
    let deployedAsks = 0;
    for (const a of asks) {
      if (availableToSell <= 0) break;
      const sellVol = Math.min(a.volume, availableToSell);
      if (sellVol > 0) {
        await prisma.orderBook.create({
          data: {
            userId: 'MARKET_MAKER',
            pairId: pairId,
            side: 'SELL',
            price: a.price,
            volume: sellVol,
          },
        });
        availableToSell -= sellVol;
        deployedAsks++;
      }
    }
    console.log(`Deployed ${bids.length} bids & ${deployedAsks} asks for ${pairId} around price ${refPrice}`);
  }

  console.log('✅ Finished deploying MARKET_MAKER orders.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
