"use client";

import { memo } from "react";
import { teeteePair } from "@/app/types";
import { getTickSize } from "@/utils/validatePrice";

interface TradeTickerPanelProps {
    pair: teeteePair;
    refPrice: number;
    ceiling: number;
    floor: number;
}

const TradeTickerPanel = memo(({
    pair,
    refPrice,
    ceiling,
    floor
}: TradeTickerPanelProps) => {
    return (
        <div className="bg-[#181A20] border border-[#2B2F36] rounded shadow-xl overflow-hidden">
            <div className="p-3 bg-gray-950 border-b border-[#2B2F36] flex justify-between items-center select-none">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7] animate-pulse shadow-[0_0_8px_#A855F7]" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">即時成交明細</h3>
                </div>
            </div>
            <div className="p-4 pt-3">
            <div className="overflow-x-auto overflow-y-auto max-h-[302px] custom-scrollbar">
                <table className="w-full text-base font-mono">
                    <thead>
                        <tr className="text-[#848E9C] border-b border-[#2B2F36] text-[10px] font-bold text-right">
                            <th className="py-1 px-2 text-left font-bold">時間</th>
                            <th className="py-1 px-2 font-bold">買進</th>
                            <th className="py-1 px-2 font-bold">賣出</th>
                            <th className="py-1 px-2 font-bold">成交</th>
                            <th className="py-1 px-2 font-bold">漲跌</th>
                            <th className="py-1 px-2 font-bold">單量</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2B2F36]/30">
                        {(!pair.recentTrades || pair.recentTrades.length === 0) ? (
                            <tr>
                                <td colSpan={6} className="text-center py-6 text-gray-500 text-sm">
                                    尚無成交紀錄
                                </td>
                            </tr>
                        ) : (
                            pair.recentTrades.map((trade, i) => {
                                const tick = getTickSize(trade.price);
                                const bid = trade.isUp ? trade.price - tick : trade.price;
                                const ask = trade.isUp ? trade.price : trade.price + tick;
                                const change = trade.price - refPrice;

                                const getPriceColor = (val: number) => {
                                    if (val > refPrice) return 'text-[#FF3B3B]';
                                    if (val < refPrice) return 'text-[#00FFA3]';
                                    return 'text-[#FFD700]';
                                };

                                const getChangeColor = (val: number) => {
                                    if (val > 0) return 'text-[#FF3B3B]';
                                    if (val < 0) return 'text-[#00FFA3]';
                                    return 'text-[#FFD700]';
                                };

                                const isCeiling = trade.price === ceiling;
                                const isFloor = trade.price === floor;
                                const tradePriceClass = isCeiling 
                                    ? 'bg-red-600 text-white font-bold rounded px-1.5 py-0.5 shadow-sm' 
                                    : isFloor 
                                        ? 'bg-green-600 text-white font-bold rounded px-1.5 py-0.5 shadow-sm' 
                                        : `font-bold ${getPriceColor(trade.price)}`;

                                return (
                                    <tr key={i} className="hover:bg-[#2B3139] border-b border-[#2B2F36] transition-colors text-[11px] font-mono text-right">
                                        <td className="py-1 px-2 text-left text-gray-400">{trade.time}</td>
                                        <td className={`py-1 px-2 ${getPriceColor(bid)}`}>{bid.toFixed(2)}</td>
                                        <td className={`py-1 px-2 ${getPriceColor(ask)}`}>{ask.toFixed(2)}</td>
                                        <td className="py-1 px-2">
                                            <span className={tradePriceClass}>
                                                {trade.price.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className={`py-1 px-2 ${getChangeColor(change)}`}>
                                            {change > 0 ? '+' : ''}{change.toFixed(2)}
                                        </td>
                                        <td className="py-1 px-2 text-[#EAECEF]">{trade.amount.toLocaleString()}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            </div>
        </div>
    );
});

TradeTickerPanel.displayName = 'TradeTickerPanel';
export default TradeTickerPanel;
