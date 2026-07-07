import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const replacer = (key: string, value: any) =>
  typeof value === 'bigint' ? value.toString() : value;

async function main() {
  console.log("=== KLineHistory OKKR around Saturday close and Sunday open ===");
  // Query all KLines for OKKR from June 27 15:50 UTC to June 28 10:10 UTC
  const klines = await prisma.kLineHistory.findMany({
    where: {
      pairId: 'OKKR',
      timestamp: {
        gte: new Date("2026-06-27T15:00:00.000Z"),
        lte: new Date("2026-06-28T11:00:00.000Z")
      }
    },
    orderBy: { timestamp: 'asc' }
  });

  console.log(`Found ${klines.length} KLines in transition period`);
  for (const kl of klines.slice(0, 10)) {
    console.log(JSON.stringify(kl, replacer));
  }
  if (klines.length > 20) {
    console.log("...");
    for (const kl of klines.slice(-10)) {
      console.log(JSON.stringify(kl, replacer));
    }
  } else if (klines.length > 10) {
    for (const kl of klines.slice(10)) {
      console.log(JSON.stringify(kl, replacer));
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
