"use client";

import { INITIAL_PAIRS } from '@/app/constants/market';
import { teeteePair, UserHolding, ChartDataPoint } from '@/app/types';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface TeeContextType{
    balance: number;
    holdings: UserHolding[];
    marketData: teeteePair[];
    buyPair: (pairId: string, amount: number, price: number) => boolean;
    sellPair: (pairId: string, amount: number, price: number) => boolean;
    simulateMarketMove: () => void;
    reportInteraction: (pairId: string, type: 'sharedLive' | 'collab' | 'xMention') => void;
}

const TeeContext = createContext<TeeContextType | undefined>(undefined);

// 輔助函數：生成模擬歷史數據
const generateInitialHistory = (basePrice: number): ChartDataPoint[] => {
    const history: ChartDataPoint[] = [];
    let lastClose = basePrice;
    const now = new Date();

    for (let i = 20; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const open = lastClose;
        const volatility = (Math.random() * 0.04) - 0.02;
        const close = Math.round(open * (1 + volatility));
        const high = Math.max(open, close) + Math.round(Math.random() * 2);
        const low = Math.min(open, close) - Math.round(Math.random() * 2);
        
        history.push({ time, open, high, low, close });
        lastClose = close;
    }
    return history;
};

export function TeeProvider({ children } : { children: React.ReactNode}) {
    const [balance, setBalance] = useState(10000);
    const [holdings, setHoldings] = useState<UserHolding[]>([]);
    const [marketData, setMarketData] = useState<teeteePair[]>(INITIAL_PAIRS);
    const [isInitialized, setIsInitialized] = useState(false);
    const [mounted, setMounted] = useState(false);

    // 初次載入: 處理掛載與 LocalStorage
    useEffect(() => {
        setMounted(true);
        const saveBalance = localStorage.getItem('tee_balance');
        const saveHoldings = localStorage.getItem('tee_holdings');
        const savedMarket =  localStorage.getItem('tee_market');

        if (saveBalance) setBalance(Number(saveBalance));
        if (saveHoldings) setHoldings(JSON.parse(saveHoldings));
        
        if (savedMarket) {
            try {
                const parsedMarket = JSON.parse(savedMarket);
                if (Array.isArray(parsedMarket) && parsedMarket.length === INITIAL_PAIRS.length) {
                    // 確保每一項都有 history，防止舊版本資料導致報錯
                    const dataWithHistory = parsedMarket.map((p, i) => ({
                        ...INITIAL_PAIRS[i], // 使用最新結構
                        ...p,
                        history: p.history && Array.isArray(p.history) ? p.history : generateInitialHistory(p.price || 100)
                    }));
                    setMarketData(dataWithHistory);
                } else {
                    setMarketData(INITIAL_PAIRS.map(p => ({ ...p, history: generateInitialHistory(p.price) })));
                }
            } catch (e) {
                console.error("Failed to parse market data", e);
                setMarketData(INITIAL_PAIRS.map(p => ({ ...p, history: generateInitialHistory(p.price) })));
            }
        } else {
            setMarketData(INITIAL_PAIRS.map(p => ({ ...p, history: generateInitialHistory(p.price) })));
        }
        
        setIsInitialized(true);
    }, []);

    // 當資料變動時，同步到 LocalStorage
    useEffect(() => {
        if (!isInitialized || !mounted) return;
        localStorage.setItem('tee_balance', balance.toString());
        localStorage.setItem('tee_holdings', JSON.stringify(holdings));
        localStorage.setItem('tee_market', JSON.stringify(marketData));
    }, [balance, holdings, marketData, isInitialized, mounted]);

    // 買入邏輯
    const buyPair = (pairId: string, amount: number, price: number) => {
        const totalCost = amount * price;
        if (balance < totalCost) return false;

        setBalance(prev => prev - totalCost);
        setHoldings(prev => {
            const existing = prev.find(h => h.pairId ===pairId);
            if (existing) {
                const totalShares = existing.shares + amount;
                const newAvgCost = ((existing.shares * existing.avgCost) + (amount * price)) / totalShares;
                return prev.map(h => h.pairId === pairId ? { ...h, shares: totalShares, avgCost: newAvgCost } : h);
            }
            return [...prev, {pairId, shares: amount, avgCost: price }];
        });
        return true;
    };

    // 賣出邏輯
    const sellPair = (pairId: string, amount: number, price: number) => {
        const existing = holdings.find(h => h.pairId === pairId);
        if (!existing || existing.shares < amount) return false;

        const totalReturn = amount * price;
        setBalance(prev => prev + totalReturn);
        setHoldings(prev => {
            const newHoldings = prev.map(h => {
                if (h.pairId === pairId) {
                    return { ...h, shares: h.shares - amount };
                }
                return h;
            }).filter(h => h.shares > 0);
            return newHoldings;
        });
        return true;
    };

    // 報告互動
    const reportInteraction = (pairId: string, type: 'sharedLive' | 'collab' | 'xMention') => {
        setMarketData(prev => prev.map(p => {
            if (p.id === pairId) {
                return {
                    ...p,
                    pendingInteractions: {
                        ...p.pendingInteractions,
                        [type]: p.pendingInteractions[type] + 1
                    }
                };
            }
            return p;
        }));
    };

    const simulateMarketMove = () => {
        setMarketData(prevData => {
            return prevData.map(pair => {
                // 1. 淨值變動邏輯 (依據用戶公式)
                // 每周自然浮動 -5% ~ +5%
                const naturalFloat = (Math.random() * 0.1) - 0.05;
                
                // 互動產生的影響 (累加所有待處理互動)
                // 共同直播: ±10%, 多人聯動: ±5%, X提及: ±1%
                let interactionImpact = 0;
                for (let i = 0; i < pair.pendingInteractions.sharedLive; i++) {
                    interactionImpact += (Math.random() * 0.2) - 0.1;
                }
                for (let i = 0; i < pair.pendingInteractions.collab; i++) {
                    interactionImpact += (Math.random() * 0.1) - 0.05;
                }
                for (let i = 0; i < pair.pendingInteractions.xMention; i++) {
                    interactionImpact += (Math.random() * 0.02) - 0.01;
                }

                // 更新淨值
                const newNV = pair.netValue * (1 + naturalFloat + interactionImpact);
                
                // 2. 股價隨自由市場變動 (以淨值為中心，但在一個範圍內自由浮動)
                // 這裡模擬市場情緒：股價通常在淨值的 90% ~ 110% 之間
                const marketSentiment = 0.9 + (Math.random() * 0.2);
                const newPrice = Math.round(newNV * marketSentiment);
                
                const change = Number(((newPrice - pair.price) / pair.price * 100).toFixed(2));

                // 更新歷史記錄
                const newTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const lastPoint = pair.history[pair.history.length - 1];
                const newPoint: ChartDataPoint = {
                    time: newTime,
                    open: lastPoint ? lastPoint.close : pair.price,
                    high: Math.max(pair.price, newPrice) + Math.round(Math.random() * 2),
                    low: Math.min(pair.price, newPrice) - Math.round(Math.random() * 2),
                    close: newPrice
                };

                const newHistory = [...pair.history.slice(-19), newPoint];

                return {
                    ...pair,
                    netValue: Number(newNV.toFixed(2)),
                    price: newPrice,
                    change24h: change,
                    history: newHistory,
                    // 結算後清空待處理互動
                    pendingInteractions: { sharedLive: 0, collab: 0, xMention: 0 }
                };
            });
        });
    };


    return (
        <TeeContext.Provider value={{ balance, holdings, marketData, buyPair, sellPair, simulateMarketMove, reportInteraction }}>
            {children}
        </TeeContext.Provider>
    );
}

export const useTee =() => {
    const context = useContext(TeeContext);
    if (!context) throw new Error("useTee must be used within TeeProvider");
    return context
};
