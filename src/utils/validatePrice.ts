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
 * 依據當前股價級距計算造市商五檔買單與賣單
 * 下檔五檔買單：依據當時價格級距向下延伸 5 檔
 * 上檔五檔賣單：依據當時價格級距向上延伸 5 檔
 * 每檔掛單數量 = 80000 / 掛價 (Math.ceil 無條件進一位)
 */
export function generateMMFiveBidsAndAsks(refPrice: number): {
  bids: { price: number; volume: number }[];
  asks: { price: number; volume: number }[];
} {
  const bids: { price: number; volume: number }[] = [];
  let pBid = refPrice;
  for (let i = 0; i < 5; i++) {
    const tick = getTickSize(pBid - 0.0001);
    pBid = alignToTick(pBid - tick);
    if (pBid <= 0) break;
    const volume = Math.ceil(80000 / pBid);
    bids.push({ price: pBid, volume });
  }

  const asks: { price: number; volume: number }[] = [];
  let pAsk = refPrice;
  for (let i = 0; i < 5; i++) {
    const tick = getTickSize(pAsk);
    pAsk = alignToTick(pAsk + tick);
    const volume = Math.ceil(80000 / pAsk);
    asks.push({ price: pAsk, volume });
  }

  return { bids, asks };
}

