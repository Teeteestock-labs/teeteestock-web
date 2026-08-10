'use client';

import { useState, useEffect } from 'react';

interface CooldownState {
  lastDividendTriggeredAt: string | null;
  cooldownHoursTotal: number;
  remainingMs: number;
  canTrigger: boolean;
  pendingDividendSettle: boolean;
}

export default function ManualDividendButton() {
  const [cooldown, setCooldown] = useState<CooldownState | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/admin/dividend-settle');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.cooldown) {
          setCooldown(data.cooldown);
          setRemainingMs(data.cooldown.remainingMs);
        }
      }
    } catch (err) {
      console.error('Failed to fetch dividend cooldown status:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Countdown interval timer
  useEffect(() => {
    if (remainingMs <= 0) return;

    const timer = setInterval(() => {
      setRemainingMs((prev) => {
        if (prev <= 1000) {
          fetchStatus();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingMs]);

  const formatRemainingTime = (ms: number) => {
    if (ms <= 0) return '00:00:00';
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}小時 ${mins.toString().padStart(2, '0')}分 ${secs.toString().padStart(2, '0')}秒`;
  };

  const handleExecuteDividend = async () => {
    setIsSubmitting(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch('/api/admin/dividend-settle', {
        method: 'POST'
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || '發動除息程序失敗');
      }

      setFeedbackMsg({
        type: 'success',
        text: data.message || '已成功計算除息參考價並暫存！劃轉清單簿將於週二 18:30 自動生效。'
      });
      setShowConfirmModal(false);
      await fetchStatus();
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: err instanceof Error ? err.message : '發生未知錯誤'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetCooldown = async () => {
    if (!confirm('確定要重置 156 小時除息冷卻時間嗎？')) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/dividend-settle', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: '已成功重置除息冷卻時間與暫存狀態！' });
        await fetchStatus();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canTrigger = cooldown ? cooldown.canTrigger && remainingMs === 0 : false;
  const isPending = cooldown?.pendingDividendSettle;

  return (
    <div className="relative inline-flex items-center gap-2">
      {/* Feedback Toast Banner */}
      {feedbackMsg && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl border shadow-xl max-w-md text-xs font-semibold backdrop-blur-md flex items-center justify-between gap-3 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-gray-400 hover:text-white text-sm font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Pending status badge indicator */}
      {isPending && (
        <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          除息參考價已暫存 (待週二 18:30 劃轉)
        </span>
      )}

      {/* Main Trigger / Cooldown Button */}
      {canTrigger ? (
        <button
          onClick={() => setShowConfirmModal(true)}
          disabled={isSubmitting}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white shadow-lg shadow-pink-500/20 border border-pink-400/30 transition-all duration-200 active:scale-95 flex items-center gap-2"
        >
          <span>💰</span>
          <span>手動執行除息 (試算參考價)</span>
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-gray-900/80 border border-gray-700/80 text-gray-400 flex items-center gap-2 select-none">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>除息冷卻中 ({formatRemainingTime(remainingMs)})</span>
          </div>
          <button
            onClick={handleResetCooldown}
            title="重置冷卻倒數 (測試調試專用)"
            className="px-2.5 py-2 rounded-xl text-xs font-bold bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            🔄 重置冷卻
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <h3 className="text-lg font-bold text-white">確認執行手動除息程序？</h3>
            </div>

            <div className="space-y-3 text-xs text-gray-300 leading-relaxed bg-gray-950/60 p-4 rounded-xl border border-gray-800">
              <p className="font-semibold text-pink-400">
                ⚠️ 本次操作將觸發 【156 小時（6.5 天）】冷卻倒數計時！
              </p>
              <div className="space-y-1.5 text-gray-400">
                <p><strong>階段一（當下生效）：</strong> 計算並暫存全市場 CP 組合之最新聯動加成、8% 股息與【除息開盤參考價】。</p>
                <p><strong>階段二（週二 18:30 生效）：</strong> 系統於過渡時段自動執行實際派發 8% 現金股利至持股玩家帳戶、劃轉更新開盤基準價，並【徹底清空買賣單簿舊委託】。</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleExecuteDividend}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/30 transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>計算中...</span>
                  </>
                ) : (
                  <span>確認發動除息 (開啟156h冷卻)</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
