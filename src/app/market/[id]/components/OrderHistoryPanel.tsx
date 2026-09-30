"use client";

import { memo } from "react";
import { teeteePair } from "@/app/types";

interface OrderHistoryPanelProps {
    pair: teeteePair;
    orders: any[];
    cancelOrder: (id: string) => Promise<{ success: boolean; message?: string }>;
    isCancelling: boolean;
    currentUserId: string;
    cancelledOrderIdsRef: React.MutableRefObject<Set<string>>;
    addNotification: (type: 'buy_submit' | 'sell_submit' | 'match_deal' | 'failed', price: number, amount: number, message?: string) => void;
    orderSubTab: 'pending' | 'trades';
    setOrderSubTab: (tab: 'pending' | 'trades') => void;
}

const OrderHistoryPanel = memo(({
    pair,
    orders,
    cancelOrder,
    isCancelling,
    currentUserId,
    cancelledOrderIdsRef,
    addNotification,
    orderSubTab,
    setOrderSubTab
}: OrderHistoryPanelProps) => {
    return (
        <div className="bg-[#181A20] border border-[#2B2F36] rounded shadow-xl overflow-hidden">
            <div className="p-3 bg-gray-950 border-b border-[#2B2F36] flex justify-between items-center select-none">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00FFA3] animate-pulse shadow-[0_0_8px_#00FFA3]" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">委託成交回報</h3>
                </div>
                <div className="flex gap-4 text-xs font-bold select-none">
                    <span 
                        onClick={() => setOrderSubTab('pending')}
                        className={`pb-0.5 cursor-pointer transition-colors ${orderSubTab === 'pending' ? 'text-[#FF69B4] border-b-2 border-[#FF69B4]' : 'text-[#848E9C] hover:text-white'}`}
                    >
                        委回
                    </span>
                    <span 
                        onClick={() => setOrderSubTab('trades')}
                        className={`pb-0.5 cursor-pointer transition-colors ${orderSubTab === 'trades' ? 'text-[#FF69B4] border-b-2 border-[#FF69B4]' : 'text-[#848E9C] hover:text-white'}`}
                    >
                        成回
                    </span>
                </div>
            </div>
            <div className="p-4 pt-3">

            {orderSubTab === 'pending' ? (() => {
                const myOrders = orders.filter(o => o.isUser && o.pairId === pair.id);
                return (
                    <div className="overflow-x-auto overflow-y-auto max-h-[250px] custom-scrollbar">
                        <table className="w-full text-base font-mono">
                            <thead>
                                <tr className="text-[#848E9C] border-b border-[#2B2F36] text-[10px] font-bold text-right">
                                    <th className="py-2 px-2 text-left font-bold">類型</th>
                                    <th className="py-2 px-2 font-bold">價格</th>
                                    <th className="py-2 px-2 font-bold">數量</th>
                                    <th className="py-2 px-2 font-bold">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2B2F36]/30">
                                {myOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-6 text-gray-500 text-sm">
                                            無未成交委託單
                                        </td>
                                    </tr>
                                ) : (
                                    myOrders.map(o => (
                                        <tr key={o.id} className="hover:bg-[#2B3139] border-b border-[#2B2F36] transition-colors text-[11px] font-mono text-right">
                                            <td className={`py-2 px-2 text-left font-bold ${o.type === 'buy' ? 'text-[#FF3B3B]' : 'text-[#00FFA3]'}`}>
                                                {o.type === 'buy' ? '買進' : '賣出'}
                                            </td>
                                            <td className="py-2 px-2 text-white font-bold">{o.price.toFixed(2)}</td>
                                            <td className="py-2 px-2 text-white">{o.amount.toLocaleString()}</td>
                                            <td className="py-2 px-2">
                                                <button 
                                                    onClick={async () => {
                                                        cancelledOrderIdsRef.current.add(o.id);
                                                        const res = await cancelOrder(o.id);
                                                        if (!res.success) {
                                                            cancelledOrderIdsRef.current.delete(o.id);
                                                            addNotification('failed', 0, 0, res.message || "撤單失敗");
                                                        }
                                                    }}
                                                    disabled={isCancelling}
                                                    className={`px-2 py-0.5 rounded transition-colors ${isCancelling ? 'bg-[#2B3139] text-[#474D57] cursor-not-allowed' : 'bg-[#2B3139] hover:bg-[#FF3B3B]/20 text-[#848E9C] hover:text-[#FF3B3B]'} text-[10px]`}
                                                >
                                                    {isCancelling ? '撤銷中...' : '撤單'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            })() : (() => {
                const myTrades = (pair.recentTrades || []).filter(
                    t => t.buyerId === currentUserId || t.sellerId === currentUserId
                );
                return (
                    <div className="overflow-x-auto overflow-y-auto max-h-[250px] custom-scrollbar">
                        <table className="w-full text-base font-mono">
                            <thead>
                                <tr className="text-[#848E9C] border-b border-[#2B2F36] text-[10px] font-bold text-right">
                                    <th className="py-2 px-2 text-left font-bold">時間</th>
                                    <th className="py-2 px-2 font-bold text-center">類型</th>
                                    <th className="py-2 px-2 font-bold">成交價</th>
                                    <th className="py-2 px-2 font-bold">成交量</th>
                                    <th className="py-2 px-2 font-bold">成交額</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2B2F36]/30">
                                {myTrades.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-6 text-gray-500 text-sm">
                                            今日尚無成交明細
                                        </td>
                                    </tr>
                                ) : (
                                    myTrades.map((t, idx) => {
                                        const isBuy = t.buyerId === currentUserId;
                                        const sideText = isBuy ? '買進' : '賣出';
                                        const sideColor = isBuy ? 'text-[#FF3B3B]' : 'text-[#00FFA3]';
                                        const totalVal = t.price * t.amount;
                                        
                                        return (
                                            <tr key={`my-trade-${idx}`} className="hover:bg-[#2B3139] border-b border-[#2B2F36] transition-colors text-[11px] font-mono text-right">
                                                <td className="py-2 px-2 text-left text-gray-400">{t.time}</td>
                                                <td className={`py-2 px-2 text-center font-bold ${sideColor}`}>{sideText}</td>
                                                <td className="py-2 px-2 text-white font-bold">{t.price.toFixed(2)}</td>
                                                <td className="py-2 px-2 text-white">{t.amount.toLocaleString()}</td>
                                                <td className="py-2 px-2 text-white font-bold">{totalVal.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            })()}
            </div>
        </div>
    );
});

OrderHistoryPanel.displayName = 'OrderHistoryPanel';
export default OrderHistoryPanel;
