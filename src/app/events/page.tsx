"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TickerTape from "@/components/TickerTape";
import BottomNav from "@/components/BottomNav";
import {
  Trophy,
  CheckCircle2,
  Circle,
  Coins,
  Lock,
  Sparkles,
  Bookmark,
  ChevronDown,
  ExternalLink,
  Timer,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  JUMP_KING_EVENT_ID,
  JUMP_KING_LIVE_URL,
  HOLO_KOUSHIEN_EVENT_ID,
} from "@/utils/eventDeadline";

interface BannerNotification {
  id: string;
  type: 'success' | 'failed';
  message: string;
  isFading: boolean;
}

interface JumpKingOption {
  id: string;
  name: string;
}

const JUMP_KING_OPTIONS: JumpKingOption[] = [
  { id: "opt_1", name: "Redcrown Woods紅冠林" },
  { id: "opt_2", name: "Colossal Drain巨型排水管" },
  { id: "opt_3", name: "False King's Keep偽王的城堡" },
  { id: "opt_4", name: "(Bargainburg巴根堡/Great Frontier廣闊的邊境/Stormwall Pass風暴牆的關隘)" },
  { id: "opt_5", name: "(Chapel Perilous危險教堂/Blue Ruin深藍廢墟/The Tower塔樓)" },
  { id: "opt_6", name: "成功通關" },
];

interface PastSchoolItem {
  id: string;
  name: string;
}

const PAST_SCHOOLS_LEFT: PastSchoolItem[] = [
  { id: "waooon", name: "WAOOON高校" },
  { id: "shirogane", name: "白銀学園高校" },
  { id: "ahoy", name: "AHOY高校" },
];

const PAST_SCHOOLS_RIGHT: PastSchoolItem[] = [
  { id: "polpol", name: "ポルポル高校" },
  { id: "konkoyo", name: "こんこよ高校" },
  { id: "kabesaki", name: "壁咲高校" },
];

export default function EventsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // ── 當前進行中企劃：JUMP KING HOLORACE ──
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [confirmedChoice, setConfirmedChoice] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isSettled, setIsSettled] = useState<boolean>(false);
  const [winningChoice, setWinningChoice] = useState<string | null>(null);
  const [hasWon, setHasWon] = useState<boolean | null>(null);
  const [totalPool, setTotalPool] = useState<number>(5000);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // ── 歷屆企劃回顧：ホロライブ甲子園2026 ──
  const [isBookmarkExpanded, setIsBookmarkExpanded] = useState<boolean>(false);
  const [pastConfirmedChoice, setPastConfirmedChoice] = useState<string | null>(null);
  const [pastIsSettled, setPastIsSettled] = useState<boolean>(false);
  const [pastWinningChoice, setPastWinningChoice] = useState<string | null>(null);

  // ── 通知與載入 ──
  const [notifications, setNotifications] = useState<BannerNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 讀取書籤展開偏好
  useEffect(() => {
    const saved = localStorage.getItem("koushien_bookmark_expanded");
    if (saved !== null) {
      setIsBookmarkExpanded(saved === "true");
    }
  }, []);

  const toggleBookmark = () => {
    setIsBookmarkExpanded((prev) => {
      const next = !prev;
      localStorage.setItem("koushien_bookmark_expanded", String(next));
      return next;
    });
  };

  // 載入預測狀態與先前的選擇紀錄
  useEffect(() => {
    let isMounted = true;
    const searchParams = new URLSearchParams(window.location.search);
    const testUnlock = searchParams.get("test_unlock");

    // 1. 載入當前進行中企劃 (JUMP KING HOLORACE)
    const jumpKingUrl = testUnlock
      ? `/api/events/prediction?eventId=${JUMP_KING_EVENT_ID}&test_unlock=${testUnlock}`
      : `/api/events/prediction?eventId=${JUMP_KING_EVENT_ID}`;

    fetch(jumpKingUrl)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.isLocked !== undefined) setIsLocked(data.isLocked);
        if (data.isSettled !== undefined) {
          setIsSettled(data.isSettled);
          setWinningChoice(data.winningChoice);
          setHasWon(data.hasWon);
        }
        if (data.totalPool !== undefined) setTotalPool(data.totalPool);

        if (data.choice) {
          setSelectedChoice(data.choice);
          setConfirmedChoice(data.choice);
        } else {
          setConfirmedChoice(null);
          const pending = localStorage.getItem("jump_king_pending_choice");
          if (pending) {
            setSelectedChoice(pending);
            localStorage.removeItem("jump_king_pending_choice");
          }
        }
      })
      .catch((err) => console.error("Failed to load jump king prediction:", err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    // 2. 載入歷屆甲子園 2026 回顧資料
    fetch(`/api/events/prediction?eventId=${HOLO_KOUSHIEN_EVENT_ID}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.choice) setPastConfirmedChoice(data.choice);
        if (data.isSettled !== undefined) {
          setPastIsSettled(data.isSettled);
          setPastWinningChoice(data.winningChoice);
        }
      })
      .catch((err) => console.error("Failed to load past koushien event:", err));

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const addNotification = (type: 'success' | 'failed', message: string) => {
    const notifId = Math.random().toString(36).substring(2, 9);
    const newNotif: BannerNotification = {
      id: notifId,
      type,
      message,
      isFading: false,
    };
    setNotifications((prev) => [...prev, newNotif]);

    setTimeout(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, isFading: true } : n))
      );
    }, 3500);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    }, 4000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleConfirm = async () => {
    if (!user) {
      if (selectedChoice) {
        localStorage.setItem("jump_king_pending_choice", selectedChoice);
      }
      router.push("/login?redirect=/events");
      return;
    }

    if (isSettled) {
      addNotification("failed", "本企劃已圓滿結算，無法修改選擇。");
      return;
    }

    if (isLocked) {
      addNotification("failed", "本企劃預測已截止，無法修改選擇。");
      return;
    }

    if (!selectedChoice) {
      addNotification("failed", "請選擇一個到達地點選項");
      return;
    }

    setIsSubmitting(true);
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const testUnlock = searchParams.get("test_unlock");
      const url = testUnlock ? `/api/events/prediction?test_unlock=${testUnlock}` : `/api/events/prediction`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: JUMP_KING_EVENT_ID,
          choice: selectedChoice,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        addNotification("failed", data.error || "操作失敗，無法儲存預測");
        if (res.status === 403) {
          setIsLocked(true);
        }
        return;
      }

      setConfirmedChoice(selectedChoice);
      addNotification("success", `你在《JUMP KING HOLORACE》選擇了【${selectedChoice}】`);

      // 重新整理參與人數與獎金池試算
      fetch(url)
        .then((r) => r.json())
        .then((d) => {
          if (d.totalPool !== undefined) setTotalPool(d.totalPool);
        })
        .catch(() => {});
    } catch (err) {
      console.error("Failed to submit prediction", err);
      addNotification("failed", "網路錯誤，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col pb-24 font-mono select-none">
      <TickerTape />

      {/* 頂部通知橫幅 (NotificationBanner) */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[90%] max-w-[450px] pointer-events-none">
        {notifications.map((notif) => {
          const isSuccess = notif.type === "success";
          const bgClass = isSuccess
            ? "bg-[#00FFA3]/15 border border-[#00FFA3]/50 backdrop-blur-md shadow-lg shadow-emerald-950/30"
            : "bg-[#3A1414]/90 border border-red-500/40 backdrop-blur-md shadow-lg shadow-red-950/40";
          const textClass = isSuccess ? "text-[#E6FFF5]" : "text-[#FFEAEA]";

          return (
            <div
              key={notif.id}
              onClick={() => removeNotification(notif.id)}
              className={`pointer-events-auto cursor-pointer rounded-lg p-3.5 shadow-xl flex items-center justify-between gap-6 select-none transition-all duration-500 ${
                notif.isFading
                  ? "opacity-0 scale-95 -translate-y-2"
                  : "opacity-100 scale-100"
              } ${bgClass}`}
            >
              <div className="flex flex-col gap-0.5 text-left">
                {!isSuccess && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF8B8B]">
                    操作失敗
                  </span>
                )}
                <span className={`text-sm font-black font-mono leading-snug ${textClass}`}>
                  {notif.message}
                </span>
              </div>
              <span className="text-xs text-white opacity-40 hover:opacity-100 transition-opacity">
                ✕
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-4 py-8 max-w-2xl mx-auto w-full">
        {/* 企劃主標題區 */}
        <div className="text-center mb-6 w-full">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181a20] border border-[#2b2f36] text-[11px] text-[#00FFA3] font-bold mb-3 shadow-inner">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            特別企劃 · SPECIAL EVENTS
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide mb-2">
            社群特別企劃專區
          </h1>

          <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
            期間限定重大賽事預測活動，猜中瓜分大額 $TEE 榮譽獎金池！
          </p>
        </div>

        {/* ── 進行中的特別企劃：JUMP KING HOLORACE ── */}
        <div className="w-full flex flex-col items-center mb-10">
          <div className="text-center mb-5 w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black mb-2">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              <span>賽事到達地點預測活動</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide mb-2 bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
              JUMP KING HOLORACE
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md mx-auto mb-4 font-semibold">
              猜測一小時比賽結束時，優勝者最高所能到達的地點（單選）。
            </p>

            {/* YouTube 現場直播按鈕 (外部連結導流) */}
            <div className="mb-4">
              <a
                href={JUMP_KING_LIVE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600/25 via-red-500/20 to-red-600/25 hover:from-red-600/40 hover:to-red-600/40 border border-red-500/50 text-red-200 hover:text-white text-xs sm:text-sm font-black transition-all shadow-lg shadow-red-950/30 active:scale-95 group select-none"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                <span>📺 前往 YouTube 現場直播觀看賽事 ↗</span>
                <ExternalLink className="w-3.5 h-3.5 text-red-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>

            {/* 總獎金池展示看板 */}
            <div className="w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#1c160c] via-[#141009] to-[#0a0805] border border-amber-500/50 shadow-xl shadow-amber-950/30 backdrop-blur-md mb-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-amber-200 font-bold block">
                      總獎金池
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      由預測中獎者均分
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline gap-1.5 self-end sm:self-center">
                  <span className="font-mono text-2xl sm:text-3xl font-black text-[#FFD700] tracking-wider drop-shadow-[0_0_12px_rgba(255,215,0,0.5)]">
                    {totalPool.toLocaleString()}
                  </span>
                  <span className="text-xs text-amber-300/80 font-bold">$TEE</span>
                </div>
              </div>
            </div>

            {/* 結算結果大橫幅 */}
            {isSettled && winningChoice && (
              <div className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 border border-amber-400/50 text-amber-200 text-sm sm:text-base font-black flex items-center justify-center gap-2 shadow-xl shadow-amber-950/30 text-center">
                <span>🏆 JUMP KING HOLORACE 優勝最高到達地點：【{winningChoice}】</span>
              </div>
            )}
          </div>

          {/* 六個選項卡片：左右排列各 3 個 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-6">
            {JUMP_KING_OPTIONS.map((opt) => {
              const isSelected = (selectedChoice ?? confirmedChoice) === opt.name;
              const isWinner = isSettled && winningChoice === opt.name;

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isLocked || isSettled}
                  onClick={() => {
                    if (!isLocked && !isSettled) {
                      setSelectedChoice(opt.name);
                    }
                  }}
                  className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between gap-3 select-none ${
                    isWinner
                      ? "bg-amber-950/40 border-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/80 text-white cursor-default"
                      : isSettled
                      ? isSelected
                        ? "bg-[#142320]/80 border-[#00FFA3]/60 text-white cursor-default opacity-95 shadow-[0_0_12px_rgba(0,255,163,0.15)]"
                        : "bg-[#0b0e14] border-[#181f2c] text-gray-500 cursor-default opacity-50"
                      : isLocked
                      ? isSelected
                        ? "bg-[#142320]/80 border-[#00FFA3]/60 text-white cursor-not-allowed opacity-95"
                        : "bg-[#0b0e14] border-[#181f2c] text-gray-500 cursor-not-allowed opacity-45"
                      : isSelected
                      ? "bg-[#142320] border-[#00FFA3] shadow-[0_0_16px_rgba(0,255,163,0.22)] text-white active:scale-[0.98] cursor-pointer"
                      : "bg-[#10141d] border-[#222a3a] text-gray-300 hover:border-gray-600 hover:bg-[#141a26] active:scale-[0.98] cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-2 text-left min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-black tracking-wide leading-snug break-words">
                      {opt.name}
                    </span>
                    {isWinner && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shrink-0">
                        🏆 優勝
                      </span>
                    )}
                  </div>

                  <div className="shrink-0">
                    {isWinner ? (
                      <Trophy className="w-5 h-5 text-amber-400" />
                    ) : isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-[#00FFA3]" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 送出預測 / 鎖定狀態列 */}
          <div className="w-full flex flex-col items-center gap-3">
            {isLocked ? (
              <>
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 px-6 rounded-xl font-black text-sm tracking-widest uppercase shadow-none bg-[#161a22] border border-gray-700/60 text-gray-400 cursor-not-allowed select-none flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-gray-400" />
                  <span>🔒 本企劃預測已截止</span>
                </button>

                {confirmedChoice ? (
                  <p className="text-[11px] text-gray-400 font-mono text-center">
                    你最終的預測選擇：<span className="text-[#00FFA3] font-bold">【{confirmedChoice}】</span>（已鎖定禁止變更）
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-500 font-mono text-center">
                    目前未完成預測選擇（已截止鎖定）
                  </p>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-3 rounded-xl font-black text-xs sm:text-sm tracking-normal transition-all duration-150 shadow-xl active:scale-[0.98] bg-gradient-to-r from-[#00FFA3]/90 to-[#00d084] hover:brightness-110 text-slate-950 shadow-emerald-950/40 cursor-pointer disabled:opacity-50 text-center"
                >
                  {isSubmitting
                    ? "儲存中..."
                    : "確定預測 （預測截止時間10/30（五）13：00）"}
                </button>

                {!user && (
                  <p className="text-[13.5px] text-amber-400/90 font-mono text-center">
                    ⚠️ 目前為未登入狀態，預測前請先登入以保存紀錄與領取獎金
                  </p>
                )}

                {confirmedChoice && (
                  <p className="text-[11px] text-gray-400 font-mono text-center">
                    {selectedChoice && selectedChoice !== confirmedChoice ? (
                      <>
                        原已儲存：<span className="text-gray-300 font-bold">【{confirmedChoice}】</span> ➔ 新選取：<span className="text-[#00FFA3] font-bold">【{selectedChoice}】</span>（請點擊上方按鈕確認更新）
                      </>
                    ) : (
                      <>
                        你目前的選擇：<span className="text-[#00FFA3] font-bold">【{confirmedChoice}】</span>（可重新選擇並點確定更新）
                      </>
                    )}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── 歷屆企劃回顧區：以書籤折疊方式保存 ── */}
        <section className="w-full space-y-3">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              <h2 className="text-sm font-bold text-white tracking-wide">歷屆企劃回顧 (Past Events)</h2>
            </div>
            <span className="text-[11px] text-gray-500 font-mono">1 筆歷史書籤</span>
          </div>

          {/* 書籤折疊元件 (Bookmark Accordion) */}
          <div className="w-full rounded-2xl border border-gray-800/90 bg-gray-900/30 overflow-hidden shadow-xl backdrop-blur-md transition-all">
            {/* 書籤頂部觸發列 */}
            <div
              onClick={toggleBookmark}
              className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-850/50 transition-colors select-none group"
            >
              <div className="flex items-center gap-3 truncate">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-sm shadow-amber-950/30 group-hover:border-amber-400/60 transition-colors">
                  <Bookmark className="w-4 h-4 fill-amber-400/40" />
                </div>

                <div className="flex flex-col gap-1 truncate text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm sm:text-base font-black text-white group-hover:text-amber-200 transition-colors truncate">
                      ホロライブ甲子園2026 冠軍預測
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-400/30 shrink-0">
                      📑 歷史企劃書籤
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-800/80 text-gray-400 border border-gray-700 shrink-0">
                      🔒 賽事已圓滿落幕
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-gray-400 font-mono flex-wrap">
                    <span className="text-amber-200/90 font-semibold">單人獎金 500 $TEE</span>
                    <span className="text-gray-600">•</span>
                    {pastConfirmedChoice ? (
                      <span className="text-[#00FFA3] font-semibold">你的預測：【{pastConfirmedChoice}】</span>
                    ) : (
                      <span className="text-gray-500">未參與預測</span>
                    )}
                    {pastIsSettled && pastWinningChoice && (
                      <>
                        <span className="text-gray-600">•</span>
                        <span className="text-yellow-400 font-semibold">冠軍：【{pastWinningChoice}】</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800/60 group-hover:bg-gray-800 text-xs font-bold text-amber-300/90 group-hover:text-amber-200 border border-gray-700/60 shrink-0 transition-all">
                <span className="hidden sm:inline">{isBookmarkExpanded ? "收合書籤" : "展開查閱"}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isBookmarkExpanded ? "rotate-180" : ""}`} />
              </div>
            </div>

            {/* 書籤展開內部內容 */}
            {isBookmarkExpanded && (
              <div className="p-4 sm:p-6 border-t border-gray-800/80 bg-gray-950/40 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                {/* 說明與獎金 */}
                <div className="text-center space-y-3">
                  <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
                    六校爭霸，誰能登頂！本企劃已於 2026 年 10 月 17 日賽事圓滿落幕。
                  </p>

                  <div className="inline-flex items-center justify-center px-5 py-2 rounded-xl bg-gradient-to-b from-[#1c160c] to-[#0e0b06] border border-amber-500/40 shadow-lg shadow-amber-950/20 backdrop-blur-md">
                    <div className="flex items-center gap-2 font-black text-white text-xs">
                      <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-amber-200">正確預測獎金</span>
                      <span className="font-mono text-sm text-[#FFD700] tracking-wider drop-shadow-[0_0_8px_rgba(255,215,0,0.4)]">
                        500 $TEE
                      </span>
                    </div>
                  </div>

                  {pastIsSettled && pastWinningChoice && (
                    <div className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 border border-amber-400/50 text-amber-200 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-950/30 text-center">
                      <span>🏆 ホロライブ甲子園2026 冠軍預測 結果：【{pastWinningChoice}】</span>
                    </div>
                  )}
                </div>

                {/* 六校卡片展示 (回顧檢視) */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  <div className="flex flex-col gap-3">
                    {PAST_SCHOOLS_LEFT.map((school) => {
                      const isSelected = pastConfirmedChoice === school.name;
                      const isWinner = pastIsSettled && pastWinningChoice === school.name;

                      return (
                        <div
                          key={school.id}
                          className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-2 select-none ${
                            isWinner
                              ? "bg-amber-950/40 border-amber-400 text-white"
                              : isSelected
                              ? "bg-[#142320]/80 border-[#00FFA3]/60 text-white"
                              : "bg-[#0b0e14] border-[#181f2c] text-gray-500 opacity-60"
                          }`}
                        >
                          <span className="text-xs font-bold truncate">{school.name}</span>
                          {isWinner && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950">
                              🏆 冠軍
                            </span>
                          )}
                          {isSelected && !isWinner && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#00FFA3]/20 text-[#00FFA3]">
                              你的選擇
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-col gap-3">
                    {PAST_SCHOOLS_RIGHT.map((school) => {
                      const isSelected = pastConfirmedChoice === school.name;
                      const isWinner = pastIsSettled && pastWinningChoice === school.name;

                      return (
                        <div
                          key={school.id}
                          className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-2 select-none ${
                            isWinner
                              ? "bg-amber-950/40 border-amber-400 text-white"
                              : isSelected
                              ? "bg-[#142320]/80 border-[#00FFA3]/60 text-white"
                              : "bg-[#0b0e14] border-[#181f2c] text-gray-500 opacity-60"
                          }`}
                        >
                          <span className="text-xs font-bold truncate">{school.name}</span>
                          {isWinner && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950">
                              🏆 冠軍
                            </span>
                          )}
                          {isSelected && !isWinner && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#00FFA3]/20 text-[#00FFA3]">
                              你的選擇
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 個人紀錄與成果反饋 */}
                <div className="w-full space-y-3">
                  {pastIsSettled ? (
                    pastConfirmedChoice === pastWinningChoice ? (
                      <div className="w-full p-4 rounded-xl bg-gradient-to-b from-[#142320] to-[#0d1715] border border-[#00FFA3]/70 text-center space-y-1">
                        <div className="text-sm font-black text-[#00FFA3] flex items-center justify-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>🎉 恭喜預測正確！已發放獎金 500 $TEE</span>
                        </div>
                        <p className="text-xs text-emerald-200/90 font-mono">
                          你預測的【{pastConfirmedChoice}】榮獲本屆大賽冠軍！
                        </p>
                      </div>
                    ) : pastConfirmedChoice ? (
                      <div className="w-full p-4 rounded-xl bg-gray-900/60 border border-gray-800 text-center space-y-1">
                        <div className="text-xs font-bold text-gray-300">
                          你選擇了【{pastConfirmedChoice}】，本屆冠軍為【{pastWinningChoice}】。感謝熱情參與！
                        </div>
                      </div>
                    ) : (
                      <div className="w-full p-4 rounded-xl bg-gray-900/60 border border-gray-800 text-center space-y-1">
                        <div className="text-xs font-bold text-gray-400">
                          本企劃已圓滿結算，感謝大家的熱情支持！
                        </div>
                      </div>
                    )
                  ) : (
                    pastConfirmedChoice ? (
                      <div className="w-full p-3.5 rounded-xl bg-[#142320]/60 border border-[#00FFA3]/40 text-center">
                        <p className="text-xs text-gray-300 font-mono">
                          你在本企劃中留下的預測選擇：<span className="text-[#00FFA3] font-bold">【{pastConfirmedChoice}】</span>
                        </p>
                      </div>
                    ) : (
                      <div className="w-full p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 text-center">
                        <p className="text-xs text-gray-400 font-mono">
                          你未於截止前參與本企劃預測（賽事已圓滿落幕）
                        </p>
                      </div>
                    )
                  )}

                  {/* 落幕提示條 */}
                  <div className="w-full py-3 px-4 rounded-xl font-black text-xs bg-[#12161f] border border-gray-800 text-gray-400 select-none flex items-center justify-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500/70" />
                    <span>本特別企劃已圓滿落幕，感謝所有玩家的熱情參與！</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
