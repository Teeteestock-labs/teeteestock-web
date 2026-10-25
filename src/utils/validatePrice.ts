/**
 * 取得台股不同價格級距的最小跳動單位 (Tick Size)
 * 0.01 ~ 未滿 10 元：最小跳動 0.01
 * 10 ~ 未滿 50 元：最小跳動 0.05
 * 50 ~ 未滿 100 元：最小跳動 0.1
 * 100 ~ 未滿 500 元：最小跳動 0.5
 * 500 ~ 未滿 1000 元：最小跳動 1.0
 * 1000 元以上：最小跳動 5.0
 */
export function getTickSize(price: number): number {
  if (price < 10) return 0.01;
  if (price < 50) return 0.05;
  if (price < 100) return 0.1;
  if (price < 500) return 0.5;
  if (price < 1000) return 1.0;
  if (price < 5000) return 5.0;
  return 10.0;
}

export function isValidTickSize(price: number): boolean {
  if (price <= 0 || isNaN(price)) return false;

  const tickSize = getTickSize(price);
  const ratio = price / tickSize;
  
  // 檢查除完後的比例是否極接近整數，容許誤差 epsilon 設定為 1e-9
  return Math.abs(ratio - Math.round(ratio)) < 1e-9;
}

export function alignToTick(price: number): number {
  if (price <= 0 || isNaN(price)) return price;
  const tickSize = getTickSize(price);
  return parseFloat((Math.round(price / tickSize) * tickSize).toFixed(2));
}

/**
 * 依據當前股價級距計算造市商上下各 8 檔買單與賣單
 * 下檔 8 檔買單：依據當時價格級距向下延伸 8 檔
 * 上檔 8 檔賣單：依據當時價格級距向上延伸 8 檔
 * 每檔掛單數量 = 499 股，當天耗盡不補充
 */
export function generateMMEightBidsAndAsks(refPrice: number, tierCount: number = 8, volumePerTier: number = 499): {
  bids: { price: number; volume: number }[];
  asks: { price: number; volume: number }[];
} {
  const bids: { price: number; volume: number }[] = [];
  let pBid = refPrice;
  for (let i = 0; i < tierCount; i++) {
    const tick = getTickSize(pBid - 0.0001);
    pBid = alignToTick(pBid - tick);
    if (pBid <= 0) break;
    bids.push({ price: pBid, volume: volumePerTier });
  }

  const asks: { price: number; volume: number }[] = [];
  let pAsk = refPrice;
  for (let i = 0; i < tierCount; i++) {
    const tick = getTickSize(pAsk);
    pAsk = alignToTick(pAsk + tick);
    asks.push({ price: pAsk, volume: volumePerTier });
  }

  return { bids, asks };
}

/**
 * 舊名稱相容別名，預設統一調用上下各 8 檔、每檔 499 股配置
 */
export function generateMMFiveBidsAndAsks(refPrice: number): {
  bids: { price: number; volume: number }[];
  asks: { price: number; volume: number }[];
} {
  return generateMMEightBidsAndAsks(refPrice, 8, 499);
}

export interface MMOrderTier {
  price: number;
  volume: number;
  isCritical: boolean;
}

export interface MMOrderPlan {
  level: number;
  levelName: string;
  bids: MMOrderTier[];
  asks: MMOrderTier[];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function calcCeilVolume(notionalValue: number, price: number): number {
  if (price <= 0) return 0;
  return Math.max(1, Math.ceil(notionalValue / price));
}

/**
 * 依據玩家已持股數（已發行股數）門檻，計算造市商 Lv.1 ~ Lv.7 階梯掛單配置（MMlevelrule）
 */
export function generateMMLevelOrders(openingPrice: number, playerShares: number): MMOrderPlan {
  let level = 1;
  let levelName = 'Lv.1【初萌冷啟動】';

  if (playerShares <= 10000) {
    level = 1;
    levelName = 'Lv.1【初萌冷啟動】';
  } else if (playerShares <= 30000) {
    level = 2;
    levelName = 'Lv.2【微光交錯】';
  } else if (playerShares <= 50000) {
    level = 3;
    levelName = 'Lv.3【社群突破】';
  } else if (playerShares <= 100000) {
    level = 4;
    levelName = 'Lv.4【籌碼展開】';
  } else if (playerShares <= 200000) {
    level = 5;
    levelName = 'Lv.5【主力成型】';
  } else if (playerShares <= 300000) {
    level = 6;
    levelName = 'Lv.6【野性博弈】';
  } else {
    level = 7;
    levelName = 'Lv.7【終極成熟與清算保底】';
  }

  const bidsMap = new Map<number, { volume: number; isCritical: boolean }>();
  const asksMap = new Map<number, { volume: number; isCritical: boolean }>();

  if (level <= 3) {
    // ── 依 Tick 檔位鋪設（Lv.1 ~ Lv.3）──
    const bTicks: { [tier: number]: number } = {};
    let pBid = openingPrice;
    for (let i = 1; i <= 14; i++) {
      const tick = getTickSize(pBid - 0.0001);
      pBid = alignToTick(pBid - tick);
      if (pBid <= 0) break;
      bTicks[i] = pBid;
    }

    const aTicks: { [tier: number]: number } = {};
    let pAsk = openingPrice;
    for (let i = 1; i <= 14; i++) {
      const tick = getTickSize(pAsk);
      pAsk = alignToTick(pAsk + tick);
      aTicks[i] = pAsk;
    }

    if (level === 1) {
      // Lv.1: 關鍵 1~8 檔 (1,800 $TEE)，取消非關鍵檔
      for (let t = 1; t <= 8; t++) {
        if (bTicks[t]) bidsMap.set(bTicks[t], { volume: calcCeilVolume(1800, bTicks[t]), isCritical: true });
        if (aTicks[t]) asksMap.set(aTicks[t], { volume: calcCeilVolume(1800, aTicks[t]), isCritical: true });
      }
    } else if (level === 2) {
      // Lv.2: 關鍵奇數檔 1, 3, 5, 7, 9, 11 (15,000 $TEE)；非關鍵偶數檔 2, 4, 6, 8, 10 (2,500 ~ 5,000 $TEE)
      const critTicks = [1, 3, 5, 7, 9, 11];
      const nonCritTicks = [2, 4, 6, 8, 10];
      for (const t of critTicks) {
        if (bTicks[t]) bidsMap.set(bTicks[t], { volume: calcCeilVolume(15000, bTicks[t]), isCritical: true });
        if (aTicks[t]) asksMap.set(aTicks[t], { volume: calcCeilVolume(15000, aTicks[t]), isCritical: true });
      }
      for (const t of nonCritTicks) {
        if (bTicks[t]) bidsMap.set(bTicks[t], { volume: calcCeilVolume(getRandomInt(2500, 5000), bTicks[t]), isCritical: false });
        if (aTicks[t]) asksMap.set(aTicks[t], { volume: calcCeilVolume(getRandomInt(2500, 5000), aTicks[t]), isCritical: false });
      }
    } else {
      // Lv.3: 關鍵偶數檔 2, 4, 6, 8, 10 (13,000 $TEE)；非關鍵奇數檔 1, 3, 5, 7, 9 (2,500 ~ 5,000 $TEE，包含第 1 檔)
      const critTicks = [2, 4, 6, 8, 10];
      const nonCritTicks = [1, 3, 5, 7, 9];
      for (const t of critTicks) {
        if (bTicks[t]) bidsMap.set(bTicks[t], { volume: calcCeilVolume(13000, bTicks[t]), isCritical: true });
        if (aTicks[t]) asksMap.set(aTicks[t], { volume: calcCeilVolume(13000, aTicks[t]), isCritical: true });
      }
      for (const t of nonCritTicks) {
        if (bTicks[t]) bidsMap.set(bTicks[t], { volume: calcCeilVolume(getRandomInt(2500, 5000), bTicks[t]), isCritical: false });
        if (aTicks[t]) asksMap.set(aTicks[t], { volume: calcCeilVolume(getRandomInt(2500, 5000), aTicks[t]), isCritical: false });
      }
    }
  } else {
    // ── 依百分比階梯鋪設（Lv.4 ~ Lv.7）──
    let critPcts: number[] = [];
    let nonCritPcts: number[] = [];
    let critVal = 5000;
    let nonCritMin = 3500;
    let nonCritMax = 7000;

    if (level === 4) {
      // Lv.4: 關鍵 1%, 3%, 5%, 8%, 10%, 13%, 15%, 18%, 20% (5,000 $TEE)
      // 非關鍵: 其餘 1% 點位 (3,500 ~ 7,000 $TEE)
      critPcts = [0.01, 0.03, 0.05, 0.08, 0.10, 0.13, 0.15, 0.18, 0.20];
      nonCritPcts = [0.02, 0.04, 0.06, 0.07, 0.09, 0.11, 0.12, 0.14, 0.16, 0.17, 0.19];
      critVal = 5000;
      nonCritMin = 3500;
      nonCritMax = 7000;
    } else if (level === 5) {
      // Lv.5: 關鍵 1%, 5%, 10%, 15%, 20% (7,000 $TEE)
      // 非關鍵: 其餘 1% 點位 (5,000 ~ 7,000 $TEE)
      critPcts = [0.01, 0.05, 0.10, 0.15, 0.20];
      nonCritPcts = [0.02, 0.03, 0.04, 0.06, 0.07, 0.08, 0.09, 0.11, 0.12, 0.13, 0.14, 0.16, 0.17, 0.18, 0.19];
      critVal = 7000;
      nonCritMin = 5000;
      nonCritMax = 7000;
    } else if (level === 6) {
      // Lv.6: 關鍵 5%, 10%, 15%, 20% (5,000 $TEE，1%~4% 核心留白)
      // 非關鍵: 6% ~ 19% 其餘點位 (5,000 ~ 7,000 $TEE)
      critPcts = [0.05, 0.10, 0.15, 0.20];
      nonCritPcts = [0.06, 0.07, 0.08, 0.09, 0.11, 0.12, 0.13, 0.14, 0.16, 0.17, 0.18, 0.19];
      critVal = 5000;
      nonCritMin = 5000;
      nonCritMax = 7000;
    } else {
      // Lv.7: 關鍵 20% 漲跌停板 (10,000 $TEE)
      // 非關鍵: 10%, 15% 外圍防波堤 (6,000 ~ 8,000 $TEE)
      critPcts = [0.20];
      nonCritPcts = [0.10, 0.15];
      critVal = 10000;
      nonCritMin = 6000;
      nonCritMax = 8000;
    }

    // 先鋪設關鍵單
    for (const pct of critPcts) {
      const bPrice = alignToTick(Math.max(0.01, openingPrice * (1 - pct)));
      const aPrice = alignToTick(openingPrice * (1 + pct));
      if (bPrice > 0) bidsMap.set(bPrice, { volume: calcCeilVolume(critVal, bPrice), isCritical: true });
      if (aPrice > 0) asksMap.set(aPrice, { volume: calcCeilVolume(critVal, aPrice), isCritical: true });
    }

    // 再鋪設非關鍵單（不覆蓋關鍵單）
    for (const pct of nonCritPcts) {
      const bPrice = alignToTick(Math.max(0.01, openingPrice * (1 - pct)));
      const aPrice = alignToTick(openingPrice * (1 + pct));
      if (bPrice > 0 && !bidsMap.has(bPrice)) {
        bidsMap.set(bPrice, { volume: calcCeilVolume(getRandomInt(nonCritMin, nonCritMax), bPrice), isCritical: false });
      }
      if (aPrice > 0 && !asksMap.has(aPrice)) {
        asksMap.set(aPrice, { volume: calcCeilVolume(getRandomInt(nonCritMin, nonCritMax), aPrice), isCritical: false });
      }
    }
  }

  // 買單依價格降序排列（最高買價在前）
  const bids: MMOrderTier[] = Array.from(bidsMap.entries())
    .map(([price, info]) => ({ price, volume: info.volume, isCritical: info.isCritical }))
    .sort((a, b) => b.price - a.price);

  // 賣單依價格升序排列（最低賣價在前）
  const asks: MMOrderTier[] = Array.from(asksMap.entries())
    .map(([price, info]) => ({ price, volume: info.volume, isCritical: info.isCritical }))
    .sort((a, b) => a.price - b.price);

  return {
    level,
    levelName,
    bids,
    asks
  };
}

