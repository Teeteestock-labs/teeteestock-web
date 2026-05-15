"use client"

import { use, useState } from "react";
import Link from "next/link";
import { teeteePair } from "@/app/types";
import { useTee } from "@/context/TeeContext";
import CandlestickChart from "@/components/CandlestickChart";

export default function MarketDetail({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParms = use(params);
    const { balance, buyPair, sellPair, holdings, marketData, reportInteraction } = useTee();
    const [amount, setAmount] = useState<number>(0);
    const [isBuy, setIsBuy] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<'time' | 'k' | 'detail'>('k');

    const pair: teeteePair | undefined = marketData.find(p => p.id === resolvedParms.id); 

    if(!pair){
        return(
            <div className="min-h-screen bg-[#0B0E11] text-white flex flex-col items-center justify-center">
                <h1 className="text-2xl text-[#FF3B3B] mb-4 font-black">找不到該交易對</h1>
                <Link href="/" className="text-[#848E9C] hover:text-white transition-colors border-b border-dotted">返回交易所大廳</Link>
            </div>
        );
    }
 
    const holdingInfo = holdings.find(h => h.pairId === pair.id);
    const myHolding = holdingInfo?.shares || 0;
    const avgCost = holdingInfo?.avgCost || 0;

    const profitLoss = (pair.price - avgCost) * myHolding;
    const profitPercentage = avgCost > 0 ? ((pair.price - avgCost) / avgCost) * 100 : 0;
    const estimatedTotal = amount * pair.price;

    const handleAction = () => {
        if (amount <= 0) return alert("請輸入數量");
        
        if (isBuy) {
            const success = buyPair(pair.id, amount, pair.price);
            if (success){
                alert(`[委託成功] 買進 ${amount} 股 ${pair.name}`);
                setAmount(0);
            } else {
                alert("餘額不足!");
            }
        } else {
            const success = sellPair(pair.id, amount, pair.price);
            if (success) {
                alert(`[委託成功] 賣出 ${amount} 股 ${pair.name}`);
                setAmount(0);
            } else {
                alert("持股不足!");
            }
        }
    }

    const handleInteraction = (type: 'sharedLive' | 'collab' | 'xMention') => {
        reportInteraction(pair.id, type);
    }

    const isUp = pair.change24h >= 0;

    return (
        <main className="min-h-screen bg-[#0B0E11] text-[#EAECEF] p-4 md:p-6 font-sans">
            {/* 頂部導覽 */}
            <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center border-b border-[#2B2F36] pb-4">
                <Link href="/" className="text-[#848E9C] hover:text-white transition-colors text-xs flex items-center gap-2">
                    <span className="text-lg">«</span> 返回報價列表
                </Link>
                <div className="text-[10px] text-[#848E9C] font-mono flex items-center gap-4">
                    <div>MARKET: <span className="text-[#00FFA3]">OPEN</span></div>
                    <div>NET VALUE: <span className="text-[#FF69B4] font-bold">{pair.netValue.toLocaleString()}</span></div>
                    <div className="text-[10px] text-gray-600">SERVER: <span className="text-[#FF69B4]">T01-TW</span></div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* 左側: 個股報價區 */}
                <div className="lg:col-span-8 space-y-4">
                    {/* 標題卡片 - 仿看盤軟體頂部 */}
                    <div className="bg-[#181A20] border border-[#2B2F36] p-5 rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                <div className="w-14 h-14 rounded-full ring-2 ring-[#0B0E11] bg-gradient-to-tr from-[#FF69B4] to-[#7000FF]" />
                                <div className="w-14 h-14 rounded-full ring-2 ring-[#0B0E11] bg-gradient-to-tr from-[#00FFA3] to-[#0070FF]" />                                
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-3xl font-black text-white tracking-tighter">{pair.name}</h1>
                                    <span className="bg-[#2B2F36] text-[#848E9C] text-[10px] px-2 py-0.5 rounded">{pair.id.toUpperCase()}</span>
                                </div>
                                <p className="text-[#848E9C] text-sm mt-1">{pair.members.join(' × ')}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`text-4xl font-mono font-black ${isUp ? 'text-[#FF3B3B]' : 'text-[#00FFA3]'}`}>
                                {pair.price.toLocaleString()}
                            </p>
                            <p className={`text-sm font-bold flex items-center justify-end gap-1 ${isUp ? 'text-[#FF3B3B]' : 'text-[#00FFA3]'}`}>
                                {isUp ? '▲' : '▼'} {Math.abs(pair.change24h).toFixed(2)}%
                            </p>
                        </div>
                    </div>

                    {/* 庫存資訊卡 - 仿專業下單軟體 */}
                    <div className="bg-[#181A20] border border-[#2B2F36] rounded p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="border-r border-[#2B2F36]">
                            <p className="text-[#848E9C] text-[10px] uppercase mb-1">庫存數量</p>
                            <p className="text-lg font-mono font-bold text-[#EAECEF]">{myHolding.toLocaleString()} <span className="text-[10px] text-gray-500 font-normal">股</span></p>
                        </div>
                        <div className="border-r border-[#2B2F36] md:px-4">
                            <p className="text-[#848E9C] text-[10px] uppercase mb-1">買進均價</p>
                            <p className="text-lg font-mono font-bold text-[#EAECEF]">
                                {avgCost > 0 ? `${Math.round(avgCost).toLocaleString()}` : "-"}
                            </p>
                        </div>
                        <div className="border-r border-[#2B2F36] md:px-4">
                            <p className="text-[#848E9C] text-[10px] uppercase mb-1">庫存損益</p>
                            <p className={`text-lg font-mono font-bold ${profitLoss >= 0 ? 'text-[#FF3B3B]' : 'text-[#00FFA3]'}`}>
                                {myHolding > 0 ? `${profitLoss >= 0 ? '+' : ''}${Math.round(profitLoss).toLocaleString()}` : "-"}
                            </p>
                        </div>
                        <div className="md:px-4">
                            <p className="text-[#848E9C] text-[10px] uppercase mb-1">預估報酬</p>
                            <p className={`text-lg font-mono font-bold ${profitLoss >= 0 ? 'text-[#FF3B3B]' : 'text-[#00FFA3]'}`}>
                                {myHolding > 0 ? `${profitPercentage >= 0 ? '+' : ''}${profitPercentage.toFixed(2)}%` : "-"}
                            </p>
                        </div>
                    </div>

                    {/* 互動區 (New) */}
                    <div className="bg-[#181A20] border border-[#2B2F36] rounded p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-bold text-[#FF69B4] flex items-center gap-2">
                                <span className="w-2 h-2 bg-[#FF69B4] rounded-full animate-pulse" /> 成員互動回報 (Impact on NV)
                            </h2>
                            <div className="flex gap-3 text-[10px] font-mono text-[#848E9C]">
                                <span>直播: {pair.pendingInteractions.sharedLive}</span>
                                <span>聯動: {pair.pendingInteractions.collab}</span>
                                <span>提及: {pair.pendingInteractions.xMention}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <button 
                                onClick={() => handleInteraction('sharedLive')}
                                className="bg-[#2B3139] hover:bg-[#FF69B4]/20 border border-[#3E454D] hover:border-[#FF69B4] p-3 rounded text-left group transition-all"
                            >
                                <p className="text-xs font-bold text-white group-hover:text-[#FF69B4]">共同直播</p>
                                <p className="text-[9px] text-[#848E9C]">淨值預計變動 ±10%</p>
                            </button>
                            <button 
                                onClick={() => handleInteraction('collab')}
                                className="bg-[#2B3139] hover:bg-[#FF69B4]/20 border border-[#3E454D] hover:border-[#FF69B4] p-3 rounded text-left group transition-all"
                            >
                                <p className="text-xs font-bold text-white group-hover:text-[#FF69B4]">多人聯動</p>
                                <p className="text-[9px] text-[#848E9C]">淨值預計變動 ±5%</p>
                            </button>
                            <button 
                                onClick={() => handleInteraction('xMention')}
                                className="bg-[#2B3139] hover:bg-[#FF69B4]/20 border border-[#3E454D] hover:border-[#FF69B4] p-3 rounded text-left group transition-all"
                            >
                                <p className="text-xs font-bold text-white group-hover:text-[#FF69B4]">X 提及對方</p>
                                <p className="text-[9px] text-[#848E9C]">淨值預計變動 ±1%</p>
                            </button>
                        </div>
                    </div>

                    {/* 圖表區 */}
                    <div className="bg-[#181A20] border border-[#2B2F36] rounded h-96 flex flex-col overflow-hidden">
                        <div className="border-b border-[#2B2F36] p-3 flex gap-4 text-[10px] font-bold bg-[#1E2329]">
                            <span 
                                onClick={() => setActiveTab('time')}
                                className={`pb-1 cursor-pointer transition-colors ${activeTab === 'time' ? 'text-[#FF69B4] border-b border-[#FF69B4]' : 'text-[#848E9C] hover:text-white'}`}
                            >
                                分時圖 (模擬)
                            </span>
                            <span 
                                onClick={() => setActiveTab('k')}
                                className={`pb-1 cursor-pointer transition-colors ${activeTab === 'k' ? 'text-[#FF69B4] border-b border-[#FF69B4]' : 'text-[#848E9C] hover:text-white'}`}
                            >
                                K線圖
                            </span>
                            <span 
                                onClick={() => setActiveTab('detail')}
                                className={`pb-1 cursor-pointer transition-colors ${activeTab === 'detail' ? 'text-[#FF69B4] border-b border-[#FF69B4]' : 'text-[#848E9C] hover:text-white'}`}
                            >
                                成交明細
                            </span>
                        </div>
                        <div className="flex-1 p-2 overflow-hidden">
                            {activeTab === 'k' && <CandlestickChart data={pair.history} />}
                            {activeTab === 'time' && (
                                <div className="w-full h-full flex items-center justify-center relative">
                                    <CandlestickChart data={pair.history} /> 
                                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                                        <span className="bg-[#FF69B4] text-white text-[10px] px-2 py-1 rounded animate-pulse">即時連線中...</span>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'detail' && (
                                <div className="h-full overflow-y-auto custom-scrollbar p-2">
                                    <table className="w-full text-[10px] font-mono">
                                        <thead>
                                            <tr className="text-[#848E9C] border-b border-[#2B2F36] text-left">
                                                <th className="py-2 px-4">時間</th>
                                                <th className="py-2 px-4">成交價</th>
                                                <th className="py-2 px-4 text-right">變動</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#2B2F36]">
                                            {[...pair.history].reverse().map((h, i) => (
                                                <tr key={i} className="hover:bg-[#2B3139]">
                                                    <td className="py-2 px-4 text-[#848E9C]">{h.time}</td>
                                                    <td className={`py-2 px-4 font-bold ${h.close >= h.open ? 'text-[#FF3B3B]' : 'text-[#00FFA3]'}`}>
                                                        {h.close.toLocaleString()}
                                                    </td>
                                                    <td className={`py-2 px-4 text-right ${h.close >= h.open ? 'text-[#FF3B3B]' : 'text-[#00FFA3]'}`}>
                                                        {h.close >= h.open ? '▲' : '▼'} {Math.abs(h.close - h.open)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 右側: 交易面板 - 仿閃電下單 */}
                <div className="lg:col-span-4">
                    <div className="bg-[#181A20] border border-[#2B2F36] rounded overflow-hidden sticky top-6">
                        <div className="bg-[#1E2329] p-3 border-b border-[#2B2F36]">
                            <h2 className="text-sm font-bold flex items-center gap-2">
                                <span className="w-2 h-2 bg-[#FF69B4] rounded-full" /> 現貨委託
                            </h2>
                        </div>

                        {/* 切換買進/賣出 */}
                        <div className="flex p-2 gap-2">
                            <button 
                                onClick={() => setIsBuy(true)}
                                className={`flex-1 py-2 rounded text-xs font-bold transition-all border ${isBuy ? 'bg-[#FF3B3B]/10 border-[#FF3B3B] text-[#FF3B3B]' : 'bg-transparent border-[#2B2F36] text-[#848E9C]'}`}
                            >
                                買進
                            </button>
                            <button 
                                onClick={() => setIsBuy(false)}
                                className={`flex-1 py-2 rounded text-xs font-bold transition-all border ${!isBuy ? 'bg-[#00FFA3]/10 border-[#00FFA3] text-[#00FFA3]' : 'bg-transparent border-[#2B2F36] text-[#848E9C]'}`}
                            >
                                賣出
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div>
                                <div className="flex justify-between text-[10px] mb-1">
                                    <span className="text-[#848E9C]">{isBuy ? "可用資金" : "可賣數量"}</span>
                                    <span className="text-white font-mono">{isBuy ? `${balance.toLocaleString()} $TEE` : `${myHolding.toLocaleString()} 股`}</span>
                                </div>
                                <div className="flex justify-between gap-1">
                                    {[25, 50, 75, 100].map(pct => (
                                        <button 
                                            key={pct}
                                            onClick={() => setAmount(isBuy ? Math.floor((balance * (pct/100)) / pair.price) : Math.floor(myHolding * (pct/100)))}
                                            className="flex-1 bg-[#2B3139] hover:bg-[#3E454D] text-[10px] py-1 rounded text-[#848E9C] transition-colors"
                                        >
                                            {pct}%
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-[#0B0E11] border border-[#2B2F36] rounded p-3 flex justify-between items-center">
                                    <span className="text-[10px] text-[#848E9C] font-bold">委託價格</span>
                                    <span className="text-sm font-mono font-bold text-white">{pair.price.toLocaleString()}</span>
                                </div>

                                <div className="bg-[#0B0E11] border border-[#2B2F36] rounded p-3 flex justify-between items-center focus-within:border-[#FF69B4] transition-colors">
                                    <span className="text-[10px] text-[#848E9C] font-bold">委託數量</span>
                                    <input 
                                        type="number" 
                                        value={amount || ""}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        placeholder="0" 
                                        className="bg-transparent text-right font-mono text-sm text-white outline-none w-full ml-4" />
                                </div>
                            </div>

                            {/* 交易預覽資訊 */}
                            <div className="bg-[#1E2329] rounded p-3 space-y-2">
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-[#848E9C]">預估委託金額</span>
                                    <span className="text-white font-mono">${estimatedTotal.toLocaleString()}</span>
                                </div>
                                {!isBuy && myHolding > 0 && (
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-[#848E9C]">實現損益預估</span>
                                        <span className={`font-mono font-bold ${profitLoss >= 0 ? 'text-[#FF3B3B]' : 'text-[#00FFA3]'}`}>
                                            {profitLoss >= 0 ? '+' : ''}{Math.round(profitLoss).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleAction} 
                                className={`w-full font-black py-4 rounded shadow-lg transition-all active:scale-[0.98] ${isBuy ? 'bg-[#FF3B3B] hover:bg-[#ff5252] text-white' : 'bg-[#00FFA3] hover:bg-[#00e693] text-black'}`}
                            >
                                {isBuy ? `現股買進` : `現股賣出`}
                            </button>

                            <p className="text-[9px] text-[#474D57] text-center leading-relaxed">
                                提醒：本交易所為 VTuber 虛擬市場，所有交易皆為 $TEE 虛擬代幣。投資一定有風險，貼貼組合有漲有跌，申購前應詳閱成員互動。
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}