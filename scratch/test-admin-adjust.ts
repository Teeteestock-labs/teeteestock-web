import { prisma } from '../src/lib/prisma';
import { runDailyRolloverOrSettlement } from '../src/services/settlementService';
import { updateAdminAdjust } from '../src/app/admin/actions';
import { MarketStatus } from '../src/types/enums';

async function testAdministrativeAdjustment() {
  console.log("\n--- Testing Cumulative Independent Administrative Overrides ---");

  const pairId = 'TEST_ADMIN';

  // 1. Create a dummy CP pair
  // Initial netValue = 100.0
  // Initial currentPrice = 100.0
  await prisma.cpPairs.upsert({
    where: { id: pairId },
    update: {
      name: "Test Admin stock",
      currentPrice: 100.00,
      openingPrice: 100.00,
      netValue: 100.00,
      status: MarketStatus.NORMAL,
      adminAdjust: 0.0,
      adminAdjustReason: ""
    },
    create: {
      id: pairId,
      name: "Test Admin stock",
      currentPrice: 100.00,
      openingPrice: 100.00,
      netValue: 100.00,
      total_shares: BigInt(1000),
      status: MarketStatus.NORMAL
    }
  });

  // Clear any existing settlement history or events for this test pair
  await prisma.teeteeEvents.deleteMany({
    where: { pairId }
  });
  await prisma.archivedEvents.deleteMany({
    where: { pairId }
  });
  await prisma.settlementLog.deleteMany({
    where: { pairId }
  });

  // 2. Set first override: 10.0 (represents 10%)
  console.log("Applying first override: +10% (input: 10.0)...");
  await updateAdminAdjust(pairId, 10.0, "First override", "https://example.com/test-1");

  // 3. Set second override: 5.0 (represents 5%)
  console.log("Applying second override: +5% (input: 5.0)...");
  await updateAdminAdjust(pairId, 5.0, "Second override", "https://example.com/test-2");

  // Verify they were both written to the database as approved, unsettled events
  const events = await prisma.teeteeEvents.findMany({
    where: { pairId, status: 'APPROVED', isSettled: false }
  });
  console.log("Database active events found:", events.length);
  if (events.length !== 2) {
    throw new Error(`Expected 2 override events, found ${events.length}`);
  }

  const firstEvent = events.find(e => e.url === "https://example.com/test-1");
  const secondEvent = events.find(e => e.url === "https://example.com/test-2");

  console.log("First Event - Type:", firstEvent?.type, "Title:", firstEvent?.title);
  console.log("Second Event - Type:", secondEvent?.type, "Title:", secondEvent?.title);

  if (!firstEvent || firstEvent.type !== 'OVERRIDE:0.1' || firstEvent.title !== 'First override') {
    throw new Error("First override event is invalid");
  }
  if (!secondEvent || secondEvent.type !== 'OVERRIDE:0.05' || secondEvent.title !== 'Second override') {
    throw new Error("Second override event is invalid");
  }

  // 4. Trigger a weekly Sunday settlement (settle)
  console.log("Triggering weekly Sunday settlement action...");
  const res = await runDailyRolloverOrSettlement({
    forceAction: 'settle',
    targetDate: new Date() // Force execution
  });
  console.log("Settlement Execution Result:", res.message);

  // 5. Verify the math
  // Initial NV = 100.0
  // collabBonusSum = 0.10 + 0.05 = 0.15
  // settledNV = 100.0 * (1 + 0.15) = 115.0
  // dividendPerShare = 115.0 * 0.08 = 9.20
  // nextWeekNV = 115.0 * 0.92 = 105.80
  // newPrice = 100.0 - 9.20 = 90.80
  const pairAfterSettle = await prisma.cpPairs.findUnique({
    where: { id: pairId }
  });

  console.log("Settled Net Value in DB:", pairAfterSettle?.netValue);
  console.log("Settled Opening Price in DB:", pairAfterSettle?.openingPrice);

  if (pairAfterSettle?.netValue !== 105.80) {
    throw new Error(`Expected settled netValue to be 105.80, got ${pairAfterSettle?.netValue}`);
  }
  if (pairAfterSettle?.openingPrice !== 90.80) {
    throw new Error(`Expected settled openingPrice to be 90.80, got ${pairAfterSettle?.openingPrice}`);
  }

  // Verify that both events are now archived
  const archivedCount = await prisma.archivedEvents.count({
    where: { pairId, type: { startsWith: 'OVERRIDE:' } }
  });
  console.log("Archived override events count:", archivedCount);
  if (archivedCount !== 2) {
    throw new Error(`Expected 2 archived override events, got ${archivedCount}`);
  }

  // 6. Verify settlement history logs
  const history = await prisma.settlementLog.findFirst({
    where: { pairId },
    orderBy: { createdAt: 'desc' }
  });

  console.log("Settlement History reason:", history?.adminAdjustReason);
  if (history?.adminAdjustReason !== "First override, Second override") {
    throw new Error(`Expected joined history reason to be 'First override, Second override', got '${history?.adminAdjustReason}'`);
  }

  // Cleanup
  await prisma.orderBook.deleteMany({
    where: { pairId }
  });
  await prisma.teeteeEvents.deleteMany({
    where: { pairId }
  });
  await prisma.archivedEvents.deleteMany({
    where: { pairId }
  });
  await prisma.settlementLog.deleteMany({
    where: { pairId }
  });
  await prisma.cpPairs.delete({
    where: { id: pairId }
  });

  console.log("✅ Administrative adjustment tests passed successfully!");
}

async function main() {
  try {
    await testAdministrativeAdjustment();
    console.log("\n🎉 All admin adjustment tests passed successfully!");
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
}

main();
