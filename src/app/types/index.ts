// src/types/index.ts

export interface Trade {
    time: string;
    price: number;
    amount: number;
    isUp: boolean;
}

// CP組合的定義
export interface teeteePair {
    id: string;
    name: string;
    members: string[];
    price: number;   // 當前市場價格
    change24h: number;      // 24小時漲跌
    ceoTitle: string;       // 預留稱號欄位
    history: ChartDataPoint[]; // 價格歷史
    recentTrades: Trade[]; // 最新成交明細
    yesterdayPrice: number; // 昨天收盤價 (或是起始參考價)
    openingPrice?: number;   // 本週開盤參考價
    todayVolume: number;    // 今天總交易量
    teeteeNews?: TeeteeNewsItem[]; // 本週貼貼資訊
    status: 'NORMAL' | 'WARNING' | 'DELISTED'; // 組合狀態
    warningWeeks: number;   // 已連續警戒週數
    pendingInteractions: {
        liveCollab: number;     // 日常直播/遊戲連動
        largeEvent: number;     // 線下/大型企劃/3D連動
        newSong: number;        // 共同新曲/MV/重大作品
    };
}

export interface TeeteeNewsItem {
    id?: string;
    type: string; // 例如: 'x_mention' 或 'collab_live'
    content: string;
    link: string;
    time?: string;
}

export interface ChartDataPoint {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
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

// 委託單 (Limit Order)
export interface Order {
    id: string;
    pairId: string;
    type: 'buy' | 'sell';
    price: number;
    amount: number;
    isUser: boolean;
    botId?: string;
    timestamp: number;
}