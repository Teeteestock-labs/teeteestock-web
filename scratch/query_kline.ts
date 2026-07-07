import { prisma } from '../src/lib/prisma';

async function main() {
  const count = await prisma.kLineHistory.count();
  console.log(`KLineHistory count: ${count}`);

  const recent = await prisma.kLineHistory.findMany({
    orderBy: { timestamp: 'desc' },
    take: 10
  });
  console.log('Recent KLineHistory:');
  recent.forEach(r => {
    console.log(` - ID: ${r.id}, pairId: ${r.pairId}, timestamp: ${r.timestamp.toISOString()}, open: ${r.open}, close: ${r.close}, vol: ${r.volume}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
