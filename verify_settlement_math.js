function getTickSize(price) {
  if (price < 10) return 0.01;
  if (price < 50) return 0.05;
  if (price < 100) return 0.1;
  if (price < 500) return 0.5;
  if (price < 1000) return 1.0;
  return 5.0;
}

function alignToTick(price) {
  if (price <= 0 || isNaN(price)) return price;
  const tickSize = getTickSize(price);
  return parseFloat((Math.round(price / tickSize) * tickSize).toFixed(2));
}

function testSettlement(currentNV, collabBonusSum, adminAdjust = 0, lastPrice = 100) {
  const WARNING_LINE = 10;
  const DELISTING_LINE = 5;
  const MIN_VALUE = 0.1;

  const settledNV = currentNV * (1 + collabBonusSum) + adminAdjust;
  const dividendPerShare = parseFloat((settledNV * 0.08).toFixed(2));

  let nextWeekNV = settledNV * 0.92;
  nextWeekNV = Math.max(MIN_VALUE, parseFloat(nextWeekNV.toFixed(2)));

  const rawOpeningPrice = lastPrice - dividendPerShare;
  const newPrice = alignToTick(Math.max(MIN_VALUE, rawOpeningPrice));

  let wasDelisted = false;
  let statusAfter = 'NORMAL';

  if (nextWeekNV < DELISTING_LINE) {
    statusAfter = 'DELISTED';
    wasDelisted = true;
  } else {
    statusAfter = nextWeekNV <= WARNING_LINE ? 'WARNING' : 'NORMAL';
  }

  return { settledNV, nextWeekNV, dividendPerShare, newPrice, statusAfter, wasDelisted };
}

function runTests() {
  console.log("Running Settlement Refactored Math & Tick Alignment Tests...");
  let passed = 0;
  let total = 0;

  function assertEqual(name, actual, expected) {
    total++;
    if (actual === expected) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} | Expected: ${expected}, Actual: ${actual}`);
    }
  }

  // Test Case 1: 週日最新市價為 110 元，無聯動加成，原淨值為 100，無 adminAdjust
  // settledNV = 100 * (1 + 0) = 100
  // dividendPerShare = 100 * 0.08 = 8.00
  // nextWeekNV = 100 * 0.92 = 92.00
  // rawOpeningPrice = 110 - 8 = 102
  // tick size for 102 is 0.5. Math.round(102 / 0.5) * 0.5 = 102.0
  let res = testSettlement(100, 0, 0, 110);
  assertEqual("Case 1 (settledNV)", res.settledNV, 100);
  assertEqual("Case 1 (dividendPerShare)", res.dividendPerShare, 8);
  assertEqual("Case 1 (nextWeekNV)", res.nextWeekNV, 92);
  assertEqual("Case 1 (newPrice)", res.newPrice, 102);
  assertEqual("Case 1 (statusAfter)", res.statusAfter, 'NORMAL');

  // Test Case 2: 週日最新市價為 110 元，加成加總為 0.09 (日常連動) + 0.15 (3D連動) = 0.24, 原淨值 100
  // settledNV = 100 * (1 + 0.24) = 124
  // dividendPerShare = 124 * 0.08 = 9.92
  // nextWeekNV = 124 * 0.92 = 114.08
  // rawOpeningPrice = 110 - 9.92 = 100.08
  // tick size for 100.08 is 0.5. Math.round(100.08 / 0.5) * 0.5 = 200 * 0.5 = 100.0
  res = testSettlement(100, 0.24, 0, 110);
  assertEqual("Case 2 (settledNV)", res.settledNV, 124);
  assertEqual("Case 2 (dividendPerShare)", res.dividendPerShare, 9.92);
  assertEqual("Case 2 (nextWeekNV)", res.nextWeekNV, 114.08);
  assertEqual("Case 2 (newPrice)", res.newPrice, 100);

  // Test Case 3: 原始開盤價為 99.64 元 (從110扣除配息) -> 對應 tick_size 0.1
  // Math.round(99.64 / 0.1) * 0.1 = 99.6
  res = testSettlement(129.5, 0, 0, 110); // dividend: 129.5 * 0.08 = 10.36. 110 - 10.36 = 99.64
  assertEqual("Case 3 (dividendPerShare)", res.dividendPerShare, 10.36);
  assertEqual("Case 3 (newPrice)", res.newPrice, 99.6);

  // Test Case 4: 下市觸發 (nextWeekNV < 5.0)
  // currentNV = 5, no collab -> settledNV = 5. dividend = 0.4. nextWeekNV = 5 * 0.92 = 4.6
  res = testSettlement(5, 0, 0, 10);
  assertEqual("Case 4 (nextWeekNV)", res.nextWeekNV, 4.6);
  assertEqual("Case 4 (statusAfter)", res.statusAfter, 'DELISTED');
  assertEqual("Case 4 (wasDelisted)", res.wasDelisted, true);

  // Test Case 5: 警戒區 (5.0 <= nextWeekNV <= 10.0)
  // currentNV = 10, no collab -> nextWeekNV = 9.2
  res = testSettlement(10, 0, 0, 20);
  assertEqual("Case 5 (nextWeekNV)", res.nextWeekNV, 9.2);
  assertEqual("Case 5 (statusAfter)", res.statusAfter, 'WARNING');

  console.log(`\nTests completed: ${passed}/${total} passed.`);
}

runTests();
