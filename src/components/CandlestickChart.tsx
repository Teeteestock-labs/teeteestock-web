"use client";

import React from 'react';
import { ChartDataPoint } from '@/app/types';

interface Props {
    data: ChartDataPoint[];
}

export default function CandlestickChart({ data }: Props) {
    if (!data || data.length === 0) return null;

    // 計算圖表範圍
    const prices = data.flatMap(d => [d.high, d.low]);
    const maxPrice = Math.max(...prices) * 1.02;
    const minPrice = Math.min(...prices) * 0.98;
    const range = maxPrice - minPrice;

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
        if (data.length <= 1) return padding + chartWidth / 2;
        return padding + (index * (chartWidth / (data.length - 1)));
    };

    const barWidth = (chartWidth / data.length) * 0.8;

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
                
                {/* 價格標籤 */}
                <text x={width - 5} y={getY(maxPrice)} fill="#848E9C" fontSize="14" fontWeight="bold" textAnchor="end">
                    {Math.round(maxPrice)}
                </text>
                <text x={width - 5} y={getY(minPrice)} fill="#848E9C" fontSize="14" fontWeight="bold" textAnchor="end">
                    {Math.round(minPrice)}
                </text>

                {/* K線繪製 */}
                {data.map((d, i) => {
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
                                fill={isUp ? color : 'transparent'} 
                                stroke={color}
                                strokeWidth="3"
                            />
                        </g>
                    );
                })}
            </svg>
            
            {/* 時間標籤 (簡易版) */}
            <div className="absolute bottom-1 left-8 right-8 flex justify-between pointer-events-none">
                <span className="text-[8px] text-[#474D57] font-mono bg-[#0B0E11]/80 px-1">{data[0].time}</span>
                <span className="text-[8px] text-[#474D57] font-mono bg-[#0B0E11]/80 px-1">{data[data.length-1].time}</span>
            </div>

            {/* 即時十字線輔助線 (CSS 實現) */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute top-0 bottom-0 border-l border-[#FF69B4]/30" style={{ left: '50%' }} />
                <div className="absolute left-0 right-0 border-t border-[#FF69B4]/30" style={{ top: '50%' }} />
            </div>
        </div>
    );
}