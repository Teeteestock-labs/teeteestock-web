"use client";

import React from 'react';
import { ChartDataPoint } from '@/app/types';

interface Props {
    data: ChartDataPoint[];
    isTimeChart?: boolean;
    yesterdayPrice?: number;
    pairId?: string;
}

export default function CandlestickChart({ data: rawData, isTimeChart, yesterdayPrice, pairId }: Props) {
    const data = React.useMemo(() => (rawData || []).filter((d): d is ChartDataPoint => d !== null), [rawData]);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const [scrollState, setScrollState] = React.useState({ scrollLeft: 0, clientWidth: 1000 });
    const [hoverCoords, setHoverCoords] = React.useState<{ 
        x: number; 
        y: number; 
        containerWidth: number; 
        containerHeight: number; 
    } | null>(null);

    const [markers, setMarkers] = React.useState<{
        id: string;
        title: string;
        type: string;
        url: string;
        labels: string[];
    }[]>([]);

    // Fetch approved event markers from backend
    React.useEffect(() => {
        if (!pairId) return;
        fetch(`/api/events/marker?pairId=${pairId}`)
            .then(res => res.json())
            .then(resData => {
                if (resData.success && resData.markers) {
                    setMarkers(resData.markers);
                }
            })
            .catch(err => console.error("Error loading event markers:", err));
    }, [pairId]);

    const handleScroll = React.useCallback(() => {
        if (containerRef.current) {
            setScrollState({
                scrollLeft: containerRef.current.scrollLeft,
                clientWidth: containerRef.current.clientWidth
            });
        }
    }, []);

    const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setHoverCoords({ 
                x, 
                y,
                containerWidth: rect.width,
                containerHeight: rect.height
            });
        }
    }, []);

    const handleTouch = React.useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        if (containerRef.current && e.touches.length > 0) {
            // Prevent default page scroll to ensure smooth touch crosshair experience
            if (e.cancelable) e.preventDefault();
            const rect = containerRef.current.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            setHoverCoords({ 
                x, 
                y,
                containerWidth: rect.width,
                containerHeight: rect.height
            });
        }
    }, []);

    const handleMouseLeave = React.useCallback(() => {
        setHoverCoords(null);
    }, []);

    // Layout configuration matching TradingView dimensions
    const paddingLeft = isTimeChart ? 0 : 40;
    const paddingRight = isTimeChart ? 32 : 60;
    const paddingTop = 25;
    const paddingBottom = 35;
    const height = 400;
    
    // Filter pre-market data (18:45 - 19:00) and off-market hours for the time chart
    const tradingData = React.useMemo(() => {
        if (!isTimeChart) return data;
        return data.filter(d => {
            if (!d.time) return false;
            const parts = d.time.split(':');
            const h = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            // 僅允許交易時間：19:00 至 24:00 (含 00:00)
            const isTradeTime = (h >= 19 && h <= 23) || (h === 0 && m === 0);
            return isTradeTime;
        });
    }, [data, isTimeChart]);

    const chartData = React.useMemo(() => {
        return isTimeChart ? tradingData : data;
    }, [isTimeChart, tradingData, data]);

    const isScrollableKLine = !isTimeChart && chartData.length > 80;
    const candleSpacing = 11;
    const computedWidth = isScrollableKLine ? Math.max(1000, chartData.length * candleSpacing + paddingLeft + paddingRight) : 1000;
    const width = isScrollableKLine ? computedWidth : scrollState.clientWidth;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const getXByTime = React.useCallback((timeStr: string) => {
        if (!timeStr) return paddingLeft;
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
        
        return paddingLeft + (secondsSince19 / 18000) * chartWidth;
    }, [chartWidth]);

    const getXByIndex = React.useCallback((index: number) => {
        if (chartData.length <= 1) return paddingLeft + chartWidth / 2;
        return paddingLeft + (index * (chartWidth / (chartData.length - 1)));
    }, [chartData.length, chartWidth]);

    const getX = React.useCallback((index: number, timeStr?: string) => {
        if (!isTimeChart) {
            return getXByIndex(index);
        }
        return getXByTime(timeStr || chartData[index]?.time || "");
    }, [isTimeChart, getXByIndex, getXByTime, chartData]);

    const getClosestPointIndex = React.useCallback((canvasX: number) => {
        if (chartData.length === 0) return -1;
        let closestIdx = 0;
        let minDiff = Infinity;
        for (let i = 0; i < chartData.length; i++) {
            const diff = Math.abs(getX(i, chartData[i].time) - canvasX);
            if (diff < minDiff) {
                minDiff = diff;
                closestIdx = i;
            }
        }
        return closestIdx;
    }, [chartData, getX]);

    React.useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            
            const updateDimensions = () => {
                setScrollState({
                    scrollLeft: container.scrollLeft,
                    clientWidth: container.clientWidth
                });
            };
            
            updateDimensions();
            
            // 使用 ResizeObserver 監聽容器尺寸動態縮放
            const resizeObserver = new ResizeObserver(() => {
                updateDimensions();
            });
            resizeObserver.observe(container);
            
            const handleResize = () => {
                updateDimensions();
            };
            window.addEventListener('resize', handleResize);
            
            return () => {
                container.removeEventListener('scroll', handleScroll);
                window.removeEventListener('resize', handleResize);
                resizeObserver.disconnect();
            };
        }
    }, [chartData.length, handleScroll]);

    React.useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollLeft = containerRef.current.scrollWidth;
            setScrollState({
                scrollLeft: containerRef.current.scrollLeft,
                clientWidth: containerRef.current.clientWidth
            });
        }
    }, [chartData.length]);

    // 計算當前可見的數據點，用於動態 Y 軸縮放
    const visibleData = React.useMemo(() => {
        if (!isScrollableKLine) {
            return chartData;
        }
        const { scrollLeft, clientWidth } = scrollState;
        const startX = Math.max(0, scrollLeft - 15);
        const endX = scrollLeft + clientWidth + 15;
        
        const visible = chartData.filter((_, i) => {
            const x = getX(i, chartData[i].time);
            return x >= startX && x <= endX;
        });
        return visible.length > 0 ? visible : chartData;
    }, [chartData, scrollState, isScrollableKLine, getX]);

    // 尋找當前可見區間內最高與最低影線點的索引值
    const { maxVisibleIdx, minVisibleIdx } = React.useMemo(() => {
        let maxVal = -Infinity;
        let minVal = Infinity;
        let maxIdx = -1;
        let minIdx = -1;

        if (chartData.length === 0) return { maxVisibleIdx: -1, minVisibleIdx: -1 };

        const { scrollLeft, clientWidth } = scrollState;
        const startX = Math.max(0, scrollLeft - 15);
        const endX = scrollLeft + clientWidth + 15;

        for (let i = 0; i < chartData.length; i++) {
            const x = getX(i, chartData[i].time);
            const isVisible = !isScrollableKLine || (x >= startX && x <= endX);
            if (isVisible) {
                const d = chartData[i];
                if (d.high > maxVal) {
                    maxVal = d.high;
                    maxIdx = i;
                }
                if (d.low < minVal) {
                    minVal = d.low;
                    minIdx = i;
                }
            }
        }

        return { maxVisibleIdx: maxIdx, minVisibleIdx: minIdx };
    }, [chartData, scrollState, isScrollableKLine, getX]);

    // Render grid skeleton if there's no trade data but we have yesterdayPrice (pre-market matching phase)
    if (rawData.length === 0 && yesterdayPrice === undefined) return null;

    const refPrice = yesterdayPrice ?? chartData[0]?.open ?? 100;

    let maxPrice = refPrice;
    let minPrice = refPrice;

    if (visibleData.length > 0) {
        const prices = visibleData.flatMap(d => [d.high, d.low, d.close, d.open]);
        maxPrice = Math.max(...prices);
        minPrice = Math.min(...prices);
    }
    
    if (isTimeChart) {
        maxPrice = refPrice * 1.20;
        minPrice = refPrice * 0.80;
    } else {
        const buffer = (maxPrice - minPrice) * 0.06 || maxPrice * 0.02;
        maxPrice = maxPrice + buffer;
        minPrice = Math.max(0, minPrice - buffer);
    }
    const range = maxPrice - minPrice || 1.0;

    const getY = (price: number) => {
        if (isTimeChart) {
            // 在分時圖的上下增加繪圖緩衝區 (頂部留 22px 防 HUD 遮擋，底部留 18px 防標籤重疊)
            const topBuffer = 22;
            const bottomBuffer = 18;
            const drawableHeight = chartHeight - topBuffer - bottomBuffer;
            return paddingTop + topBuffer + (drawableHeight - ((price - minPrice) / range) * drawableHeight);
        }
        return paddingTop + (chartHeight - ((price - minPrice) / range) * chartHeight);
    };

    const yRef = getY(refPrice);

    const barWidth = isTimeChart
        ? Math.max(2.5, (chartWidth / 300) * 0.8)
        : (chartWidth / chartData.length) * 0.7;

    // 色彩規範：若 C >= O，線體與 HUD 漲跌幅欄位一律渲染為老派台股紅 (#FF0000)；若 C < O，則渲染為綠色 (#00FF00)
    const colorUp = '#FF0000';
    const colorDown = '#00FF00';
    
    const lastPt = chartData.length > 0 ? chartData[chartData.length - 1] : null;
    const currentPrice = lastPt ? lastPt.close : refPrice;
    const isCurrentUp = currentPrice >= refPrice;
    // 當為跌（綠色）時，使用對比度更柔和的翡翠綠 (#089981) 代替高亮綠 (#00FF00)，確保白字可讀性
    const currentPriceColor = isCurrentUp ? colorUp : '#089981';

    const maxVolume = Math.max(...visibleData.map(d => d.volume || 0), 1);

    const pathD = isTimeChart
        ? chartData.map((d, i) => `${i === 0 ? 'M' : 'L'}${getX(i, d.time).toFixed(1)} ${getY(d.close).toFixed(1)}`).join(' ')
        : '';

    const areaGradientId = isCurrentUp ? 'area-gradient-up' : 'area-gradient-down';

    // 計算滑鼠/觸控位置對應的最接近數據節點以鎖定 Crosshair
    const actualWidth = hoverCoords ? hoverCoords.containerWidth : 1;
    const virtualX = hoverCoords
        ? (isScrollableKLine 
            ? hoverCoords.x 
            : (hoverCoords.x / actualWidth) * width)
        : 0;

    const canvasHoverX = hoverCoords 
        ? (isScrollableKLine 
            ? hoverCoords.x + scrollState.scrollLeft 
            : virtualX)
        : 0;

    const closestPtIdx = hoverCoords ? getClosestPointIndex(canvasHoverX) : -1;
    const closestPt = closestPtIdx !== -1 ? chartData[closestPtIdx] : null;

    // Snapped X coordinate (to align with the time bucket) and smooth Y coordinate (to match cursor height)
    let snapX = 0;
    let snapY = 0;
    let priceAtHover = 0;

    // 逆向計算滑鼠 Y 軸位置對應的精確價格
    const getPriceFromY = (yPixel: number) => {
        if (!hoverCoords || hoverCoords.containerHeight <= 0) return refPrice;
        const ySvg = (yPixel / hoverCoords.containerHeight) * height;
        
        if (isTimeChart) {
            const topBuffer = 22;
            const bottomBuffer = 18;
            const drawableHeight = chartHeight - topBuffer - bottomBuffer;
            const ratio = 1 - (ySvg - paddingTop - topBuffer) / drawableHeight;
            const price = minPrice + range * ratio;
            return Math.max(minPrice, Math.min(maxPrice, price));
        } else {
            const ratio = 1 - (ySvg - paddingTop) / chartHeight;
            const price = minPrice + range * ratio;
            return Math.max(minPrice, Math.min(maxPrice, price));
        }
    };

    if (hoverCoords && closestPt && closestPtIdx !== -1) {
        const ratioX = getX(closestPtIdx) / width;
        snapX = (isScrollableKLine 
            ? getX(closestPtIdx) - scrollState.scrollLeft
            : ratioX * hoverCoords.containerWidth);

        // 準星 Y 軸跟隨滑鼠移動，提供平滑且無分時差距的看盤體驗 (比照 TradingView)
        snapY = hoverCoords.y;
        priceAtHover = getPriceFromY(hoverCoords.y);
    }

    const showCrosshair = hoverCoords && closestPt && 
        snapX >= paddingLeft && snapX <= (hoverCoords.containerWidth - paddingRight) && 
        snapY >= paddingTop && snapY <= (hoverCoords.containerHeight - paddingBottom);

    const maxPt = maxVisibleIdx !== -1 ? chartData[maxVisibleIdx] : null;
    const minPt = minVisibleIdx !== -1 ? chartData[minVisibleIdx] : null;

    // ── 頂部 HUD 動態注入文字 ──
    const displayPt = closestPt || chartData[chartData.length - 1];
    const hudTime = displayPt ? displayPt.time : '--';
    const hudOpen = displayPt ? displayPt.open.toFixed(2) : '--';
    const hudHigh = displayPt ? displayPt.high.toFixed(2) : '--';
    const hudLow = displayPt ? displayPt.low.toFixed(2) : '--';
    const hudClose = displayPt ? displayPt.close.toFixed(2) : '--';
    
    const hudChangeVal = displayPt ? ((displayPt.close - displayPt.open) / displayPt.open) * 100 : 0;
    const hudChangeSign = hudChangeVal >= 0 ? '+' : '';
    const hudChange = displayPt ? `${hudChangeSign}${hudChangeVal.toFixed(2)}` : '--';
    const hudVol = displayPt ? displayPt.volume.toLocaleString() : '--';
    
    const isHudUp = displayPt ? displayPt.close >= displayPt.open : true;
    const hudColor = isHudUp ? colorUp : colorDown;

    return (
        <div 
            className="w-full h-full p-1 bg-[#131722] rounded border border-[#2a2e39] relative overflow-hidden group flex flex-col select-none"
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouch}
            onTouchMove={handleTouch}
            onMouseLeave={handleMouseLeave}
            onTouchEnd={handleMouseLeave}
        >
            {/* 頂部 HUD 動態文字面板 */}
            <div className="absolute top-1.5 left-2 z-30 font-mono text-[8px] sm:text-[9px] text-gray-400 pointer-events-none select-none flex flex-wrap items-center gap-x-1 sm:gap-x-1.5 gap-y-0.5 bg-[#131722]/80 px-2 py-0.5 rounded border border-[#2a2e39]/30">
                <span>時間: <span className="text-gray-100 font-semibold">{hudTime}</span></span>
                <span className="text-[#2a2e39]">|</span>
                <span>開: <span style={{ color: hudColor }} className="font-semibold">{hudOpen}</span></span>
                <span className="text-[#2a2e39]">|</span>
                <span>高: <span style={{ color: hudColor }} className="font-semibold">{hudHigh}</span></span>
                <span className="text-[#2a2e39]">|</span>
                <span>低: <span style={{ color: hudColor }} className="font-semibold">{hudLow}</span></span>
                <span className="text-[#2a2e39]">|</span>
                <span>收: <span style={{ color: hudColor }} className="font-semibold">{hudClose}</span></span>
                <span className="text-[#2a2e39]">|</span>
                <span>幅: <span style={{ color: hudColor }} className="font-semibold">{hudChange}%</span></span>
                <span className="text-[#2a2e39]">|</span>
                <span>量: <span className="text-gray-100 font-semibold">{hudVol}股</span></span>
            </div>

            {/* 主圖表區 (可橫向捲動) */}
            <div ref={containerRef} className={`w-full h-full overflow-x-auto overflow-y-hidden custom-scrollbar ${isTimeChart ? '' : 'pr-[60px]'}`}>
                <div style={{ width: isScrollableKLine ? `${width}px` : '100%', height: '100%', position: 'relative' }}>
                    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="absolute inset-0">
                        <defs>
                            <linearGradient id="area-gradient-red" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={colorUp} stopOpacity="0.3"/>
                                <stop offset="100%" stopColor={colorUp} stopOpacity="0.0"/>
                            </linearGradient>
                            <linearGradient id="area-gradient-green" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={colorDown} stopOpacity="0.0"/>
                                <stop offset="100%" stopColor={colorDown} stopOpacity="0.3"/>
                            </linearGradient>
                            <clipPath id="clip-above">
                                <rect x="0" y="0" width={width} height={yRef} />
                            </clipPath>
                            <clipPath id="clip-below">
                                <rect x="0" y={yRef} width={width} height={height - yRef} />
                            </clipPath>
                        </defs>

                        {/* 背景水平網格線 (對齊 Y 軸標籤，分時圖使用 9 個，K線圖使用 8 個) */}
                        {Array.from({ length: isTimeChart ? 9 : 8 }).map((_, i) => {
                            const totalSteps = isTimeChart ? 8 : 7;
                            const ratio = i / totalSteps;
                            const price = minPrice + range * ratio;
                            const y = getY(price);
                            const isCenter = isTimeChart && i === 4;
                            
                            const strokeColor = isCenter ? "#474D57" : "#2B2F36";
                            const strokeW = isCenter ? 1.2 : 0.8;
                            const dashArray = isCenter ? undefined : "3,3";
                            const opacityVal = isCenter ? 0.8 : 0.35;
                            
                            return (
                                <line 
                                    key={`h-grid-${i}`}
                                    x1={paddingLeft} y1={y}
                                    x2={width - paddingRight} y2={y}
                                    stroke={strokeColor} 
                                    strokeWidth={strokeW} 
                                    strokeDasharray={dashArray} 
                                    opacity={opacityVal}
                                    className={isCenter ? "z-10" : ""}
                                />
                            );
                        })}

                        {/* 背景垂直網格線 (分時圖對齊每小時 X 軸標籤) */}
                        {(isTimeChart ? [0.2, 0.4, 0.6, 0.8] : [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875]).map(p => (
                            <line 
                                key={`v-grid-${p}`}
                                x1={paddingLeft + p * chartWidth} y1={paddingTop}
                                x2={paddingLeft + p * chartWidth} y2={height - paddingBottom}
                                stroke="#2B2F36" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.3"
                            />
                        ))}

                        {/* 1. 量能直方柱 (底層背景渲染) */}
                        {chartData.map((d, i) => {
                            const volHeight = ((d.volume || 0) / maxVolume) * (chartHeight * 0.16);
                            const candleUp = d.close >= d.open;
                            const volColor = candleUp ? 'rgba(255, 0, 0, 0.18)' : 'rgba(0, 255, 0, 0.18)';
                            const x = getX(i, d.time);
                            return (
                                <rect
                                    key={`vol-${i}`}
                                    x={x - barWidth / 2}
                                    y={paddingTop + chartHeight - volHeight}
                                    width={Math.max(1.5, barWidth)}
                                    height={volHeight}
                                    fill={volColor}
                                />
                            );
                        })}
                        
                        {/* 2. 折線圖 (isTimeChart === true) / 蠟燭圖 (isTimeChart === false) */}
                        {isTimeChart ? (
                            <>
                                {chartData.length > 0 && (() => {
                                    const x0 = getX(0, chartData[0].time).toFixed(1);
                                    const xn = getX(chartData.length - 1, chartData[chartData.length - 1].time).toFixed(1);
                                    const yRefStr = yRef.toFixed(1);

                                    // 1. 建立連續的折線 Path D
                                    const linePathD = chartData.map((d, i) => 
                                        `${i === 0 ? 'M' : 'L'}${getX(i, d.time).toFixed(1)} ${getY(d.close).toFixed(1)}`
                                    ).join(' ');

                                    // 2. 紅色漸層區多邊形 (基準線之上，低於基準線的值強制限幅在 yRef)
                                    const redPoints = `${x0},${yRefStr} ` + 
                                        chartData.map((d, i) => 
                                            `${getX(i, d.time).toFixed(1)},${Math.min(yRef, getY(d.close)).toFixed(1)}`
                                        ).join(' ') + 
                                        ` ${xn},${yRefStr}`;

                                    // 3. 綠色漸層區多邊形 (基準線之下，高於基準線的值強制限幅在 yRef)
                                    const greenPoints = `${x0},${yRefStr} ` + 
                                        chartData.map((d, i) => 
                                            `${getX(i, d.time).toFixed(1)},${Math.max(yRef, getY(d.close)).toFixed(1)}`
                                        ).join(' ') + 
                                        ` ${xn},${yRefStr}`;

                                    return (
                                        <>
                                            {/* 紅色漸層區 (限幅 + Clip Path 雙重物理隔離) */}
                                            <polygon 
                                                points={redPoints} 
                                                clipPath="url(#clip-above)"
                                                fill="url(#area-gradient-red)"
                                            />
                                            {/* 綠色漸層區 (限幅 + Clip Path 雙重物理隔離) */}
                                            <polygon 
                                                points={greenPoints} 
                                                clipPath="url(#clip-below)"
                                                fill="url(#area-gradient-green)"
                                            />

                                            {/* 雙色折線：藉由 Clip Path 於基準線完美割離，無遞延或混色 */}
                                            <path 
                                                d={linePathD} 
                                                stroke={colorUp} 
                                                strokeWidth="1.5" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                fill="none" 
                                                clipPath="url(#clip-above)" 
                                            />
                                            <path 
                                                d={linePathD} 
                                                stroke={colorDown} 
                                                strokeWidth="1.5" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                fill="none" 
                                                clipPath="url(#clip-below)" 
                                            />
                                        </>
                                    );
                                })()}
                            </>
                        ) : (
                            chartData.map((d, i) => {
                                const candleUp = d.close >= d.open;
                                const color = candleUp ? colorUp : colorDown;
                                const x = getX(i);
                                const openY = getY(d.open);
                                const closeY = getY(d.close);
                                const highY = getY(d.high);
                                const lowY = getY(d.low);
                                 
                                return (
                                    <g key={i} className="hover:opacity-85 transition-opacity cursor-crosshair">
                                        <line 
                                            x1={x} y1={highY} 
                                            x2={x} y2={lowY} 
                                            stroke={color} strokeWidth="1.2" 
                                        />
                                        <rect 
                                            x={x - barWidth / 2} 
                                            y={Math.min(openY, closeY)} 
                                            width={Math.max(1.5, barWidth)} 
                                            height={Math.max(Math.abs(openY - closeY), 1.2)} 
                                            fill={color} 
                                            stroke={color}
                                            strokeWidth="0.8"
                                        />
                                    </g>
                                );
                            })
                        )}

                        {/* 3. 在當前可見的最高與最低點標註其數值 (置於上下緩衝區，置中對齊影線端點) */}
                        {maxPt && (
                            <g>
                                <line 
                                    x1={getX(maxVisibleIdx, maxPt.time)} 
                                    y1={getY(isTimeChart ? maxPt.close : maxPt.high)} 
                                    x2={getX(maxVisibleIdx, maxPt.time)} 
                                    y2={getY(isTimeChart ? maxPt.close : maxPt.high) - 5} 
                                    stroke={isTimeChart ? "#ffffff" : "#ef5350"} 
                                    strokeWidth="0.8" 
                                />
                                <text 
                                    x={getX(maxVisibleIdx, maxPt.time)} 
                                    y={getY(isTimeChart ? maxPt.close : maxPt.high) - 8} 
                                    fill={isTimeChart ? "#ffffff" : "#ef5350"} 
                                    fontSize="9" 
                                    fontFamily="monospace"
                                    textAnchor="middle"
                                    fontWeight="bold"
                                >
                                    {(isTimeChart ? maxPt.close : maxPt.high).toFixed(2)}
                                </text>
                            </g>
                        )}
                        {minPt && (
                            <g>
                                <line 
                                    x1={getX(minVisibleIdx, minPt.time)} 
                                    y1={getY(isTimeChart ? minPt.close : minPt.low)} 
                                    x2={getX(minVisibleIdx, minPt.time)} 
                                    y2={getY(isTimeChart ? minPt.close : minPt.low) + 5} 
                                    stroke={isTimeChart ? "#ffffff" : "#26a69a"} 
                                    strokeWidth="0.8" 
                                />
                                <text 
                                    x={getX(minVisibleIdx, minPt.time)} 
                                    y={getY(isTimeChart ? minPt.close : minPt.low) + 14} 
                                    fill={isTimeChart ? "#ffffff" : "#26a69a"} 
                                    fontSize="9" 
                                    fontFamily="monospace"
                                    textAnchor="middle"
                                    fontWeight="bold"
                                >
                                    {(isTimeChart ? minPt.close : minPt.low).toFixed(2)}
                                </text>
                            </g>
                        )}

                        {/* 4. 讀取事件標記數據，於對應 X 軸渲染特殊 Icon */}
                        {chartData.map((d, i) => {
                            const matching = markers.filter(m => m.labels.includes(d.time));
                            if (matching.length === 0) return null;
                            const x = getX(i, d.time);
                            const tooltipText = matching.map(m => `• ${m.title}`).join('\n');

                            return (
                                <g key={`marker-${i}`} className="cursor-pointer">
                                    <circle 
                                        cx={x} 
                                        cy={paddingTop + chartHeight + 8} 
                                        r="5" 
                                        fill="#ff69b4" 
                                        stroke="#ffffff" 
                                        strokeWidth="1" 
                                        className="hover:scale-125 transition-transform origin-center"
                                    />
                                    <path 
                                        d={`M ${x - 2} ${paddingTop + chartHeight + 6.5} L ${x + 2} ${paddingTop + chartHeight + 6.5} L ${x + 2} ${paddingTop + chartHeight + 9} L ${x} ${paddingTop + chartHeight + 11} L ${x - 2} ${paddingTop + chartHeight + 9} Z`} 
                                        fill="#ffffff" 
                                    />
                                    <title>{`【最新核可貼貼情報】\n${tooltipText}`}</title>
                                </g>
                            );
                        })}

                        {/* SVG 刻度分時標籤 */}
                        {isTimeChart ? (
                            [
                                { label: '19:00', ratio: 0.0 },
                                { label: '20:00', ratio: 0.2 },
                                { label: '21:00', ratio: 0.4 },
                                { label: '22:00', ratio: 0.6 },
                                { label: '23:00', ratio: 0.8 },
                                { label: '24:00', ratio: 1.0 }
                            ].map((tick, i) => {
                                const x = paddingLeft + tick.ratio * chartWidth;
                                return (
                                    <g key={`time-tick-${i}`}>
                                        <line 
                                            x1={x} y1={paddingTop + chartHeight} 
                                            x2={x} y2={paddingTop + chartHeight + 4} 
                                            stroke="#2B2F36" strokeWidth="1" 
                                        />
                                        <text 
                                            x={x} y={paddingTop + chartHeight + 16} 
                                            fill="#848E9C" fontSize="9" fontFamily="monospace" textAnchor="middle"
                                            className="opacity-70"
                                        >
                                            {tick.label}
                                        </text>
                                    </g>
                                );
                            })
                        ) : (
                            chartData.map((d, i) => {
                                const step = chartData.length > 120 ? 30 : 15;
                                if (i % step !== 0) return null;
                                const x = getX(i);
                                return (
                                    <g key={`tick-${i}`}>
                                        <line 
                                            x1={x} y1={paddingTop + chartHeight} 
                                            x2={x} y2={paddingTop + chartHeight + 4} 
                                            stroke="#2B2F36" strokeWidth="1" 
                                        />
                                        <text 
                                            x={x} y={paddingTop + chartHeight + 16} 
                                            fill="#848E9C" fontSize="9" fontFamily="monospace" textAnchor="middle"
                                            className="opacity-70"
                                        >
                                            {d.time}
                                        </text>
                                    </g>
                                );
                            })
                        )}

                        {/* 底部邊界線 */}
                        <line 
                            x1={paddingLeft} y1={paddingTop + chartHeight}
                            x2={width - paddingRight} y2={paddingTop + chartHeight}
                            stroke="#2B2F36" strokeWidth="1"
                        />
                    </svg>
                </div>
            </div>

            {/* Sticky 價格刻度面板 (固定在右側) */}
            <div className={`absolute right-0 top-0 bottom-0 w-[60px] ${isTimeChart ? 'bg-transparent' : 'bg-[#131722] border-l border-[#2a2e39]'} pointer-events-none select-none z-20 font-mono text-[9px] text-[#848E9C]`}>
                <div 
                    className={`absolute left-0 right-0 ${isTimeChart ? '' : 'border-t border-[#2a2e39]'}`} 
                    style={{ bottom: `${paddingBottom}px` }} 
                />

                {/* Y 軸價格標籤 (分時圖 9 個，K線圖 8 個) */}
                {Array.from({ length: isTimeChart ? 9 : 8 }).map((_, i) => {
                    const totalSteps = isTimeChart ? 8 : 7;
                    const ratio = i / totalSteps;
                    const price = minPrice + range * ratio;
                    const isEdge = i === 0 || i === totalSteps;
                    const isCenter = isTimeChart && i === 4;
                    const percentY = (getY(price) / height) * 100;
                    return (
                        <span 
                            key={`y-label-${i}`}
                            className={`absolute right-2 font-mono text-[9px] ${
                                isEdge ? 'font-semibold text-gray-300' : 
                                isCenter ? 'font-bold text-pink-400 shadow-sm' : 'text-[#474D57]'
                            }`}
                            style={{ top: `${percentY}%`, transform: 'translateY(-50%)' }}
                        >
                            {price.toFixed(2)}
                        </span>
                    );
                })}

                {/* 實時成交價 Tracker 游標 */}
                <div 
                    className="absolute right-0 left-0 text-white py-0.5 text-center font-bold font-mono text-[9px] z-30 shadow border-y"
                    style={{ 
                        top: `${(getY(currentPrice) / height) * 100}%`, 
                        transform: 'translateY(-50%)',
                        backgroundColor: currentPriceColor,
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                    }}
                >
                    {currentPrice.toFixed(2)}
                </div>
            </div>

            {/* TradingView 十字準星 & 刻度懸浮浮標 (Snapped to Closest Node) */}
            {showCrosshair && (
                <div className="absolute inset-0 pointer-events-none z-10">
                    {/* 十字虛線：垂直 */}
                    <div 
                        className="absolute top-0 bottom-0 border-l border-dashed border-[#848E9C]/35" 
                        style={{ left: `${snapX}px` }} 
                    />
                    
                    {/* 十字虛線：水平 */}
                    <div 
                        className="absolute left-0 border-t border-dashed border-[#848E9C]/35" 
                        style={{ top: `${snapY}px`, right: `${isTimeChart ? 32 : 60}px` }} 
                    />

                    {/* Y 軸價格懸浮標籤 */}
                    <div 
                        className="absolute right-0 bg-[#363a45] text-white px-1.5 py-0.5 rounded-l text-[8px] font-bold font-mono z-40 border-y border-[#848E9C]/30"
                        style={{ top: `${snapY}px`, transform: 'translateY(-50%)' }}
                    >
                        {priceAtHover.toFixed(2)}
                    </div>

                    {/* X 軸時間懸浮標籤 */}
                    {closestPt && (
                        <div 
                            className="absolute bg-[#363a45] text-white px-2 py-0.5 rounded text-[8px] font-bold font-mono z-40 border border-[#848E9C]/30"
                            style={{ 
                                left: `${snapX}px`, 
                                bottom: `${paddingBottom - 23}px`,
                                transform: 'translateX(-50%)'
                            }}
                        >
                            {closestPt.time}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}