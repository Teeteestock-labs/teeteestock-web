"use client";

import { memo } from "react";

export type NotificationType = 'buy_submit' | 'sell_submit' | 'match_deal' | 'failed';
export interface BannerNotification {
    id: string;
    type: NotificationType;
    price: number;
    amount: number;
    message?: string;
    isFading: boolean;
}

interface NotificationBannerProps {
    notifications: BannerNotification[];
    removeNotification: (id: string) => void;
    pairId: string;
    pairIdMap: Record<string, string>;
}

const NotificationBanner = memo(({
    notifications,
    removeNotification,
    pairId,
    pairIdMap
}: NotificationBannerProps) => {
    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[90%] max-w-[450px] pointer-events-none">
            {notifications.map((notif) => {
                const stockId = pairIdMap[pairId.toLowerCase()] || pairId.toUpperCase();
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
    );
});

NotificationBanner.displayName = 'NotificationBanner';
export default NotificationBanner;
