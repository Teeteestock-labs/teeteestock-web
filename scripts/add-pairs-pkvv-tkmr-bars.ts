import { PrismaClient } from '@prisma/client';
import { generateMMFiveBidsAndAsks } from '../src/utils/validatePrice';

const prisma = new PrismaClient();

const NEW_PAIRS = [
  { id: 'PKVV', name: 'PekoVivi' },
  { id: 'TKMR', name: 'TakaMori' },
  { id: 'BARS', name: 'BaeRyS' },
];

async function main() {
  console.log('--- Starting Incremental Migration for New CP Pairs (PKVV, TKMR, BARS) ---');

  for (const pair of NEW_PAIRS) {
    // 1. Upsert CpPairs
    console.log(`Upserting CpPair: ${pair.id} (${pair.name})...`);
    await prisma.cpPairs.upsert({
      where: { id: pair.id },
      update: {
        name: pair.name,
      },
      create: {
        id: pair.id,
        name: pair.name,
        netValue: 100.0,
        currentPrice: 100.0,
        openingPrice: 100.0,
        todayOpenPrice: 100.0,
        last_close_price: 100.0,
        next_open_price: 100.0,
        total_shares: BigInt(1000000),
        status: 'NORMAL',
        warningWeeks: 0,
        adminAdjust: 0.0,
      },
    });

    // 2. Upsert MARKET_MAKER portfolio (500,000 shares)
    console.log(`Upserting MARKET_MAKER portfolio for ${pair.id} with 500,000 shares...`);
    await prisma.userPortfolios.upsert({
      where: {
        userId_pairId: {
          userId: 'MARKET_MAKER',
          pairId: pair.id,
        },
      },
      update: {
        shares_owned: BigInt(500000),
        average_cost: 100.0,
      },
      create: {
        userId: 'MARKET_MAKER',
        pairId: pair.id,
        shares_owned: BigInt(500000),
        average_cost: 100.0,
        initial_choice: 'CASH_ONLY',
      },
    });

    // 3. Clear existing MM orders for this pair and deploy 8 bids & 8 asks (499 shares/tier)
    console.log(`Deploying 8-tier MM liquidity orders for ${pair.id}...`);
    await prisma.orderBook.deleteMany({
      where: {
        userId: 'MARKET_MAKER',
        pairId: pair.id,
      },
    });

    const { bids, asks } = generateMMFiveBidsAndAsks(100.0);

    for (const b of bids) {
      await prisma.orderBook.create({
        data: {
          userId: 'MARKET_MAKER',
          pairId: pair.id,
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
          pairId: pair.id,
          side: 'SELL',
          price: a.price,
          volume: a.volume,
        },
      });
    }

    console.log(`✅ Successfully setup ${pair.id} with 8 bids and 8 asks (499 shares each).`);
  }

  console.log('--- Migration Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
