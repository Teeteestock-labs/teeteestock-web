import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CP_PAIR_IDS = [
  'MCMT', 'OKKR', 'PKMR', 'NEFL', 'SRAZ', 'FBMO', 'SSWT', 'SBRN', 'AZIR',
];

async function main() {
  console.log('--- Deploying / Refreshing MARKET_MAKER 5-Tier Liquidity Orders ---');

  // Clear existing MARKET_MAKER orders
  const deleted = await prisma.orderBook.deleteMany({
    where: { userId: 'MARKET_MAKER' }
  });
  console.log(`Cleared ${deleted.count} old MARKET_MAKER orders.`);

  for (const pairId of CP_PAIR_IDS) {
    const pair = await prisma.cpPairs.findUnique({ where: { id: pairId } });
    const refPrice = pair ? pair.currentPrice : 100.0;

    // 買進 5 檔
    const buyPrices = [refPrice - 0.5, refPrice - 1.0, refPrice - 1.5, refPrice - 2.0, refPrice - 2.5];
    for (const p of buyPrices) {
      if (p <= 0) continue;
      await prisma.orderBook.create({
        data: {
          userId: 'MARKET_MAKER',
          pairId: pairId,
          side: 'BUY',
          price: parseFloat(p.toFixed(2)),
          volume: 5000,
        },
      });
    }

    // 賣出 5 檔
    const sellPrices = [refPrice + 0.5, refPrice + 1.0, refPrice + 1.5, refPrice + 2.0, refPrice + 2.5];
    for (const p of sellPrices) {
      await prisma.orderBook.create({
        data: {
          userId: 'MARKET_MAKER',
          pairId: pairId,
          side: 'SELL',
          price: parseFloat(p.toFixed(2)),
          volume: 5000,
        },
      });
    }
    console.log(`Deployed 5 bids & 5 asks for ${pairId} around price ${refPrice}`);
  }

  console.log('✅ Finished deploying MARKET_MAKER orders.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
