// src/types/index.ts

// CP組合的定義
export interface teeteePair {
    id: string;
    name: string;
    members: string[];
    price: number;   // 當前市場價格
    netValue: number;       // 當前淨值
    lastWeeklyNV: number;   // 上週結算時的淨值，用於計算週漲跌
    change24h: number;      // 24小時漲跌
    ceoTitle: string;       // 預留稱號欄位
    history: ChartDataPoint[]; // 價格歷史
    pendingInteractions: {
        sharedLive: number;     // 共同直播次數
        collab: number;         // 多人聯動次數
        xMention: number;       // X提及次數
    };
}

export interface ChartDataPoint {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
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