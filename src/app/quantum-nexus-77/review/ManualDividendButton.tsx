'use client';

import { useState, useEffect } from 'react';

export interface CooldownState {
  lastDividendTriggeredAt: string | null;
  cooldownHoursTotal: number;
  remainingMs: number;
  canTrigger: boolean;
  pendingDividendSettle: boolean;
}

interface ManualDividendButtonProps {
  initialCooldown?: CooldownState | null;
}

export default function ManualDividendButton({ initialCooldown = null }: ManualDividendButtonProps) {
  const [cooldown, setCooldown] = useState<CooldownState | null>(initialCooldown);
  const [remainingMs, setRemainingMs] = useState<number>(initialCooldown?.remainingMs || 0);
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
  const isPending = cooldown?.pendingDividendSettle ?? false;

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

      {/* 合併為一的「手動除息」與「狀態提示」按鈕 / 監控元件 */}
      {canTrigger ? (
        <button
          onClick={() => setShowConfirmModal(true)}
          disabled={isSubmitting}
          className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-95 ${
            !isPending
              ? 'bg-amber-500/15 border border-amber-400/60 text-amber-300 hover:bg-amber-500/25 shadow-amber-950/30'
              : 'bg-emerald-500/15 border border-emerald-400/40 text-[#00FFA3] hover:bg-emerald-500/25 shadow-emerald-950/30'
          }`}
          title={!isPending ? '尚未手動確定週一除息，請點擊進行試算並確認暫存' : '週一除息已確認暫存，點擊可重新試算'}
        >
          <div className="relative flex items-center justify-center">
            <span className="text-sm">💰</span>
            {!isPending && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
              </span>
            )}
          </div>
          <span>手動確定週一除息</span>
          {!isPending ? (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              ⚠️ 尚未確定
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-[#00FFA3] border border-emerald-500/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3]" />
              已確認暫存
            </span>
          )}
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-gray-900/80 border border-gray-700/80 text-gray-300 flex items-center gap-2 select-none shadow-sm">
            <span className="text-sm">💰</span>
            {isPending && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-[#00FFA3] border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3]" />
                已確認暫存
              </span>
            )}
            <span className="text-amber-400 flex items-center gap-1 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              冷卻中 ({formatRemainingTime(remainingMs)})
            </span>
          </div>
          <button
            onClick={handleResetCooldown}
            title="重置冷卻倒數 (測試調試專用)"
            className="px-2.5 py-2 rounded-xl text-xs font-bold bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white transition-colors cursor-pointer"
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
              <div className={`p-2.5 rounded-lg border flex items-center gap-2 font-semibold ${
                !isPending
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-[#00FFA3]'
              }`}>
                <span>
                  {!isPending
                    ? '⚠️ 提示：目前尚未手動確定週一除息程序'
                    : 'ℹ️ 提示：週一除息已確認暫存，重新發動將更新試算結果'}
                </span>
              </div>
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
