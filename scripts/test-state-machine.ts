import { PrismaClient } from '@prisma/client';
import { getCurrentMarketStatus } from '../src/utils/marketHours';
import { checkAndTickMarketStatus } from '../src/services/settlementService';

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== State Machine Unit Tests ===");

  // 1. Test getCurrentMarketStatus based on time
  const testClosed = new Date("2026-07-04T12:00:00+08:00"); // 12:00
  const statusClosed = getCurrentMarketStatus(testClosed);
  console.log(`Time 12:00 Status: expected CLOSED, got ${statusClosed}`);
  if (statusClosed !== 'CLOSED') throw new Error("CLOSED test failed");

  const testPreMarket = new Date("2026-07-04T18:50:00+08:00"); // 18:50
  const statusPreMarket = getCurrentMarketStatus(testPreMarket);
  console.log(`Time 18:50 Status: expected PRE_MARKET, got ${statusPreMarket}`);
  if (statusPreMarket !== 'PRE_MARKET') throw new Error("PRE_MARKET test failed");

  const testOpen = new Date("2026-07-04T20:00:00+08:00"); // 20:00
  const statusOpen = getCurrentMarketStatus(testOpen);
  console.log(`Time 20:00 Status: expected OPEN, got ${statusOpen}`);
  if (statusOpen !== 'OPEN') throw new Error("OPEN test failed");

  // 2. Test DB transitions
  console.log("Testing DB state tick transitions...");
  // Seed state to CLOSED
  await prisma.systemConfig.update({ where: { id: 1 }, data: { marketStatus: 'CLOSED' } });
  
  // Tick with pre-market time
  const tickedStatus = await checkAndTickMarketStatus(testPreMarket);
  console.log(`Ticking with 18:50 time: expected PRE_MARKET, got ${tickedStatus}`);
  
  // Verify DB state is PRE_MARKET
  const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
  console.log(`DB marketStatus: expected PRE_MARKET, got ${config?.marketStatus}`);
  if (config?.marketStatus !== 'PRE_MARKET') throw new Error("Transition to PRE_MARKET failed");

  console.log("All unit tests passed successfully!");
}

runTests()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
  });
