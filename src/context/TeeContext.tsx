"use client";

import { INITIAL_PAIRS } from '@/app/constants/market';
import { teeteePair, UserHolding, ChartDataPoint, Order } from '@/app/types';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { isValidTickSize, getTickSize, alignToTick } from '@/utils/validatePrice';
import { isPreMarketPeriod, isOperatingPeriod } from '@/utils/marketHours';


export interface OrderBook {
    bids: { price: number, amount: number }[];
    asks: { price: number, amount: number }[];
}

interface TeeContextType {
    balance: number;
    holdings: UserHolding[];
    marketData: teeteePair[];
    orders: Order[];
    marketStatus: 'CLOSED' | 'PRE_MARKET' | 'OPEN' | 'SETTLING' | 'MAINTENANCE' | 'CLOSED_SETTLED';
    isSubmitting: boolean;
    isCancelling: boolean;
    getOrderBook: (pairId: string) => OrderBook;
    submitOrder: (pairId: string, type: 'buy' | 'sell', amount: number, price: number) => Promise<{ success: boolean, message?: string }>;
    cancelOrder: (orderId: string) => Promise<{ success: boolean, message?: string }>;
    simulateMarketMove: () => void;
    reportInteraction: (pairId: string, type: 'liveCollab' | 'largeEvent' | 'newSong') => void;
    executeWeeklySettlement: () => void;
    submitTeeteeReport: (pairId: string, type: string, url: string) => void;
    refreshPlayerState: () => Promise<void>;
}

const TeeContext = createContext<TeeContextType | undefined>(undefined);

// 輔助函數：生成模擬歷史數據
// 輔助函數：補全歷史數據到 360 筆以保證圖表飽滿且不崩潰
const padHistory = (dbHistory: ChartDataPoint[], basePrice: number): ChartDataPoint[] => {
    const requiredPoints = 300;
    if (dbHistory.length >= requiredPoints) {
        return dbHistory;
    }
    
    const padded: ChartDataPoint[] = [];
    const pointsToGen = requiredPoints - dbHistory.length;
    
    // 以最早的真實數據價格為基底往回推算，若無真實數據則以當前價格為基底
    const firstRealPrice = dbHistory.length > 0 ? dbHistory[0].open : basePrice;
    let lastClose = firstRealPrice;
    
    for (let i = pointsToGen; i > 0; i--) {
        let h = 19;
        let m = 0;
        
        if (dbHistory.length > 0 && dbHistory[0].time) {
            const parts = dbHistory[0].time.split(':');
            let rh = parseInt(parts[0], 10);
            if (isNaN(rh)) rh = 19;
            let rm = parseInt(parts[1], 10);
            if (isNaN(rm)) rm = 0;
            
            let totalMin = rh * 60 + rm - i;
            if (totalMin < 0) {
                totalMin += 24 * 60;
            }
            h = Math.floor(totalMin / 60) % 24;
            m = totalMin % 60;
        } else {
            // 若完全沒有歷史，就從 19:00 開始依序生成
            const totalMin = 19 * 60 + (pointsToGen - i);
            h = Math.floor(totalMin / 60) % 24;
            m = totalMin % 60;
        }
        
        const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        const open = lastClose;
        const close = open;
        const high = open;
        const low = open;
        const volume = 0;
        
        padded.push({ time, open, high, low, close, volume });
        lastClose = close;
    }
    
    return [...padded, ...dbHistory];
};

export interface Bot {
    id: string;
    name: string;
    balance: number;
    holdings: { [pairId: string]: number };
}

const _INITIAL_BOTS: Bot[] = [
    { id: 'bot_1', name: '大戶A', balance: 10000, holdings: {} },
    { id: 'bot_2', name: '外資B', balance: 10000, holdings: {} },
    { id: 'bot_3', name: '散戶C', balance: 10000, holdings: {} },
    { id: 'bot_4', name: '自營商D', balance: 10000, holdings: {} },
    { id: 'bot_5', name: '投信E', balance: 10000, holdings: {} },
];

export function TeeProvider({ children } : { children: React.ReactNode}) {
    const [balance, setBalance] = useState(10000);
    const [holdings, setHoldings] = useState<UserHolding[]>([]);
    const [marketData, setMarketData] = useState<teeteePair[]>(INITIAL_PAIRS);
    const [orders, setOrders] = useState<Order[]>([]);
    const [bots, setBots] = useState<Bot[]>([]);
    
    const [marketStatus, setMarketStatus] = useState<'CLOSED' | 'PRE_MARKET' | 'OPEN' | 'SETTLING' | 'MAINTENANCE' | 'CLOSED_SETTLED'>('CLOSED');
    const [isInitialized, setIsInitialized] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    // 同步後端行情與玩家狀態
    const fetchLatestMarketAndPlayer = async () => {
        try {
            // 1. 同步行情與訂單
            const marketRes = await fetch('/api/market');
            if (marketRes.ok) {
                const data = await marketRes.json();
                if (data.success) {
                    if (data.marketStatus) {
                        setMarketStatus(data.marketStatus);
                    }
                    if (Array.isArray(data.pairs)) {
                        const mergedMarket = data.pairs.map((p: any) => {
                            const initialPair = INITIAL_PAIRS.find(x => x.id === p.id) || INITIAL_PAIRS[0];
                            return {
                                ...initialPair,
                                ...p,
                                yesterdayPrice: p.openingPrice,
                                history: padHistory(p.history || [], p.openingPrice || p.price)
                            };
                        });
                        setMarketData(mergedMarket);
                        localStorage.setItem('tee_market', JSON.stringify(mergedMarket));
                    }
                    if (Array.isArray(data.orders)) {
                        setOrders(data.orders);
                        localStorage.setItem('tee_orders', JSON.stringify(data.orders));
                    }
                }
            }

            // 2. 同步玩家資產
            const playerRes = await fetch('/api/player');
            if (playerRes.ok) {
                const data = await playerRes.json();
                if (data && data.player) {
                    setBalance(data.player.balance);
                    setHoldings(data.player.holdings);
                    localStorage.setItem('tee_balance', data.player.balance.toString());
                    localStorage.setItem('tee_holdings', JSON.stringify(data.player.holdings));
                    localStorage.setItem('tee_last_db_balance', data.player.balance.toString());
                }
            }
        } catch (err) {
            console.error("Error fetching latest market and player data:", err);
        }
    };

    // 每週除息與結算功能 (呼叫後端 API 進行結算，並單向同步最新玩家餘額與庫存)
    const executeWeeklySettlement = async () => {
        setMarketStatus('SETTLING');
        
        try {
            // ── 1. 撤銷所有委託單 (退還資金/股票到本地) ──
            let newBalance = balance;
            const newHoldings = [...holdings];
            const nextBots = [...bots];

            orders.forEach(order => {
                if (order.isUser) {
                    if (order.type === 'buy') {
                        newBalance += order.price * order.amount;
                    } else {
                        const existingIdx = newHoldings.findIndex(h => h.pairId === order.pairId);
                        if (existingIdx >= 0) {
                            newHoldings[existingIdx] = { 
                                ...newHoldings[existingIdx], 
                                shares: newHoldings[existingIdx].shares + order.amount 
                            };
                        } else {
                            newHoldings.push({ pairId: order.pairId, shares: order.amount, avgCost: order.price });
                        }
                    }
                } else if (order.botId) {
                    const botIdx = nextBots.findIndex(x => x.id === order.botId);
                    if (botIdx >= 0) {
                        if (order.type === 'buy') {
                            nextBots[botIdx].balance += order.price * order.amount;
                        } else {
                            nextBots[botIdx].holdings[order.pairId] = (nextBots[botIdx].holdings[order.pairId] || 0) + order.amount;
                        }
                    }
                }
            });

            // ── 2. 先將完全退還委託後的玩家資料同步到後端 ──
            await fetch('/api/player', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ balance: newBalance, holdings: newHoldings })
            });

            // ── 3. 呼叫後端結算 API ──
            const res = await fetch('/api/cron/settle', { method: 'POST' });
            if (!res.ok) throw new Error('Settlement API failed');
            const data = await res.json();
            
            if (!data.success || !data.results) throw new Error('Invalid settlement response');

            // ── 4. 向後端 GET 拉取結算與分紅後的最新正確餘額與持股 ──
            const playerRes = await fetch('/api/player');
            if (!playerRes.ok) throw new Error('Failed to fetch player data after settlement');
            const playerData = await playerRes.json();
            
            let finalBalance = newBalance;
            let finalHoldings = newHoldings;
            if (playerData && playerData.player) {
                finalBalance = playerData.player.balance;
                finalHoldings = playerData.player.holdings;
                localStorage.setItem('tee_last_db_balance', finalBalance.toString());
            }

            // ── 5. 套用結算結果到市場資料與機器人模擬 ──
            const _delistedIds = new Set<string>(data.delistedPairs || []);

            const updatedMarket = marketData.map(pair => {
                const settlementResult = data.results.find((r: any) => r.pairId === pair.id);
                if (!settlementResult) return pair;

                const { newPrice, statusAfter, wasDelisted } = settlementResult;

                // 計算機器人股利與清算
                if (wasDelisted) {
                    // 清算：退回持股以 newPrice (估算值) 買回
                    nextBots.forEach(bot => {
                        if (bot.holdings[pair.id] && bot.holdings[pair.id] > 0) {
                            bot.balance += bot.holdings[pair.id] * newPrice;
                            delete bot.holdings[pair.id];
                        }
                    });
                } else {
                    const estDividend = Math.max(0, pair.price - newPrice);
                    nextBots.forEach(bot => {
                        if (bot.holdings[pair.id] && bot.holdings[pair.id] > 0) {
                            bot.balance += bot.holdings[pair.id] * estDividend;
                        }
                    });
                }

                // 更新 K 線，製造除息缺口 (跳空開盤)
                const exactTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const newHistory = [...pair.history];
                newHistory.push({
                    time: exactTime,
                    open: newPrice,
                    high: newPrice,
                    low: newPrice,
                    close: newPrice,
                    volume: 0
                });
                if (newHistory.length > 360) newHistory.shift();
                
                const dividendPerShare = Math.max(0, pair.price - newPrice);

                return {
                    ...pair,
                    price: newPrice,
                    status: statusAfter as 'NORMAL' | 'WARNING' | 'DELISTED',
                    warningWeeks: statusAfter === 'WARNING' ? (pair.warningWeeks || 0) + 1 : 0,
                    yesterdayPrice: newPrice,
                    teeteeNews: [],
                    history: newHistory,
                    pendingInteractions: { liveCollab: 0, largeEvent: 0, newSong: 0 }
                };
            });

            // ── 6. 更新前端狀態 ──
            setBalance(finalBalance);
            setHoldings(finalHoldings);
            setOrders([]);
            setBots(nextBots);
            setMarketData(updatedMarket);

            // ── 7. 組裝結算報告 ──
            const warningPairs = data.results.filter((r: any) => r.statusAfter === 'WARNING');
            const delistedPairs = data.results.filter((r: any) => r.wasDelisted);

            let reportMsg = `除息結算完成！\n`;
            reportMsg += `已撤銷所有委託單。\n`;
            reportMsg += `帳戶餘額已與後端安全同步。\n`;
            if (warningPairs.length > 0) {
                reportMsg += `\n⚠️ 警戒中組合：${warningPairs.map((r: any) => r.pairId).join(', ')}\n`;
            }
            if (delistedPairs.length > 0) {
                reportMsg += `\n🚫 本週下市：${delistedPairs.map((r: any) => r.pairId).join(', ')}\n`;
            }

            setTimeout(() => {
                fetchLatestMarketAndPlayer();
                alert(reportMsg);
            }, 3000);

        } catch (error) {
            console.error('Settlement error:', error);
            setTimeout(() => {
                fetchLatestMarketAndPlayer();
                alert(`結算過程發生錯誤：${error instanceof Error ? error.message : '未知錯誤'}`);
            }, 3000);
        }
    };

    // 初次載入: 處理掛載與 LocalStorage
    useEffect(() => {
        setMounted(true);
        // Init will sync with server immediately
        const saveBalance = localStorage.getItem('tee_balance');
        const saveHoldings = localStorage.getItem('tee_holdings');
        const savedMarket =  localStorage.getItem('tee_market');
        const savedOrders = localStorage.getItem('tee_orders');
        const savedBots = localStorage.getItem('tee_bots');

        if (saveBalance) setBalance(Number(saveBalance));
        try { if (saveHoldings) setHoldings(JSON.parse(saveHoldings)); } catch (_e) { console.warn('Failed to parse holdings from localStorage'); }
        try { if (savedMarket) setMarketData(JSON.parse(savedMarket)); } catch (_e) { console.warn('Failed to parse market from localStorage'); }
        try { if (savedOrders) setOrders(JSON.parse(savedOrders)); } catch (_e) { console.warn('Failed to parse orders from localStorage'); }
        try { if (savedBots) setBots(JSON.parse(savedBots)); } catch (_e) { console.warn('Failed to parse bots from localStorage'); }

        fetchLatestMarketAndPlayer().then(() => {
            setIsInitialized(true);
        });
    }, []);

    // 當資料變動時，同步到 LocalStorage
    useEffect(() => {
        if (!isInitialized || !mounted) return;
        localStorage.setItem('tee_balance', balance.toString());
        localStorage.setItem('tee_holdings', JSON.stringify(holdings));
        localStorage.setItem('tee_market', JSON.stringify(marketData));
        localStorage.setItem('tee_orders', JSON.stringify(orders));
        localStorage.setItem('tee_bots', JSON.stringify(bots));
    }, [balance, holdings, marketData, orders, bots, isInitialized, mounted]);

    // 取得即時五檔盤口
    const getOrderBook = (pairId: string): OrderBook => {
        const pairOrders = orders.filter(o => o.pairId === pairId);
        
        const bidsMap = new Map<number, number>();
        const asksMap = new Map<number, number>();
        
        pairOrders.forEach(o => {
            if (o.type === 'buy') bidsMap.set(o.price, (bidsMap.get(o.price) || 0) + o.amount);
            else asksMap.set(o.price, (asksMap.get(o.price) || 0) + o.amount);
        });

        const bids = Array.from(bidsMap.entries())
            .map(([price, amount]) => ({ price, amount }))
            .sort((a, b) => b.price - a.price)
            .slice(0, 5);
            
        const asks = Array.from(asksMap.entries())
            .map(([price, amount]) => ({ price, amount }))
            .sort((a, b) => a.price - b.price)
            .slice(0, 5);

        return { bids, asks };
    };

    // 提交委託單 (向後端資料庫送出訂單，等待確認後才更新 UI)
    const submitOrder = async (pairId: string, type: 'buy' | 'sell', amount: number, price: number): Promise<{ success: boolean, message?: string }> => {
        if (marketStatus === 'CLOSED' || marketStatus === 'SETTLING' || marketStatus === 'CLOSED_SETTLED') {
            return { success: false, message: `交易所目前處於非營運清算狀態 (${marketStatus})，拒絕任何掛單寫入。` };
        }
        if (marketStatus === 'MAINTENANCE') {
            return { success: false, message: "系統維護中，全面禁止任何交易操作。" };
        }
        if (isSubmitting) {
            return { success: false, message: "委託處理中，請稍候..." };
        }
        if (amount <= 0 || price <= 0) return { success: false, message: "無效的數量或價格" };

        // 台股 Tick Size 跳動單位檢查
        if (!isValidTickSize(price)) {
            const tick = getTickSize(price);
            return { success: false, message: `委託價不符合 Tick Size (此級距最小跳動為 ${tick} 元)` };
        }

        const pair = marketData.find(p => p.id === pairId);
        if (!pair) return { success: false, message: "找不到該交易對" };

        const refPrice = pair.yesterdayPrice ?? pair.price;
        const ceiling = alignToTick(refPrice * 1.20);
        const floor = alignToTick(refPrice * 0.80);

        if (price > ceiling || price < floor) {
            return { success: false, message: "委託價格超出今日漲跌停限制區間。" };
        }

        // 本地預先檢查，避免無意義請求
        if (type === 'buy') {
            const totalCost = amount * price;
            if (balance < totalCost) return { success: false, message: "餘額不足" };
        } else {
            const existing = holdings.find(h => h.pairId === pairId);
            if (!existing || existing.shares < amount) return { success: false, message: "庫存不足" };
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/orders/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pairId,
                    side: type.toUpperCase(),
                    price,
                    volume: amount,
                    userId: 'default_player'
                })
            });
            const data = await res.json();

            if (!res.ok) {
                return { success: false, message: data.error || '委託失敗' };
            }

            // 成功：從 DB 同步最新狀態（餘額、庫存、訂單、行情）
            await fetchLatestMarketAndPlayer();
            return { success: true, message: "委託單已送出" };
        } catch (err) {
            console.error("Order submission failed:", err);
            return { success: false, message: "網路錯誤，請稍後重試" };
        } finally {
            setIsSubmitting(false);
        }
    };

    // 取消委託單 (等待 API 確認後才更新 UI)
    const cancelOrder = async (orderId: string): Promise<{ success: boolean, message?: string }> => {
        if (marketStatus === 'MAINTENANCE') {
            return { success: false, message: "系統維護中，全面禁止任何撤單操作。" };
        }

        const order = orders.find(o => o.id === orderId);
        if (!order || !order.isUser) {
            return { success: false, message: '找不到該委託單' };
        }

        setIsCancelling(true);
        try {
            const res = await fetch('/api/orders/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, userId: 'default_player' })
            });

            if (res.ok) {
                // 成功：從 DB 同步最新狀態
                await fetchLatestMarketAndPlayer();
                return { success: true, message: '撤單成功' };
            } else {
                const data = await res.json();
                // 不論原因，都同步一次 DB 狀態以確保 UI 正確
                await fetchLatestMarketAndPlayer();
                if (data.error === 'Order not found') {
                    return { success: false, message: '該委託單已成交或已被撮合，無法撤銷。' };
                }
                return { success: false, message: data.error || '撤單失敗' };
            }
        } catch (err) {
            console.error('Cancel order API call failed:', err);
            await fetchLatestMarketAndPlayer();
            return { success: false, message: '網路錯誤，請稍後重試' };
        } finally {
            setIsCancelling(false);
        }
    };

    const reportInteraction = (pairId: string, type: 'liveCollab' | 'largeEvent' | 'newSong') => {
        setMarketData(prev => prev.map(p => {
            if (p.id === pairId) {
                return { ...p, pendingInteractions: { ...p.pendingInteractions, [type]: p.pendingInteractions[type] + 1 } };
            }
            return p;
        }));
    };

    // 手動觸發撮合引擎 (點擊 ⚡ 市場撮合 按鈕時)
    const simulateMarketMove = async () => {
        const open = isPreMarketPeriod() || isOperatingPeriod();
        if (!open) {
            fetchLatestMarketAndPlayer();
        }

        try {
            const res = await fetch('/api/matching', { method: 'POST' });
            if (res.ok) {
                await fetchLatestMarketAndPlayer();
            } else {
                console.error("Matching execution failed");
            }
        } catch (err) {
            console.error("Failed to trigger matching:", err);
        }
    };

    // 每 3 秒自動向後台同步最新行情與玩家資產
    useEffect(() => {
        if (!isInitialized) return;
        const intervalId = setInterval(() => {
            fetchLatestMarketAndPlayer();
        }, 3000);
        return () => clearInterval(intervalId);
    }, [isInitialized]);

    const submitTeeteeReport = (pairId: string, type: string, url: string) => {
        const dateStr = new Date().toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });
        const cleanType = type === 'x_mention' ? 'X 提及' : '直播聯動';
        const displayUrl = url.length > 45 ? `${url.substring(0, 45)}...` : url;
        const content = `使用者回報：${cleanType}，連結：${displayUrl}`;

        const newItem = {
            id: `usr_report_${Date.now()}`,
            type: type,
            content: content,
            link: url,
            time: dateStr
        };

        // 1. 本地立即反應以提供流暢 UI 體驗
        setMarketData(prev => prev.map(p => {
            if (p.id === pairId) {
                return {
                    ...p,
                    teeteeNews: [newItem, ...(p.teeteeNews || [])]
                };
            }
            return p;
        }));

        // 2. 非同步向後端發送回報資料存入 SQLite 資料庫 (進入 Pending 待審核狀態)
        fetch('/api/events/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pairId,
                url: url,
                userId: 'default_player',
                type: type
            })
        }).catch(err => {
            console.error('Error submitting report to events report api:', err);
        });
    };

    return (
        <TeeContext.Provider value={{ balance, holdings, marketData, orders, marketStatus, isSubmitting, isCancelling, getOrderBook, submitOrder, cancelOrder, simulateMarketMove, reportInteraction, executeWeeklySettlement, submitTeeteeReport, refreshPlayerState: fetchLatestMarketAndPlayer }}>
            {children}
        </TeeContext.Provider>
    );
}

export const useTee =() => {
    const context = useContext(TeeContext);
    if (!context) throw new Error("useTee must be used within TeeProvider");
    return context;
};
