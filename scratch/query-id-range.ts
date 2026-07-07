import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const replacer = (key: string, value: any) =>
  typeof value === 'bigint' ? value.toString() : value;

async function main() {
  console.log("=== KLineHistory with IDs between 8870 and 8900 ===");
  const klines = await prisma.kLineHistory.findMany({
    where: {
      id: {
        gte: 8870,
        lte: 8900
      }
    },
    orderBy: { id: 'asc' }
  });
  console.log(JSON.stringify(klines, replacer, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
