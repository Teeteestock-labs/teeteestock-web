"use client";

import React, { useState, useMemo, useRef } from "react";
import { teeteePair, UserHolding } from "@/app/types";

export type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'MAX';

interface AssetHistoryChartProps {
  holdings: UserHolding[];
  marketData: teeteePair[];
  balance: number;
  netWorth: number;
}

interface DataPoint {
  dateStr: string;
  timestamp: number;
  value: number;
}

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

export default function AssetHistoryChart({
  holdings,
  marketData,
  balance,
  netWorth,
}: AssetHistoryChartProps) {
  const [range, setRange] = useState<TimeRange>('1M');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 計算選定區間的歷史總資產軌跡數據點 (無歷史紀錄時填0)
  const dataPoints: DataPoint[] = useMemo(() => {
    const now = new Date();
    let days = 30;
    if (range === '3M') days = 90;
    if (range === '6M') days = 180;
    if (range === '1Y') days = 365;
    if (range === 'MAX') days = 500;

    const points: DataPoint[] = [];

    for (let i = days; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      // 無歷史紀錄之過去日期填 0，當前最新點 (i === 0) 帶入真實總資產淨值
      const val = i === 0 ? netWorth : 0;
      points.push({
        dateStr,
        timestamp: d.getTime(),
        value: val,
      });
    }

    return points;
  }, [range, netWorth]);

  // 若該區間內包含無歷史資料點 (value === 0)，折線與視覺元素以灰色系 (#6B7280) 呈現
  const hasMissingData = dataPoints.some(p => p.value === 0);
  const strokeColor = hasMissingData ? "#6B7280" : "#38BDF8"; // 灰色 / 淺藍色
  const gradientId = `asset-gradient-${range}`;

  // SVG 繪製參數 (橫軸 paddingX 設為 0，讓折線完全延伸拉至同寬)
  const svgWidth = 600;
  const svgHeight = 160;
  const paddingX = 0;
  const paddingY = 15;

  const values = dataPoints.map(p => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values) * 1.02;
  const rangeVal = maxVal - minVal || 1;

  const pointsWithCoords = useMemo(() => {
    return dataPoints.map((pt, idx) => {
      const x = (idx / Math.max(1, dataPoints.length - 1)) * svgWidth;
      const y = svgHeight - paddingY - ((pt.value - minVal) / rangeVal) * (svgHeight - paddingY * 2);
      return { ...pt, x, y };
    });
  }, [dataPoints, minVal, rangeVal]);

  // 繪製 SVG 折線與漸層面積
  const linePathD = useMemo(() => {
    if (pointsWithCoords.length === 0) return "";
    return pointsWithCoords.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, "");
  }, [pointsWithCoords]);

  const areaPathD = useMemo(() => {
    if (pointsWithCoords.length === 0) return "";
    const firstX = pointsWithCoords[0].x;
    const lastX = pointsWithCoords[pointsWithCoords.length - 1].x;
    const bottomY = svgHeight;
    return `${linePathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [linePathD, pointsWithCoords]);

  // 游標移動處理 (更新上方數字)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || pointsWithCoords.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relativeX = (mouseX / rect.width) * svgWidth;

    let closestIdx = 0;
    let minDiff = Infinity;
    pointsWithCoords.forEach((pt, idx) => {
      const diff = Math.abs(pt.x - relativeX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoverIdx(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoverIdx(null);
  };

  const activePoint = hoverIdx !== null ? pointsWithCoords[hoverIdx] : null;

  return (
    <div className="bg-[#181a20]/40 rounded-xl border border-[#2b2f36] pt-4 font-mono select-none overflow-hidden space-y-3">
      {/* 頂部標題與時段切換按鈕 (1M, 3M, 6M, 1Y, MAX) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#2b2f36]/60 px-4 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${hasMissingData ? 'bg-gray-500' : 'bg-[#38BDF8] animate-pulse shadow-[0_0_8px_#38BDF8]'}`} />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              總資產歷史走勢 (Net Worth Trend)
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-black text-white font-mono">
              {(activePoint ? activePoint.value : netWorth).toLocaleString()} $TEE
            </span>
            {activePoint && (
              <span className="text-[10px] text-gray-400 font-mono ml-1">
                [{activePoint.dateStr}]
              </span>
            )}
          </div>
        </div>

        {/* 時段切換按鈕區 */}
        <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-lg border border-[#2b2f36]">
          {(['1M', '3M', '6M', '1Y', 'MAX'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 text-[11px] font-extrabold rounded transition-all duration-150 ${
                range === r
                  ? 'bg-gradient-to-r from-[#38BDF8] to-[#0284C7] text-white shadow-md shadow-sky-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-[#1e2329]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 分時圖畫布 (全寬滿版拉至極致同寬) */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-44 cursor-crosshair overflow-hidden"
      >
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none" className="w-full h-full block">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 橫向參考虛線 */}
          {[0.25, 0.5, 0.75].map((ratio, i) => {
            const lineY = paddingY + ratio * (svgHeight - paddingY * 2);
            return (
              <line
                key={i}
                x1={0}
                y1={lineY}
                x2={svgWidth}
                y2={lineY}
                stroke="#2B2F36"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* 漸層面積 */}
          <path d={areaPathD} fill={`url(#${gradientId})`} />

          {/* 折線 (無歷史數據時為灰色 strokeColor) */}
          <path
            d={linePathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover 準心軸與亮點 */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={0}
                x2={activePoint.x}
                y2={svgHeight}
                stroke={hasMissingData ? "#9CA3AF" : "#7DD3FC"}
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="4.5"
                fill={strokeColor}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>
      </div>

      {/* X 軸日期標示 (滿版對齊) */}
      <div className="flex justify-between px-4 pb-3 pt-1 text-[9px] text-gray-500 font-mono select-none border-t border-[#2b2f36]/40">
        <span>{dataPoints[0]?.dateStr}</span>
        <span>{dataPoints[Math.floor(dataPoints.length / 2)]?.dateStr}</span>
        <span>{dataPoints[dataPoints.length - 1]?.dateStr}</span>
      </div>
    </div>
  );
}
