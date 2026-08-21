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
      setIsOpen(true);
    };

    window.addEventListener('trigger_login_reward_modal_preview', handlePreviewEvent);
    (window as any).previewLoginRewardModal = handlePreviewEvent;

    return () => {
      window.removeEventListener('trigger_login_reward_modal_preview', handlePreviewEvent);
    };
  }, []);

  // 點擊任何地方關閉視窗，並即時將獎勵匯入使用者資產
  const handleClaimAndClose = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // 呼叫 API 即時領取入帳
      const res = await fetch('/api/login-reward', { method: 'POST' });
      if (res.ok) {
        // 即時向後端同步最新玩家資產餘額
        await refreshPlayerState();
      }
    } catch (err) {
      console.error('Failed to claim login reward:', err);
    } finally {
      setIsProcessing(false);
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleClaimAndClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn font-mono select-none cursor-pointer"
    >
      <div
        onClick={(e) => {
          // 確保點擊視窗內部任何區域同樣觸發關閉與領取
          e.stopPropagation();
          handleClaimAndClose();
        }}
        className="bg-[#121418] border border-[#2B2F36] rounded-2xl p-6 max-w-xl w-full space-y-6 shadow-2xl relative text-[#EAECEF] cursor-pointer hover:border-gray-600 transition-colors"
      >
        {/* 大標題與簡潔文字 */}
        <div className="text-center space-y-2 border-b border-[#2B2F36] pb-4">
          <h2 className="text-xl font-extrabold text-white tracking-wider">
            登入獎勵
          </h2>
          <p className="text-xs text-gray-400">
            {todayAmount > 0
              ? `今日登入獎勵 +${todayAmount} $TEE，點擊任意處即刻匯入資產`
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
                      ✓ 已領
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

        {/* 底部說明與確認提示 */}
        <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl px-4 py-3 text-center">
          <p className="text-xs text-gray-300 font-semibold">
            💡 點擊視窗任意處：自動劃轉獎勵入帳並關閉
          </p>
        </div>

        {/* 按鈕（點擊即關閉並領取） */}
        <button
          onClick={handleClaimAndClose}
          className="w-full py-3 rounded-xl font-bold text-xs bg-[#2B2F36] hover:bg-[#363B44] text-white border border-gray-700 hover:border-gray-500 transition-all active:scale-[0.99] cursor-pointer shadow-md"
        >
          確認收下
        </button>
      </div>
    </div>
  );
}
