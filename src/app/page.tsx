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
  const router = useRouter();
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

  const getXByTime = (timeStr: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    let h = parseInt(parts[0], 10) || 19;
    const m = parseInt(parts[1], 10) || 0;
    const s = parseInt(parts[2], 10) || 0;
    if (h === 24) h = 0;
    let secondsSince19 = 0;
    if (h >= 19) {
      secondsSince19 = (h - 19) * 3600 + m * 60 + s;
    } else {
      secondsSince19 = (h + 5) * 3600 + m * 60 + s;
    }
    secondsSince19 = Math.max(0, Math.min(18000, secondsSince19));
    return (secondsSince19 / 18000) * width;
  };

  const scale = yesterdayPrice > 0 ? (25 / (yesterdayPrice * 0.20)) : 1.0;

  const coords = historyPoints.map((pt) => {
    if (pt === null || pt.close === null || !pt.time) return null;
    
    // 排除非交易時間的補貼點 (僅允許 19:00 ~ 24:00，包含 00:00 收盤點)
    const parts = pt.time.split(':');
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const isTradeTime = (h >= 19 && h <= 23) || (h === 0 && m === 0);
    if (!isTradeTime) return null;

    const x = getXByTime(pt.time);
    const y = baselineY - (pt.close - yesterdayPrice) * scale;
    return { x, y, close: pt.close };
  }).filter((c): c is { x: number; y: number; close: number } => c !== null);

  // 紅色與綠色漸層的多邊形頂點 (基準線限幅，防止跨越基準線相互污染)
  const redPoints = coords.length > 0
    ? `${coords[0].x.toFixed(1)},${baselineY.toFixed(1)} ` +
      coords.map(c => `${c.x.toFixed(1)},${Math.min(baselineY, c.y).toFixed(1)}`).join(" ") +
      ` ${coords[coords.length - 1].x.toFixed(1)},${baselineY.toFixed(1)}`
    : "";

  const greenPoints = coords.length > 0
    ? `${coords[0].x.toFixed(1)},${baselineY.toFixed(1)} ` +
      coords.map(c => `${c.x.toFixed(1)},${Math.max(baselineY, c.y).toFixed(1)}`).join(" ") +
      ` ${coords[coords.length - 1].x.toFixed(1)},${baselineY.toFixed(1)}`
    : "";

  const linePathD = coords.map((c, i) => 
    `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)} ${c.y.toFixed(1)}`
  ).join(' ');

  const normalTextClass = isTodayUp ? 'text-red-500' : isTodayDown ? 'text-green-500' : 'text-gray-400';
  const textClass = (isLimitUp || isLimitDown) ? 'text-white' : normalTextClass;
  const normalBg = 'bg-[#0f172a]/30 hover:bg-[#0f172a]/50';
  const normalBorder = isTodayUp ? 'border-red-500/30' : isTodayDown ? 'border-green-500/30' : 'border-slate-800';
  const limitBorder = isLimitUp ? 'border-red-600' : isLimitDown ? 'border-green-600' : normalBorder;

  if (viewMode === 'compact') {
    return (
      <tr
        onClick={() => router.push(`/market/${pair.id}`)}
        className={`hover:bg-[#121b26]/60 transition-all duration-150 font-mono select-none cursor-pointer h-11 border-b border-slate-800/50 last:border-b-0 ${flashClass}`}
      >
        {/* 商品 */}
        <td className="pl-4 border-r border-slate-800/80 py-1">
          <div className="flex items-center gap-2">
            {renderMiniKBar(openVal, closeVal, highVal, lowVal)}
            <div>
              <span className="font-black text-xs uppercase tracking-wider text-white">{stockId}</span>
              <span className="text-[9px] block text-gray-500">{pair.name}</span>
            </div>
          </div>
        </td>
        
        {/* 成交 (漲跌停時變色為矩形) */}
        <td className={`w-24 text-center border-r border-slate-800/80 py-1 ${isLimitUp ? 'bg-red-600 text-white' : isLimitDown ? 'bg-green-600 text-white' : ''}`}>
          <span className={`text-xs font-bold ${textClass}`}>{pair.price.toFixed(2)}</span>
        </td>

        {/* 漲跌 */}
        <td className="w-20 text-center border-r border-slate-800/80 py-1">
          <span className={`text-xs font-bold ${normalTextClass}`}>
            {diff > 0 ? '+' : ''}{diff.toFixed(2)}
          </span>
        </td>

        {/* 幅度 */}
        <td className="w-20 text-center border-r border-slate-800/80 py-1">
          <span className={`text-xs font-bold ${normalTextClass}`}>
            {diff > 0 ? '+' : ''}{changePercent.toFixed(2)}%
          </span>
        </td>

        {/* 成交量 */}
        <td className="w-20 text-center py-1">
          <span className="text-xs font-bold text-[#FFD700]">
            {pair.todayVolume.toLocaleString()}
          </span>
        </td>
      </tr>
    );
  }

  if (viewMode === 'grid') {
    const bottomBg = isLimitUp ? 'bg-red-900' : isLimitDown ? 'bg-green-900' : '';
    const topBg = isLimitUp ? 'bg-red-600' : isLimitDown ? 'bg-green-600' : '';
    const headerCodeClass = isLimitUp || isLimitDown ? 'text-white' : 'text-gray-500';
    return (
      <Link
        href={`/market/${pair.id}`}
        className={`rounded-lg border flex flex-col justify-between h-28 transition-all duration-150 ${limitBorder} ${normalBg} ${flashClass} font-mono overflow-hidden`}
      >
        {/* Top row: Name on left, 4-letter code on right */}
        <div className={`flex justify-between items-center w-full px-3 py-2.5 ${topBg}`}>
          <span className="font-bold text-sm text-white truncate max-w-[70%]">{pair.name}</span>
          <span className={`text-[10px] ${headerCodeClass} font-bold uppercase tracking-wider`}>{stockId}</span>
        </div>

        {/* Bottom section: Price, K-bar and Changes */}
        <div className={`flex flex-col justify-between flex-1 p-3 pt-1.5 pb-2.5 ${bottomBg}`}>
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
        </div>
      </Link>
    );
  }

  const bottomBg = isLimitUp ? 'bg-red-900' : isLimitDown ? 'bg-green-900' : '';
  const topBg = isLimitUp ? 'bg-red-600' : isLimitDown ? 'bg-green-600' : 'bg-slate-950/20';
  const headerCodeClass = isLimitUp || isLimitDown ? 'text-white' : 'text-gray-500';

  return (
    <Link
      href={`/market/${pair.id}`}
      className={`flex rounded-lg border h-28 transition-all duration-150 ${limitBorder} ${normalBg} ${flashClass} font-mono overflow-hidden shadow-sm`}
    >
      {/* Left Part (30% width): Vertical Flex Box containing Header and Details */}
      <div className="w-[30%] flex flex-col items-stretch h-full border-r border-slate-900">
        {/* Top row (Header): Name on left, Code on right */}
        <div className={`flex justify-between items-center w-full px-3 py-2.5 border-b border-slate-900 ${topBg}`}>
          <span className="font-bold text-xs text-white truncate max-w-[65%]">{pair.name}</span>
          <span className={`text-[9px] ${headerCodeClass} font-bold uppercase tracking-wider`}>{stockId}</span>
        </div>

        {/* Bottom section (Body): Price and Changes */}
        <div className={`flex flex-col justify-between flex-1 p-3 pt-1.5 pb-2.5 ${bottomBg}`}>
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
      </div>

      {/* Right Column: Chart part (70% width) - 永遠為 bg-black 且拉高至與左半邊相同 */}
      <div className="w-[70%] bg-black p-2 flex flex-col justify-between select-none relative h-full">
        <div className="relative w-full h-[80px]">
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id={`area-gradient-red-${pair.id.toLowerCase()}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0"/>
              </linearGradient>
              <linearGradient id={`area-gradient-green-${pair.id.toLowerCase()}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.0"/>
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.3"/>
              </linearGradient>
              <clipPath id={`clip-above-${pair.id.toLowerCase()}`}>
                <rect x="0" y="0" width={width} height={baselineY} />
              </clipPath>
              <clipPath id={`clip-below-${pair.id.toLowerCase()}`}>
                <rect x="0" y={baselineY} width={width} height={height - baselineY} />
              </clipPath>
            </defs>

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
            
            {/* Horizontal Baseline (灰色實線) */}
            <line
              x1={0}
              y1={baselineY}
              x2={width}
              y2={baselineY}
              stroke="#474D57"
              strokeWidth="0.6"
              opacity="0.8"
            />

            {coords.length > 0 && (
              <>
                {/* 紅色漸層區 (限幅 + Clip Path 雙重防跨線污染) */}
                <polygon
                  points={redPoints}
                  fill={`url(#area-gradient-red-${pair.id.toLowerCase()})`}
                  clipPath={`url(#clip-above-${pair.id.toLowerCase()})`}
                />
                {/* 綠色漸層區 (限幅 + Clip Path 雙重防跨線污染) */}
                <polygon
                  points={greenPoints}
                  fill={`url(#area-gradient-green-${pair.id.toLowerCase()})`}
                  clipPath={`url(#clip-below-${pair.id.toLowerCase()})`}
                />

                {/* 雙色折線：藉由 Clip Path 於基準線完美割離，無遞延或混色 */}
                <path
                  d={linePathD}
                  stroke="#ef4444"
                  strokeWidth="0.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  clipPath={`url(#clip-above-${pair.id.toLowerCase()})`}
                />
                <path
                  d={linePathD}
                  stroke="#22c55e"
                  strokeWidth="0.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  clipPath={`url(#clip-below-${pair.id.toLowerCase()})`}
                />
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('teeteestock-lobby-view-mode');
    if (saved === 'compact' || saved === 'grid' || saved === 'sparkline') {
      setViewMode(saved);
    }
  }, []);

  const currentViewMode = mounted ? viewMode : 'compact';

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
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all duration-150 ${currentViewMode === 'compact' ? 'bg-gray-900 text-white border border-gray-800 shadow' : 'text-gray-500 hover:text-gray-300'}`}
              >
                📊 緊湊列表
              </button>
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all duration-150 ${currentViewMode === 'grid' ? 'bg-gray-900 text-white border border-gray-800 shadow' : 'text-gray-500 hover:text-gray-300'}`}
              >
                ⏹️ 大字方塊
              </button>
              <button
                onClick={() => handleViewModeChange('sparkline')}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all duration-150 ${currentViewMode === 'sparkline' ? 'bg-gray-900 text-white border border-gray-800 shadow' : 'text-gray-500 hover:text-gray-300'}`}
              >
                📈 分時走勢
              </button>
            </div>

            {currentViewMode === 'compact' && (
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#0a111a] shadow-xl">
                <table className="w-full border-collapse text-left text-sm text-gray-400">
                  <thead className="bg-[#121b26] text-gray-400 text-xs font-bold border-b border-slate-800 select-none">
                    <tr>
                      <th className="py-2.5 pl-4 border-r border-slate-800/80 font-bold">商品</th>
                      <th className="w-24 py-2.5 text-center border-r border-slate-800/80 font-bold">成交</th>
                      <th className="w-20 py-2.5 text-center border-r border-slate-800/80 font-bold">漲跌</th>
                      <th className="w-20 py-2.5 text-center border-r border-slate-800/80 font-bold">幅度</th>
                      <th className="w-20 py-2.5 text-center font-bold">成交量</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {sortedMarketData.map((pair) => (
                      <TickerItem key={pair.id} pair={pair} viewMode="compact" />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {currentViewMode === 'grid' && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {sortedMarketData.map((pair) => (
                  <TickerItem key={pair.id} pair={pair} viewMode="grid" />
                ))}
              </div>
            )}

            {currentViewMode === 'sparkline' && (
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
                          <tr 
                            key={h.pairId} 
                            onClick={() => router.push(`/market/${pair.id}`)}
                            className="hover:bg-gray-900/40 transition-colors cursor-pointer select-none"
                          >
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