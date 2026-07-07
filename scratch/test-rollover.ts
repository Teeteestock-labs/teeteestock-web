import { runDailyRolloverOrSettlement } from '../src/services/settlementService';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log("=== Running Rollover / Settlement Test ===");
  
  // Let's check current OKKR state
  const before = await prisma.cpPairs.findUnique({ where: { id: 'OKKR' } });
  console.log("Before:", {
    openingPrice: before?.openingPrice,
    currentPrice: before?.currentPrice,
    netValue: before?.netValue
  });

  // Run the daily rollover/settlement with today's date (Sunday June 28)
  const result = await runDailyRolloverOrSettlement({
    targetDate: new Date("2026-06-28T17:45:00+08:00") // Simulate Sunday 17:45 Taipei time
  });
  console.log("Result:", result);

  const after = await prisma.cpPairs.findUnique({ where: { id: 'OKKR' } });
  console.log("After:", {
    openingPrice: after?.openingPrice,
    currentPrice: after?.currentPrice,
    netValue: after?.netValue
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
