"use client"

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { teeteePair } from "@/app/types";
import { useTee } from "@/context/TeeContext";
import { useAuth } from "@/context/AuthContext";
import { getTeeTeeNews } from "./actions";
import TickerTape from "@/components/TickerTape";
import { alignToTick, getTickSize } from "@/utils/validatePrice";
import BottomNav from "@/components/BottomNav";

import ChartSection from "./components/ChartSection";
import OrderPanel from "./components/OrderPanel";
import OrderHistoryPanel from "./components/OrderHistoryPanel";
import TradeTickerPanel from "./components/TradeTickerPanel";
import NewsReportSection from "./components/NewsReportSection";
import NotificationBanner, { NotificationType, BannerNotification } from "./components/NotificationBanner";

const PAIR_ID_MAP: Record<string, string> = {
  'micomet': 'MCMT',
  'okakoro': 'OKKR',
  'pekomarin': 'PKMR',
  'noefure': 'NEFL',
  'soraz': 'SRAZ',
  'fubumio': 'FBMO',
  'shishiwata': 'SSWT',
  'subaruna': 'SBRN',
  'aziro': 'AZIR',
  'pekovivi': 'PKVV',
  'takamori': 'TKMR',
  'baerys': 'BARS'
};

export default function MarketDetailClient({ id }: { id: string }) {
    const { user } = useAuth();
    const currentUserId = user?.id || 'default_player';
    const { balance, availableBalance, submitOrder, holdings, marketData, orders, reportInteraction, cancelOrder, marketStatus, submitTeeteeReport, getOrderBook, isSubmitting, isCancelling } = useTee();
    const [amount, setAmount] = useState<number>(0);
    const [orderPrice, setOrderPrice] = useState<number>(0);
    const [lastSeenPrice, setLastSeenPrice] = useState<number>(0);
    const [activeTab, setActiveTab] = useState<'time' | 'k' | 'detail'>('time');
    const [chartRange, setChartRange] = useState<'1D' | '1W' | '1M' | '6M' | 'YTD' | '1Y' | '5Y'>('1D');
    const [klinePeriod, setKlinePeriod] = useState<'1m' | '5m' | '1D' | '1W' | '1M'>('1m');
    const [isAdjustedKline, setIsAdjustedKline] = useState<boolean>(false);
    const [dividends, setDividends] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loadingChart, setLoadingChart] = useState(false);
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
        if (pair) {
            setReportTargetId(pair.id);
            setChartRange('1D');
            setKlinePeriod('1m');
            setChartData([]);
            setDividends([]);
            setOrderPrice(pair.openingPrice ?? 100);
        }
    }, [pair?.id]);

    useEffect(() => {
        if (!pair) return;
        
        if (activeTab === 'time') {
            if (chartRange === '1D') {
                setLoadingChart(false);
                return;
            }
            setLoadingChart(true);
            fetch(`/api/charts/kline?id=${pair.id}&range=${chartRange}`)
                .then(res => res.json())
                .then(resData => {
                    if (resData.success && resData.data) {
                        setChartData(resData.data);
                        if (resData.dividends) setDividends(resData.dividends);
                    }
                })
                .catch(err => console.error("Error loading chart data:", err))
                .finally(() => setLoadingChart(false));
        } else if (activeTab === 'k') {
            setLoadingChart(true);
            fetch(`/api/charts/kline?id=${pair.id}&period=${klinePeriod}`)
                .then(res => res.json())
                .then(resData => {
                    if (resData.success && resData.data) {
                        setChartData(resData.data);
                        if (resData.dividends) setDividends(resData.dividends);
                    }
                })
                .catch(err => console.error("Error loading chart data:", err))
                .finally(() => setLoadingChart(false));
        }
    }, [pair?.id, pair?.price, activeTab, chartRange, klinePeriod]);

    const rawDisplayData = activeTab === 'time' && chartRange === '1D'
        ? (pair?.history || [])
        : chartData;

    const displayData = useMemo(() => {
        if (!isAdjustedKline || !dividends.length || activeTab !== 'k') {
            return rawDisplayData;
        }

        return rawDisplayData.map(pt => {
            const ptTime = pt.rawTimestamp ? new Date(pt.rawTimestamp).getTime() : 0;
            const addBack = dividends
                .filter(d => d.timestamp > ptTime)
                .reduce((sum, d) => sum + (d.dividendPerShare || 0), 0);

            if (addBack <= 0) return pt;

            return {
                ...pt,
                open: parseFloat(Math.max(0.1, pt.open - addBack).toFixed(2)),
                high: parseFloat(Math.max(0.1, pt.high - addBack).toFixed(2)),
                low: parseFloat(Math.max(0.1, pt.low - addBack).toFixed(2)),
                close: parseFloat(Math.max(0.1, pt.close - addBack).toFixed(2)),
            };
        });
    }, [rawDisplayData, isAdjustedKline, dividends, activeTab]); 

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
                        addNotification('match_deal', oldOrder.price, oldOrder.amount);
                    }
                } else if (newOrder.amount < oldOrder.amount) {
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

    if(!pair){
        return(
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
                <h1 className="text-2xl text-[#FF3B3B] mb-4 font-black">找不到該交易對</h1>
                <Link href="/" className="text-[#848E9C] hover:text-white transition-colors border-b border-dotted">返回交易大廳</Link>
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
    const totalHolding = holdingInfo?.shares || 0;
    const pendingSellVolume = (orders || [])
        .filter(o => (o.isUser || !o.botId) && o.pairId.toLowerCase() === pair.id.toLowerCase() && (o.type === 'sell' || (o as any).side === 'SELL'))
        .reduce((sum, o) => sum + o.amount, 0);
    const availableShares = Math.max(0, totalHolding - pendingSellVolume);
    const myHolding = availableShares;
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

    const totalBidVol = paddedBids.reduce((acc, b) => acc + (b?.amount || 0), 0);
    const totalAskVol = paddedAsks.reduce((acc, a) => acc + (a?.amount || 0), 0);
    const bidRatio = totalBidVol + totalAskVol > 0 ? (totalBidVol / (totalBidVol + totalAskVol)) * 100 : 50;

    const profitLoss = (pair.price - avgCost) * totalHolding;
    const profitPercentage = avgCost > 0 ? ((pair.price - avgCost) / avgCost) * 100 : 0;
    const estimatedTotal = amount * (orderPrice || pair.price);

    const handleAction = async (type: 'buy' | 'sell') => {
        if (marketStatus !== 'OPEN' && marketStatus !== 'PRE_MARKET') {
            addNotification('failed', 0, 0, "交易所目前處於非營運時段，開盤時間為週二至週日 19:00 - 24:00 (18:45 開放盤前掛單)。");
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

    const amplitude = yesterdayPrice > 0 ? ((highVal - lowVal) / yesterdayPrice) * 100 : 0;

    const todayTrades = pair.recentTrades || [];
    const totalTradeVol = todayTrades.reduce((sum, t) => sum + t.amount, 0);
    const totalTradeVal = todayTrades.reduce((sum, t) => sum + (t.price * t.amount), 0);
    const avgPrice = totalTradeVol > 0 ? (totalTradeVal / totalTradeVol) : null;

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
                <div className="max-w-[1600px] w-full mx-auto mb-3 flex justify-end items-center border-b border-[#2B2F36]/60 pb-1.5">
                    <div className="text-[10px] text-[#848E9C] font-mono">
                        MARKET: {marketStatus === 'OPEN' ? <span className="text-[#00FFA3]">OPEN</span> : <span className="text-[#FF3B3B]">CLOSED</span>}
                    </div>
                </div>

                {marketStatus !== 'OPEN' && marketStatus !== 'PRE_MARKET' && marketStatus !== 'MAINTENANCE' && (
                    <div className="max-w-[1600px] w-full mx-auto mb-6 bg-red-500/20 text-red-500 text-center py-2 text-sm font-bold animate-pulse rounded border border-red-500/50">
                        ⚠️ 交易所目前處於非營運時段，開盤時間為週二至週日 19:00 - 24:00 (18:45 開放盤前掛單)。 ⚠️
                    </div>
                )}

                <div className="max-w-[1600px] w-full mx-auto space-y-4">
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
                                    <div className={volumeContainerClass}>
                                        <span className="leading-none">成交量</span>
                                        <span className="leading-none mt-1">{pair.todayVolume.toLocaleString()}</span>
                                    </div>

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

                    <ChartSection 
                        pair={pair}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        chartRange={chartRange}
                        setChartRange={setChartRange}
                        klinePeriod={klinePeriod}
                        setKlinePeriod={setKlinePeriod}
                        isAdjustedKline={isAdjustedKline}
                        setIsAdjustedKline={setIsAdjustedKline}
                        displayData={displayData}
                        loadingChart={loadingChart}
                        yesterdayPrice={yesterdayPrice}
                        ceiling={ceiling}
                        floor={floor}
                        highVal={highVal}
                        lowVal={lowVal}
                        amplitude={amplitude}
                        avgPrice={avgPrice}
                        getCompareColor={getCompareColor}
                    />

                    <OrderPanel 
                        pair={pair}
                        paddedBids={paddedBids}
                        paddedAsks={paddedAsks}
                        maxQty={maxQty}
                        bidRatio={bidRatio}
                        totalBidVol={totalBidVol}
                        totalAskVol={totalAskVol}
                        orderPrice={orderPrice}
                        setOrderPrice={setOrderPrice}
                        amount={amount}
                        setAmount={setAmount}
                        handleIncrement={handleIncrement}
                        handleDecrement={handleDecrement}
                        handleAmountIncrement={handleAmountIncrement}
                        handleAmountDecrement={handleAmountDecrement}
                        handleAction={handleAction}
                        balance={balance}
                        availableBalance={availableBalance}
                        myHolding={myHolding}
                        totalHolding={totalHolding}
                        avgCost={avgCost}
                        profitLoss={profitLoss}
                        profitPercentage={profitPercentage}
                        estimatedTotal={estimatedTotal}
                        ceiling={ceiling}
                        floor={floor}
                        refPrice={refPrice}
                        isSubmitting={isSubmitting}
                        marketStatus={marketStatus}
                    />

                    <OrderHistoryPanel 
                        pair={pair}
                        orders={orders}
                        cancelOrder={cancelOrder}
                        isCancelling={isCancelling}
                        currentUserId={currentUserId}
                        cancelledOrderIdsRef={cancelledOrderIdsRef}
                        addNotification={addNotification}
                        orderSubTab={orderSubTab}
                        setOrderSubTab={setOrderSubTab}
                    />

                    <TradeTickerPanel 
                        pair={pair}
                        refPrice={refPrice}
                        ceiling={ceiling}
                        floor={floor}
                    />

                    <NewsReportSection 
                        pair={pair}
                        newsList={newsList}
                        reportTargetId={reportTargetId}
                        setReportTargetId={setReportTargetId}
                        reportUrl={reportUrl}
                        setReportUrl={setReportUrl}
                        reportErrorMsg={reportErrorMsg}
                        reportSuccessMsg={reportSuccessMsg}
                        handleReportSubmit={handleReportSubmit}
                        marketData={marketData}
                        pairIdMap={PAIR_ID_MAP}
                    />

                </div>
            </main>
            
            <NotificationBanner 
                notifications={notifications}
                removeNotification={removeNotification}
                pairId={pair.id}
                pairIdMap={PAIR_ID_MAP}
            />

            <BottomNav />
        </div>
    );
}
