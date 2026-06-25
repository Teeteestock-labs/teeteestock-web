"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { teeteePair } from "@/app/types";
import { useTee } from "@/context/TeeContext";
import { getTeeTeeNews } from "./actions";
import CandlestickChart from "@/components/CandlestickChart";
import TickerTape from "@/components/TickerTape";
import { alignToTick, getTickSize } from "@/utils/validatePrice";
import BottomNav from "@/components/BottomNav";

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

export default function MarketDetailClient({ id }: { id: string }) {
    const { balance, submitOrder, holdings, marketData, orders, reportInteraction, cancelOrder, marketStatus, submitTeeteeReport, getOrderBook } = useTee();
    const [amount, setAmount] = useState<number>(0);
    const [orderPrice, setOrderPrice] = useState<number>(0);
    const [lastSeenPrice, setLastSeenPrice] = useState<number>(0);
    const [activeTab, setActiveTab] = useState<'time' | 'k' | 'orders'>('k');
    const [newsList, setNewsList] = useState<any[]>([]);

    const [reportType, setReportType] = useState<string>('live_collab');
    const [reportUrl, setReportUrl] = useState('');
    const [reportErrorMsg, setReportErrorMsg] = useState('');
    const [reportSuccessMsg, setReportSuccessMsg] = useState('');

    useEffect(() => {
        getTeeTeeNews(id).then(data => setNewsList(data));
    }, [id]);

    const pair: teeteePair | undefined = marketData.find(
        p => p.id.toLowerCase() === id.toLowerCase() || PAIR_ID_MAP[p.id.toLowerCase()] === id
    ); 

    // 當選擇的交易對價格更新時，動態帶入最新價格
    if (pair && pair.price !== lastSeenPrice) {
        setLastSeenPrice(pair.price);
        setOrderPrice(pair.price);
    }

    if(!pair){
        return(
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
                <h1 className="text-2xl text-[#FF3B3B] mb-4 font-black">找不到該交易對</h1>
                <Link href="/" className="text-[#848E9C] hover:text-white transition-colors border-b border-dotted">返回交易所大廳</Link>
            </div>
        );
    }

    const { bids, asks } = getOrderBook(pair.id);
    const paddedBids = [...bids.slice(0, 5)];
    while (paddedBids.length < 5) {
        paddedBids.push({ price: 0, amount: 0 });
    }

    const paddedAsks = [...asks.slice(0, 5)];
    while (paddedAsks.length < 5) {
        paddedAsks.push({ price: 0, amount: 0 });
    }

    const maxQty = Math.max(
        ...bids.slice(0, 5).map(b => b.amount),
        ...asks.slice(0, 5).map(a => a.amount),
        1
    );

    const holdingInfo = holdings.find(h => h.pairId === pair.id);
    const refPrice = pair.openingPrice ?? pair.yesterdayPrice ?? pair.price;
    const ceiling = alignToTick(refPrice * 1.20);
    const floor = alignToTick(refPrice * 0.80);
    const myHolding = holdingInfo?.shares || 0;
    const avgCost = holdingInfo?.avgCost || 0;

    const handleDecrement = () => {
        const tick = getTickSize(orderPrice || pair.price);
        setOrderPrice(alignToTick(Math.max(tick, (orderPrice || pair.price) - tick)));
    };
    const handleIncrement = () => {
        const tick = getTickSize(orderPrice || pair.price);
        setOrderPrice(alignToTick((orderPrice || pair.price) + tick));
    };

    const profitLoss = (pair.price - avgCost) * myHolding;
    const profitPercentage = avgCost > 0 ? ((pair.price - avgCost) / avgCost) * 100 : 0;
    const estimatedTotal = amount * (orderPrice || pair.price);

    const handleAction = (type: 'buy' | 'sell') => {
        if (marketStatus === 'CLOSED') return alert("交易所目前處於非營運時段，開盤時間為 18:00 - 24:00。");
        if (amount <= 0 || orderPrice <= 0) return alert("請輸入數量與價格");
        
        const checkRefPrice = pair.openingPrice ?? pair.yesterdayPrice ?? pair.price;
        const checkCeiling = alignToTick(checkRefPrice * 1.20);
        const checkFloor = alignToTick(checkRefPrice * 0.80);
        if (orderPrice > checkCeiling || orderPrice < checkFloor) {
            return alert(`[委託失敗] 委託價格 ${orderPrice} 超出今日漲跌停限制區間 [${checkFloor.toFixed(2)} ~ ${checkCeiling.toFixed(2)}]`);
        }

        const res = submitOrder(pair.id, type, amount, orderPrice);
        if (res.success) {
            alert(`[委託成功] ${type === 'buy' ? '買進' : '賣出'} ${amount} 股 @ ${orderPrice}\n(等待集合競價撮合)`);
            setAmount(0);
        } else {
            alert(res.message);
        }
    }

    const handleInteraction = (type: 'liveCollab' | 'largeEvent' | 'newSong') => {
        reportInteraction(pair.id, type);
    }

    const validateUrl = (urlStr: string) => {
        try {
            const url = new URL(urlStr);
            const host = url.hostname.toLowerCase();
            return (
                host.includes("x.com") || 
                host.includes("twitter.com") || 
                host.includes("youtube.com") || 
                host.includes("youtu.be")
            );
        } catch (e) {
            if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
                try {
                    const url = new URL("https://" + urlStr);
                    const host = url.hostname.toLowerCase();
                    return (
                        host.includes("x.com") || 
                        host.includes("twitter.com") || 
                        host.includes("youtube.com") || 
                        host.includes("youtu.be")
                    );
                } catch (err) {
                    return false;
                }
            }
            return false;
        }
    };

    const handleReportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setReportErrorMsg("");
        setReportSuccessMsg("");

        if (!reportUrl.trim()) {
            setReportErrorMsg("請輸入貼貼來源網址");
            return;
        }

        if (!validateUrl(reportUrl)) {
            setReportErrorMsg("網址格式錯誤！只開放 X (Twitter) 或 YouTube 連結");
            return;
        }

        submitTeeteeReport(pair.id, reportType, reportUrl);
        setReportUrl("");
        setReportSuccessMsg("回報成功！已送往後台審查，感謝您的奉獻！");
        setTimeout(() => setReportSuccessMsg(""), 4000);
    };

    const isUp = pair.change24h >= 0;

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col pb-20">
            <TickerTape />
            <main className="flex-1 text-[#EAECEF] p-4 md:p-6 font-sans">
            {/* 頂部導覽 */}
            <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center border-b border-[#2B2F36] pb-4">
                <Link href="/" className="text-[#848E9C] hover:text-white transition-colors text-xs flex items-center gap-2">
                    <span className="text-lg">«</span> 返回報價列表
                </Link>
                <div className="text-[10px] text-[#848E9C] font-mono flex items-center gap-4">
                    <div>MARKET: {marketStatus === 'OPEN' ? <span className="text-[#00FFA3]">OPEN</span> : <span className="text-[#FF3B3B]">CLOSED</span>}</div>
                    <div className="text-[10px] text-gray-600">SERVER: <span className="text-[#FF69B4]">T01-TW</span></div>
                </div>
            </div>

            {marketStatus === 'CLOSED' && (
                <div className="max-w-6xl mx-auto mb-6 bg-red-500/20 text-red-500 text-center py-2 text-sm font-bold animate-pulse rounded border border-red-500/50">
                    ⚠️ 交易所目前處於非營運時段，開盤時間為 18:00 - 24:00。 ⚠️
                </div>
            )}

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
                    <div className="bg-[#181A20] border border-[#2B2F36] rounded p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="border-b md:border-b-0 md:border-r border-[#2B2F36] pb-2 md:pb-0">
                            <p className="text-[#848E9C] text-[10px] uppercase mb-1">庫存數量</p>
                            <p className="text-lg font-mono font-bold text-[#EAECEF]">{myHolding.toLocaleString()} <span className="text-[10px] text-gray-500 font-normal">股</span></p>
                        </div>
                        <div className="border-b md:border-b-0 md:border-r border-[#2B2F36] pb-2 md:pb-0 md:px-4">
                            <p className="text-[#848E9C] text-[10px] uppercase mb-1">買進均價</p>
                            <p className="text-lg font-mono font-bold text-[#EAECEF]">
                                {avgCost > 0 ? `${Math.round(avgCost).toLocaleString()}` : "-"}
                            </p>
                        </div>
                        <div className="border-b md:border-b-0 md:border-r border-[#2B2F36] pb-2 md:pb-0 md:px-4">
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

                    {/* 貼貼情報 (TeeTee Intel) */}
                    <div className="bg-[#181A20] border border-[#2B2F36] rounded p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-bold text-[#FF69B4] flex items-center gap-2">
                                <span className="w-2 h-2 bg-[#FF69B4] rounded-full animate-pulse" /> 最新貼貼情報 (Approved Intel)
                            </h2>
                        </div>
                        <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                            {newsList.length === 0 ? (
                                <p className="text-center text-sm text-[#848E9C] py-4">目前暫無已核可的貼貼情報</p>
                            ) : (
                                newsList.map((news) => {
                                    let typeLabel = "未知";
                                    let typeColor = "text-gray-400 bg-gray-500/10 border-gray-500/30";
                                    if (news.eventType === 'x_mention') { typeLabel = 'X 提及'; typeColor = 'text-sky-400 bg-sky-500/10 border-sky-500/20'; }
                                    if (news.eventType === 'live_collab') { typeLabel = '日常連動'; typeColor = 'text-red-400 bg-red-500/10 border-red-500/20'; }
                                    if (news.eventType === 'large_event') { typeLabel = '大型/3D'; typeColor = 'text-purple-400 bg-purple-500/10 border-purple-500/20'; }
                                    if (news.eventType === 'new_song') { typeLabel = '新曲/MV'; typeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'; }
                                    if (news.eventType === 'video') { typeLabel = '影片/首播'; typeColor = 'text-purple-400 bg-purple-500/10 border-purple-500/30'; }
                                    if (news.eventType === 'crowdsourced') { typeLabel = '股民回報'; typeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30'; }
                                    if (news.eventType === 'totsumachi') { typeLabel = '突發/凸待'; typeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'; }

                                    return (
                                        <div key={news.id} className="bg-[#0B0E11] border border-[#2B2F36] p-3 rounded-lg hover:border-[#FF69B4]/50 transition-colors">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${typeColor}`}>
                                                    {typeLabel}
                                                </span>
                                                <span className="text-[10px] text-pink-400 font-bold bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                                                    聯動加成
                                                </span>
                                                <span className="text-[10px] text-[#848E9C] ml-auto">
                                                    {new Date(news.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-[#EAECEF] mb-2">{news.rawText}</p>
                                            <a href={news.url} target="_blank" rel="noreferrer" className="text-[10px] text-[#FF69B4] hover:underline flex items-center gap-1">
                                                <span>🔗 前往精華來源</span>
                                                {news.url.includes('&t=') && <span className="bg-[#FF69B4]/20 text-[#FF69B4] px-1 rounded">帶有時間戳</span>}
                                            </a>
                                        </div>
                                    )
                                })
                            )}
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
                                onClick={() => setActiveTab('orders')}
                                className={`pb-1 cursor-pointer transition-colors ${activeTab === 'orders' ? 'text-[#FF69B4] border-b border-[#FF69B4]' : 'text-[#848E9C] hover:text-white'}`}
                            >
                                委託單
                            </span>
                        </div>
                        <div className="flex-1 p-2 overflow-hidden">
                            {activeTab === 'k' && <CandlestickChart data={pair.history} yesterdayPrice={pair.yesterdayPrice} />}
                            {activeTab === 'time' && (
                                <div className="w-full h-full flex items-center justify-center relative">
                                    <CandlestickChart data={pair.history} isTimeChart={true} yesterdayPrice={pair.yesterdayPrice} /> 
                                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                                        <span className="bg-[#FF69B4] text-white text-[10px] px-2 py-1 rounded animate-pulse">即時連線中...</span>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'orders' && (() => {
                                const myOrders = orders.filter(o => o.isUser && o.pairId === pair.id);
                                return (
                                <div className="h-full overflow-y-auto custom-scrollbar p-2">
                                    <table className="w-full text-[10px] font-mono">
                                        <thead>
                                            <tr className="text-[#848E9C] border-b border-[#2B2F36] text-left">
                                                <th className="py-2 px-2">類型</th>
                                                <th className="py-2 px-2 text-right">價格</th>
                                                <th className="py-2 px-2 text-right">數量</th>
                                                <th className="py-2 px-2 text-right">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#2B2F36]">
                                            {myOrders.length === 0 ? (
                                                <tr><td colSpan={4} className="text-center py-4 text-gray-500">無未成交委託單</td></tr>
                                            ) : (
                                                myOrders.map(o => (
                                                <tr key={o.id} className="hover:bg-[#2B3139]">
                                                    <td className={`py-2 px-2 font-bold ${o.type === 'buy' ? 'text-[#FF3B3B]' : 'text-[#00FFA3]'}`}>
                                                        {o.type === 'buy' ? '買進' : '賣出'}
                                                    </td>
                                                    <td className="py-2 px-2 text-right text-white">{o.price.toLocaleString()}</td>
                                                    <td className="py-2 px-2 text-right text-white">{o.amount}</td>
                                                    <td className="py-2 px-2 text-right">
                                                        <button 
                                                            onClick={() => cancelOrder(o.id)}
                                                            className="bg-[#2B3139] hover:bg-[#FF3B3B]/20 text-[#848E9C] hover:text-[#FF3B3B] px-2 py-0.5 rounded transition-colors"
                                                        >
                                                            撤單
                                                        </button>
                                                    </td>
                                                </tr>
                                            )))}
                                        </tbody>
                                    </table>
                                </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* 五檔買賣盤 (比照台股標準) */}
                    <div className="bg-[#181A20] border border-[#2B2F36] rounded overflow-hidden">
                        <div className="bg-[#1E2329] p-3 border-b border-[#2B2F36]">
                            <h2 className="text-sm font-bold flex items-center gap-2">
                                <span className="w-2 h-2 bg-[#FF69B4] rounded-full" /> 五檔買賣盤 (Order Book)
                            </h2>
                        </div>
                        <div className="flex flex-col bg-[#181A20] select-none">
                            {/* 賣五 to 賣一 */}
                            {[4, 3, 2, 1, 0].map(i => {
                                const ask = paddedAsks[i];
                                const hasData = ask && ask.price > 0;
                                const volPercent = maxQty > 0 && ask.amount > 0 ? Math.min(100, (ask.amount / maxQty) * 100) : 0;
                                return (
                                    <div 
                                        key={`ask-${i}`} 
                                        onClick={() => hasData && setOrderPrice(ask.price)}
                                        className="grid grid-cols-3 w-full text-base font-bold py-2.5 px-4 relative overflow-hidden cursor-pointer hover:bg-[#2B3139] border-b border-[#2B2F36]/20 transition-colors items-center min-h-[44px]"
                                    >
                                        {hasData && (
                                            <div 
                                                className="absolute right-0 top-0 bottom-0 bg-[#00FFA3]/5 transition-all z-0" 
                                                style={{ width: `${volPercent}%` }} 
                                            />
                                        )}
                                        <span className="text-left text-[#848E9C] relative z-10">賣{['一', '二', '三', '四', '五'][i]}</span>
                                        <span className={`text-center font-mono relative z-10 ${hasData ? 'text-[#00FFA3]' : 'text-gray-600'}`}>
                                            {hasData ? ask.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '--'}
                                        </span>
                                        <span className="text-right font-mono text-white relative z-10">
                                            {hasData ? ask.amount.toLocaleString() : '--'}
                                        </span>
                                    </div>
                                );
                            })}

                            {/* 最新成交價平盤橫條 */}
                            {(() => {
                                const priceDiff = pair.price - refPrice;
                                const priceChangePercent = refPrice > 0 ? (priceDiff / refPrice) * 100 : 0;
                                return (
                                    <div className={`w-full py-3 px-4 border-y flex justify-between items-center text-base font-bold select-none ${
                                        priceDiff > 0 
                                            ? 'bg-[#FF3B3B]/10 border-[#FF3B3B]/20 text-[#FF3B3B]' 
                                            : priceDiff < 0 
                                                ? 'bg-[#00FFA3]/10 border-[#00FFA3]/20 text-[#00FFA3]' 
                                                : 'bg-[#1E2329] border-[#2B2F36] text-white'
                                    }`}>
                                        <span>最新成交價</span>
                                        <span className="font-mono text-lg">{pair.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        <span className="font-mono text-sm flex items-center gap-1">
                                            {priceDiff > 0 ? '▲' : priceDiff < 0 ? '▼' : ''} 
                                            {Math.abs(priceDiff).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                                            ({priceDiff > 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                                        </span>
                                    </div>
                                );
                            })()}

                            {/* 買一 to 買五 */}
                            {[0, 1, 2, 3, 4].map(i => {
                                const bid = paddedBids[i];
                                const hasData = bid && bid.price > 0;
                                const volPercent = maxQty > 0 && bid.amount > 0 ? Math.min(100, (bid.amount / maxQty) * 100) : 0;
                                return (
                                    <div 
                                        key={`bid-${i}`} 
                                        onClick={() => hasData && setOrderPrice(bid.price)}
                                        className="grid grid-cols-3 w-full text-base font-bold py-2.5 px-4 relative overflow-hidden cursor-pointer hover:bg-[#2B3139] border-b border-[#2B2F36]/20 transition-colors items-center min-h-[44px]"
                                    >
                                        {hasData && (
                                            <div 
                                                className="absolute right-0 top-0 bottom-0 bg-[#FF3B3B]/5 transition-all z-0" 
                                                style={{ width: `${volPercent}%` }} 
                                            />
                                        )}
                                        <span className="text-left text-[#848E9C] relative z-10">買{['一', '二', '三', '四', '五'][i]}</span>
                                        <span className={`text-center font-mono relative z-10 ${hasData ? 'text-[#FF3B3B]' : 'text-gray-600'}`}>
                                            {hasData ? bid.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '--'}
                                        </span>
                                        <span className="text-right font-mono text-white relative z-10">
                                            {hasData ? bid.amount.toLocaleString() : '--'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 即時成交明細 */}
                    <div className="bg-[#181A20] border border-[#2B2F36] rounded p-4 space-y-3">
                        <h3 className="text-sm font-bold text-[#FF69B4] flex items-center gap-2 border-b border-[#2B2F36] pb-2">
                            <span className="w-2 h-2 bg-[#FF69B4] rounded-full animate-pulse" /> 即時成交明細 (Recent Trades)
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-base font-mono">
                                <thead>
                                    <tr className="text-[#848E9C] border-b border-[#2B2F36] text-left">
                                        <th className="py-2 px-4 text-left">時間</th>
                                        <th className="py-2 px-4 text-center">成交價</th>
                                        <th className="py-2 px-4 text-right">數量 (股)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#2B2F36]/30">
                                    {(!pair.recentTrades || pair.recentTrades.length === 0) ? (
                                        <tr>
                                            <td colSpan={3} className="text-center py-6 text-gray-500 text-sm">
                                                尚無成交紀錄
                                            </td>
                                        </tr>
                                    ) : (
                                        pair.recentTrades.slice(0, 3).map((trade, i) => (
                                            <tr key={i} className="hover:bg-[#2B3139] transition-colors">
                                                <td className="py-2 px-4 text-left text-gray-400 text-sm">{trade.time}</td>
                                                <td className={`py-2 px-4 text-center font-bold font-mono text-base ${trade.isUp ? 'text-[#FF3B3B]' : 'text-[#00FFA3]'}`}>
                                                    {trade.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className={`py-2 px-4 text-right font-mono text-base ${trade.isUp ? 'text-[#FF3B3B]' : 'text-[#00FFA3]'}`}>
                                                    {trade.amount.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 右側: 交易面板與回報面板 (合併設定為 sticky 以便對齊瀏覽) */}
                <div className="lg:col-span-4 sticky top-6 self-start space-y-4">
                    {/* 交易面板 - 仿閃電下單 */}
                    <div className="bg-[#181A20] border border-[#2B2F36] rounded overflow-hidden">
                        <div className="bg-[#1E2329] p-3 border-b border-[#2B2F36]">
                            <h2 className="text-sm font-bold flex items-center gap-2">
                                <span className="w-2 h-2 bg-[#FF69B4] rounded-full" /> 現貨委託
                            </h2>
                        </div>

                        <div className="p-4 space-y-4">
                            <div>
                                <div className="flex justify-between text-[10px] mb-1">
                                    <span className="text-[#848E9C]">可用資金</span>
                                    <span className="text-white font-mono">{balance.toLocaleString()} $TEE</span>
                                </div>
                                <div className="flex justify-between text-[10px] mb-2">
                                    <span className="text-[#848E9C]">可賣庫存</span>
                                    <span className="text-white font-mono">{myHolding.toLocaleString()} 股</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-[#0B0E11] border border-[#2B2F36] rounded p-3 flex justify-between items-center focus-within:border-[#FF69B4] transition-colors">
                                    <span className="text-[10px] text-[#848E9C] font-bold">委託價格</span>
                                    <div className="flex items-center ml-4">
                                        <button type="button" onClick={handleDecrement} className="px-3 py-1 text-[#848e9c] hover:bg-[#2b2f36] rounded-l bg-[#181a20]">-</button>
                                        <input 
                                            type="number"
                                            value={orderPrice || ""}
                                            step={getTickSize(orderPrice || pair.price)}
                                            onChange={(e) => setOrderPrice(Number(e.target.value))}
                                            placeholder="市價" 
                                            className="bg-transparent text-center font-mono text-sm text-white outline-none w-20" />
                                        <button type="button" onClick={handleIncrement} className="px-3 py-1 text-[#848e9c] hover:bg-[#2b2f36] rounded-r bg-[#181a20]">+</button>
                                    </div>
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

                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const price = orderPrice || pair.price;
                                            if (price > 0) {
                                                setAmount(Math.floor(balance / price));
                                            }
                                        }}
                                        className="h-12 font-bold rounded bg-[#FF3B3B]/10 hover:bg-[#FF3B3B]/20 text-[#FF3B3B] border border-[#FF3B3B]/30 active:scale-95 transition-all text-sm flex items-center justify-center cursor-pointer"
                                    >
                                        買入梭哈
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setAmount(myHolding)}
                                        className="h-12 font-bold rounded bg-[#00FFA3]/10 hover:bg-[#00FFA3]/20 text-[#00FFA3] border border-[#00FFA3]/30 active:scale-95 transition-all text-sm flex items-center justify-center cursor-pointer"
                                    >
                                        賣出梭哈
                                    </button>
                                </div>
                            </div>

                            {/* 交易預覽資訊 */}
                            <div className="bg-[#1E2329] rounded p-3 space-y-2">
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-[#848E9C]">今日漲停 / 跌停限制</span>
                                    <span className="font-mono text-white">
                                        <span className="text-[#FF3B3B]">▲{ceiling.toFixed(2)}</span> / <span className="text-[#00FFA3]">▼{floor.toFixed(2)}</span>
                                    </span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-[#848E9C]">預估委託金額</span>
                                    <span className="text-white font-mono">${estimatedTotal.toLocaleString()}</span>
                                </div>
                                {myHolding > 0 && (
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-[#848E9C]">賣出損益預估 (若成交)</span>
                                        <span className={`font-mono font-bold ${profitLoss >= 0 ? 'text-[#FF3B3B]' : 'text-[#00FFA3]'}`}>
                                            {profitLoss >= 0 ? '+' : ''}{Math.round(profitLoss).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleAction('buy')} 
                                    className="flex-1 font-black h-12 rounded shadow-lg transition-all active:scale-[0.98] bg-[#FF3B3B] hover:bg-[#ff5252] text-white text-base flex items-center justify-center cursor-pointer"
                                >
                                    現股買進
                                </button>
                                <button 
                                    onClick={() => handleAction('sell')} 
                                    className="flex-1 font-black h-12 rounded shadow-lg transition-all active:scale-[0.98] bg-[#00FFA3] hover:bg-[#00e693] text-black text-base flex items-center justify-center cursor-pointer"
                                >
                                    現股賣出
                                </button>
                            </div>

                            <div className="border-t border-[#2B2F36] pt-3 mt-3">
                                <label className="text-[10px] text-[#848E9C] font-semibold block mb-2">沙盒模擬測試 (Sandbox Controls)</label>
                                <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                                    <button 
                                        onClick={() => handleInteraction('liveCollab')}
                                        className="py-1.5 bg-[#FF69B4]/10 hover:bg-[#FF69B4]/30 text-[#FF69B4] font-bold rounded border border-[#FF69B4]/30 transition-all text-center"
                                    >
                                        日常連動
                                    </button>
                                    <button 
                                        onClick={() => handleInteraction('largeEvent')}
                                        className="py-1.5 bg-[#FF69B4]/10 hover:bg-[#FF69B4]/30 text-[#FF69B4] font-bold rounded border border-[#FF69B4]/30 transition-all text-center"
                                    >
                                        大型/3D
                                    </button>
                                    <button 
                                        onClick={() => handleInteraction('newSong')}
                                        className="py-1.5 bg-[#FF69B4]/10 hover:bg-[#FF69B4]/30 text-[#FF69B4] font-bold rounded border border-[#FF69B4]/30 transition-all text-center"
                                    >
                                        新曲/MV
                                    </button>
                                </div>
                            </div>

                            <p className="text-[9px] text-[#474D57] text-center leading-relaxed">
                                提醒：本交易所為 VTuber 虛擬市場，所有交易皆為 $TEE 虛擬代幣。投資一定有風險，貼貼組合有漲有跌，申購前應詳閱成員互動。
                            </p>
                        </div>
                    </div>

                    {/* 股民貼貼回報面板 (玻璃擬態質感卡片) */}
                    <div className="bg-gradient-to-b from-[#1E2329] to-[#181A20] border border-[#2B2F36] rounded p-4 space-y-3 shadow-xl backdrop-blur-md relative overflow-hidden group/form hover:border-[#FF69B4]/30 transition-all">
                        {/* 炫光背景效果 */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF69B4]/5 rounded-full blur-3xl pointer-events-none" />
                        
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#2B2F36] pb-2">
                            <span className="text-lg">✍️</span> 股民貼貼回報 (Crowdsource)
                        </h3>

                        <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
                            <div className="space-y-1">
                                <label className="text-[10px] text-[#848E9C] font-semibold">回報項目/管道</label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    <button 
                                        type="button"
                                        onClick={() => setReportType('live_collab')}
                                        className={`py-1.5 rounded font-bold border transition-all text-center text-[10px] ${
                                            reportType === 'live_collab' 
                                                ? 'bg-[#FF69B4]/20 text-[#FF69B4] border-[#FF69B4]' 
                                                : 'bg-[#0B0E11] text-[#848E9C] border-[#2B2F36] hover:text-white'
                                        }`}
                                    >
                                        日常連動
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setReportType('large_event')}
                                        className={`py-1.5 rounded font-bold border transition-all text-center text-[10px] ${
                                            reportType === 'large_event' 
                                                ? 'bg-[#FF69B4]/20 text-[#FF69B4] border-[#FF69B4]' 
                                                : 'bg-[#0B0E11] text-[#848E9C] border-[#2B2F36] hover:text-white'
                                        }`}
                                    >
                                        大型/3D
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setReportType('new_song')}
                                        className={`py-1.5 rounded font-bold border transition-all text-center text-[10px] ${
                                            reportType === 'new_song' 
                                                ? 'bg-[#FF69B4]/20 text-[#FF69B4] border-[#FF69B4]' 
                                                : 'bg-[#0B0E11] text-[#848E9C] border-[#2B2F36] hover:text-white'
                                        }`}
                                    >
                                        新曲/MV
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] text-[#848E9C] font-semibold flex justify-between">
                                    <span>互動網址 (URL)</span>
                                    <span className="text-[9px] text-[#474D57]">(限 X / YouTube)</span>
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="https://x.com/... 或 https://youtube.com/..." 
                                    value={reportUrl}
                                    onChange={(e) => setReportUrl(e.target.value)}
                                    className="w-full bg-[#0B0E11] border border-[#2B2F36] focus:border-[#FF69B4] rounded p-2 text-white outline-none font-mono text-[11px] transition-colors"
                                />
                            </div>

                            {reportErrorMsg && (
                                <p className="text-[10px] text-[#FF3B3B] bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 p-2 rounded">
                                    ⚠️ {reportErrorMsg}
                                </p>
                            )}
                            {reportSuccessMsg && (
                                <p className="text-[10px] text-[#00FFA3] bg-[#00FFA3]/10 border border-[#00FFA3]/20 p-2 rounded">
                                    ✅ {reportSuccessMsg}
                                </p>
                            )}

                            <button 
                                type="submit"
                                className="w-full py-2.5 bg-gradient-to-r from-[#FF69B4] to-[#7000FF] hover:from-[#ff85c2] hover:to-[#8a2be2] text-white font-bold rounded shadow-lg shadow-pink-500/20 active:scale-[0.98] transition-all text-center text-xs"
                            >
                                遞交貼貼回報 (待審查)
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </main>
        <BottomNav />
        </div>
    );
}
