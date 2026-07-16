"use client"

import { useState, useEffect, useRef } from "react";
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
    const { balance, submitOrder, holdings, marketData, orders, reportInteraction, cancelOrder, marketStatus, submitTeeteeReport, getOrderBook, isSubmitting, isCancelling } = useTee();
    const [amount, setAmount] = useState<number>(0);
    const [orderPrice, setOrderPrice] = useState<number>(0);
    const [lastSeenPrice, setLastSeenPrice] = useState<number>(0);
    const [activeTab, setActiveTab] = useState<'time' | 'k'>('k');
    const [orderSubTab, setOrderSubTab] = useState<'pending' | 'trades'>('pending');
    const [newsList, setNewsList] = useState<any[]>([]);

    const [reportTargetId, setReportTargetId] = useState<string>('');
    const [reportUrl, setReportUrl] = useState('');
    const [reportErrorMsg, setReportErrorMsg] = useState('');
    const [reportSuccessMsg, setReportSuccessMsg] = useState('');

    const pair: teeteePair | undefined = marketData.find(
        p => p.id.toLowerCase() === id.toLowerCase() || PAIR_ID_MAP[p.id.toLowerCase()] === id
    ); 

    useEffect(() => {
        if (pair && !reportTargetId) {
            setReportTargetId(pair.id);
        }
    }, [pair, reportTargetId]); 

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

    type NotificationType = 'buy_submit' | 'sell_submit' | 'match_deal' | 'failed';
    interface BannerNotification {
        id: string;
        type: NotificationType;
        price: number;
        amount: number;
        message?: string;
        isFading: boolean;
    }

    const [notifications, setNotifications] = useState<BannerNotification[]>([]);
    const prevOrdersRef = useRef<any[]>([]);
    const cancelledOrderIdsRef = useRef<Set<string>>(new Set());

    const addNotification = (type: NotificationType, price: number, amount: number, message?: string) => {
        const notifId = Math.random().toString(36).substring(2, 9);
        const newNotif: BannerNotification = {
            id: notifId,
            type,
            price,
            amount,
            message,
            isFading: false
        };
        setNotifications(prev => [...prev, newNotif]);

        setTimeout(() => {
            setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isFading: true } : n));
        }, 4500);

        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notifId));
        }, 5000);
    };

    const removeNotification = (notifId: string) => {
        setNotifications(prev => prev.filter(n => n.id !== notifId));
    };

    // Auto-detect filled orders (成交) from order book changes
    useEffect(() => {
        if (!pair) return;
        if (!orders) {
            prevOrdersRef.current = [];
            return;
        }
        if (prevOrdersRef.current && prevOrdersRef.current.length > 0) {
            const prevUserOrders = prevOrdersRef.current.filter((o: any) => o.isUser && o.pairId === pair.id);
            const currentUserOrders = orders.filter((o: any) => o.isUser && o.pairId === pair.id);

            prevUserOrders.forEach((oldOrder: any) => {
                const newOrder = currentUserOrders.find((o: any) => o.id === oldOrder.id);
                if (!newOrder) {
                    if (cancelledOrderIdsRef.current.has(oldOrder.id)) {
                        cancelledOrderIdsRef.current.delete(oldOrder.id);
                    } else {
                        // Fully filled!
                        addNotification('match_deal', oldOrder.price, oldOrder.amount);
                    }
                } else if (newOrder.amount < oldOrder.amount) {
                    // Partially filled
                    const filledVol = oldOrder.amount - newOrder.amount;
                    addNotification('match_deal', oldOrder.price, filledVol);
                }
            });
        }
        prevOrdersRef.current = orders;
    }, [orders, pair?.id]);

    useEffect(() => {
        getTeeTeeNews(id).then(data => setNewsList(data));
    }, [id]);

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
    const handleAmountDecrement = () => {
        setAmount(Math.max(0, amount - 1));
    };
    const handleAmountIncrement = () => {
        setAmount(amount + 1);
    };

    // Calculate total bid/ask volume and ratio
    const totalBidVol = paddedBids.reduce((acc, b) => acc + (b?.amount || 0), 0);
    const totalAskVol = paddedAsks.reduce((acc, a) => acc + (a?.amount || 0), 0);
    const bidRatio = totalBidVol + totalAskVol > 0 ? (totalBidVol / (totalBidVol + totalAskVol)) * 100 : 50;

    const profitLoss = (pair.price - avgCost) * myHolding;
    const profitPercentage = avgCost > 0 ? ((pair.price - avgCost) / avgCost) * 100 : 0;
    const estimatedTotal = amount * (orderPrice || pair.price);

    const handleAction = async (type: 'buy' | 'sell') => {
        if (marketStatus === 'CLOSED') {
            addNotification('failed', 0, 0, "交易所目前處於非營運時段，開盤時間為 18:00 - 24:00。");
            return;
        }
        if (amount <= 0 || orderPrice <= 0) {
            addNotification('failed', 0, 0, "請輸入數量與價格");
            return;
        }
        
        const checkRefPrice = pair.openingPrice ?? pair.yesterdayPrice ?? pair.price;
        const checkCeiling = alignToTick(checkRefPrice * 1.20);
        const checkFloor = alignToTick(checkRefPrice * 0.80);
        if (orderPrice > checkCeiling || orderPrice < checkFloor) {
            addNotification('failed', orderPrice, amount, `委託價格 ${orderPrice} 超出今日漲跌停限制區間 [${checkFloor.toFixed(2)} ~ ${checkCeiling.toFixed(2)}]`);
            return;
        }

        const res = await submitOrder(pair.id, type, amount, orderPrice);
        if (res.success) {
            addNotification(type === 'buy' ? 'buy_submit' : 'sell_submit', orderPrice, amount);
            setAmount(0);
        } else {
            addNotification('failed', orderPrice, amount, res.message || "委託失敗");
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

        submitTeeteeReport(reportTargetId || pair.id, 'live_collab', reportUrl);
        setReportUrl("");
        setReportSuccessMsg("回報成功！已送往後台審查，感謝您的奉獻！");
        setTimeout(() => setReportSuccessMsg(""), 4000);
    };

    const isUp = pair.change24h >= 0;
    const priceDiff = pair.price - (pair.yesterdayPrice || pair.price);

    // Calculate today's high and low prices from history points
    const historyPoints = pair.history || [];
    const validKBarPoints = historyPoints.filter(pt => pt !== null);
    const firstTradeIdx = validKBarPoints.findIndex(pt => pt.volume > 0);
    const todayPoints = firstTradeIdx >= 0 ? validKBarPoints.slice(firstTradeIdx) : [];
    
    const openVal = todayPoints.length > 0 ? todayPoints[0].open : (pair.openingPrice ?? pair.price);
    const closeVal = pair.price;
    const highs = todayPoints.map(pt => pt.high);
    const lows = todayPoints.map(pt => pt.low);
    const highVal = highs.length > 0 ? Math.max(...highs, openVal, closeVal) : Math.max(openVal, closeVal);
    const lowVal = lows.length > 0 ? Math.min(...lows, openVal, closeVal) : Math.min(openVal, closeVal);

    const yesterdayPrice = pair.yesterdayPrice || pair.price;

    // Amplitude: (最高 - 最低) / 昨收 * 100
    const amplitude = yesterdayPrice > 0 ? ((highVal - lowVal) / yesterdayPrice) * 100 : 0;

    // Average Price (VWAP) calculation
    const todayTrades = pair.recentTrades || [];
    const totalTradeVol = todayTrades.reduce((sum, t) => sum + t.amount, 0);
    const totalTradeVal = todayTrades.reduce((sum, t) => sum + (t.price * t.amount), 0);
    const avgPrice = totalTradeVol > 0 ? (totalTradeVal / totalTradeVol) : null;

    // Helpers to compare against yesterday's close price
    const getCompareColor = (val: number | null | undefined) => {
        if (val === null || val === undefined) return 'text-gray-400';
        if (val > yesterdayPrice) return 'text-[#FF3B3B]'; // Red
        if (val < yesterdayPrice) return 'text-[#00FFA3]'; // Green
        return 'text-white';
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col pb-20">
            <TickerTape />
            <main className="flex-1 text-[#EAECEF] pt-2 px-4 pb-4 md:pt-3 md:px-6 md:pb-6 font-sans">
            {/* 頂部導覽 */}
            <div className="max-w-[1600px] w-full mx-auto mb-3 flex justify-end items-center border-b border-[#2B2F36]/60 pb-1.5">
                <div className="text-[10px] text-[#848E9C] font-mono">
                    MARKET: {marketStatus === 'OPEN' ? <span className="text-[#00FFA3]">OPEN</span> : <span className="text-[#FF3B3B]">CLOSED</span>}
                </div>
            </div>

            {marketStatus === 'CLOSED' && (
                <div className="max-w-[1600px] w-full mx-auto mb-6 bg-red-500/20 text-red-500 text-center py-2 text-sm font-bold animate-pulse rounded border border-red-500/50">
                    ⚠️ 交易所目前處於非營運時段，開盤時間為 19:00 - 24:00。 ⚠️
                </div>
            )}

            <div className="max-w-[1600px] w-full mx-auto space-y-4">
                    {/* 標題卡片 - 仿看盤軟體頂部 */}
                    <div className="sticky top-0 z-30 bg-[#181A20]/95 backdrop-blur-sm border border-[#2B2F36] p-5 rounded flex flex-row items-center justify-between gap-4 shadow-xl">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 whitespace-nowrap">
                                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tighter truncate">{pair.name}</h1>
                                    <span className="bg-[#2B2F36] text-[#848E9C] text-[10px] px-2 py-0.5 rounded flex-shrink-0">{pair.id.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                        {(() => {
                            const isLimitUp = pair.price >= ceiling;
                            const isLimitDown = pair.price <= floor;
                            const isLimitState = isLimitUp || isLimitDown;

                            let volumeContainerClass = "text-right whitespace-nowrap flex flex-col items-end justify-center font-mono text-[#FFD700] text-xs sm:text-sm font-bold py-2.5";

                            let containerClass = "text-right whitespace-nowrap flex-shrink-0 flex flex-col items-end justify-center py-2.5 transition-all";
                            if (isLimitState) {
                                const bgColor = isLimitUp ? "bg-red-600" : "bg-green-600";
                                containerClass += ` ${bgColor} text-white px-4 rounded-lg shadow-lg`;
                            }

                            let priceClass = "font-mono font-black leading-none text-3xl sm:text-4xl";
                            if (!isLimitState) {
                                priceClass += isUp ? " text-[#FF3B3B]" : " text-[#00FFA3]";
                            }

                            let changeClass = "font-mono font-bold flex items-center justify-end gap-1.5 leading-none mt-1 text-xs sm:text-sm";
                            if (!isLimitState) {
                                changeClass += isUp ? " text-[#FF3B3B]" : " text-[#00FFA3]";
                            }

                            return (
                                <div className="flex items-center gap-5 flex-shrink-0 select-none">
                                    {/* 成交量區 */}
                                    <div className={volumeContainerClass}>
                                        <span className="leading-none">成交量</span>
                                        <span className="leading-none mt-1">{pair.todayVolume.toLocaleString()}</span>
                                    </div>

                                    {/* 價格與漲跌區 */}
                                    <div className={containerClass}>
                                        <p className={priceClass}>
                                            {pair.price.toFixed(2)}
                                        </p>
                                        <p className={changeClass}>
                                            <span>{isUp ? '▲' : '▼'} {Math.abs(priceDiff).toFixed(2)}</span>
                                            <span>({isUp ? '+' : ''}{pair.change24h.toFixed(2)}%)</span>
                                        </p>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* 盤面即時統計數據欄 */}
                    <div className="bg-[#181A20] border border-[#2B2F36] p-4 rounded grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4 text-xs font-mono select-none">
                        <div>
                            <span className="text-[#848E9C] block text-[9px] font-bold mb-1">開盤</span>
                            <span className={`font-bold text-sm ${getCompareColor(pair.todayOpenPrice)}`}>
                                {pair.todayOpenPrice ? pair.todayOpenPrice.toFixed(2) : '未成交'}
                            </span>
                        </div>
                        <div>
                            <span className="text-[#848E9C] block text-[9px] font-bold mb-1">昨收</span>
                            <span className="text-white font-bold text-sm">{yesterdayPrice.toFixed(2)}</span>
                        </div>
                        <div>
                            <span className="text-[#848E9C] block text-[9px] font-bold mb-1">最高</span>
                            <span className={`font-bold text-sm ${getCompareColor(highVal)}`}>
                                {highVal.toFixed(2)}
                            </span>
                        </div>
                        <div>
                            <span className="text-[#848E9C] block text-[9px] font-bold mb-1">最低</span>
                            <span className={`font-bold text-sm ${getCompareColor(lowVal)}`}>
                                {lowVal.toFixed(2)}
                            </span>
                        </div>
                        <div>
                            <span className="text-[#848E9C] block text-[9px] font-bold mb-1">漲停</span>
                            <span className="text-white font-bold text-sm">{ceiling.toFixed(2)}</span>
                        </div>
                        <div>
                            <span className="text-[#848E9C] block text-[9px] font-bold mb-1">跌停</span>
                            <span className="text-white font-bold text-sm">{floor.toFixed(2)}</span>
                        </div>
                        <div>
                            <span className="text-[#848E9C] block text-[9px] font-bold mb-1">振幅</span>
                            <span className="text-white font-bold text-sm">{amplitude.toFixed(2)}%</span>
                        </div>
                        <div>
                            <span className="text-[#848E9C] block text-[9px] font-bold mb-1">均價</span>
                            <span className={`${avgPrice ? 'text-white' : 'text-gray-400'} font-bold text-sm`}>
                                {avgPrice ? avgPrice.toFixed(2) : '未成交'}
                            </span>
                        </div>
                    </div>



                    {/* 圖表區 */}
                    <div className="bg-[#181A20] border border-[#2B2F36] rounded h-96 flex flex-col overflow-hidden">
                        <div className="border-b border-[#2B2F36] p-3 flex gap-4 text-[10px] font-bold bg-[#1E2329]">
                            <span 
                                onClick={() => setActiveTab('time')}
                                className={`pb-1 cursor-pointer transition-colors ${activeTab === 'time' ? 'text-[#FF69B4] border-b border-[#FF69B4]' : 'text-[#848E9C] hover:text-white'}`}
                            >
                                分時圖
                            </span>
                            <span 
                                onClick={() => setActiveTab('k')}
                                className={`pb-1 cursor-pointer transition-colors ${activeTab === 'k' ? 'text-[#FF69B4] border-b border-[#FF69B4]' : 'text-[#848E9C] hover:text-white'}`}
                            >
                                K線圖
                            </span>
                        </div>
                        <div className="flex-1 p-2 overflow-hidden">
                            {activeTab === 'k' && <CandlestickChart data={pair.history} yesterdayPrice={pair.yesterdayPrice} />}
                            {activeTab === 'time' && (
                                <CandlestickChart data={pair.history} isTimeChart={true} yesterdayPrice={pair.yesterdayPrice} /> 
                            )}
                        </div>
                    </div>

                    {/* 買賣及五檔配置 (置於K線圖下方) */}
                    <div className="bg-[#181A20] border border-[#2B2F36] rounded overflow-hidden select-none shadow-2xl">
                        {/* 頂部快捷按鈕列 (僅保留現價/漲停/跌停) */}
                        <div className="grid grid-cols-3 border-b border-[#2B2F36] select-none text-xs font-bold bg-[#1E2329]/40">
                            <button
                                type="button"
                                onClick={() => setOrderPrice(pair.price)}
                                className="py-2.5 text-center text-[#EAECEF] border-r border-[#2B2F36] hover:bg-[#383f49] hover:text-white transition-all active:scale-95 bg-[#2B3139]"
                            >
                                現價
                            </button>
                            <button
                                type="button"
                                onClick={() => setOrderPrice(ceiling)}
                                className="py-2.5 text-center text-[#FF3B3B] border-r border-[#2B2F36] hover:bg-[#383f49] transition-all active:scale-95 bg-[#2B3139]"
                            >
                                漲停
                            </button>
                            <button
                                type="button"
                                onClick={() => setOrderPrice(floor)}
                                className="py-2.5 text-center text-[#00FFA3] hover:bg-[#383f49] transition-all active:scale-95 bg-[#2B3139]"
                            >
                                跌停
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
                                    <div className="text-white font-mono truncate">可用: {balance.toLocaleString()}</div>
                                    <div className="text-[#848E9C] font-mono truncate">
                                        庫存: <span className="text-white">{myHolding.toLocaleString()}</span> 股
                                    </div>
                                    {myHolding > 0 && (
                                        <div className="text-[9px] font-mono truncate flex items-center justify-end gap-1">
                                            <span className="text-gray-400">均價: {Math.round(avgCost)}</span>
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
                                    <div className="text-[#FFD700] font-mono truncate">${estimatedTotal.toLocaleString()}</div>
                                </div>
                            </div>

                            {/* 快捷操作貼齊五檔上緣 */}
                            <div className="flex items-center gap-2.5 font-bold text-[10px] px-1 select-none mt-2 pb-0.5">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        const price = orderPrice || pair.price;
                                        if (price > 0) {
                                            setAmount(Math.floor(balance / price));
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
                    {/* 我的交易回報 (My Order & Trade Returns) */}
                    <div className="bg-[#181A20] border border-[#2B2F36] rounded p-4 space-y-3 shadow-xl">
                        <div className="border-b border-[#2B2F36] pb-2 flex justify-between items-center">
                            <div className="flex gap-4 text-xs font-bold select-none">
                                <span 
                                    onClick={() => setOrderSubTab('pending')}
                                    className={`pb-1 cursor-pointer transition-colors ${orderSubTab === 'pending' ? 'text-[#FF69B4] border-b border-[#FF69B4]' : 'text-[#848E9C] hover:text-white'}`}
                                >
                                    委回
                                </span>
                                <span 
                                    onClick={() => setOrderSubTab('trades')}
                                    className={`pb-1 cursor-pointer transition-colors ${orderSubTab === 'trades' ? 'text-[#FF69B4] border-b border-[#FF69B4]' : 'text-[#848E9C] hover:text-white'}`}
                                >
                                    成回
                                </span>
                            </div>
                        </div>

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
                                t => t.buyerId === 'default_player' || t.sellerId === 'default_player'
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
                                                    const isBuy = t.buyerId === 'default_player';
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

                    {/* 即時成交明細 */}
                    <div className="bg-[#181A20] border border-[#2B2F36] rounded p-4 space-y-3">
                        <h3 className="text-sm font-bold text-[#FF69B4] flex items-center gap-2 border-b border-[#2B2F36] pb-2">
                            <span className="w-2 h-2 bg-[#FF69B4] rounded-full animate-pulse" /> 即時成交明細 (Recent Trades)
                        </h3>
                        <div className="overflow-x-auto overflow-y-auto max-h-[300px] custom-scrollbar">
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

                    {/* 貼貼情報 (TeeTee Intel) */}
                    <div className="bg-[#181A20] border border-[#2B2F36] rounded p-4 space-y-3 shadow-xl">
                        <div className="flex justify-between items-center mb-1">
                            <h2 className="text-sm font-bold text-[#FF69B4] flex items-center gap-2">
                                <span className="w-2 h-2 bg-[#FF69B4] rounded-full animate-pulse" /> 最新貼貼情報 (Approved Intel)
                            </h2>
                        </div>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
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

                    {/* 股民貼貼回報面板 (最下面) */}
                    <div className="bg-gradient-to-b from-[#1E2329] to-[#181A20] border border-[#2B2F36] rounded p-4 space-y-3 shadow-xl backdrop-blur-md relative overflow-hidden group/form hover:border-[#FF69B4]/30 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF69B4]/5 rounded-full blur-3xl pointer-events-none" />
                        
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#2B2F36] pb-2">
                            <span className="text-lg">✍️</span> 股民貼貼回報 (Crowdsource)
                        </h3>

                        <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
                            <div className="space-y-1">
                                <label className="text-[10px] text-[#848E9C] font-semibold">目標個股組合</label>
                                <select 
                                    value={reportTargetId}
                                    onChange={(e) => setReportTargetId(e.target.value)}
                                    className="w-full bg-[#0B0E11] border border-[#2B2F36] focus:border-[#FF69B4] rounded p-2 text-white outline-none font-mono text-[11px] transition-colors"
                                >
                                    {[...marketData]
                                        .sort((a, b) => {
                                            const codeA = PAIR_ID_MAP[a.id.toLowerCase()] || a.id.toUpperCase();
                                            const codeB = PAIR_ID_MAP[b.id.toLowerCase()] || b.id.toUpperCase();
                                            return codeA.localeCompare(codeB);
                                        })
                                        .map((p) => {
                                            const stockId = PAIR_ID_MAP[p.id.toLowerCase()] || p.id.toUpperCase();
                                            return (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} ({stockId})
                                                </option>
                                            );
                                        })}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] text-[#848E9C] font-semibold flex justify-between">
                                    <span>互動網址 (URL)</span>
                                    <span className="text-[9px] text-[#474D57]">(限 X / YouTube)</span>
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="https://youtube.com/..." 
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
        </main>
        
        {/* 頂部通知橫幅容器 */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[90%] max-w-[450px] pointer-events-none">
            {notifications.map((notif) => {
                const stockId = PAIR_ID_MAP[pair.id.toLowerCase()] || pair.id.toUpperCase();
                let bgClass = "";
                let labelClass = "";
                let textClass = "";
                let label = "";
                let detailText = "";

                if (notif.type === 'buy_submit') {
                    // 委託買進：精美半透明紅底配亮紅字與純白成交細節
                    bgClass = "bg-[#FF3B3B]/10 border border-[#FF3B3B]/40 backdrop-blur-md shadow-lg shadow-red-950/20";
                    labelClass = "text-[#FF8B8B]";
                    textClass = "text-white";
                    label = "買進 委託成功";
                    detailText = `[${stockId}] ${notif.amount}股 ${notif.price.toFixed(2)}$TEE`;
                } else if (notif.type === 'sell_submit') {
                    // 委託賣出：精美半透明綠底配亮綠字與純白成交細節
                    bgClass = "bg-[#00FFA3]/10 border border-[#00FFA3]/40 backdrop-blur-md shadow-lg shadow-green-950/20";
                    labelClass = "text-[#00FFA3]";
                    textClass = "text-white";
                    label = "賣出 委託成功";
                    detailText = `[${stockId}] ${notif.amount}股 ${notif.price.toFixed(2)}$TEE`;
                } else if (notif.type === 'match_deal') {
                    // 成交：精美半透明黃底配亮黃字與純白成交細節
                    bgClass = "bg-[#FFD700]/15 border border-[#FFD700]/40 backdrop-blur-md shadow-lg shadow-yellow-950/20";
                    labelClass = "text-[#FFE57F]";
                    textClass = "text-white";
                    label = "成交";
                    detailText = `[${stockId}] ${notif.amount}股 ${notif.price.toFixed(2)}$TEE`;
                } else if (notif.type === 'failed') {
                    // 失敗：半透明暗紅底配淡紅字
                    bgClass = "bg-[#3A1414]/90 border border-red-500/40 backdrop-blur-md shadow-lg shadow-red-950/40";
                    labelClass = "text-[#FF8B8B]";
                    textClass = "text-[#FFEAEA]";
                    label = "操作失敗";
                    detailText = notif.message || "";
                }

                return (
                    <div
                        key={notif.id}
                        onClick={() => removeNotification(notif.id)}
                        className={`pointer-events-auto cursor-pointer rounded-lg p-3.5 shadow-xl flex items-center justify-between gap-6 select-none transition-all duration-500 ${
                            notif.isFading ? 'opacity-0 scale-95 -translate-y-2' : 'opacity-100 scale-100'
                        } ${bgClass}`}
                    >
                        <div className="flex flex-col gap-0.5">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${labelClass}`}>{label}</span>
                            <span className={`text-sm font-black font-mono leading-none ${textClass}`}>{detailText}</span>
                        </div>
                        <span className="text-xs text-white opacity-40 hover:opacity-100 transition-opacity">✕</span>
                    </div>
                );
            })}
        </div>

        <BottomNav />
        </div>
    );
}
