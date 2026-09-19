import { PrismaClient } from '@prisma/client';
import { generateMMFiveBidsAndAsks } from '../src/utils/validatePrice';

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

    for (const a of asks) {
      await prisma.orderBook.create({
        data: {
          userId: 'MARKET_MAKER',
          pairId: pairId,
          side: 'SELL',
          price: a.price,
          volume: a.volume,
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
