import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const replacer = (key: string, value: any) =>
  typeof value === 'bigint' ? value.toString() : value;

function getTickSize(price: number) {
  if (price < 10) return 0.01;
  if (price < 50) return 0.05;
  if (price < 100) return 0.1;
  if (price < 500) return 0.5;
  if (price < 1000) return 1.0;
  return 5.0;
}

function alignToTick(price: number) {
  if (price <= 0 || isNaN(price)) return price;
  const tickSize = getTickSize(price);
  return parseFloat((Math.round(price / tickSize) * tickSize).toFixed(2));
}

async function main() {
  console.log("=== CpPairs OKKR ===");
  const okkr = await prisma.cpPairs.findUnique({
    where: { id: 'OKKR' }
  });
  console.log(JSON.stringify(okkr, replacer, 2));

  if (!okkr) {
    console.log("OKKR not found");
    return;
  }

  // Let's query recent trades to see what transactions happened today and yesterday
  console.log("\n=== Trades for OKKR (latest 10) ===");
  const trades = await prisma.trades.findMany({
    where: { pairId: 'OKKR' },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log(JSON.stringify(trades, replacer, 2));

  // Let's query KLineHistory for today (June 28) and yesterday (June 27)
  console.log("\n=== KLineHistory OKKR for June 27 (Yesterday) ===");
  // Note: Taipei 18:00 to 24:00 is UTC 10:00 to 16:00
  // June 27: 10:00:00 UTC to 16:00:00 UTC
  const klinesYesterday = await prisma.kLineHistory.findMany({
    where: {
      pairId: 'OKKR',
      timestamp: {
        gte: new Date("2026-06-27T10:00:00.000Z"),
        lte: new Date("2026-06-27T16:00:00.000Z")
      }
    },
    orderBy: { timestamp: 'asc' }
  });
  console.log(`Found ${klinesYesterday.length} KLines for yesterday`);
  if (klinesYesterday.length > 0) {
    console.log("First KLine:", JSON.stringify(klinesYesterday[0], replacer, 2));
    console.log("Last KLine:", JSON.stringify(klinesYesterday[klinesYesterday.length - 1], replacer, 2));
  }

  console.log("\n=== KLineHistory OKKR for June 28 (Today) ===");
  const klinesToday = await prisma.kLineHistory.findMany({
    where: {
      pairId: 'OKKR',
      timestamp: {
        gte: new Date("2026-06-28T10:00:00.000Z"),
        lte: new Date("2026-06-28T16:00:00.000Z")
      }
    },
    orderBy: { timestamp: 'asc' }
  });
  console.log(`Found ${klinesToday.length} KLines for today`);
  if (klinesToday.length > 0) {
    console.log("First KLine:", JSON.stringify(klinesToday[0], replacer, 2));
    console.log("Last KLine:", JSON.stringify(klinesToday[klinesToday.length - 1], replacer, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
