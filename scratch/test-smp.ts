import { prisma } from '../src/lib/prisma';
import { POST as submitOrder } from '../src/app/api/orders/submit/route';
import { POST as triggerMatching } from '../src/app/api/matching/route';
import { OrderSide } from '../src/types/enums';

async function testApiDefense() {
  console.log("\n--- Testing API-Level Defense ---");

  const pairId = 'MCMT';
  const userId = 'smp_test_player';

  // 1. Clear any existing orders for this test user
  await prisma.orderBook.deleteMany({
    where: { userId }
  });

  // 2. Submit initial BUY order at 90.0
  const req1 = new Request("http://localhost/api/orders/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pairId, side: OrderSide.BUY, price: 90.0, volume: 10, userId })
  });

  const res1 = await submitOrder(req1);
  const data1 = await res1.json();
  console.log("Submit BUY Response status:", res1.status, data1);

  if (res1.status !== 201) {
    throw new Error("Failed to submit initial BUY order");
  }

  // 3. Submit overlapping SELL order at 90.0 (should be blocked)
  const req2 = new Request("http://localhost/api/orders/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pairId, side: OrderSide.SELL, price: 90.0, volume: 10, userId })
  });

  const res2 = await submitOrder(req2);
  const data2 = await res2.json();
  console.log("Submit SELL Response status:", res2.status, data2);

  if (res2.status !== 400 || !data2.error.includes("不允許自買自賣")) {
    throw new Error("API defense failed: did not block overlapping self-match order correctly");
  }

  console.log("✅ API-Level Defense passed successfully!");
}

async function testMatchingEngineSMP() {
  console.log("\n--- Testing Matching Engine SMP Layer ---");

  const pairId = 'MCMT';
  const userId = 'smp_test_player';

  // 1. Clear existing orders for the pair
  await prisma.orderBook.deleteMany({
    where: { pairId }
  });
  await prisma.trades.deleteMany({
    where: { pairId }
  });

  // 2. Bypass API block by directly inserting crossing orders into DB
  // Order 1: Older BUY order at 90.0 (created 10 seconds ago)
  const olderBuy = await prisma.orderBook.create({
    data: {
      userId,
      pairId,
      side: OrderSide.BUY,
      price: 90.0,
      volume: 10,
      createdAt: new Date(Date.now() - 10000)
    }
  });

  // Order 2: Newer SELL order at 90.0 (created just now)
  const newerSell = await prisma.orderBook.create({
    data: {
      userId,
      pairId,
      side: OrderSide.SELL,
      price: 90.0,
      volume: 10,
      createdAt: new Date()
    }
  });

  console.log(`Manually inserted older BUY order: ${olderBuy.id} (${olderBuy.createdAt.toISOString()})`);
  console.log(`Manually inserted newer SELL order: ${newerSell.id} (${newerSell.createdAt.toISOString()})`);

  // 3. Trigger the matching engine via API (temporarily bypassing hours check if needed)
  process.env.BYPASS_MARKET_HOURS = "true";
  const req = new Request("http://localhost/api/matching", { method: "POST" });
  const res = await triggerMatching(req);
  const data = await res.json();
  console.log("Matching Response:", JSON.stringify(data, null, 2));

  // 4. Verify results
  // A. Check that no trades were created
  const trades = await prisma.trades.findMany({
    where: { pairId }
  });
  console.log("Trades created for MCMT:", trades.length);
  if (trades.length !== 0) {
    throw new Error("SMP failed: trades were created between same user accounts");
  }

  // B. Verify that the older BUY order was deleted
  const buyInDb = await prisma.orderBook.findUnique({
    where: { id: olderBuy.id }
  });
  console.log("Older BUY order in DB:", buyInDb ? "STILL EXISTS (Fail)" : "DELETED (Success)");
  if (buyInDb) {
    throw new Error("SMP failed: older order was not cancelled");
  }

  // C. Verify that the newer SELL order still exists
  const sellInDb = await prisma.orderBook.findUnique({
    where: { id: newerSell.id }
  });
  console.log("Newer SELL order in DB:", sellInDb ? "STILL EXISTS (Success)" : "DELETED (Fail)");
  if (!sellInDb) {
    throw new Error("SMP failed: newer order was incorrectly cancelled or deleted");
  }

  console.log("✅ Matching Engine SMP Layer passed successfully!");
}

async function main() {
  try {
    await testApiDefense();
    await testMatchingEngineSMP();
    console.log("\n🎉 All SMP tests passed successfully!");
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
}

main();
