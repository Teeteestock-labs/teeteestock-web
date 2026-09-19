"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTee } from "@/context/TeeContext";
import { useAuth } from "@/context/AuthContext";
import SettlementTimer from "@/components/SettlementTimer";
import TickerTape from "@/components/TickerTape";
import BottomNav from "@/components/BottomNav";
import GlobalStats from "@/components/GlobalStats";
import AssetHistoryChart from "@/components/AssetHistoryChart";
import DividendNotificationModal from "@/components/DividendNotificationModal";
import LoginRewardModal from "@/components/LoginRewardModal";
import Footer from "@/components/Footer";
import { alignToTick } from "@/utils/validatePrice";
import { teeteePair, UserHolding } from "@/app/types";

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
    const isTradeTime = (h >= 19 && h <= 23) || (h === 0 && m <= 4);
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
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  clipPath={`url(#clip-above-${pair.id.toLowerCase()})`}
                />
                <path
                  d={linePathD}
                  stroke="#22c55e"
                  strokeWidth="0.5"
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

// ── Asset Donut Chart Component ──
const SLICE_COLORS = [
  '#FF69B4', // Hot Pink
  '#FFD700', // Gold
  '#00BFFF', // Sky Blue
  '#A855F7', // Purple
  '#FF7F50', // Coral / Orange
  '#3B82F6', // Royal Blue
  '#EC4899', // Rose Pink
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
];

interface DonutSlice {
  pairId: string;
  stockId: string;
  name: string;
  shares: number;
  color: string;
  percentage: number;
}

function AssetDonutChart({ 
  holdings, 
  marketData, 
  totalROI 
}: { 
  holdings: UserHolding[]; 
  marketData: teeteePair[]; 
  totalROI: number; 
}) {
  const [hoveredSlice, setHoveredSlice] = useState<DonutSlice | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeHoldings = holdings.filter(h => h.shares > 0);
  const totalShares = activeHoldings.reduce((sum, h) => sum + h.shares, 0);

  const slices: DonutSlice[] = activeHoldings.map((h, idx) => {
    const pair = marketData.find(p => p.id.toLowerCase() === h.pairId.toLowerCase());
    const stockId = PAIR_ID_MAP[h.pairId.toLowerCase()] || h.pairId.toUpperCase();
    const pct = totalShares > 0 ? (h.shares / totalShares) * 100 : 0;
    return {
      pairId: h.pairId,
      stockId,
      name: pair?.name || h.pairId,
      shares: h.shares,
      color: SLICE_COLORS[idx % SLICE_COLORS.length],
      percentage: pct,
    };
  });

  const radius = 38;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;
  const roiColor = totalROI > 0 ? "text-[#FF3B3B]" : totalROI < 0 ? "text-[#00FFA3]" : "text-gray-400";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredSlice(null);
    setMousePos(null);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center justify-center select-none"
    >
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {totalShares === 0 || slices.length === 0 ? (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#2B2F36"
              strokeWidth={strokeWidth}
            />
          ) : (
            slices.map((slice) => {
              const strokeDasharray = `${(slice.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((cumulativePercent / 100) * circumference);
              cumulativePercent += slice.percentage;

              const isHovered = hoveredSlice?.pairId === slice.pairId;

              return (
                <circle
                  key={slice.pairId}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-150 cursor-pointer origin-center opacity-90 hover:opacity-100"
                  onMouseEnter={() => setHoveredSlice(slice)}
                />
              );
            })
          )}
        </svg>

        {/* 圓餅圖中間：總報酬率 (換行後實際報酬率) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-1">
          <span className="text-[9px] text-gray-400 font-bold leading-tight">總報酬率：</span>
          <span className={`text-[11px] font-black leading-tight mt-0.5 ${roiColor}`}>
            {totalROI > 0 ? '+' : ''}{totalROI.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* 滑鼠移動到顯示並動態跟隨滑鼠標籤 " 股數（百分比）" */}
      {hoveredSlice && mousePos && (
        <div 
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y - 12}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="absolute bg-[#0B0E11]/95 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg border border-[#FF69B4]/50 shadow-2xl whitespace-nowrap z-50 pointer-events-none flex items-center gap-1.5 backdrop-blur-md transition-all duration-75 ease-out"
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredSlice.color }} />
          <span>{hoveredSlice.stockId}：</span>
          <span className="font-mono text-[#FFD700]">{hoveredSlice.shares.toLocaleString()} 股</span>
          <span className="font-mono text-gray-400">({hoveredSlice.percentage.toFixed(1)}%)</span>
        </div>
      )}
    </div>
  );
}

// ── 股息紀錄折疊卡片組件 (Dividend History Section Component) ──
function DividendHistorySection({ 
  settlementLogs, 
  holdings, 
  marketData, 
  router 
}: { 
  settlementLogs: any[]; 
  holdings: UserHolding[]; 
  marketData: teeteePair[]; 
  router: any; 
}) {
  // 按配息日期 (YYYY/MM/DD) 分組 SettlementLog
  const dateGroups = useMemo(() => {
    const groups: { [dateStr: string]: { date: Date; logs: any[] } } = {};
    (settlementLogs || []).forEach(log => {
      const d = new Date(log.createdAt);
      const dateStr = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
      if (!groups[dateStr]) {
        groups[dateStr] = { date: d, logs: [] };
      }
      groups[dateStr].logs.push(log);
    });
    return Object.entries(groups)
      .sort((a, b) => b[1].date.getTime() - a[1].date.getTime());
  }, [settlementLogs]);

  // 預設配息日期折疊狀態 (預設第一期最新日期展開，其餘折疊)
  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>({});

  const toggleDate = (dateStr: string) => {
    setCollapsedDates(prev => ({
      ...prev,
      [dateStr]: !prev[dateStr]
    }));
  };

  // 篩選玩家真正有參與配息的歷史日期群組 (過濾掉參與檔數為 0 的日期)
  const validDateGroups = useMemo(() => {
    return dateGroups.filter(([_, group]) => {
      return group.logs.some(log => {
        const shares = typeof log.userSharesAtSettle === 'number' ? log.userSharesAtSettle : 0;
        return shares > 0;
      });
    });
  }, [dateGroups]);

  // 計算玩家歷史總受領股息金額 (僅使用 UserDividendLog 精確記錄)
  const totalEarnedOverall = useMemo(() => {
    let total = 0;
    validDateGroups.forEach(([_, group]) => {
      group.logs.forEach(log => {
        const shares = typeof log.userSharesAtSettle === 'number' ? log.userSharesAtSettle : 0;
        const payout = typeof log.userPayout === 'number' ? log.userPayout : shares * (log.dividendPerShare || 0);
        if (shares > 0) {
          total += payout;
        }
      });
    });
    return total;
  }, [validDateGroups]);

  return (
    <div className="bg-[#181a20]/40 rounded-xl border border-[#2b2f36] overflow-hidden shadow-xl">
      {/* 1. 統一風格標題列：配息相關資訊 */}
      <div className="p-3 bg-gray-950 border-b border-[#2b2f36] flex justify-between items-center select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF69B4] animate-pulse shadow-[0_0_8px_#FF69B4]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">配息相關資訊</h3>
        </div>
        <div className="flex items-center gap-3 font-mono">
          <span className="text-xs font-bold text-white">
            累計領取 +{totalEarnedOverall.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $TEE
          </span>
          <span className="text-[10px] text-gray-400 border-l border-gray-800 pl-3">
            共 {validDateGroups.length} 期配息
          </span>
        </div>
      </div>

      {/* 2. 依配息日期折疊區域 (Collapsible Groups by Date) */}
      {validDateGroups.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-xs font-bold font-mono">
          目前尚無歷史配息紀錄
        </div>
      ) : (
        <div className="divide-y divide-[#21262C] max-h-[320px] overflow-y-auto custom-scrollbar">
          {validDateGroups.map(([dateStr, group], index) => {
            const isCollapsed = collapsedDates[dateStr] ?? true;

            let dateTotalEarned = 0;
            // 僅使用 UserDividendLog 精確記錄的持股與配息金額 (不隨目前持股變動)
            const items = group.logs
              .map(log => {
                const pair = marketData.find(p => p.id.toLowerCase() === log.pairId.toLowerCase());
                
                const shares = typeof log.userSharesAtSettle === 'number' ? log.userSharesAtSettle : 0;
                const payout = typeof log.userPayout === 'number' ? log.userPayout : shares * (log.dividendPerShare || 0);

                if (shares > 0) {
                  dateTotalEarned += payout;
                }

                return {
                  log,
                  pair,
                  shares,
                  payout,
                  stockId: PAIR_ID_MAP[log.pairId.toLowerCase()] || log.pairId.toUpperCase(),
                  name: pair?.name || log.pairId
                };
              })
              .filter(item => item.shares > 0);

            const participatingCount = items.length;
            if (participatingCount === 0) return null;

            return (
              <div key={dateStr} className="bg-gray-950/30">
                {/* 配息日期折疊標題列 */}
                <button
                  onClick={() => toggleDate(dateStr)}
                  className="w-full px-4 py-2.5 bg-[#131722]/80 hover:bg-gray-900/80 transition-colors border-b border-[#2b2f36]/40 flex justify-between items-center text-left select-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-gray-200">{dateStr}</span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      ({participatingCount} 檔配息)
                    </span>
                  </div>

                  <div className="flex items-center gap-4 font-mono">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block">本期配息金額</span>
                      <span className="text-xs font-bold text-white">
                        +{dateTotalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $TEE
                      </span>
                    </div>
                    <span className="text-gray-400 text-xs transition-transform duration-200">
                      {isCollapsed ? '▼' : '▲'}
                    </span>
                  </div>
                </button>

                {/* 折疊內容：個股領息明細表 (縮小列高與緊密化) */}
                {!isCollapsed && (
                  <div className="overflow-x-auto custom-scrollbar bg-black/20">
                    {items.length === 0 ? (
                      <div className="py-4 text-center text-gray-500 text-[11px] font-mono">
                        基準日無持有配息商品
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse font-mono">
                        <thead>
                          <tr className="bg-gray-950/80 text-gray-500 text-[10px] font-bold border-b border-[#2b2f36] uppercase tracking-wider select-none whitespace-nowrap leading-tight">
                            <th className="px-4 py-1.5 border-r border-[#2b2f36]/60">商品</th>
                            <th className="px-4 py-1.5 text-right border-r border-[#2b2f36]/60">每股配息</th>
                            <th className="px-4 py-1.5 text-right border-r border-[#2b2f36]/60">基準日持有股數</th>
                            <th className="px-4 py-1.5 text-right">本期配息金額</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#21262C]/60 text-xs">
                          {items.map(item => (
                            <tr
                              key={item.log.id}
                              className="hover:bg-gray-900/30 transition-colors"
                            >
                              {/* 1. 商品 (僅顯示股號) */}
                              <td className="px-4 py-1.5 border-r border-[#2b2f36]/60">
                                <div className="font-bold text-xs text-gray-200 uppercase tracking-wider">{item.stockId}</div>
                              </td>

                              {/* 2. 每股配息 (不使用亮色) */}
                              <td className="px-4 py-1.5 text-right border-r border-[#2b2f36]/60 text-gray-300">
                                {item.log.dividendPerShare.toFixed(2)} $TEE
                              </td>

                              {/* 3. 基準日持有股數 (不使用亮色) */}
                              <td className="px-4 py-1.5 text-right border-r border-[#2b2f36]/60 text-gray-300">
                                {item.shares.toLocaleString(undefined, { maximumFractionDigits: 0 })} 股
                              </td>

                              {/* 4. 本期配息金額 (亮白色) */}
                              <td className="px-4 py-1.5 text-right font-bold text-white">
                                +{item.payout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $TEE
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>('list');
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [isAdjustedCost, setIsAdjustedCost] = useState(false);
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
    availableBalance,
    holdings,
    marketData,
    orders,
    cancelOrder,
    isCancelling,
    marketStatus,
    simulateMarketMove,
    executeWeeklySettlement,
    settlementLogs
  } = useTee();
  const { user } = useAuth();

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
    const pair = marketData.find(p => p.id.toLowerCase() === h.pairId.toLowerCase());
    return sum + (h.shares * (pair?.price || 0));
  }, 0);

  const totalCost = holdings.reduce((sum, h) => sum + (h.shares * h.avgCost), 0);
  const totalProfit = totalStockValue - totalCost;
  const totalROI = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  const netWorth = balance + totalStockValue;

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex flex-col justify-center items-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
          <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase animate-pulse">
            正在載入資訊...
          </span>
        </div>
      </main>
    );
  }

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
            {!user && (
              <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3 flex items-center justify-between gap-2 text-xs text-slate-300 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">💡 訪客試玩模式</span>
                  <span className="text-slate-400 hidden sm:inline">登入或註冊專屬交易帳號即可永久保存投資部位與歷史紀錄！</span>
                </div>
                <Link
                  href="/login"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs shrink-0 transition-colors"
                >
                  登入 / 註冊
                </Link>
              </div>
            )}
            <div className="bg-[#181a20]/40 p-4 rounded-xl border border-[#2b2f36] flex justify-between items-center bg-gray-950/20">
              <div className="flex flex-col justify-center space-y-3">
                <div>
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">總資產估值</p>
                  <p className="text-lg font-black text-white mt-0.5">{netWorth.toLocaleString()} $TEE</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">可用資產</p>
                  <p className="text-base font-bold text-[#00FFA3] mt-0.5">{availableBalance.toLocaleString()} $TEE</p>
                  {balance > availableBalance && (
                    <p className="text-[9px] text-[#848E9C] font-mono mt-0.5">(委託買單保留: {(balance - availableBalance).toLocaleString()})</p>
                  )}
                </div>
              </div>

              {/* 右側：中空甜甜圈圖 (總報酬率在中間，Hover 顯示股數與百分比) */}
              <AssetDonutChart holdings={holdings} marketData={marketData} totalROI={totalROI} />
            </div>

            <div className="bg-[#181a20]/40 rounded-xl border border-[#2b2f36] overflow-hidden">
              <div className="p-3 bg-gray-950 border-b border-[#2b2f36] flex justify-between items-center select-none">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00FFA3] animate-pulse shadow-[0_0_8px_#00FFA3]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">當前持有部位</h3>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <button
                    onClick={() => setIsAdjustedCost(prev => !prev)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all duration-150 border flex items-center gap-1.5 select-none cursor-pointer ${
                      isAdjustedCost
                        ? 'bg-[#FF69B4]/10 text-[#FF69B4] border-[#FF69B4]/40 hover:bg-[#FF69B4]/20 shadow-[0_0_8px_rgba(255,105,180,0.2)]'
                        : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white hover:bg-gray-800'
                    }`}
                    title="加回歷史除息金額（還原成本計算）"
                  >
                    <span
                      className={`w-3 h-3 rounded-[2px] border flex items-center justify-center shrink-0 transition-colors ${
                        isAdjustedCost
                          ? 'border-[#FF69B4] bg-[#FF69B4] text-gray-950'
                          : 'border-gray-500 bg-transparent'
                      }`}
                    >
                      {isAdjustedCost && (
                        <svg className="w-2.5 h-2.5 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    <span>還原成本</span>
                  </button>
                  <span className="text-[10px] font-mono text-gray-400">
                    共 {holdings.length} 檔
                  </span>
                </div>
              </div>
              {holdings.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs font-bold">目前無持股</div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse font-mono">
                    <thead>
                      <tr className="bg-gray-950 text-gray-500 text-[10px] font-bold border-b border-[#2b2f36] uppercase tracking-wider select-none whitespace-nowrap leading-tight">
                        <th className="px-3 py-2 border-r border-[#2b2f36]/60 align-bottom">商品</th>
                        <th className="px-3 py-2 text-right border-r border-[#2b2f36]/60">
                          <div>市價</div>
                          <div>{isAdjustedCost ? '還原均價' : '均價'}</div>
                        </th>
                        <th className="px-3 py-2 text-right border-r border-[#2b2f36]/60">
                          <div>現值</div>
                          <div>{isAdjustedCost ? '還原成本' : '成本'}</div>
                        </th>
                        <th className="px-3 py-2 text-right border-r border-[#2b2f36]/60">
                          <div>總股數</div>
                          <div>可用股數</div>
                        </th>
                        <th className="px-3 py-2 text-right">
                          <div>未實現損益</div>
                          <div>報酬率</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#21262C]">
                      {holdings.map((h) => {
                        const pair = marketData.find(p => p.id.toLowerCase() === h.pairId.toLowerCase());
                        if (!pair) return null;
                        const pendingSellVolume = (orders || [])
                          .filter(o => (o.isUser || !o.botId) && o.pairId.toLowerCase() === h.pairId.toLowerCase() && (o.type === 'sell' || (o as any).side === 'SELL'))
                          .reduce((sum, o) => sum + o.amount, 0);
                        const availableShares = Math.max(0, h.shares - pendingSellVolume);

                        // 計算該商品玩家「實際有領取配息」的累計每股配息 (僅計入有 UserDividendLog 記錄的結算期)
                        const pairLogs = (settlementLogs || []).filter((l: any) => {
                          if (l.pairId.toLowerCase() !== h.pairId.toLowerCase()) return false;
                          // 只有 userSharesAtSettle > 0 才代表該期有實際領到配息
                          return typeof l.userSharesAtSettle === 'number' && l.userSharesAtSettle > 0;
                        });
                        const cumulativeDividendPerShare = pairLogs.reduce((sum: number, l: any) => sum + (l.dividendPerShare || 0), 0);

                        // 計算有效均價（若啟動還原成本，僅扣除玩家實際有參與的配息）
                        const effectiveAvgCost = isAdjustedCost 
                          ? Math.max(0, h.avgCost - cumulativeDividendPerShare)
                          : h.avgCost;

                        const value = h.shares * pair.price;
                        const cost = h.shares * effectiveAvgCost;
                        const profit = (pair.price - effectiveAvgCost) * h.shares;
                        const roi = effectiveAvgCost > 0 ? ((pair.price - effectiveAvgCost) / effectiveAvgCost) * 100 : 0;
                        const profitColor = profit > 0 ? "text-[#FF3B3B]" : profit < 0 ? "text-[#00FFA3]" : "text-gray-400";
                        const stockId = PAIR_ID_MAP[pair.id.toLowerCase()] || pair.id.toUpperCase();
                        return (
                          <tr 
                            key={h.pairId} 
                            onClick={() => router.push(`/market/${pair.id}`)}
                            className="hover:bg-gray-900/40 transition-colors cursor-pointer select-none"
                          >
                            {/* 1. 商品名稱 */}
                            <td className="px-3 py-3 border-r border-[#2b2f36]/60">
                              <div className="font-bold text-xs text-white uppercase tracking-wider">{stockId}</div>
                              <div className="text-[9px] text-gray-500 truncate max-w-[80px]">{pair.name}</div>
                            </td>

                            {/* 2. 目前市價 / 成交均價 */}
                            <td className="px-3 py-3 text-right border-r border-[#2b2f36]/60">
                              <div className="text-xs font-bold text-white">{pair.price.toFixed(2)}</div>
                              <div className={`text-[10px] ${isAdjustedCost ? 'text-[#FF69B4] font-bold' : 'text-gray-400'}`}>
                                {effectiveAvgCost.toFixed(2)}
                              </div>
                            </td>

                            {/* 3. 現值 / 買入成本 */}
                            <td className="px-3 py-3 text-right border-r border-[#2b2f36]/60">
                              <div className="text-xs font-bold text-white">{value.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                              <div className={`text-[10px] ${isAdjustedCost ? 'text-[#FF69B4] font-bold' : 'text-gray-400'}`}>
                                {cost.toLocaleString(undefined, {maximumFractionDigits: 0})}
                              </div>
                            </td>

                            {/* 4. 總股數 / 可用股數 (總股數 - 目前委託賣單股數) */}
                            <td className="px-3 py-3 text-right border-r border-[#2b2f36]/60">
                              <div className="text-xs font-bold text-white">{h.shares.toLocaleString()} 股</div>
                              <div className="text-[10px] text-gray-400 font-mono">
                                {availableShares.toLocaleString()} 股
                              </div>
                            </td>

                            {/* 5. 未實現損益 / 報酬率 */}
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

            {/* 目前委託狀態 (Active Pending Orders) */}
            {(() => {
              const myPendingOrders = (orders || []).filter(o => o.isUser || !o.botId);
              return (
                <div className="bg-[#181a20]/40 rounded-xl border border-[#2b2f36] overflow-hidden">
                  <div className="p-3 bg-gray-950 border-b border-[#2b2f36] flex justify-between items-center select-none">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FFD700] animate-pulse shadow-[0_0_8px_#FFD700]" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">當前委託狀態</h3>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">
                      共 {myPendingOrders.length} 筆
                    </span>
                  </div>

                  {myPendingOrders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-xs font-bold font-mono">
                      目前無未成交委託單
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse font-mono">
                        <thead>
                          <tr className="bg-gray-950 text-gray-500 text-[10px] font-bold border-b border-[#2b2f36] uppercase tracking-wider select-none">
                            <th className="px-3 py-2 border-r border-[#2b2f36]/60">商品 / 股號</th>
                            <th className="px-3 py-2 border-r border-[#2b2f36]/60">類型</th>
                            <th className="px-3 py-2 text-right border-r border-[#2b2f36]/60">委託價格</th>
                            <th className="px-3 py-2 text-right border-r border-[#2b2f36]/60">委託數量</th>
                            <th className="px-3 py-2 text-center">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#21262C]">
                          {myPendingOrders.map((o) => {
                            const stockId = PAIR_ID_MAP[o.pairId.toLowerCase()] || o.pairId.toUpperCase();
                            const pair = marketData.find(p => p.id.toLowerCase() === o.pairId.toLowerCase());
                            const isBuy = o.type === 'buy' || (o as any).side === 'BUY';
                            return (
                              <tr 
                                key={o.id}
                                className="hover:bg-gray-900/40 transition-colors text-xs font-bold"
                              >
                                <td 
                                  onClick={() => router.push(`/market/${o.pairId}`)}
                                  className="px-3 py-2.5 cursor-pointer"
                                >
                                  <div className="font-bold text-xs text-white uppercase tracking-wider">{stockId}</div>
                                  <div className="text-[9px] text-gray-500 truncate max-w-[90px]">{pair?.name || o.pairId}</div>
                                </td>
                                <td className={`px-3 py-2.5 font-bold ${isBuy ? 'text-[#FF3B3B]' : 'text-[#00FFA3]'}`}>
                                  {isBuy ? '買進' : '賣出'}
                                </td>
                                <td className="px-3 py-2.5 text-right text-white font-mono font-bold">
                                  {o.price.toFixed(2)}
                                </td>
                                <td className="px-3 py-2.5 text-right text-white font-mono">
                                  {o.amount.toLocaleString()} 股
                                </td>
                                <td className="px-3 py-2.5 text-center">
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      const res = await cancelOrder(o.id);
                                      if (!res.success) {
                                        alert(res.message || "撤單失敗");
                                      }
                                    }}
                                    disabled={isCancelling}
                                    className={`px-2.5 py-1 rounded transition-colors text-[10px] font-bold ${
                                      isCancelling
                                        ? 'bg-[#2B3139] text-[#474D57] cursor-not-allowed'
                                        : 'bg-[#2B3139] hover:bg-[#FF3B3B]/20 text-gray-300 hover:text-[#FF3B3B] border border-gray-700/50'
                                    }`}
                                  >
                                    {isCancelling ? '撤銷中' : '撤單'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 已領股息總額資訊卡 (Collapsible Dividend Section by Date) */}
            <DividendHistorySection
              settlementLogs={settlementLogs}
              holdings={holdings}
              marketData={marketData}
              router={router}
            />

            {/* 最下方總資產歷史變化分時圖 (1M, 3M, 6M, 1Y, MAX) */}
            <AssetHistoryChart
              holdings={holdings}
              marketData={marketData}
              balance={balance}
              netWorth={netWorth}
            />
          </div>
        )}
      </div>

      <Footer />
      <DividendNotificationModal />
      <LoginRewardModal />
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