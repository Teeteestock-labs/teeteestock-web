"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTee } from "@/context/TeeContext";
import SettlementTimer from "@/components/SettlementTimer";
import TickerTape from "@/components/TickerTape";
import BottomNav from "@/components/BottomNav";
import GlobalStats from "@/components/GlobalStats";
import { alignToTick } from "@/utils/validatePrice";
import { teeteePair } from "@/app/types";

const PAIR_ID_MAP: Record<string, string> = {
  'micomet': 'MCMT',
  'okakoro': 'OKKR',
  'pekomarin': 'PKMR',
  'noefure': 'NEFL',
  'soraz': 'SRAZ',
  'fubumio': 'FBMO',
  'shishiwata': 'SSWT',
  'subaruna': 'SBRN',
  'aziro': 'AZIR'
};

type Mode = 'list' | 'asset';
type ViewMode = 'compact' | 'grid' | 'sparkline';

// ── Ticker Item Component ──
interface TickerItemProps {
  pair: teeteePair;
  viewMode: ViewMode;
}

// 輔助函數：繪製今日 K 棒
const renderMiniKBar = (open: number, close: number, high: number, low: number) => {
  const isUp = close > open;
  const isDown = close < open;
  const color = isUp ? '#ef4444' : isDown ? '#22c55e' : '#ffffff'; // 紅漲綠跌平盤白

  const max = Math.max(high, open, close);
  const min = Math.min(low, open, close);
  const range = max - min || 1.0;

  // 畫布高度為 26px，上下留 2px padding
  const padding = 2;
  const h = 26;
  const chartH = h - padding * 2;
  const getY = (val: number) => {
    return padding + (chartH - ((val - min) / range) * chartH);
  };

  const yHigh = getY(high);
  const yLow = getY(low);
  const yOpen = getY(open);
  const yClose = getY(close);

  const rectY = Math.min(yOpen, yClose);
  const rectHeight = Math.max(Math.abs(yOpen - yClose), 1.5);

  return (
    <svg width="8" height="26" className="overflow-visible select-none inline-block">
      {/* 影線 */}
      <line
        x1="4"
        y1={yHigh}
        x2="4"
        y2={yLow}
        stroke={color}
        strokeWidth="1.2"
      />
      {/* 實體棒 */}
      <rect
        x="1.5"
        y={rectY}
        width="5"
        height={rectHeight}
        fill={color}
        stroke={color}
        strokeWidth="0.5"
      />
    </svg>
  );
};

function TickerItem({ pair, viewMode }: TickerItemProps) {
  const [flashClass, setFlashClass] = useState("");
  const prevPriceRef = useRef(pair.price);

  useEffect(() => {
    if (pair.price > prevPriceRef.current) {
      setFlashClass("animate-flash-red");
      const timer = setTimeout(() => setFlashClass(""), 500);
      return () => clearTimeout(timer);
    } else if (pair.price < prevPriceRef.current) {
      setFlashClass("animate-flash-green");
      const timer = setTimeout(() => setFlashClass(""), 500);
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = pair.price;
  }, [pair.price]);

  const yesterdayPrice = pair.openingPrice ?? pair.price;
  const diff = pair.price - yesterdayPrice;
  const changePercent = yesterdayPrice > 0 ? (diff / yesterdayPrice) * 100 : 0;

  const isTodayUp = diff > 0;
  const isTodayDown = diff < 0;

  // Ceiling and Floor limits (+/-20%)
  const ceiling = alignToTick(yesterdayPrice * 1.20);
  const floor = alignToTick(yesterdayPrice * 0.80);
  const isLimitUp = pair.price >= ceiling;
  const isLimitDown = pair.price <= floor;

  const stockId = PAIR_ID_MAP[pair.id.toLowerCase()] || pair.id.toUpperCase();

  // Calculate today's Open, Close, High, Low for K-bar
  const historyPoints = pair.history || [];
  const validKBarPoints = historyPoints.filter(pt => pt !== null);
  
  // 找出今日第一個有實際成交量 (volume > 0) 的點，作為開盤基準價
  const firstTradeIdx = validKBarPoints.findIndex(pt => pt.volume > 0);
  const todayPoints = firstTradeIdx >= 0 ? validKBarPoints.slice(firstTradeIdx) : [];
  
  const openVal = todayPoints.length > 0 ? todayPoints[0].open : yesterdayPrice;
  const closeVal = pair.price;
  const highs = todayPoints.map(pt => pt.high);
  const lows = todayPoints.map(pt => pt.low);
  const highVal = highs.length > 0 ? Math.max(...highs, openVal, closeVal) : Math.max(openVal, closeVal);
  const lowVal = lows.length > 0 ? Math.min(...lows, openVal, closeVal) : Math.min(openVal, closeVal);

  // Dynamic order book ratio
  const { getOrderBook } = useTee();
  const { bids, asks } = getOrderBook(pair.id);
  const totalBidVol = bids.reduce((sum, b) => sum + b.amount, 0);
  const totalAskVol = asks.reduce((sum, a) => sum + a.amount, 0);
  const totalVol = totalBidVol + totalAskVol;
  const ratio = totalVol > 0 ? (totalBidVol / totalVol) * 100 : 50;

  // Sparkline chart coordinate calculations
  const width = 160;
  const height = 55;
  const baselineY = 27.5;

  const validHistoryPoints = historyPoints.filter(pt => pt !== null && pt.close !== null);
  const scale = 22 / (Math.max(...validHistoryPoints.map(pt => Math.abs(pt.close - yesterdayPrice)), 1.0));

  const coords = historyPoints.map((pt, idx) => {
    if (pt === null || pt.close === null) return null;
    const x = (idx / (historyPoints.length - 1 || 1)) * width;
    const y = baselineY - (pt.close - yesterdayPrice) * scale;
    return { x, y, close: pt.close };
  }).filter((c): c is { x: number; y: number; close: number } => c !== null);

  let areaPoints = "";
  if (coords.length > 0) {
    const firstX = coords[0].x.toFixed(1);
    const lastX = coords[coords.length - 1].x.toFixed(1);
    areaPoints = `${firstX},${baselineY} ` + coords.map(c => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ") + ` ${lastX},${baselineY}`;
  }

  const pathAreaFill = isLimitUp || isLimitDown ? "rgba(255, 255, 255, 0.15)" : isTodayUp ? "rgba(239, 68, 68, 0.08)" : isTodayDown ? "rgba(34, 197, 94, 0.08)" : "rgba(255, 255, 255, 0.05)";

  if (viewMode === 'compact') {
    const textClass = isLimitUp ? 'text-white' : isTodayUp ? 'text-red-500' : isTodayDown ? 'text-green-500' : 'text-gray-400';
    const bgClass = isLimitUp ? 'bg-red-600' : isLimitDown ? 'bg-green-600' : 'bg-[#0f172a]/30 hover:bg-[#0f172a]/50';
    const borderClass = isLimitUp ? 'border-red-600' : isLimitDown ? 'border-green-600' : isTodayUp ? 'border-red-500/30' : isTodayDown ? 'border-green-500/30' : 'border-slate-800';
    const labelColor = isLimitUp || isLimitDown ? 'text-white/70' : 'text-gray-500';

    return (
      <Link
        href={`/market/${pair.id}`}
        className={`flex items-center justify-between px-4 py-2 border rounded-lg ${borderClass} ${bgClass} ${flashClass} transition-all duration-150 font-mono select-none`}
      >
        <div className="flex-1 flex items-center gap-2">
          {renderMiniKBar(openVal, closeVal, highVal, lowVal)}
          <div>
            <span className="font-black text-xs uppercase tracking-wider text-white">{stockId}</span>
            <span className={`text-[9px] block ${labelColor}`}>{pair.name}</span>
          </div>
        </div>
        <div className="w-24 text-right pr-2">
          <span className={`text-xs font-bold ${textClass}`}>{pair.price.toFixed(2)}</span>
          <div className="w-16 h-1 bg-gray-800 rounded-full overflow-hidden ml-auto mt-1 flex">
            <div className="bg-red-500 h-full" style={{ width: `${ratio}%` }} />
            <div className="bg-green-500 h-full" style={{ width: `${100 - ratio}%` }} />
          </div>
        </div>
        <div className="w-20 text-right pr-2">
          <span className={`text-xs font-bold ${textClass}`}>
            {diff > 0 ? '+' : ''}{diff.toFixed(2)}
          </span>
        </div>
        <div className="w-20 text-right">
          <span className={`text-xs font-bold ${textClass}`}>
            {diff > 0 ? '+' : ''}{changePercent.toFixed(2)}%
          </span>
        </div>
      </Link>
    );
  }

  if (viewMode === 'grid') {
    const textClass = isLimitUp ? 'text-white' : isTodayUp ? 'text-red-500' : isTodayDown ? 'text-green-500' : 'text-gray-400';
    const bgClass = isLimitUp ? 'bg-red-600' : isLimitDown ? 'bg-green-600' : 'bg-[#0f172a]/30 hover:bg-[#0f172a]/50';
    const borderClass = isLimitUp ? 'border-red-600' : isLimitDown ? 'border-green-600' : isTodayUp ? 'border-red-500/30' : isTodayDown ? 'border-green-500/30' : 'border-slate-800';

    return (
      <Link
        href={`/market/${pair.id}`}
        className={`p-3 rounded-lg border flex flex-col justify-between h-28 transition-all duration-150 ${borderClass} ${bgClass} ${flashClass} font-mono`}
      >
        {/* Top row: Name on left, 4-letter code on right */}
        <div className="flex justify-between items-center w-full">
          <span className="font-bold text-sm text-white truncate max-w-[70%]">{pair.name}</span>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{stockId}</span>
        </div>

        {/* Middle row: Large Price and Today's K-bar next to it */}
        <div className="flex justify-between items-center w-full my-0.5">
          <span className={`text-2xl font-black tracking-tight ${textClass}`}>
            {pair.price.toFixed(2)}
          </span>
          <div className="scale-125 transform-gpu origin-right pr-1">
            {renderMiniKBar(openVal, closeVal, highVal, lowVal)}
          </div>
        </div>

        {/* Bottom row: Up/Down arrow, absolute change, percentage change */}
        <div className={`flex items-center gap-1.5 text-xs font-bold ${textClass}`}>
          <span>{diff > 0 ? '▲' : diff < 0 ? '▼' : ''}</span>
          <span>{diff !== 0 ? Math.abs(diff).toFixed(2) : '0.00'}</span>
          <span>{Math.abs(changePercent).toFixed(2)}%</span>
        </div>
      </Link>
    );
  }

  // viewMode === 'sparkline'
  const textClass = isLimitUp ? 'text-white' : isTodayUp ? 'text-red-500' : isTodayDown ? 'text-green-500' : 'text-gray-400';
  const bgClass = isLimitUp ? 'bg-red-600' : isLimitDown ? 'bg-green-600' : 'bg-[#0f172a]/30 hover:bg-[#0f172a]/50';
  const borderClass = isLimitUp ? 'border-red-600' : isLimitDown ? 'border-green-600' : isTodayUp ? 'border-red-500/30' : isTodayDown ? 'border-green-500/30' : 'border-slate-800';

  return (
    <Link
      href={`/market/${pair.id}`}
      className={`flex rounded-lg border h-28 transition-all duration-150 ${borderClass} ${bgClass} ${flashClass} font-mono overflow-hidden shadow-sm`}
    >
      {/* Left Column: Info part (30% width) */}
      <div className="w-[30%] flex flex-col justify-between p-3 border-r border-slate-800 bg-slate-950/20">
        {/* Top row: Name on left, 4-letter code on right */}
        <div className="flex justify-between items-center w-full">
          <span className="font-bold text-sm text-white truncate max-w-[70%]">{pair.name}</span>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{stockId}</span>
        </div>

        {/* Middle row: Large Price and Today's K-bar next to it */}
        <div className="flex justify-between items-center w-full my-0.5">
          <span className={`text-xl font-black tracking-tight ${textClass}`}>
            {pair.price.toFixed(2)}
          </span>
          <div className="scale-110 transform-gpu origin-right pr-1">
            {renderMiniKBar(openVal, closeVal, highVal, lowVal)}
          </div>
        </div>

        {/* Bottom row: Up/Down arrow, absolute change, percentage change */}
        <div className={`flex items-center gap-1.5 text-xs font-bold ${textClass}`}>
          <span>{diff > 0 ? '▲' : diff < 0 ? '▼' : ''}</span>
          <span>{diff !== 0 ? Math.abs(diff).toFixed(2) : '0.00'}</span>
          <span>{Math.abs(changePercent).toFixed(2)}%</span>
        </div>
      </div>

      {/* Right Column: Sparkline graph (70% width) */}
      <div className="w-[70%] bg-black p-2 flex flex-col justify-between select-none relative">
        <div className="relative w-full h-[65px]">
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            {/* Grid lines */}
            {[1, 2, 3, 4].map((idx) => {
              const gridX = (idx / 5) * width;
              return (
                <line
                  key={idx}
                  x1={gridX}
                  y1={0}
                  x2={gridX}
                  y2={height}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="0.5"
                />
              );
            })}
            
            {/* Horizontal Baseline (solid cyan-blue line in the middle) */}
            <line
              x1={0}
              y1={baselineY}
              x2={width}
              y2={baselineY}
              stroke="#00E5FF"
              strokeWidth="0.8"
              opacity="0.6"
            />

            {coords.length > 0 && (
              <>
                <polygon
                  points={areaPoints}
                  fill={pathAreaFill}
                />
                {coords.map((c, idx) => {
                  if (idx === 0) return null;
                  const prev = coords[idx - 1];
                  const price = c.close;
                  
                  const isUp = price > yesterdayPrice;
                  const isDown = price < yesterdayPrice;
                  const stroke = isUp ? "#ef4444" : isDown ? "#22c55e" : "#ffffff";
                  
                  return (
                    <line
                      key={idx}
                      x1={prev.x}
                      y1={prev.y}
                      x2={c.x}
                      y2={c.y}
                      stroke={stroke}
                      strokeWidth="0.5"
                      strokeLinecap="round"
                    />
                  );
                })}
              </>
            )}
          </svg>
        </div>
        <div className="flex justify-between px-1 text-[9px] font-mono select-none leading-none pt-1 border-t border-slate-800/40 text-gray-500">
          <span>19:00</span>
          <span>20:00</span>
          <span>21:00</span>
          <span>22:00</span>
          <span>23:00</span>
          <span>24:00</span>
        </div>
      </div>
    </Link>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>('list');
  const [viewMode, setViewMode] = useState<ViewMode>('compact');

  const {
    balance,
    holdings,
    marketData,
    marketStatus,
    simulateMarketMove,
    executeWeeklySettlement
  } = useTee();

  const sortedMarketData = [...marketData].sort((a, b) => a.id.localeCompare(b.id));

  useEffect(() => {
    const saved = localStorage.getItem('teeteestock-lobby-view-mode');
    if (saved === 'compact' || saved === 'grid' || saved === 'sparkline') {
      setViewMode(saved);
    }
  }, []);

  useEffect(() => {
    const queryMode = searchParams.get('mode');
    if (queryMode === 'list' || queryMode === 'asset') {
      setMode(queryMode);
    } else {
      setMode('list');
    }
  }, [searchParams]);

  const handleViewModeChange = (newViewMode: ViewMode) => {
    setViewMode(newViewMode);
    localStorage.setItem('teeteestock-lobby-view-mode', newViewMode);
  };

  const totalStockValue = holdings.reduce((sum, h) => {
    const pair = marketData.find(p => p.id === h.pairId);
    return sum + (h.shares * (pair?.price || 0));
  }, 0);

  const netWorth = balance + totalStockValue;

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col pb-20 font-mono">
      <TickerTape />

      <GlobalStats />

      {marketStatus !== 'OPEN' && marketStatus !== 'PRE_MARKET' && (
        <div className="bg-red-600 text-white text-center py-2 text-sm font-bold animate-pulse font-mono">
          {marketStatus === 'MAINTENANCE'
            ? '⚠️ 系統維護中，目前全面禁止任何交易與掛單操作 ⚠️'
            : '⚠️ 交易所休市中 (開盤時間為週二至週日 19:00 - 24:00，18:45 開放限價掛單) ⚠️'}
        </div>
      )}
      {marketStatus === 'PRE_MARKET' && (
        <div className="bg-[#F0B90B] text-slate-950 text-center py-2 text-sm font-bold animate-pulse font-mono">
          📢 盤前試撮掛單期 (18:45 ~ 19:00) 📢
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {mode === 'list' && (
          <div className="p-3 space-y-4">
            {/* Controls & Simulator */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-gray-900/30 p-3 rounded-xl border border-gray-900">
              <div className="flex items-center gap-2">
                <SettlementTimer />
              </div>
            </div>

            {/* 三模切換器 (Interface Selector) */}
            <div className="bg-gray-950 p-1 rounded-xl border border-gray-900 flex select-none">
              <button
                onClick={() => handleViewModeChange('compact')}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all duration-150 ${viewMode === 'compact' ? 'bg-gray-900 text-white border border-gray-800 shadow' : 'text-gray-500 hover:text-gray-300'}`}
              >
                📊 緊湊列表
              </button>
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all duration-150 ${viewMode === 'grid' ? 'bg-gray-900 text-white border border-gray-800 shadow' : 'text-gray-500 hover:text-gray-300'}`}
              >
                ⏹️ 大字方塊
              </button>
              <button
                onClick={() => handleViewModeChange('sparkline')}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all duration-150 ${viewMode === 'sparkline' ? 'bg-gray-900 text-white border border-gray-800 shadow' : 'text-gray-500 hover:text-gray-300'}`}
              >
                📈 分時走勢
              </button>
            </div>

            {/* Render selected view mode */}
            {viewMode === 'compact' && (
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#0a111a] shadow-xl">
                {/* Table Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#121b26] text-gray-400 text-xs font-bold border-b border-slate-800 select-none">
                  <div className="flex-1 pl-3">商品</div>
                  <div className="w-24 text-right pr-2">成交</div>
                  <div className="w-20 text-right pr-2">漲跌</div>
                  <div className="w-20 text-right">幅度</div>
                </div>
                <div className="p-1.5 space-y-1">
                  {sortedMarketData.map((pair) => (
                    <TickerItem key={pair.id} pair={pair} viewMode="compact" />
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {sortedMarketData.map((pair) => (
                  <TickerItem key={pair.id} pair={pair} viewMode="grid" />
                ))}
              </div>
            )}

            {viewMode === 'sparkline' && (
              <div className="space-y-1">
                {sortedMarketData.map((pair) => (
                  <TickerItem key={pair.id} pair={pair} viewMode="sparkline" />
                ))}
              </div>
            )}
          </div>
        )}

        {mode === 'asset' && (
          <div className="p-4 space-y-4">
            <div className="bg-[#181a20]/40 p-4 rounded-xl border border-[#2b2f36] flex justify-between items-center bg-gray-950/20">
              <div>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">總資產估值</p>
                <p className="text-xl font-black text-white mt-1">{netWorth.toLocaleString()} $TEE</p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">可用餘額</p>
                <p className="text-xl font-black text-green-500 mt-1">{balance.toLocaleString()} $TEE</p>
              </div>
            </div>

            <div className="bg-[#181a20]/40 rounded-xl border border-[#2b2f36] overflow-hidden">
              <div className="p-3 bg-gray-950 border-b border-[#2b2f36] flex justify-between items-center">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">持有部位</h3>
              </div>
              {holdings.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs font-bold">目前無持股</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-950 text-gray-500 text-[10px] font-bold border-b border-[#2b2f36] uppercase tracking-wider select-none">
                        <th className="px-3 py-2">商品</th>
                        <th className="px-3 py-2 text-right">股數 / 均價</th>
                        <th className="px-3 py-2 text-right">現價 / 市值</th>
                        <th className="px-3 py-2 text-right">未實現損益 / ROI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#21262C]">
                      {holdings.map((h) => {
                        const pair = marketData.find(p => p.id === h.pairId);
                        if (!pair) return null;
                        const value = h.shares * pair.price;
                        const profit = (pair.price - h.avgCost) * h.shares;
                        const roi = h.avgCost > 0 ? ((pair.price - h.avgCost) / h.avgCost) * 100 : 0;
                        const profitColor = profit > 0 ? "text-red-500" : profit < 0 ? "text-green-500" : "text-gray-400";
                        const stockId = PAIR_ID_MAP[pair.id.toLowerCase()] || pair.id.toUpperCase();
                        return (
                          <tr key={h.pairId} className="hover:bg-gray-900/40 transition-colors">
                            <td className="px-3 py-3">
                              <div className="font-bold text-xs text-white uppercase tracking-wider">{stockId}</div>
                              <div className="text-[9px] text-gray-500 truncate max-w-[80px]">{pair.name}</div>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <div className="text-xs font-bold text-white">{h.shares.toLocaleString()}</div>
                              <div className="text-[10px] text-gray-500">{h.avgCost.toFixed(1)}</div>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <div className="text-xs font-bold text-white">{pair.price.toLocaleString()}</div>
                              <div className="text-[10px] text-gray-500">{value.toLocaleString()}</div>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <div className={`text-xs font-bold ${profitColor}`}>
                                {profit > 0 ? '+' : ''}{profit.toLocaleString(undefined, {maximumFractionDigits: 0})}
                              </div>
                              <div className={`text-[10px] ${profitColor}`}>
                                {profit > 0 ? '+' : ''}{roi.toFixed(2)}%
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center font-mono">
        <div className="w-8 h-8 rounded-full border-4 border-t-pink-500 border-r-transparent border-b-transparent border-l-transparent animate-spin mb-4" />
        <p className="text-xs text-gray-500">載入交易大廳中...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}