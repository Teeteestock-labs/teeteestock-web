import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const replacer = (key: string, value: any) =>
  typeof value === 'bigint' ? value.toString() : value;

async function main() {
  console.log("=== Last 10 Settlement Logs ===");
  const logs = await prisma.settlementLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log(JSON.stringify(logs, replacer, 2));

  console.log("\n=== Last 5 Daily Opening Prices in KLineHistory for OKKR ===");
  // Find distinct daily opening prices by grouping or querying the first KLine of each day
  // Let's query KLines around 10:00:00 UTC (18:00 Taipei) for the past 5 days
  const targetDays = [
    { name: "Sunday June 28", start: "2026-06-28T10:00:00.000Z" },
    { name: "Saturday June 27", start: "2026-06-27T10:00:00.000Z" },
    { name: "Friday June 26", start: "2026-06-26T10:00:00.000Z" },
    { name: "Thursday June 25", start: "2026-06-25T10:00:00.000Z" },
    { name: "Wednesday June 24", start: "2026-06-24T10:00:00.000Z" }
  ];

  for (const day of targetDays) {
    const klines = await prisma.kLineHistory.findMany({
      where: {
        pairId: 'OKKR',
        timestamp: {
          gte: new Date(day.start),
          lte: new Date(new Date(day.start).getTime() + 5 * 60 * 1000) // first 5 mins
        }
      },
      orderBy: { timestamp: 'asc' },
      take: 1
    });
    if (klines.length > 0) {
      console.log(`${day.name} Open KLine:`, JSON.stringify(klines[0], replacer, 2));
    } else {
      console.log(`${day.name} - No KLine found`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
