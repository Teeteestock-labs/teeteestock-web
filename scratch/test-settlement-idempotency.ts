import { prisma } from '../src/lib/prisma';
import { runDailyRolloverOrSettlement } from '../src/services/settlementService';

async function testIdempotency() {
  console.log('=== Test: Settlement Idempotency & Concurrency Protection ===\n');

  // Clean up any test settlement logs from last 48 hours for clean test start
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  await prisma.settlementLog.deleteMany({
    where: { createdAt: { gte: fortyEightHoursAgo } }
  });
  await prisma.systemConfig.upsert({
    where: { id: 1 },
    update: { marketStatus: 'SETTLING', pendingDividendSettle: true },
    create: { id: 1, marketStatus: 'SETTLING', pendingDividendSettle: true }
  });

  console.log('1. Launching two concurrent settlement calls simultaneously...');
  const [res1, res2] = await Promise.all([
    runDailyRolloverOrSettlement({ forceAction: 'settle' }),
    runDailyRolloverOrSettlement({ forceAction: 'settle' })
  ]);

  console.log('Call 1 Result:', res1.actionExecuted, '-', res1.message);
  console.log('Call 2 Result:', res2.actionExecuted, '-', res2.message);

  const actions = [res1.actionExecuted, res2.actionExecuted];
  const settleCount = actions.filter(a => a === 'settle').length;
  const noneCount = actions.filter(a => a === 'none').length;

  if (settleCount === 1 && noneCount === 1) {
    console.log('\n✅ PASSED: Exactly 1 settlement executed, 1 was blocked by atomic concurrency guard!');
  } else {
    console.error(`\n❌ FAILED: Expected 1 settle and 1 none, but got ${settleCount} settle and ${noneCount} none.`);
    process.exit(1);
  }

  console.log('\n2. Testing sequential call immediately after settlement...');
  const res3 = await runDailyRolloverOrSettlement({ forceAction: 'settle' });
  console.log('Call 3 Result:', res3.actionExecuted, '-', res3.message);

  if (res3.actionExecuted === 'none') {
    console.log('✅ PASSED: Sequential call was immediately blocked by 48h guard!');
  } else {
    console.error('❌ FAILED: Sequential call was not blocked!');
    process.exit(1);
  }

  // Cleanup test logs
  await prisma.settlementLog.deleteMany({
    where: { createdAt: { gte: fortyEightHoursAgo } }
  });
  console.log('\n🎉 ALL SETTLEMENT IDEMPOTENCY TESTS PASSED!');
}

testIdempotency()
  .catch((e) => {
    console.error('Test error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
