import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const replacer = (key: string, value: any) =>
  typeof value === 'bigint' ? value.toString() : value;

async function main() {
  console.log("=== Saturday June 27 OKKR Trades ===");
  const satTrades = await prisma.trades.findMany({
    where: {
      pairId: 'OKKR',
      createdAt: {
        gte: new Date("2026-06-27T00:00:00.000Z"),
        lte: new Date("2026-06-27T23:59:59.000Z")
      }
    },
    orderBy: { createdAt: 'asc' }
  });
  console.log(`Found ${satTrades.length} trades on Saturday`);
  if (satTrades.length > 0) {
    console.log("First trade on Saturday:", JSON.stringify(satTrades[0], replacer, 2));
    console.log("Last trade on Saturday:", JSON.stringify(satTrades[satTrades.length - 1], replacer, 2));
  }

  console.log("\n=== Sunday June 28 OKKR Trades ===");
  const sunTrades = await prisma.trades.findMany({
    where: {
      pairId: 'OKKR',
      createdAt: {
        gte: new Date("2026-06-28T00:00:00.000Z"),
        lte: new Date("2026-06-28T23:59:59.000Z")
      }
    },
    orderBy: { createdAt: 'asc' }
  });
  console.log(`Found ${sunTrades.length} trades on Sunday`);
  if (sunTrades.length > 0) {
    console.log("First trade on Sunday:", JSON.stringify(sunTrades[0], replacer, 2));
    console.log("Last trade on Sunday:", JSON.stringify(sunTrades[sunTrades.length - 1], replacer, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
