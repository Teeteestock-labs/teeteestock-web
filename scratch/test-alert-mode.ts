import { prisma } from '../src/lib/prisma';
import { runDailyRolloverOrSettlement } from '../src/services/settlementService';
import { alignToTick, getTickSize } from '../src/utils/validatePrice';
import { MarketStatus, OrderSide } from '../src/types/enums';

async function testAlertModeTrigger() {
  console.log("\n--- Testing Alert Mode Trigger & MM Order Placement ---");

  const pairId = 'TEST_ALERT';

  // 1. Create a dummy CP pair
  // We want: Limit_Down_Price < Alert_Price
  // Yesterday close = 9.0 -> Limit_Down_Price = 9.0 * 0.80 = 7.20
  // netValue = 100.0 -> Alert_Price = 100.0 * 0.08 = 8.0
  // Since 7.20 < 8.0, it triggers Alert Mode!
  await prisma.cpPairs.upsert({
    where: { id: pairId },
    update: {
      name: "Test Alert stock",
      currentPrice: 9.00,
      openingPrice: 9.00,
      netValue: 100.00,
      status: MarketStatus.NORMAL
    },
    create: {
      id: pairId,
      name: "Test Alert stock",
      currentPrice: 9.00,
      openingPrice: 9.00,
      netValue: 100.00,
      total_shares: BigInt(1000000),
      status: MarketStatus.NORMAL
    }
  });

  // Ensure MARKET_MAKER user exists and has a balance
  await prisma.userAccount.upsert({
    where: { userId: 'MARKET_MAKER' },
    update: {
      balance: 1000000.00 // Set mm balance to a controlled number for easy verification
    },
    create: {
      userId: 'MARKET_MAKER',
      balance: 1000000.00
    }
  });

  // Clear orders for this pair
  await prisma.orderBook.deleteMany({
    where: { pairId }
  });

  // Calculate active alert pairs in database beforehand to check expectation
  const activePairs = await prisma.cpPairs.findMany({
    where: { status: { not: MarketStatus.DELISTED } }
  });
  const alertPairs = [];
  for (const p of activePairs) {
    const alertPrice = p.netValue * 0.08;
    const limitDownPrice = p.currentPrice * 0.80;
    if (limitDownPrice < alertPrice) {
      alertPairs.push(p.id);
    }
  }
  const alertCount = alertPairs.length;
  console.log(`Pre-calculation: found ${alertCount} pairs that will enter Alert Mode:`, alertPairs);

  console.log("Triggering forced daily rollover settlement run...");
  
  // Call rollover forced action
  const res = await runDailyRolloverOrSettlement({
    forceAction: 'rollover',
    targetDate: new Date()
  });

  console.log("Rollover Execution Result:", res.message);

  // 2. Query orders placed by MARKET_MAKER
  const orders = await prisma.orderBook.findMany({
    where: { pairId, userId: 'MARKET_MAKER' }
  });

  console.log(`Created orders count: ${orders.length}`);
  if (orders.length === 0) {
    throw new Error("Alert Mode did not deploy any orders");
  }

  // Target Alert Price = 100 * 0.08 = 8.00
  // We expect prices around 8.00:
  // Center price = 8.00
  // Down 2 ticks: 7.99, 7.98
  // Up 8 ticks: 8.01, 8.02, 8.03, 8.04, 8.05, 8.06, 8.07, 8.08
  const expectedPrices = [7.98, 7.99, 8.00, 8.01, 8.02, 8.03, 8.04, 8.05, 8.06, 8.07, 8.08];

  const orderPrices = orders.map(o => parseFloat(o.price.toFixed(2)));
  console.log("Expected prices:", expectedPrices);
  console.log("Actual order prices:", orderPrices);

  for (const p of expectedPrices) {
    if (!orderPrices.includes(p)) {
      throw new Error(`Expected price level ${p} not found in deployed buy orders`);
    }
  }

  // Check weights:
  // Cash allocated = 1,000,000 / alertCount
  // dotZeroPrice (8.00) gets 53.7% of allocatedCash
  // Expected volume for 8.00 is floor(allocatedCash * 0.537 / 8.00)
  const allocatedCash = 1000000.00 / alertCount;
  const expectedVolume = Math.floor((allocatedCash * 0.537) / 8.00);

  const dotZeroOrder = orders.find(o => parseFloat(o.price.toFixed(2)) === 8.00);
  console.log(`8.00 Order details:`, dotZeroOrder);
  console.log(`Expected volume: ${expectedVolume}, Got volume: ${dotZeroOrder?.volume}`);

  if (!dotZeroOrder || dotZeroOrder.volume !== expectedVolume) {
    throw new Error(`Dot zero weight allocation failed: expected volume ${expectedVolume}, got ${dotZeroOrder?.volume}`);
  }

  // Cleanup
  await prisma.orderBook.deleteMany({
    where: { pairId }
  });
  await prisma.cpPairs.delete({
    where: { id: pairId }
  });

  console.log("✅ Alert Mode trigger & order weight placement tests passed successfully!");
}

async function main() {
  try {
    await testAlertModeTrigger();
    console.log("\n🎉 All Alert Mode tests passed successfully!");
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
}

main();
