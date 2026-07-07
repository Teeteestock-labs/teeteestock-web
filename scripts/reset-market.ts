import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CP_PAIR_IDS = [
  'MCMT',
  'OKKR',
  'PKMR',
  'NEFL',
  'SRAZ',
  'FBMO',
  'SSWT',
  'SBRN',
  'AZIR',
];

async function main() {
  console.log('--- Start Market & Database Reset Script ---');

  // 1. Clear order books, trades, K-lines, events, and settlement logs
  console.log('Clearing transaction, event, and history tables...');
  
  const orderBookCount = await prisma.orderBook.deleteMany();
  console.log(`Cleared ${orderBookCount.count} orders from OrderBook.`);

  const tradesCount = await prisma.trades.deleteMany();
  console.log(`Cleared ${tradesCount.count} trades from Trades.`);

  const klineCount = await prisma.kLineHistory.deleteMany();
  console.log(`Cleared ${klineCount.count} KLine records from KLineHistory.`);

  const logCount = await prisma.settlementLog.deleteMany();
  console.log(`Cleared ${logCount.count} records from SettlementLog.`);

  const eventCount = await prisma.teeteeEvents.deleteMany();
  console.log(`Cleared ${eventCount.count} records from TeeteeEvents.`);

  const archivedEventCount = await prisma.archivedEvents.deleteMany();
  console.log(`Cleared ${archivedEventCount.count} records from ArchivedEvents.`);

  // 2. Reset CP Pairs prices and status
  console.log('Resetting CP Pairs to initial values (100.0, NORMAL)...');
  for (const pairId of CP_PAIR_IDS) {
    await prisma.cpPairs.update({
      where: { id: pairId },
      data: {
        netValue: 100.0,
        currentPrice: 100.0,
        openingPrice: 100.0,
        last_close_price: 100.0,
        next_open_price: 100.0,
        status: 'NORMAL',
        warningWeeks: 0,
        adminAdjust: 0.0,
      },
    });
    console.log(`Reset pair: ${pairId}`);
  }

  // 3. Clear existing test bot portfolios and accounts
  console.log('Cleaning up existing TEST_BOT_* portfolios and accounts...');
  const portfolioCleanup = await prisma.userPortfolios.deleteMany({
    where: {
      userId: { startsWith: 'TEST_BOT_' }
    }
  });
  console.log(`Cleared ${portfolioCleanup.count} test bot portfolios.`);

  // 4. Seed TEST_BOT_01 to TEST_BOT_50
  console.log('Seeding TEST_BOT_01 to TEST_BOT_50 user accounts and portfolios...');
  for (let i = 1; i <= 50; i++) {
    const botId = `TEST_BOT_${i.toString().padStart(2, '0')}`;
    
    // Seed account balance (1M TEE)
    await prisma.userAccount.upsert({
      where: { userId: botId },
      update: {
        balance: 1000000.0,
      },
      create: {
        userId: botId,
        balance: 1000000.0,
      },
    });

    // Seed portfolios (100k shares of each pair)
    for (const pairId of CP_PAIR_IDS) {
      await prisma.userPortfolios.create({
        data: {
          userId: botId,
          pairId: pairId,
          shares_owned: BigInt(100000),
          average_cost: 100.0,
          initial_choice: 'CASH_ONLY',
        },
      });
    }
    console.log(`Seeded account and portfolios for: ${botId}`);
  }

  // 5. Reset MARKET_MAKER user account balance
  console.log('Resetting MARKET_MAKER user account balance...');
  await prisma.userAccount.upsert({
    where: { userId: 'MARKET_MAKER' },
    update: {
      balance: 999999999.0,
    },
    create: {
      userId: 'MARKET_MAKER',
      balance: 999999999.0,
    },
  });

  // 6. Reset MARKET_MAKER portfolios
  console.log('Resetting MARKET_MAKER portfolios...');
  await prisma.userPortfolios.deleteMany({
    where: {
      userId: 'MARKET_MAKER'
    }
  });
  for (const pairId of CP_PAIR_IDS) {
    await prisma.userPortfolios.create({
      data: {
        userId: 'MARKET_MAKER',
        pairId: pairId,
        shares_owned: BigInt(500000),
        average_cost: 100.0,
        initial_choice: 'CASH_ONLY',
      },
    });
  }
  console.log('✅ MARKET_MAKER portfolios reset.');

  console.log('--- Database Reset and Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Reset script execution failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
