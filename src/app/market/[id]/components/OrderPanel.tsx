"use client";

import { memo } from "react";
import { teeteePair } from "@/app/types";
import { getTickSize } from "@/utils/validatePrice";

interface OrderPanelProps {
    pair: teeteePair;
    paddedBids: { price: number; amount: number }[];
    paddedAsks: { price: number; amount: number }[];
    maxQty: number;
    bidRatio: number;
    totalBidVol: number;
    totalAskVol: number;
    orderPrice: number;
    setOrderPrice: (price: number) => void;
    amount: number;
    setAmount: (amount: number) => void;
    handleIncrement: () => void;
    handleDecrement: () => void;
    handleAmountIncrement: () => void;
    handleAmountDecrement: () => void;
    handleAction: (type: 'buy' | 'sell') => Promise<void>;
    balance: number;
    availableBalance: number;
    myHolding: number;
    totalHolding: number;
    avgCost: number;
    profitLoss: number;
    profitPercentage: number;
    estimatedTotal: number;
    ceiling: number;
    floor: number;
    refPrice: number;
    isSubmitting: boolean;
    marketStatus: string;
}

const OrderPanel = memo(({
    pair,
    paddedBids,
    paddedAsks,
    maxQty,
    bidRatio,
    totalBidVol,
    totalAskVol,
    orderPrice,
    setOrderPrice,
    amount,
    setAmount,
    handleIncrement,
    handleDecrement,
    handleAmountIncrement,
    handleAmountDecrement,
    handleAction,
    balance,
    availableBalance,
    myHolding,
    totalHolding,
    avgCost,
    profitLoss,
    profitPercentage,
    estimatedTotal,
    ceiling,
    floor,
    refPrice,
    isSubmitting,
    marketStatus
}: OrderPanelProps) => {
    return (
        <div className="bg-[#181A20] border border-[#2B2F36] rounded overflow-hidden select-none shadow-2xl">
            <div className="p-3 bg-gray-950 border-b border-[#2B2F36] flex justify-between items-center select-none">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFD700] animate-pulse shadow-[0_0_8px_#FFD700]" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">五檔買賣報價</h3>
                </div>
            </div>

            {/* 頂部快捷按鈕列 (現價 / 漲停 / 跌停) */}
            <div className="p-2.5 bg-[#12161c] border-b border-[#2B2F36] grid grid-cols-3 gap-2 select-none">
                <button
                    type="button"
                    onClick={() => setOrderPrice(pair.price)}
                    title={`填入現價 (${pair.price})`}
                    className={`py-2 px-1.5 rounded-lg text-center font-bold text-xs transition-all duration-150 active:scale-95 shadow-sm flex flex-col items-center justify-center gap-0.5 cursor-pointer border ${
                        orderPrice === pair.price
                            ? 'bg-slate-700/90 border-amber-400 text-amber-300 ring-1 ring-amber-400/50 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                            : 'bg-[#22272f] hover:bg-[#2c323c] border-[#363c48] hover:border-slate-500 text-slate-200'
                    }`}
                >
                    <span className="text-xs tracking-wider">現價</span>
                    <span className="text-[10px] font-mono font-normal text-slate-400">
                        {pair.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setOrderPrice(ceiling)}
                    title={`填入漲停價 (${ceiling})`}
                    className={`py-2 px-1.5 rounded-lg text-center font-bold text-xs transition-all duration-150 active:scale-95 shadow-sm flex flex-col items-center justify-center gap-0.5 cursor-pointer border ${
                        orderPrice === ceiling
                            ? 'bg-red-900/60 border-red-500 text-red-200 ring-1 ring-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.25)]'
                            : 'bg-[#291417] hover:bg-[#36191d] border-[#4a2024] hover:border-red-500/70 text-[#FF4D4D]'
                    }`}
                >
                    <span className="text-xs tracking-wider flex items-center gap-0.5">
                        <span className="text-[9px]">▲</span> 漲停
                    </span>
                    <span className="text-[10px] font-mono font-normal text-red-400/80">
                        {ceiling.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setOrderPrice(floor)}
                    title={`填入跌停價 (${floor})`}
                    className={`py-2 px-1.5 rounded-lg text-center font-bold text-xs transition-all duration-150 active:scale-95 shadow-sm flex flex-col items-center justify-center gap-0.5 cursor-pointer border ${
                        orderPrice === floor
                            ? 'bg-emerald-900/60 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                            : 'bg-[#0d231a] hover:bg-[#133024] border-[#184633] hover:border-emerald-500/70 text-[#00FFA3]'
                    }`}
                >
                    <span className="text-xs tracking-wider flex items-center gap-0.5">
                        <span className="text-[9px]">▼</span> 跌停
                    </span>
                    <span className="text-[10px] font-mono font-normal text-emerald-400/80">
                        {floor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </button>
            </div>

            <div className="p-4 space-y-4">
                {/* 委託價格輸入列 */}
                <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-7 flex items-center bg-[#0B0E11] border border-[#2B2F36] rounded h-[40px] overflow-hidden focus-within:border-[#FF69B4] transition-colors">
                        <button 
                            type="button" 
                            onClick={handleDecrement} 
                            className="w-10 h-full flex items-center justify-center text-[#848e9c] hover:bg-[#2b2f36] bg-[#181a20] transition-colors border-r border-[#2B2F36] text-lg font-bold select-none"
                        >
                            -
                        </button>
                        <div className="flex-1 relative flex items-center justify-center">
                            <input 
                                type="number"
                                value={orderPrice || ""}
                                step={getTickSize(orderPrice || pair.price)}
                                onChange={(e) => setOrderPrice(Number(e.target.value))}
                                placeholder="委託價格" 
                                className="bg-transparent text-center font-mono text-sm font-bold text-white outline-none w-full px-2 placeholder-[#848E9C]" 
                            />
                        </div>
                        <button 
                            type="button" 
                            onClick={handleIncrement} 
                            className="w-10 h-full flex items-center justify-center text-[#848e9c] hover:bg-[#2b2f36] bg-[#181a20] transition-colors border-l border-[#2B2F36] text-lg font-bold select-none"
                        >
                            +
                        </button>
                    </div>

                    {/* 右側帳戶餘額/庫存資訊 */}
                    <div className="col-span-5 text-[10px] font-bold text-right flex flex-col justify-center h-[40px] pl-2 border-l border-[#2B2F36]/50 leading-tight">
                        <div className="text-white font-mono truncate">可用: {availableBalance.toLocaleString()}</div>
                        <div className="text-[#848E9C] font-mono truncate">
                            庫存: <span className="text-white">{myHolding.toLocaleString()}</span> 股
                        </div>
                        {myHolding > 0 && (
                            <div className="text-[9px] font-mono truncate flex items-center justify-end gap-1">
                                <span className="text-gray-400">均價: {avgCost.toFixed(1)}</span>
                                <span className="text-gray-600">|</span>
                                <span className={profitLoss >= 0 ? 'text-[#FF3B3B]' : 'text-[#00FFA3]'}>
                                    {profitLoss >= 0 ? '▲' : '▼'}{Math.abs(Math.round(profitLoss))} ({profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}%)
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 委託數量輸入列 */}
                <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-7 flex items-center bg-[#0B0E11] border border-[#2B2F36] rounded h-[40px] overflow-hidden focus-within:border-[#FF69B4] transition-colors">
                        <button 
                            type="button" 
                            onClick={handleAmountDecrement} 
                            className="w-10 h-full flex items-center justify-center text-[#848e9c] hover:bg-[#2b2f36] bg-[#181a20] transition-colors border-r border-[#2B2F36] text-lg font-bold select-none"
                        >
                            -
                        </button>
                        <div className="flex-1 relative flex items-center justify-center">
                            <input 
                                type="number" 
                                value={amount || ""}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                placeholder="1" 
                                className="bg-transparent text-center font-mono text-sm font-bold text-white outline-none w-full px-2 placeholder-[#848E9C]" 
                            />
                        </div>
                        <button 
                            type="button" 
                            onClick={handleAmountIncrement} 
                            className="w-10 h-full flex items-center justify-center text-[#848e9c] hover:bg-[#2b2f36] bg-[#181a20] transition-colors border-l border-[#2B2F36] text-lg font-bold select-none"
                        >
                            +
                        </button>
                    </div>

                    {/* 右側單位與預估價金 */}
                    <div className="col-span-5 text-[10px] font-bold text-right flex flex-col justify-center h-[40px] pl-2 border-l border-[#2B2F36]/50">
                        <div className="text-white mb-0.5">1單位：1股</div>
                        <div className="text-[#FFD700] truncate">預估價金：</div>
                        <div className="text-[#FFD700] font-mono truncate">{estimatedTotal.toLocaleString()} $TEE</div>
                    </div>
                </div>

                {/* 快捷操作貼齊五檔上緣 */}
                <div className="flex items-center gap-2.5 font-bold text-[10px] px-1 select-none mt-2 pb-0.5">
                    <button 
                        type="button"
                        onClick={() => {
                            const price = orderPrice || pair.price;
                            if (price > 0) {
                                setAmount(Math.floor(availableBalance / price));
                            }
                        }}
                        className="text-[#FF3B3B] hover:underline cursor-pointer focus:outline-none bg-transparent border-0 p-0"
                    >
                        全額買進
                    </button>
                    <span className="text-gray-600">|</span>
                    <button 
                        type="button"
                        onClick={() => setAmount(myHolding)}
                        className="text-[#00FFA3] hover:underline cursor-pointer focus:outline-none bg-transparent border-0 p-0"
                    >
                        全股賣出
                    </button>
                </div>

                {/* 五檔買賣盤 (放到下面) */}
                <div className="border border-[#2B2F36] rounded overflow-hidden bg-[#0B0E11]/40 text-sm select-none">
                    <div className="grid grid-cols-4 border-b border-[#2B2F36]/50 bg-[#1E2329]/40 text-[10px] text-[#848E9C] font-bold py-1.5 px-3">
                        <div className="text-right pr-2">買量</div>
                        <div className="text-center">買價</div>
                        <div className="text-center">賣價</div>
                        <div className="text-left pl-2">賣量</div>
                    </div>
                    <div className="divide-y divide-[#2B2F36]/20">
                        {[0, 1, 2, 3, 4].map(i => {
                            const bid = paddedBids[i];
                            const ask = paddedAsks[i];
                            
                            const hasBid = bid && bid.price > 0;
                            const hasAsk = ask && ask.price > 0;

                            const bidDiff = bid.price - refPrice;
                            const bidColor = bidDiff > 0 
                                ? 'text-[#FF3B3B]' 
                                : bidDiff < 0 
                                    ? 'text-[#00FFA3]' 
                                    : 'text-white';

                            const askDiff = ask.price - refPrice;
                            const askColor = askDiff > 0 
                                ? 'text-[#FF3B3B]' 
                                : askDiff < 0 
                                    ? 'text-[#00FFA3]' 
                                    : 'text-white';

                            // Bid styling logic
                            const isBidCurrent = hasBid && bid.price === pair.price;
                            const isBidCeiling = hasBid && bid.price === ceiling;
                            const isBidFloor = hasBid && bid.price === floor;
                            const isBidSelected = hasBid && orderPrice === bid.price;

                            let bidBgBorderClass = '';
                            let bidTextClass = bidColor;
                            if (isBidCeiling || isBidFloor) {
                                const bgColor = isBidCeiling ? 'bg-red-600' : 'bg-green-600';
                                const borderColor = isBidCurrent ? 'border-white' : (isBidCeiling ? 'border-red-600' : 'border-green-600');
                                bidBgBorderClass = `${bgColor} border ${borderColor}`;
                                bidTextClass = 'text-white font-bold';
                            } else if (isBidCurrent) {
                                bidBgBorderClass = 'border border-white bg-transparent';
                                bidTextClass = 'text-white';
                            } else if (isBidSelected) {
                                bidBgBorderClass = 'border border-[#FFD700] bg-[#FFD700]/10 shadow-[0_0_8px_rgba(255,215,0,0.2)]';
                            } else {
                                bidBgBorderClass = 'border border-transparent hover:bg-[#2B3139]';
                            }

                            // Ask styling logic
                            const isAskCurrent = hasAsk && ask.price === pair.price;
                            const isAskCeiling = hasAsk && ask.price === ceiling;
                            const isAskFloor = hasAsk && ask.price === floor;
                            const isAskSelected = hasAsk && orderPrice === ask.price;

                            let askBgBorderClass = '';
                            let askTextClass = askColor;
                            if (isAskCeiling || isAskFloor) {
                                const bgColor = isAskCeiling ? 'bg-red-600' : 'bg-green-600';
                                const borderColor = isAskCurrent ? 'border-white' : (isAskCeiling ? 'border-red-600' : 'border-green-600');
                                askBgBorderClass = `${bgColor} border ${borderColor}`;
                                askTextClass = 'text-white font-bold';
                            } else if (isAskCurrent) {
                                askBgBorderClass = 'border border-white bg-transparent';
                                askTextClass = 'text-white';
                            } else if (isAskSelected) {
                                askBgBorderClass = 'border border-[#FFD700] bg-[#FFD700]/10 shadow-[0_0_8px_rgba(255,215,0,0.2)]';
                            } else {
                                askBgBorderClass = 'border border-transparent hover:bg-[#2B3139]';
                            }

                            return (
                                <div key={`five-tier-${i}`} className="grid grid-cols-4 items-center h-10 px-3 font-bold font-mono text-xs">
                                    <div className="text-right text-[#EAECEF] pr-2 truncate">
                                        {hasBid ? bid.amount.toLocaleString() : '--'}
                                    </div>
                                    
                                    <div 
                                        onClick={() => hasBid && setOrderPrice(bid.price)}
                                        className={`text-center py-1 cursor-pointer transition-all rounded ${bidTextClass} ${bidBgBorderClass}`}
                                    >
                                        {hasBid ? bid.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '--'}
                                    </div>

                                    <div 
                                        onClick={() => hasAsk && setOrderPrice(ask.price)}
                                        className={`text-center py-1 cursor-pointer transition-all rounded ${askTextClass} ${askBgBorderClass}`}
                                    >
                                        {hasAsk ? ask.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '--'}
                                    </div>

                                    <div className="text-left text-[#EAECEF] pl-2 truncate">
                                        {hasAsk ? ask.amount.toLocaleString() : '--'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 比例條與總委託量 */}
                <div className="space-y-1.5">
                    <div className="w-full h-1.5 bg-[#2B2F36] rounded-full overflow-hidden flex">
                        <div 
                            className="bg-[#FF3B3B] h-full transition-all duration-500" 
                            style={{ width: `${bidRatio}%` }} 
                        />
                        <div 
                            className="bg-[#0070FF] h-full transition-all duration-500" 
                            style={{ width: `${100 - bidRatio}%` }} 
                        />
                    </div>
                    <div className="flex justify-between text-xs font-mono font-bold text-[#EAECEF]">
                        <span>{totalBidVol.toLocaleString()}</span>
                        <span>{totalAskVol.toLocaleString()}</span>
                    </div>
                </div>

                {/* 買進/賣出 按鈕 (橫跨底端) */}
                <div className="flex gap-3 mt-4 pt-4 border-t border-[#2B2F36]/50">
                    <button 
                        onClick={() => handleAction('buy')} 
                        disabled={isSubmitting}
                        className={`flex-1 font-black h-12 rounded shadow-lg transition-all text-base flex items-center justify-center ${isSubmitting ? 'bg-[#FF3B3B]/50 cursor-not-allowed' : 'bg-[#FF3B3B] hover:bg-[#ff5252] active:scale-[0.98] cursor-pointer'} text-white`}
                    >
                        {isSubmitting ? (
                            <><span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />處理中...</>
                        ) : '現股買進'}
                    </button>
                    <button 
                        onClick={() => handleAction('sell')} 
                        disabled={isSubmitting}
                        className={`flex-1 font-black h-12 rounded shadow-lg transition-all text-base flex items-center justify-center ${isSubmitting ? 'bg-[#00B074]/50 cursor-not-allowed' : 'bg-[#00B074] hover:bg-[#00c985] active:scale-[0.98] cursor-pointer'} text-white`}
                    >
                        {isSubmitting ? (
                            <><span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />處理中...</>
                        ) : '現股賣出'}
                    </button>
                </div>
                
                <p className="text-[9px] text-[#474D57] text-center leading-relaxed mt-4 pt-2 border-t border-[#2B2F36]/10">
                    提醒：本交易所為 VTuber 虛擬市場，所有交易皆為 $TEE 虛擬代幣。投資一定有風險，貼貼組合有漲有跌，申購前應詳閱成員互動。
                </p>
            </div>
        </div>
    );
});

OrderPanel.displayName = 'OrderPanel';
export default OrderPanel;
