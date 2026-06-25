"use client";

import React from 'react';
import { ChartDataPoint } from '@/app/types';

interface Props {
    data: ChartDataPoint[];
    isTimeChart?: boolean;
    yesterdayPrice?: number;
}

export default function CandlestickChart({ data: rawData, isTimeChart, yesterdayPrice }: Props) {
    const data = React.useMemo(() => (rawData || []).filter((d): d is ChartDataPoint => d !== null), [rawData]);
    if (data.length === 0) return null;

    // 計算參考基準價 (優先使用昨收/開盤參考價，否則使用首筆開盤價)
    const refPrice = yesterdayPrice ?? data[0].open;

    // 計算圖表範圍
    const prices = data.flatMap(d => [d.high, d.low, d.close, d.open]);
    let maxPrice = Math.max(...prices);
    let minPrice = Math.min(...prices);
    
    if (isTimeChart) {
        // 對稱設計：使平盤線 (refPrice) 保持在圖表正中央
        const maxDiff = Math.max(Math.abs(maxPrice - refPrice), Math.abs(minPrice - refPrice));
        // 保證至少有 2% 的上下波動範圍，避免價格極度平坦時除以零或圖表過於敏感
        const buffer = Math.max(maxDiff, refPrice * 0.02);
        maxPrice = refPrice + buffer;
        minPrice = refPrice - buffer;
    } else {
        maxPrice = maxPrice * 1.02;
        minPrice = minPrice * 0.98;
    }
    const range = maxPrice - minPrice || 1.0;

    // 畫布維度
    const width = 1000;
    const height = 400;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const getY = (price: number) => {
        return padding + (chartHeight - ((price - minPrice) / range) * chartHeight);
    };

    const getX = (index: number) => {
        if (!isTimeChart) {
            if (data.length <= 1) return padding + chartWidth / 2;
            return padding + (index * (chartWidth / (data.length - 1)));
        }

        // 偵測數據的時段是否符合標準台北時間 18:00 - 24:00 區間
        const firstPt = data[0];
        const firstTimeStr = firstPt?.time || "";
        const firstParts = firstTimeStr.split(':');
        const firstH = parseInt(firstParts[0], 10) || 18;
        
        // 台北時間 18:00 到凌晨 00:59 視為標準直播時段數據
        const isStandardSession = (firstH >= 18 || firstH < 1);

        if (!isStandardSession) {
            // 測試/影子時段：直接將所有數據點平均鋪滿 X 軸，防止全部擠在邊界
            if (data.length <= 1) return padding + chartWidth / 2;
            return padding + (index * (chartWidth / (data.length - 1)));
        }

        const pt = data[index];
        const timeStr = pt.time || "";
        const parts = timeStr.split(':');
        let h = parseInt(parts[0], 10) || 18;
        const m = parseInt(parts[1], 10) || 0;
        
        if (h === 24) h = 0; // 統一午夜為 0 點
        
        let minutesSince18 = 0;
        if (h >= 18) {
            minutesSince18 = (h - 18) * 60 + m;
        } else {
            minutesSince18 = (h + 6) * 60 + m;
        }
        minutesSince18 = Math.max(0, Math.min(360, minutesSince18));
        
        return padding + (minutesSince18 / 360) * chartWidth;
    };

    const barWidth = isTimeChart
        ? Math.max(2.5, (chartWidth / 360) * 0.8)
        : (chartWidth / data.length) * 0.8;

    return (
        <div className="w-full h-full p-1 bg-[#0B0E11] rounded border border-[#2B2F36] relative overflow-hidden group">
            {/* 背景網格 */}
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="absolute inset-0">
                {[0, 0.25, 0.5, 0.75, 1].map(p => (
                    <line 
                        key={p}
                        x1={padding} y1={padding + p * chartHeight}
                        x2={width - padding} y2={padding + p * chartHeight}
                        stroke="#2B2F36" strokeWidth="1" strokeDasharray="4,4"
                    />
                ))}
                
                {/* 平盤線 (yesterdayPrice) */}
                {isTimeChart && (
                    <line 
                        x1={padding} y1={getY(refPrice)}
                        x2={width - padding} y2={getY(refPrice)}
                        stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" strokeDasharray="6,4"
                    />
                )}
                
                {/* 價格標籤 */}
                <text x={width - 5} y={getY(maxPrice)} fill="#848E9C" fontSize="14" fontWeight="bold" textAnchor="end">
                    {Math.round(maxPrice)}
                </text>
                {isTimeChart && (
                    <text x={width - 5} y={getY(refPrice) - 4} fill="#eaecef" fontSize="12" fontWeight="bold" textAnchor="end" opacity="0.6">
                        平盤: {refPrice.toFixed(1)}
                    </text>
                )}
                <text x={width - 5} y={getY(minPrice)} fill="#848E9C" fontSize="14" fontWeight="bold" textAnchor="end">
                    {Math.round(minPrice)}
                </text>

                {/* 折線圖 (isTimeChart === true) 或是 K線圖 (isTimeChart === false) */}
                {isTimeChart ? (
                    // 1. 繪製今日成交折線圖段：高於昨日價為紅 (#FF3B3B)，低於昨日價為綠 (#00FFA3)，平盤為白 (#FFFFFF)
                    data.map((d, i) => {
                        if (i === 0) return null;
                        const prevD = data[i - 1];
                        const x1 = getX(i - 1);
                        const y1 = getY(prevD.close);
                        const x2 = getX(i);
                        const y2 = getY(d.close);
                        
                        const isUp = d.close > refPrice;
                        const isDown = d.close < refPrice;
                        const color = isUp ? '#FF3B3B' : isDown ? '#00FFA3' : '#FFFFFF';
                        
                        return (
                            <line 
                                key={i}
                                x1={x1} y1={y1} 
                                x2={x2} y2={y2} 
                                stroke={color} strokeWidth="3" 
                                strokeLinecap="round"
                            />
                        );
                    })
                ) : (
                    // 2. 繪製傳統 K線圖
                    data.map((d, i) => {
                        const isUp = d.close >= d.open;
                        const color = isUp ? '#FF3B3B' : '#00FFA3'; // 台灣配色
                        const x = getX(i);
                        const openY = getY(d.open);
                        const closeY = getY(d.close);
                        const highY = getY(d.high);
                        const lowY = getY(d.low);
                        
                        return (
                            <g key={i} className="hover:opacity-80 transition-opacity cursor-crosshair">
                                {/* 上下影線 */}
                                <line 
                                    x1={x} y1={highY} 
                                    x2={x} y2={lowY} 
                                    stroke={color} strokeWidth="3" 
                                />
                                {/* 實體棒 */}
                                <rect 
                                    x={x - barWidth / 2} 
                                    y={Math.min(openY, closeY)} 
                                    width={barWidth} 
                                    height={Math.max(Math.abs(openY - closeY), 1)} 
                                    fill={color} 
                                    stroke={color}
                                    strokeWidth="3"
                                />
                            </g>
                        );
                    })
                )}
            </svg>
            
            {/* 時間標籤 (簡易版) */}
            <div className="absolute bottom-1 left-8 right-8 flex justify-between pointer-events-none">
                <span className="text-[8px] text-[#474D57] font-mono bg-[#0B0E11]/80 px-1">
                    {isTimeChart ? '18:00' : data[0].time}
                </span>
                <span className="text-[8px] text-[#474D57] font-mono bg-[#0B0E11]/80 px-1">
                    {isTimeChart ? '24:00' : data[data.length-1].time}
                </span>
            </div>

            {/* 即時十字線輔助線 (CSS 實現) */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute top-0 bottom-0 border-l border-[#FF69B4]/30" style={{ left: '50%' }} />
                <div className="absolute left-0 right-0 border-t border-[#FF69B4]/30" style={{ top: '50%' }} />
            </div>
        </div>
    );
}