// src/types/index.ts

// CP組合的定義
export interface Teeteepair {
    id: string;
    name: string;
    members: string[];
    currentPrice: number;   // 當前市場價格
    netValue: number;       // 本週結算後的淨值
    change24h: number;      // 24小時漲跌
}

// 用戶持股紀錄
export interface UserHolding{
    pairId: string;
    shares: number;         // 當前持有股數
    avgCost: number;        // 平均買入成本
}

// 稱號與結算相關
export interface SettlementData{
    pairId: string;
    snapshortTime: string;  // 上次週五 18:00 時間戳
    ranking: {
        userId: string;
        userName: string;
        shareAtSnapshot: number;    //  結算時持股
        title: '董事長' | '董事' | '股東';
    }[];
}

// 全域用戶狀態
export interface UserProfile{
    id: string;
    name: string;
    balanceT: number;       // 目前擁有T幣
    holdings: UserHolding[];
    // 紀錄目前的稱號，每周一9:00更新
    currentTitles: {
        pairId: string;
        title: string;
    }[];
}