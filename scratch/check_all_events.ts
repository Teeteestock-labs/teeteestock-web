import { prisma } from '../src/lib/prisma';

async function main() {
  const events = await prisma.teeteeEvents.findMany({
    orderBy: { createdAt: 'desc' }
  });
  console.log(`Total events: ${events.length}`);
  events.forEach(e => {
    console.log(`- Pair: ${e.pairId} | Status: ${e.status} | URL: ${e.url} | Title: ${e.title}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
