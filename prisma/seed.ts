import { PrismaClient } from '@prisma/client';
import { MarketStatus, UserChoice } from '../src/types/enums';

const prisma = new PrismaClient();

const INITIAL_PAIRS = [
  { id: 'MCMT', name: 'MiComet' },
  { id: 'OKKR', name: 'OkaKoro' },
  { id: 'PKMR', name: 'PekoMarine' },
  { id: 'NEFL', name: 'NoelFlare' },
  { id: 'SRAZ', name: 'SorAZ' },
  { id: 'FBMO', name: 'FubuMio' },
  { id: 'SSWT', name: 'ShishiWata' },
  { id: 'SBRN', name: 'SubaRuna' },
  { id: 'AZIR', name: 'AZIro' },
];

async function main() {
  console.log('--- Start Seeding Database ---');

  // 1. Seed SystemConfig (idempotent: update is empty to avoid overwriting)
  console.log('Seeding SystemConfig...');
  await prisma.systemConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      is_market_open: false,
      tax_rate: 0.003,
      warning_line: 10.0,
      delisting_line: 5.0,
      marketStatus: 'CLOSED',
    },
  });
  console.log('✅ SystemConfig seeded.');

  // 2. Seed CpPairs (idempotent)
  console.log('Seeding 9 Hololive CpPairs...');
  for (const pair of INITIAL_PAIRS) {
    await prisma.cpPairs.upsert({
      where: { id: pair.id },
      update: { name: pair.name }, // Update names to strip Chinese text
      create: {
        id: pair.id,
        name: pair.name,
        netValue: 100.0,
        currentPrice: 100.0,
        openingPrice: 100.0,
        last_close_price: 100.0,
        next_open_price: 100.0,
        total_shares: BigInt(1000000),
        status: MarketStatus.NORMAL, // evaluates to 'NORMAL'
      },
    });
  }
  console.log('✅ CpPairs seeded.');

  // 3. Seed Market Maker Account (idempotent)
  console.log('Seeding MARKET_MAKER user account...');
  await prisma.userAccount.upsert({
    where: { userId: 'MARKET_MAKER' },
    update: {},
    create: {
      userId: 'MARKET_MAKER',
      balance: 999999999.0,
    },
  });
  console.log('✅ MARKET_MAKER account seeded.');

  // 4. Seed Market Maker Portfolios (idempotent)
  console.log('Seeding MARKET_MAKER portfolios...');
  for (const pair of INITIAL_PAIRS) {
    await prisma.userPortfolios.upsert({
      where: {
        userId_pairId: {
          userId: 'MARKET_MAKER',
          pairId: pair.id,
        },
      },
      update: {},
      create: {
        userId: 'MARKET_MAKER',
        pairId: pair.id,
        shares_owned: BigInt(500000),
        average_cost: 100.0,
        initial_choice: UserChoice.CASH_ONLY, // evaluates to 'CASH_ONLY'
      },
    });
  }
  console.log('✅ MARKET_MAKER portfolios seeded.');

  console.log('--- Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
