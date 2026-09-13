'use client';

import React, { useState, useEffect } from 'react';
import { useTee } from '@/context/TeeContext';

interface DayProgress {
  key: string;      // 'WED', 'THU', 'FRI', 'SAT', 'SUN'
  label: string;
  dayName: string;
  amount: number;
  claimed: boolean;
  isToday: boolean;
}

export default function LoginRewardModal() {
  const { refreshPlayerState } = useTee();
  const [daysProgress, setDaysProgress] = useState<DayProgress[]>([
    { key: 'WED', label: 'WED', dayName: '週三', amount: 50, claimed: false, isToday: false },
    { key: 'THU', label: 'THU', dayName: '週四', amount: 50, claimed: false, isToday: false },
    { key: 'FRI', label: 'FRI', dayName: '週五', amount: 100, claimed: false, isToday: false },
    { key: 'SAT', label: 'SAT', dayName: '週六', amount: 100, claimed: false, isToday: false },
    { key: 'SUN', label: 'SUN', dayName: '週日', amount: 100, claimed: false, isToday: false },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [todayAmount, setTodayAmount] = useState<number>(0);
  const [todayKey, setTodayKey] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    async function checkLoginReward() {
      try {
        const res = await fetch('/api/login-reward');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) {
          setDaysProgress(data.daysProgress);
          setTodayAmount(data.todayAmount);
          setTodayKey(data.todayKey);

          // 若今天（週三～週日）可領取獎勵，自動彈出視窗
          if (data.isTodayClaimable) {
            setIsOpen(true);
          }
        }
      } catch (err) {
        console.error('Failed to check login reward:', err);
      }
    }

    checkLoginReward();

    // 支援手動即時預覽控制台測試命令 window.previewLoginRewardModal()
    const handlePreviewEvent = () => {
      setDaysProgress([
        { key: 'WED', label: 'WED', dayName: '週三', amount: 50, claimed: true, isToday: false },
        { key: 'THU', label: 'THU', dayName: '週四', amount: 50, claimed: false, isToday: true },
        { key: 'FRI', label: 'FRI', dayName: '週五', amount: 100, claimed: false, isToday: false },
        { key: 'SAT', label: 'SAT', dayName: '週六', amount: 100, claimed: false, isToday: false },
        { key: 'SUN', label: 'SUN', dayName: '週日', amount: 100, claimed: false, isToday: false },
      ]);
      setTodayAmount(50);
      setTodayKey('THU');
      setIsFadingOut(false);
      setIsProcessing(false);
      setIsOpen(true);
    };

    window.addEventListener('trigger_login_reward_modal_preview', handlePreviewEvent);
    (window as any).previewLoginRewardModal = handlePreviewEvent;

    return () => {
      window.removeEventListener('trigger_login_reward_modal_preview', handlePreviewEvent);
    };
  }, []);

  // 按下「領取獎勵」時的處理邏輯
  const handleClaim = async () => {
    if (isProcessing || isFadingOut) return;
    setIsProcessing(true);

    // 1. 即時將當天卡片轉變為「已領取」樣式
    setDaysProgress((prev) =>
      prev.map((day) =>
        day.isToday || day.key === todayKey
          ? { ...day, claimed: true, isToday: false }
          : day
      )
    );

    // 2. 呼叫 API 劃轉獎勵金額並即時更新玩家資產餘額
    try {
      const res = await fetch('/api/login-reward', { method: 'POST' });
      if (res.ok) {
        await refreshPlayerState();
      }
    } catch (err) {
      console.error('Failed to claim login reward:', err);
    }

    // 3. 觸發 3 秒淡出效果，並在 3 秒後完全關閉視窗
    setIsFadingOut(true);
    setTimeout(() => {
      setIsOpen(false);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-none transition-opacity duration-[3000ms] ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="bg-[#121418] border border-[#2B2F36] rounded-2xl p-6 max-w-xl w-full space-y-6 shadow-2xl relative text-[#EAECEF]">
        {/* 標題與說明 */}
        <div className="text-center space-y-2 border-b border-[#2B2F36] pb-4">
          <h2 className="text-xl font-extrabold text-white tracking-wider">
            登入獎勵
          </h2>
          <p className="text-xs text-gray-400">
            {todayAmount > 0
              ? `今日登入獎勵 +${todayAmount} $TEE`
              : '每日 00:00 重置，週三至週日登入即可領取獎勵！'}
          </p>
        </div>

        {/* 週三到週日英文簡稱卡片矩陣 (WED, THU, FRI, SAT, SUN) */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {daysProgress.map((day) => {
            const isClaimed = day.claimed;
            const isToday = day.isToday;

            let cardBgClass = 'bg-[#181A20] border-[#2B2F36] text-gray-400';
            if (isClaimed) {
              cardBgClass = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400';
            } else if (isToday) {
              cardBgClass = 'bg-[#1E2329] border-[#00FFA3] text-white shadow-[0_0_12px_rgba(0,255,163,0.2)] animate-pulse';
            }

            return (
              <div
                key={day.key}
                className={`flex flex-col items-center justify-between py-3.5 px-1.5 rounded-xl border transition-all text-center ${cardBgClass}`}
              >
                {/* 英文簡稱 */}
                <span className="text-xs sm:text-sm font-black tracking-wider uppercase">
                  {day.label}
                </span>

                {/* 領取記號 / 狀態 */}
                <div className="my-2 min-h-[22px] flex items-center justify-center">
                  {isClaimed ? (
                    <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                      ✓ 已領取
                    </span>
                  ) : isToday ? (
                    <span className="text-[10px] font-bold bg-[#00FFA3]/20 text-[#00FFA3] px-1.5 py-0.5 rounded">
                      可領取
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-600">未發放</span>
                  )}
                </div>

                {/* 獎勵金額 */}
                <span className="text-[11px] font-mono font-bold whitespace-nowrap">
                  {day.amount} $TEE
                </span>
              </div>
            );
          })}
        </div>

        {/* 按鈕（需按下「領取獎勵」才執行劃轉與 3 秒淡出） */}
        <button
          onClick={handleClaim}
          disabled={isFadingOut}
          className={`w-full py-3 rounded-xl font-bold text-xs border transition-all cursor-pointer shadow-md ${
            isFadingOut
              ? 'bg-emerald-900/50 text-emerald-300 border-emerald-500/40 cursor-default'
              : 'bg-[#2B2F36] hover:bg-[#363B44] text-white border-gray-700 hover:border-gray-500 active:scale-[0.99]'
          }`}
        >
          {isFadingOut ? '已領取' : '領取獎勵'}
        </button>
      </div>
    </div>
  );
}
