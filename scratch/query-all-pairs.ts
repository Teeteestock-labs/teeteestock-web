import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const replacer = (key: string, value: any) =>
  typeof value === 'bigint' ? value.toString() : value;

async function main() {
  const pairs = await prisma.cpPairs.findMany();
  console.log("=== All CP Pairs Current State ===");
  console.log(JSON.stringify(pairs.map(p => ({
    id: p.id,
    openingPrice: p.openingPrice,
    currentPrice: p.currentPrice,
    netValue: p.netValue,
    lastSettledAt: p.lastSettledAt
  })), replacer, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
