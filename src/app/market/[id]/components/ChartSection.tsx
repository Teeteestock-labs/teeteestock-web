"use client";

import { memo } from "react";
import CandlestickChart from "@/components/CandlestickChart";
import { teeteePair } from "@/app/types";

interface ChartSectionProps {
    pair: teeteePair;
    activeTab: 'time' | 'k' | 'detail';
    setActiveTab: (tab: 'time' | 'k' | 'detail') => void;
    chartRange: '1D' | '1W' | '1M' | '6M' | 'YTD' | '1Y' | '5Y';
    setChartRange: (range: '1D' | '1W' | '1M' | '6M' | 'YTD' | '1Y' | '5Y') => void;
    klinePeriod: '1m' | '5m' | '1D' | '1W' | '1M';
    setKlinePeriod: (period: '1m' | '5m' | '1D' | '1W' | '1M') => void;
    isAdjustedKline: boolean;
    setIsAdjustedKline: (val: boolean) => void;
    displayData: any[];
    loadingChart: boolean;
    yesterdayPrice: number;
    ceiling: number;
    floor: number;
    highVal: number;
    lowVal: number;
    amplitude: number;
    avgPrice: number | null;
    getCompareColor: (val: number | null | undefined) => string;
}

const ChartSection = memo(({
    pair,
    activeTab,
    setActiveTab,
    chartRange,
    setChartRange,
    klinePeriod,
    setKlinePeriod,
    isAdjustedKline,
    setIsAdjustedKline,
    displayData,
    loadingChart,
    yesterdayPrice,
    ceiling,
    floor,
    highVal,
    lowVal,
    amplitude,
    avgPrice,
    getCompareColor
}: ChartSectionProps) => {
    return (
        <div className="bg-[#181A20] border border-[#2B2F36] rounded h-96 flex flex-col overflow-hidden shadow-xl">
            <div className="p-3 bg-gray-950 border-b border-[#2B2F36] flex justify-between items-center text-xs font-bold select-none">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] animate-pulse shadow-[0_0_8px_#38BDF8]" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">技術分析圖表</h3>
                </div>
                <div className="flex gap-4">
                    <span 
                        onClick={() => setActiveTab('time')}
                        className={`pb-0.5 cursor-pointer transition-colors ${activeTab === 'time' ? 'text-[#FF69B4] border-b-2 border-[#FF69B4]' : 'text-[#848E9C] hover:text-white'}`}
                    >
                        分時圖
                    </span>
                    <span 
                        onClick={() => setActiveTab('k')}
                        className={`pb-0.5 cursor-pointer transition-colors ${activeTab === 'k' ? 'text-[#FF69B4] border-b-2 border-[#FF69B4]' : 'text-[#848E9C] hover:text-white'}`}
                    >
                        K線圖
                    </span>
                    <span 
                        onClick={() => setActiveTab('detail')}
                        className={`pb-0.5 cursor-pointer transition-colors ${activeTab === 'detail' ? 'text-[#FF69B4] border-b-2 border-[#FF69B4]' : 'text-[#848E9C] hover:text-white'}`}
                    >
                        詳細
                    </span>
                </div>
            </div>

            {activeTab !== 'detail' && (
                <div className="border-b border-[#2B2F36] px-3 py-1.5 flex items-center justify-between text-[9px] font-normal text-[#848E9C] bg-[#1E2329]/50 select-none">
                    <div className="flex gap-2 items-center">
                        {activeTab === 'time' ? (
                            // 分時圖區間按鈕
                            (['1D', '1W', '1M', '6M', 'YTD', '1Y', '5Y'] as const).map((r) => {
                                const labelMap = {
                                    '1D': '當日',
                                    '1W': '1周',
                                    '1M': '1個月',
                                    '6M': '6月',
                                    'YTD': '本年迄今',
                                    '1Y': '1年',
                                    '5Y': '5年'
                                };
                                return (
                                    <span 
                                        key={r}
                                        onClick={() => setChartRange(r)}
                                        className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors hover:text-white ${chartRange === r ? 'bg-[#FF69B4]/10 text-[#FF69B4] font-bold border border-[#FF69B4]/25' : 'hover:bg-[#2B2F36]'}`}
                                    >
                                        {labelMap[r]}
                                    </span>
                                );
                            })
                        ) : (
                            // K線圖週期按鈕
                            (['1m', '5m', '1D', '1W', '1M'] as const).map((p) => {
                                const labelMap = {
                                    '1m': isAdjustedKline ? '還原1分' : '1分k',
                                    '5m': isAdjustedKline ? '還原5分' : '5分k',
                                    '1D': isAdjustedKline ? '還原日' : '日k',
                                    '1W': isAdjustedKline ? '還原周' : '周k',
                                    '1M': isAdjustedKline ? '還原月' : '月k'
                                };
                                return (
                                    <span 
                                        key={p}
                                        onClick={() => setKlinePeriod(p)}
                                        className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors hover:text-white ${klinePeriod === p ? 'bg-[#FF69B4]/10 text-[#FF69B4] font-bold border border-[#FF69B4]/25' : 'hover:bg-[#2B2F36]'}`}
                                    >
                                        {labelMap[p]}
                                    </span>
                                );
                            })
                        )}
                    </div>

                    {/* K線圖專用：右側還原/原始切換按鈕 */}
                    {activeTab === 'k' && (
                        <button
                            onClick={() => setIsAdjustedKline(!isAdjustedKline)}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all flex items-center gap-1.5 select-none border cursor-pointer ${
                                isAdjustedKline
                                    ? 'bg-[#FF69B4]/20 text-[#FF69B4] border-[#FF69B4]/50 shadow-[0_0_8px_rgba(255,105,180,0.3)] font-black'
                                    : 'bg-[#2B2F36]/60 text-[#848E9C] border-transparent hover:text-white hover:bg-[#2B2F36]'
                            }`}
                            title="加回歷史除息金額（還原 K 線走勢）"
                        >
                            <span
                                className={`w-3 h-3 rounded-[2px] border flex items-center justify-center shrink-0 transition-colors ${
                                    isAdjustedKline
                                        ? 'border-[#FF69B4] bg-[#FF69B4] text-gray-950'
                                        : 'border-gray-500 bg-transparent'
                                }`}
                            >
                                {isAdjustedKline && (
                                    <svg className="w-2.5 h-2.5 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </span>
                            <span>還原k</span>
                        </button>
                    )}
                </div>
            )}
            <div className="flex-1 p-2 overflow-hidden relative">
                {loadingChart && activeTab !== 'detail' && (
                    <div className="absolute inset-0 bg-[#181A20]/60 backdrop-blur-[1px] flex items-center justify-center z-20 text-xs text-[#FF69B4] font-bold font-mono">
                        載入數據中...
                    </div>
                )}
                {activeTab === 'k' && <CandlestickChart data={displayData} yesterdayPrice={pair.yesterdayPrice} pairId={pair.id} />}
                {activeTab === 'time' && (
                    <CandlestickChart data={displayData} isTimeChart={true} yesterdayPrice={pair.yesterdayPrice} pairId={pair.id} /> 
                )}
                {activeTab === 'detail' && (
                    <div className="h-full flex items-center justify-center p-4">
                        <div className="w-full max-w-lg grid grid-cols-2 gap-4 text-xs font-mono select-none">
                            <div className="bg-[#1E2329]/50 border border-[#2B2F36] p-3 rounded flex flex-col justify-center">
                                <span className="text-[#848E9C] text-[9px] font-bold mb-1">開盤</span>
                                <span className={`font-bold text-sm ${getCompareColor(pair.todayOpenPrice)}`}>
                                    {pair.todayOpenPrice ? pair.todayOpenPrice.toFixed(2) : '未成交'}
                                </span>
                            </div>
                            <div className="bg-[#1E2329]/50 border border-[#2B2F36] p-3 rounded flex flex-col justify-center">
                                <span className="text-[#848E9C] text-[9px] font-bold mb-1">昨收</span>
                                <span className="text-white font-bold text-sm">{yesterdayPrice.toFixed(2)}</span>
                            </div>
                            <div className="bg-[#1E2329]/50 border border-[#2B2F36] p-3 rounded flex flex-col justify-center">
                                <span className="text-[#848E9C] text-[9px] font-bold mb-1">最高</span>
                                <span className={`font-bold text-sm ${getCompareColor(highVal)}`}>
                                    {highVal.toFixed(2)}
                                </span>
                            </div>
                            <div className="bg-[#1E2329]/50 border border-[#2B2F36] p-3 rounded flex flex-col justify-center">
                                <span className="text-[#848E9C] text-[9px] font-bold mb-1">最低</span>
                                <span className={`font-bold text-sm ${getCompareColor(lowVal)}`}>
                                    {lowVal.toFixed(2)}
                                </span>
                            </div>
                            <div className="bg-[#1E2329]/50 border border-[#2B2F36] p-3 rounded flex flex-col justify-center">
                                <span className="text-[#848E9C] text-[9px] font-bold mb-1">漲停</span>
                                <span className="text-white font-bold text-sm">{ceiling.toFixed(2)}</span>
                            </div>
                            <div className="bg-[#1E2329]/50 border border-[#2B2F36] p-3 rounded flex flex-col justify-center">
                                <span className="text-[#848E9C] text-[9px] font-bold mb-1">跌停</span>
                                <span className="text-white font-bold text-sm">{floor.toFixed(2)}</span>
                            </div>
                            <div className="bg-[#1E2329]/50 border border-[#2B2F36] p-3 rounded flex flex-col justify-center">
                                <span className="text-[#848E9C] text-[9px] font-bold mb-1">振幅</span>
                                <span className="text-white font-bold text-sm">{amplitude.toFixed(2)}%</span>
                            </div>
                            <div className="bg-[#1E2329]/50 border border-[#2B2F36] p-3 rounded flex flex-col justify-center">
                                <span className="text-[#848E9C] text-[9px] font-bold mb-1">均價</span>
                                <span className={`${avgPrice ? 'text-white' : 'text-gray-400'} font-bold text-sm`}>
                                    {avgPrice ? avgPrice.toFixed(2) : '未成交'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

ChartSection.displayName = 'ChartSection';
export default ChartSection;
