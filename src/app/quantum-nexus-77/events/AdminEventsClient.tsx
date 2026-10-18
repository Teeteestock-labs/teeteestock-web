"use client";

import { useState } from "react";
import { Trophy, Coins, Users, CheckCircle2, Circle, AlertTriangle, ShieldCheck, Lock, Unlock, FolderArchive, ChevronDown } from "lucide-react";
import { settleChampionAction, toggleEventLockAction, toggleEventArchiveAction } from "./actions";

interface OptionStat {
  name: string;
  count: number;
  percentage: number;
}

interface EventData {
  id: string;
  title: string;
  prize: number;
  isLocked: boolean;
  lockedAt: string | null;
  isSettled: boolean;
  isArchived: boolean;
  winningChoice: string | null;
  settledAt: string | null;
  winnerCount: number;
  totalPayout: number;
  totalPredictions: number;
  options: OptionStat[];
  recentPredictions: {
    userId: string;
    choice: string;
    createdAt: string;
  }[];
}

interface Props {
  initialData: EventData;
}

export default function AdminEventsClient({ initialData }: Props) {
  const [data, setData] = useState<EventData>(initialData);
  const [selectedChampion, setSelectedChampion] = useState<string | null>(data.winningChoice);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isSettled = data.isSettled;
  const isEnded = data.isSettled || data.isArchived;
  const [isExpanded, setIsExpanded] = useState<boolean>(!isEnded);

  // 切換手動截止鎖定
  const handleToggleLock = async (targetLock: boolean) => {
    if (isSettled) return;
    setIsSubmitting(true);
    setNotification(null);

    try {
      const res = await toggleEventLockAction(data.id, targetLock);
      if (!res.success) {
        setNotification({ type: 'error', message: res.error || '切換鎖定狀態失敗。' });
        return;
      }

      setData((prev) => ({
        ...prev,
        isLocked: res.isLocked!,
        lockedAt: res.lockedAt ? new Date(res.lockedAt).toISOString() : null,
      }));

      setNotification({
        type: 'success',
        message: targetLock
          ? '🔒 企劃預測已手動截止鎖定！前台已禁止玩家點選與提交。'
          : '🟢 企劃預測已重新開放！前台玩家可自由選擇與提交。',
      });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || '網路異常。' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 切換歸檔狀態
  const handleToggleArchive = async (targetArchive: boolean) => {
    setIsSubmitting(true);
    setNotification(null);

    try {
      const res = await toggleEventArchiveAction(data.id, targetArchive);
      if (!res.success) {
        setNotification({ type: 'error', message: res.error || '切換歸檔狀態失敗。' });
        return;
      }

      setData((prev) => ({
        ...prev,
        isArchived: res.isArchived!,
        isLocked: res.isLocked !== undefined ? res.isLocked : prev.isLocked,
      }));

      setNotification({
        type: 'success',
        message: targetArchive
          ? '📁 企劃已成功歸檔！使用者前台將以書籤折疊方式保存顯示。'
          : '📂 企劃已解除歸檔！',
      });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || '網路異常。' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenConfirm = () => {
    if (isSettled) return;
    if (!selectedChampion) {
      setNotification({ type: 'error', message: '請先在下方卡片中選擇一所學校作為本屆冠軍。' });
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSettle = async () => {
    if (!selectedChampion || isSettled) return;

    setIsSubmitting(true);
    setNotification(null);

    try {
      const res = await settleChampionAction(data.id, selectedChampion);
      if (!res.success) {
        setNotification({ type: 'error', message: res.error || '結算失敗。' });
        setShowConfirmModal(false);
        return;
      }

      // 結算成功
      const result = res.data!;
      setData((prev) => ({
        ...prev,
        isLocked: true,
        isSettled: true,
        winningChoice: result.winningChoice,
        settledAt: result.settledAt ? new Date(result.settledAt).toISOString() : new Date().toISOString(),
        winnerCount: result.winnerCount,
        totalPayout: result.totalPayout,
      }));

      setShowConfirmModal(false);
      setNotification({
        type: 'success',
        message: `🏆 結算成功！本屆冠軍【${result.winningChoice}】已公佈，已為 ${result.winnerCount} 位猜中者每人發放 ${data.prize} $TEE（總額 ${result.totalPayout} $TEE）！`,
      });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || '網路異常，結算失敗。' });
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStat = data.options.find((o) => o.name === selectedChampion);
  const estimatedWinners = selectedStat ? selectedStat.count : 0;
  const estimatedPayout = estimatedWinners * data.prize;

  return (
    <div className="space-y-8 font-mono">
      {/* 通知橫幅 */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
            notification.type === 'success'
              ? 'bg-[#00FFA3]/15 border-[#00FFA3]/50 text-[#E6FFF5]'
              : 'bg-red-950/60 border-red-500/50 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-bold">
            {notification.type === 'success' ? (
              <ShieldCheck className="w-5 h-5 text-[#00FFA3] shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* 企劃主容器（已結束企劃支援折疊） */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/40 shadow-xl backdrop-blur-md overflow-hidden transition-all">
        {/* 卡片頂部摘要列 (點擊可展開/收合) */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none transition-colors ${
            isEnded ? 'hover:bg-gray-850/60 bg-gray-900/70' : 'border-b border-gray-800 bg-gray-900/60'
          }`}
        >
          <div className="flex items-center gap-3.5 truncate">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-md ${
              isSettled
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : data.isArchived
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                : 'bg-emerald-500/20 border-emerald-500/40 text-[#00FFA3]'
            }`}>
              <Trophy className="w-5 h-5" />
            </div>

            <div className="space-y-1 truncate text-left">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-base sm:text-lg font-black text-white truncate">
                  {data.title}
                </span>
                {isSettled ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-400" />
                    已結算落幕
                  </span>
                ) : data.isLocked ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-red-400" />
                    預測已截止
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
                    預測開放中
                  </span>
                )}
                {data.isArchived && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                    <FolderArchive className="w-3 h-3 text-blue-400" />
                    已折疊保存
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 text-xs text-gray-400 font-mono flex-wrap">
                <span className="text-gray-500">ID: {data.id}</span>
                <span className="text-gray-700">•</span>
                <span className="text-amber-200">單人獎金 {data.prize} $TEE</span>
                <span className="text-gray-700">•</span>
                <span>總預測 {data.totalPredictions} 人</span>
                {isSettled && data.winningChoice && (
                  <>
                    <span className="text-gray-700">•</span>
                    <span className="text-yellow-400 font-bold">冠軍：【{data.winningChoice}】</span>
                    <span className="text-gray-700">•</span>
                    <span className="text-emerald-400">總發放 {data.totalPayout} $TEE ({data.winnerCount}人)</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => handleToggleArchive(!data.isArchived)}
              disabled={isSubmitting}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                data.isArchived
                  ? 'border-amber-500/50 bg-amber-950/30 text-amber-300 hover:bg-amber-950/60'
                  : 'border-gray-750 bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
              <span>{data.isArchived ? "解除結束標記" : "標記為結束"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3.5 py-2 rounded-xl bg-gray-800/80 hover:bg-gray-800 border border-gray-700 text-xs font-bold text-gray-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <span>{isExpanded ? "收合企劃" : "展開企劃詳情"}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* 展開時顯示之完整管理與統計內容 */}
        {isExpanded && (
          <div className="p-6 space-y-8 border-t border-gray-800/80 bg-gray-950/20 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* 手動控制截止鎖定控制列 */}
            <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">企劃預測截止控制</span>
                  {isSettled ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      已結算公佈
                    </span>
                  ) : data.isLocked ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                      🔒 預測已手動截止
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      🟢 預測開放中
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {isSettled
                    ? "本企劃已結算發放完畢，預測全面停止。"
                    : data.isLocked
                    ? `已於 ${data.lockedAt ? new Date(data.lockedAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }) : '後台'} 手動截止預測，前台已鎖定禁選。`
                    : "預測處於開放中，前台顯示「🟢 企劃預測開放中」，玩家可隨時選擇與更新。"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">

          {!isSettled && (
            data.isLocked ? (
              <button
                type="button"
                onClick={() => handleToggleLock(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-emerald-500/50 bg-emerald-950/30 text-emerald-300 text-xs font-black hover:bg-emerald-950/60 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/20"
              >
                <Unlock className="w-4 h-4 text-emerald-400" />
                <span>重新開放預測</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleToggleLock(true)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-red-500/50 bg-red-950/30 text-red-300 text-xs font-black hover:bg-red-950/60 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-red-950/20"
              >
                <Lock className="w-4 h-4 text-red-400" />
                <span>手動截止預測（鎖定）</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* 企劃狀態總覽卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 卡片 1: 企劃狀態 */}
        <div className="bg-gray-900/50 border border-gray-800 p-5 rounded-2xl flex flex-col justify-between">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">企劃狀態</span>
          <div className="mt-2 space-y-1.5">
            {data.isArchived && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/50 text-blue-300 text-xs font-black">
                  <FolderArchive className="w-3.5 h-3.5 text-blue-400" />
                  已歸檔書籤保存
                </span>
              </div>
            )}
            {isSettled ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-black">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  已結算公佈
                </span>
              </div>
            ) : data.isLocked ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-red-300 text-xs font-black">
                  <Lock className="w-3.5 h-3.5 text-red-400" />
                  已手動截止
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-black">
                  <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse" />
                  預測開放中
                </span>
              </div>
            )}
          </div>
          <span className="text-[11px] text-gray-500 mt-2 truncate">ID: {data.id}</span>
        </div>

        {/* 卡片 2: 單人預測獎金 */}
        <div className="bg-gray-900/50 border border-gray-800 p-5 rounded-2xl flex flex-col justify-between">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">單人獲獎獎金</span>
          <div className="flex items-center gap-2 mt-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <span className="text-2xl font-black text-[#FFD700]">{data.prize}</span>
            <span className="text-xs text-gray-400 font-bold">$TEE</span>
          </div>
          <span className="text-[11px] text-gray-500 mt-2">由所有猜中者全額領取</span>
        </div>

        {/* 卡片 3: 總參與人數 */}
        <div className="bg-gray-900/50 border border-gray-800 p-5 rounded-2xl flex flex-col justify-between">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">總預測人次</span>
          <div className="flex items-center gap-2 mt-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="text-2xl font-black text-white">{data.totalPredictions}</span>
            <span className="text-xs text-gray-400">人</span>
          </div>
          <span className="text-[11px] text-gray-500 mt-2">有效預測資料數</span>
        </div>

        {/* 卡片 4: 冠軍與發放金額 */}
        <div className="bg-gray-900/50 border border-gray-800 p-5 rounded-2xl flex flex-col justify-between">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            {isSettled ? "結算成果" : "預計發放總額"}
          </span>
          <div className="mt-2">
            {isSettled ? (
              <div className="flex flex-col">
                <span className="text-base font-black text-amber-400 truncate">
                  🏆 {data.winningChoice}
                </span>
                <span className="text-xs text-gray-300 font-bold mt-1">
                  共 {data.winnerCount} 人 · {data.totalPayout} $TEE
                </span>
              </div>
            ) : selectedChampion ? (
              <div className="flex flex-col">
                <span className="text-base font-black text-[#00FFA3] truncate">
                  {selectedChampion}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  預估 {estimatedPayout} $TEE ({estimatedWinners} 人)
                </span>
              </div>
            ) : (
              <span className="text-xs text-gray-500">請選取下方學校試算</span>
            )}
          </div>
          <span className="text-[11px] text-gray-500 mt-2">
            {isSettled && data.settledAt
              ? `結算於 ${new Date(data.settledAt).toLocaleDateString('zh-TW')}`
              : "點擊按鈕確認後即刻加值"}
          </span>
        </div>
      </div>

      {/* 學校選項與冠軍設定區塊 */}
      <section className="bg-gray-900/40 border border-gray-800 p-6 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              本次企劃學校選項與得票統計
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {isSettled
                ? "本企劃已完成結算，冠軍學校已公佈在前台特別企劃頁面。"
                : "點選最終奪冠的高校，點擊下方「確認冠軍」按鈕後將立即對外公佈並自動加值獎金。"}
            </p>
          </div>

          {!isSettled && (
            <button
              type="button"
              onClick={handleOpenConfirm}
              disabled={!selectedChampion || isSubmitting}
              className={`px-6 py-3 rounded-xl font-black text-sm tracking-wide transition-all shadow-xl flex items-center justify-center gap-2 select-none ${
                selectedChampion
                  ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 active:scale-95 cursor-pointer shadow-amber-950/40"
                  : "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed"
              }`}
            >
              <Trophy className="w-4 h-4 text-slate-950" />
              <span>確認冠軍並發放獎金</span>
            </button>
          )}
        </div>

        {/* 6 個學校卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.options.map((option) => {
            const isWinner = isSettled && data.winningChoice === option.name;
            const isSelected = selectedChampion === option.name;

            return (
              <div
                key={option.name}
                onClick={() => {
                  if (!isSettled) {
                    setSelectedChampion(option.name);
                  }
                }}
                className={`p-4 rounded-xl border transition-all select-none ${
                  isWinner
                    ? "bg-amber-950/30 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-500"
                    : isSelected
                    ? "bg-emerald-950/20 border-[#00FFA3] shadow-[0_0_15px_rgba(0,255,163,0.2)] cursor-pointer"
                    : isSettled
                    ? "bg-[#0b0e14] border-gray-800/80 opacity-50 cursor-default"
                    : "bg-[#10141d] border-gray-800 hover:border-gray-600 hover:bg-[#141a26] cursor-pointer"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm sm:text-base text-white">
                      {option.name}
                    </span>
                    {isWinner && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950 flex items-center gap-1">
                        🏆 冠軍
                      </span>
                    )}
                  </div>

                  {!isSettled && (
                    <div>
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-[#00FFA3]" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  )}
                </div>

                {/* 票數與佔比 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-gray-400">{option.count} 票</span>
                    <span className="text-gray-300 font-bold">{option.percentage}%</span>
                  </div>
                  {/* 進度條 */}
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isWinner
                          ? "bg-gradient-to-r from-amber-400 to-yellow-300"
                          : isSelected
                          ? "bg-gradient-to-r from-[#00FFA3] to-emerald-400"
                          : "bg-gray-600"
                      }`}
                      style={{ width: `${option.percentage}%` }}
                    />
                  </div>
                </div>

                {/* 發放獎金試算 */}
                <div className="mt-3 pt-3 border-t border-gray-800/60 flex items-center justify-between text-[11px] text-gray-400 font-mono">
                  <span>若奪冠總發放：</span>
                  <span className="text-amber-300 font-bold">
                    {(option.count * data.prize).toLocaleString()} $TEE
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 已結算大提示 */}
        {isSettled && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-amber-950/40 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-black text-amber-200">
                  本企劃已於 {data.settledAt ? new Date(data.settledAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }) : ''} 圓滿結算！
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  本屆優勝學校為【{data.winningChoice}】，共 {data.winnerCount} 名預測正確者每人獲得 {data.prize} $TEE（總額 {data.totalPayout} $TEE）。
                </p>
              </div>
            </div>

            <div className="px-4 py-2 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold text-center">
              獎金已全數發放完畢
            </div>
          </div>
        )}
      </section>

      {/* 使用者預測清單 (最新 50 筆) */}
      <section className="bg-gray-900/40 border border-gray-800 p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          最新預測紀錄 (近期 50 筆)
        </h3>

        {data.recentPredictions.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-gray-800 rounded-xl">
            目前尚無預測紀錄
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-gray-900/80 text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="py-2.5 px-4">使用者識別</th>
                  <th className="py-2.5 px-4">預測學校</th>
                  <th className="py-2.5 px-4">狀態</th>
                  <th className="py-2.5 px-4 text-right">預測時間</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {data.recentPredictions.map((pred, i) => {
                  const isWinner = isSettled && pred.choice === data.winningChoice;

                  return (
                    <tr key={i} className="hover:bg-gray-800/30">
                      <td className="py-2.5 px-4 text-gray-300 font-bold truncate max-w-[200px]">
                        {pred.userId}
                      </td>
                      <td className="py-2.5 px-4 text-white">
                        {pred.choice}
                      </td>
                      <td className="py-2.5 px-4">
                        {isSettled ? (
                          isWinner ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              猜中（獲 {data.prize} $TEE）
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-800 text-gray-500">
                              未猜中
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            已記錄
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right text-gray-500">
                        {new Date(pred.createdAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
          </div>
        )}
      </div>

      {/* 二度確認結算 Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-amber-500/60 max-w-lg w-full rounded-2xl p-6 shadow-2xl shadow-amber-950/30 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  確認公佈本屆冠軍並發放獎金
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  此操作不可撤回，請仔細確認以下發放參數
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-gray-950/70 p-4 rounded-xl border border-gray-800 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-gray-800/80">
                <span className="text-gray-400">冠軍高校：</span>
                <span className="text-sm font-black text-amber-400">【{selectedChampion}】</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-800/80">
                <span className="text-gray-400">猜中獲獎人數：</span>
                <span className="text-sm font-black text-white">{estimatedWinners} 人</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-800/80">
                <span className="text-gray-400">每人發放獎金：</span>
                <span className="font-bold text-[#FFD700]">{data.prize} $TEE</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400">總發放獎金額度：</span>
                <span className="text-base font-black text-[#00FFA3]">
                  {estimatedPayout.toLocaleString()} $TEE
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/30 text-[11px] text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>
                注意：點擊「確定公佈並發放」後，系統將立即在前台對所有玩家公佈冠軍結果，並自動為所有猜中者的餘額加值 500 $TEE，且不可重複執行或取消。
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-xs font-bold hover:bg-gray-800 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmSettle}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black hover:brightness-110 transition-all shadow-lg shadow-amber-950/40 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "結算發放中..." : "確定公佈並發放"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
