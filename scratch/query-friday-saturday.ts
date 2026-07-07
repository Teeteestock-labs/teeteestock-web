import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const replacer = (key: string, value: any) =>
  typeof value === 'bigint' ? value.toString() : value;

async function main() {
  console.log("=== Friday June 26 Last 5 KLines ===");
  const friKlines = await prisma.kLineHistory.findMany({
    where: {
      pairId: 'OKKR',
      timestamp: {
        gte: new Date("2026-06-26T15:50:00.000Z"),
        lte: new Date("2026-06-26T16:00:00.000Z")
      }
    },
    orderBy: { timestamp: 'asc' }
  });
  console.log(JSON.stringify(friKlines, replacer, 2));

  console.log("\n=== Saturday June 27 First 5 KLines ===");
  const satKlines = await prisma.kLineHistory.findMany({
    where: {
      pairId: 'OKKR',
      timestamp: {
        gte: new Date("2026-06-27T10:00:00.000Z"),
        lte: new Date("2026-06-27T10:05:00.000Z")
      }
    },
    orderBy: { timestamp: 'asc' }
  });
  console.log(JSON.stringify(satKlines, replacer, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
