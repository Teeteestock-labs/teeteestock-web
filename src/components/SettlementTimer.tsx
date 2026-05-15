"use client"


import React, { useState, useEffect } from 'react';

export default function SettlementTimer(){
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [isSettling, setIssettling] = useState<boolean>(false);
    const [isFinalHour, setIsFinalHour] = useState<boolean>(false);

    useEffect(() =>{
        const calculateTime = () => {
            const now = new Date();
            const day = now.getDay(); // 0 = 週日, 1-6為週一至週六
            const hour = now.getHours();

            // 半段是否處於結算時間 : 週一且09:00之前
            const isMondayMorning = (day === 1 && hour < 9);

            if (isMondayMorning){
                setIssettling(true);
                setIsFinalHour(false);
                setTimeLeft("稱號與股利分派處理中");
            } else {
                setIssettling(false);

                // 目標時間為 "下一個週一 00:00:00"
                const nextMonday = new Date(now);
                // 計算距離下周一還差幾天
                // 如果為週一(>=9點)，需+7天；如為週日(0)，則+1天
                const daysToNextMonday = day === 0 ? 1 : 8 - day;

                nextMonday.setDate(now.getDate() + daysToNextMonday);
                nextMonday.setHours(0, 0, 0, 0);

                const diff = nextMonday.getTime() -now.getTime();

                const h = Math.floor(diff / (1000 * 60 * 60));
                const m = Math.floor((diff / (1000 * 60)) % 60);
                const s = Math.floor((diff / 1000) % 60);

                setIsFinalHour(h === 0);

                setTimeLeft(`距離本週結算時間剩餘 ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
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