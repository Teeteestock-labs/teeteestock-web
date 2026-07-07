import { prisma } from '@/lib/prisma';
import { INITIAL_PAIRS } from '@/app/constants/market';

async function main() {
  console.log("Seeding initial CP pairs into SQLite database...");
  for (const pair of INITIAL_PAIRS) {
    await prisma.cpPairs.upsert({
      where: { id: pair.id },
      update: {
        name: pair.name,
        netValue: 100.0,
        currentPrice: pair.price,
        openingPrice: pair.price,
        status: pair.status,
      },
      create: {
        id: pair.id,
        name: pair.name,
        netValue: 100.0,
        currentPrice: pair.price,
        openingPrice: pair.price,
        status: pair.status,
      }
    });
  }
  console.log("Seeding completed successfully!");
}

main()
  .catch(err => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
