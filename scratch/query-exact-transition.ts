import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const replacer = (key: string, value: any) =>
  typeof value === 'bigint' ? value.toString() : value;

async function main() {
  console.log("=== Saturday close (latest 10 KLines) ===");
  const satKlines = await prisma.kLineHistory.findMany({
    where: {
      pairId: 'OKKR',
      timestamp: {
        gte: new Date("2026-06-27T15:50:00.000Z"),
        lte: new Date("2026-06-27T16:00:00.000Z")
      }
    },
    orderBy: { timestamp: 'asc' }
  });
  console.log(JSON.stringify(satKlines, replacer, 2));

  console.log("\n=== Sunday open (first 10 KLines) ===");
  const sunKlines = await prisma.kLineHistory.findMany({
    where: {
      pairId: 'OKKR',
      timestamp: {
        gte: new Date("2026-06-28T10:00:00.000Z"),
        lte: new Date("2026-06-28T10:10:00.000Z")
      }
    },
    orderBy: { timestamp: 'asc' }
  });
  console.log(JSON.stringify(sunKlines, replacer, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
