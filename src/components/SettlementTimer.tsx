"use client"


import React, { useState, useEffect } from 'react';
import { getTaipeiTime } from '@/utils/marketHours';

export default function SettlementTimer(){
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [isSettling, setIssettling] = useState<boolean>(false);
    const [isFinalHour, setIsFinalHour] = useState<boolean>(false);

    useEffect(() =>{
        const calculateTime = () => {
            const now = new Date();
            const taipei = getTaipeiTime(now);
            const day = taipei.dayOfWeek; // 0 = 週日, 1-6為週一至週六
            const hour = taipei.hour;

            // 判斷是否處於結算時間 : 週一 23:59
            const isMondaySettling = (day === 1 && hour === 23 && taipei.minute === 59);

            if (isMondaySettling){
                setIssettling(true);
                setIsFinalHour(false);
                setTimeLeft("除息結算與股利發放處理中...");
            } else {
                setIssettling(false);

                // 計算台北時間當前的 totalMinutes，用來推算距離週一 23:59 的差值
                const currentTotalMinutes = day * 24 * 60 + hour * 60 + taipei.minute;
                // 週一 23:59:00 = dayOfWeek=1, hour=23, minute=59
                const targetTotalMinutes = 1 * 24 * 60 + 23 * 60 + 59;
                let diffMinutes = targetTotalMinutes - currentTotalMinutes;
                if (diffMinutes <= 0) diffMinutes += 7 * 24 * 60; // wrap to next week

                // 扣除已過的秒數
                const diffSeconds = diffMinutes * 60 - taipei.second;

                const h = Math.floor(diffSeconds / 3600);
                const m = Math.floor((diffSeconds % 3600) / 60);
                const s = diffSeconds % 60;

                setIsFinalHour(h === 0);

                setTimeLeft(`距離除息發放剩餘 ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
            }
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    },[]);

    return (
        <div className="bg-[#1E2329] border-[#2B2F36] px-4 py-2 rounded-lg flex items-center gap-3 shadow-inner">
            <div className={`w-2 h-2 rounded-full ${
                isSettling ? 'bg-yellow-500 animate-pulse' : 
                isFinalHour ? 'bg-[#FF3B3B] animate-ping' : 'bg-[#00FFA3] shadow-[0_0_8px_#00FFA3]'
            }`} />

            <span className={`font-mono text-sm font-bold ${
                isSettling ? 'text-[#848E9C]' :
                isFinalHour ? 'text-[#FF3B3B]' : 'text-[#EAECEF]'
            }`}>
                {timeLeft}
            </span>
        </div>
    );
}