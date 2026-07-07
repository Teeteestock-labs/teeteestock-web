import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const replacer = (key: string, value: any) =>
  typeof value === 'bigint' ? value.toString() : value;

async function main() {
  const mmOrders = await prisma.orderBook.findMany({
    where: { userId: 'MARKET_MAKER' },
    orderBy: { pairId: 'asc' }
  });

  console.log("=== Market Maker Orders ===");
  console.log(JSON.stringify(mmOrders, replacer, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
