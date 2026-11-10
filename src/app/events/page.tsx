"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TickerTape from "@/components/TickerTape";
import BottomNav from "@/components/BottomNav";
import {
  Trophy,
  Coins,
  Sparkles,
  Bookmark,
  ChevronDown,
  ExternalLink,
  CheckCircle2,
  Circle,
  Lock,
  Timer,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  YUBI_SUMO_EVENT_ID,
  YUBI_SUMO_LIVE_URL,
  JUMP_KING_EVENT_ID,
  JUMP_KING_LIVE_URL,
  HOLO_KOUSHIEN_EVENT_ID,
} from "@/utils/eventDeadline";

interface BannerNotification {
  id: string;
  type: "success" | "failed";
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

  // ── 當前進行中企劃：ゆび相撲大会 冠軍預測 ──
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [confirmedChoice, setConfirmedChoice] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isSettled, setIsSettled] = useState<boolean>(false);
  const [winningChoice, setWinningChoice] = useState<string | null>(null);
  const [hasWon, setHasWon] = useState<boolean | null>(null);
  const [totalPool, setTotalPool] = useState<number>(5000);
  const [totalPredictions, setTotalPredictions] = useState<number>(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [liveStreamUrl, setLiveStreamUrl] = useState<string | null>(YUBI_SUMO_LIVE_URL);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // ── 歷屆企劃 1：JUMP KING HOLORACE ──
  const [isJumpKingBookmarkExpanded, setIsJumpKingBookmarkExpanded] = useState<boolean>(false);
  const [jumpKingConfirmedChoice, setJumpKingConfirmedChoice] = useState<string | null>(null);
  const [jumpKingIsSettled, setJumpKingIsSettled] = useState<boolean>(false);
  const [jumpKingWinningChoice, setJumpKingWinningChoice] = useState<string | null>(null);
  const [jumpKingHasWon, setJumpKingHasWon] = useState<boolean | null>(null);
  const [jumpKingTotalPool, setJumpKingTotalPool] = useState<number>(5000);

  // ── 歷屆企劃 2：ホロライブ甲子園2026 ──
  const [isKoushienBookmarkExpanded, setIsKoushienBookmarkExpanded] = useState<boolean>(false);
  const [koushienConfirmedChoice, setKoushienConfirmedChoice] = useState<string | null>(null);
  const [koushienIsSettled, setKoushienIsSettled] = useState<boolean>(false);
  const [koushienWinningChoice, setKoushienWinningChoice] = useState<string | null>(null);

  // ── 提示通知 ──
  const [notifications, setNotifications] = useState<BannerNotification[]>([]);

  // 讀取書籤展開偏好
  useEffect(() => {
    const savedJumpKing = localStorage.getItem("jump_king_bookmark_expanded");
    if (savedJumpKing !== null) {
      setIsJumpKingBookmarkExpanded(savedJumpKing === "true");
    }

    const savedKoushien = localStorage.getItem("koushien_bookmark_expanded");
    if (savedKoushien !== null) {
      setIsKoushienBookmarkExpanded(savedKoushien === "true");
    }
  }, []);

  const toggleJumpKingBookmark = () => {
    setIsJumpKingBookmarkExpanded((prev) => {
      const next = !prev;
      localStorage.setItem("jump_king_bookmark_expanded", String(next));
      return next;
    });
  };

  const toggleKoushienBookmark = () => {
    setIsKoushienBookmarkExpanded((prev) => {
      const next = !prev;
      localStorage.setItem("koushien_bookmark_expanded", String(next));
      return next;
    });
  };

  const addNotification = (type: "success" | "failed", message: string) => {
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
    }, 4500);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // 載入預測狀態與先前的選擇紀錄
  useEffect(() => {
    let isMounted = true;
    const searchParams = new URLSearchParams(window.location.search);
    const testUnlock = searchParams.get("test_unlock");

    // 1. 載入當前進行中企劃：ゆび相撲大会
    const yubiSumoUrl = testUnlock
      ? `/api/events/prediction?eventId=${YUBI_SUMO_EVENT_ID}&test_unlock=${testUnlock}`
      : `/api/events/prediction?eventId=${YUBI_SUMO_EVENT_ID}`;

    fetch(yubiSumoUrl)
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
        if (data.totalPredictions !== undefined) setTotalPredictions(data.totalPredictions);
        if (Array.isArray(data.choices)) setChoices(data.choices);
        if (data.liveStreamUrl !== undefined) setLiveStreamUrl(data.liveStreamUrl);

        if (data.choice) {
          setSelectedChoice(data.choice);
          setConfirmedChoice(data.choice);
        } else {
          setConfirmedChoice(null);
          const pending = localStorage.getItem("yubi_sumo_pending_choice");
          if (pending) {
            setSelectedChoice(pending);
            localStorage.removeItem("yubi_sumo_pending_choice");
          }
        }
      })
      .catch((err) => console.error("Failed to load yubi sumo prediction:", err));

    // 2. 載入歷屆企劃：JUMP KING HOLORACE
    fetch(`/api/events/prediction?eventId=${JUMP_KING_EVENT_ID}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.isSettled !== undefined) {
          setJumpKingIsSettled(data.isSettled);
          setJumpKingWinningChoice(data.winningChoice);
          setJumpKingHasWon(data.hasWon);
        }
        if (data.totalPool !== undefined) setJumpKingTotalPool(data.totalPool);
        if (data.choice) setJumpKingConfirmedChoice(data.choice);
      })
      .catch((err) => console.error("Failed to load jump king prediction:", err));

    // 3. 載入歷屆企劃：甲子園 2026 回顧資料
    fetch(`/api/events/prediction?eventId=${HOLO_KOUSHIEN_EVENT_ID}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.choice) setKoushienConfirmedChoice(data.choice);
        if (data.isSettled !== undefined) {
          setKoushienIsSettled(data.isSettled);
          setKoushienWinningChoice(data.winningChoice);
        }
      })
      .catch((err) => console.error("Failed to load past koushien event:", err));

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleConfirmSubmit = async () => {
    if (!user) {
      if (selectedChoice) {
        localStorage.setItem("yubi_sumo_pending_choice", selectedChoice);
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
      addNotification("failed", "請選擇一個冠軍選項");
      return;
    }

    setIsSubmitting(true);
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const testUnlock = searchParams.get("test_unlock");
      const url = testUnlock
        ? `/api/events/prediction?eventId=${YUBI_SUMO_EVENT_ID}&test_unlock=${testUnlock}`
        : `/api/events/prediction?eventId=${YUBI_SUMO_EVENT_ID}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: YUBI_SUMO_EVENT_ID,
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
      setShowConfirmModal(false);
      addNotification("success", `你在《ゆび相撲大会 冠軍預測》選擇了【${selectedChoice}】`);

      // 重新整理參與人數與獎金池試算
      fetch(url)
        .then((r) => r.json())
        .then((d) => {
          if (d.totalPool !== undefined) setTotalPool(d.totalPool);
          if (d.totalPredictions !== undefined) setTotalPredictions(d.totalPredictions);
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

      {/* 浮動通知橫幅 */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[90%] max-w-[450px] pointer-events-none">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => removeNotification(notif.id)}
            className={`pointer-events-auto cursor-pointer rounded-lg p-3.5 shadow-xl flex items-center justify-between gap-4 select-none transition-all duration-500 ${
              notif.isFading ? "opacity-0 scale-95 -translate-y-2" : "opacity-100 scale-100"
            } ${
              notif.type === "success"
                ? "bg-[#00FFA3]/15 border border-[#00FFA3]/50 text-[#00FFA3] backdrop-blur-md"
                : "bg-red-500/15 border border-red-500/50 text-red-300 backdrop-blur-md"
            }`}
          >
            <span className="text-xs font-bold">{notif.message}</span>
            <span className="text-xs opacity-60 hover:opacity-100 transition-opacity">✕</span>
          </div>
        ))}
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

        {/* ═══════════════ 當前進行中企劃：ゆび相撲大会 ═══════════════ */}
        <div className="w-full flex flex-col items-center mb-10">
          <div className="text-center mb-5 w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black mb-2">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              <span>特別企劃 · 冠軍預測活動</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
              ゆび相撲大会 冠軍預測
            </h2>

            {/* YouTube 現場直播按鈕 (公布時即時啟用) */}
            {liveStreamUrl && (
              <div className="mb-4">
                <a
                  href={liveStreamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600/25 via-red-500/20 to-red-600/25 hover:from-red-600/40 hover:to-red-600/40 border border-red-500/50 text-red-200 hover:text-white text-xs sm:text-sm font-black transition-all shadow-lg shadow-red-950/30 active:scale-95 group select-none"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  <span>📺 前往 YouTube 現場直播觀看賽事 ↗</span>
                  <ExternalLink className="w-3.5 h-3.5 text-red-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            )}

            {/* 總獎金池展示看板（與 JUMP KING 獎金架構相同） */}
            <div className="w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#1c160c] via-[#141009] to-[#0a0805] border border-amber-500/50 shadow-xl shadow-amber-950/30 backdrop-blur-md mb-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-amber-200 font-bold block">
                      累積總獎金池
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      根據預測人數增加，猜中者均分。
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

              {totalPredictions > 0 && (
                <div className="mt-2.5 pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px] text-amber-200/80 font-mono">
                  <span>目前預測參與熱度</span>
                  <span className="font-bold text-[#00FFA3]">{totalPredictions} 人已參與</span>
                </div>
              )}
            </div>

            {/* 結算結果大橫幅 */}
            {isSettled && winningChoice && (
              <div className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 border border-amber-400/50 text-amber-200 text-sm sm:text-base font-black flex items-center justify-center gap-2 shadow-xl shadow-amber-950/30 text-center mb-4">
                <span>🏆 ゆび相撲大会 最終冠軍結果：【{winningChoice}】</span>
              </div>
            )}
          </div>

          {/* 選項展示區域（選項後續更新：未發布時顯示籌備公告，發布後自動渲染選項卡片） */}
          {choices.length === 0 ? (
            <div className="w-full p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#141822] via-[#0f131a] to-[#0a0d12] border border-amber-500/30 text-center space-y-3 shadow-xl backdrop-blur-md mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-inner shadow-amber-950/40">
                <Sparkles className="w-6 h-6 text-amber-300" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-black text-white">
                  參賽選手名單與預測選項即將公布
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
                  大會賽程與預測名單籌備中，選項名單發布後將立即開放預測投票，敬請持續關注！
                </p>
              </div>

              <div className="pt-2">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  名單整理中 · 預測即將開放
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-6">
              {choices.map((choiceName, idx) => {
                const isSelected = (selectedChoice ?? confirmedChoice) === choiceName;
                const isWinner = isSettled && winningChoice === choiceName;

                return (
                  <button
                    key={choiceName}
                    type="button"
                    disabled={isLocked || isSettled}
                    onClick={() => {
                      if (!isLocked && !isSettled) {
                        setSelectedChoice(choiceName);
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
                    <div className="flex items-center gap-2.5 text-left min-w-0 flex-1">
                      <span className="w-5 h-5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs sm:text-sm font-black tracking-wide leading-snug break-words">
                        {choiceName}
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
          )}

          {/* 送出預測 / 鎖定狀態列 */}
          <div className="w-full flex flex-col items-center gap-3">
            {choices.length === 0 ? (
              <button
                type="button"
                disabled
                className="w-full py-3.5 px-6 rounded-xl font-black text-sm tracking-widest uppercase shadow-none bg-[#161a22] border border-gray-700/60 text-gray-500 cursor-not-allowed select-none flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-gray-500" />
                <span>預測選項準備中 · 敬請期待名單發布</span>
              </button>
            ) : isSettled ? (
              hasWon ? (
                <div className="w-full p-4 rounded-xl bg-gradient-to-b from-[#142320] to-[#0d1715] border border-[#00FFA3]/70 text-center space-y-1">
                  <div className="text-sm font-black text-[#00FFA3] flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>🎉 恭喜預測正確！已瓜分發放獎金！</span>
                  </div>
                  <p className="text-xs text-emerald-200/90 font-mono">
                    你預測的【{confirmedChoice}】榮獲本屆大賽冠軍！
                  </p>
                </div>
              ) : confirmedChoice ? (
                <div className="w-full p-4 rounded-xl bg-gray-900/60 border border-gray-800 text-center space-y-1">
                  <div className="text-xs font-bold text-gray-300">
                    你選擇了【{confirmedChoice}】{winningChoice ? `，本屆冠軍為【${winningChoice}】` : ""}。感謝熱情參與！
                  </div>
                </div>
              ) : (
                <div className="w-full p-4 rounded-xl bg-gray-900/60 border border-gray-800 text-center space-y-1">
                  <div className="text-xs font-bold text-gray-400">
                    本特別企劃已圓滿結算，感謝大家的熱情支持！
                  </div>
                </div>
              )
            ) : isLocked ? (
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
                    賽事已截止鎖定，你未於截止前完成預測選擇。
                  </p>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={!selectedChoice || isSubmitting}
                  onClick={() => setShowConfirmModal(true)}
                  className={`w-full py-3.5 px-6 rounded-xl font-black text-sm tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-lg select-none ${
                    selectedChoice && !isSubmitting
                      ? "bg-gradient-to-r from-[#00FFA3] to-[#00d688] text-slate-950 hover:brightness-110 shadow-[#00FFA3]/20 active:scale-[0.99] cursor-pointer"
                      : "bg-gray-800 text-gray-500 cursor-not-allowed shadow-none"
                  }`}
                >
                  {isSubmitting ? (
                    <span>儲存中...</span>
                  ) : confirmedChoice ? (
                    selectedChoice === confirmedChoice ? (
                      <span>預測已保存（可重新選擇更新）</span>
                    ) : (
                      <span>更新預測選擇</span>
                    )
                  ) : (
                    <span>確認送出預測</span>
                  )}
                </button>

                {confirmedChoice && (
                  <p className="text-[11px] text-gray-400 font-mono text-center">
                    目前已保存預測：<span className="text-[#00FFA3] font-bold">【{confirmedChoice}】</span>（截止前皆可自由變更）
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── 確認送出彈窗 ── */}
        {showConfirmModal && selectedChoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Trophy className="w-5 h-5" />
                <h3 className="text-base font-black text-white">確認你的企劃預測</h3>
              </div>

              <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 text-center space-y-1">
                <span className="text-xs text-gray-400">你選擇的預測項目</span>
                <p className="text-lg font-black text-[#00FFA3]">【{selectedChoice}】</p>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed text-center">
                在管理員手動截止前，你隨時可以回來變更你的選擇。猜中者將均分累積總獎金池！
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-xs font-bold hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  返回重選
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00FFA3] to-[#00d688] text-slate-950 text-xs font-black hover:brightness-110 transition-all shadow-lg shadow-[#00FFA3]/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "送出中..." : "確認送出"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 歷屆企劃回顧區：以書籤折疊方式保存 ── */}
        <section className="w-full space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              <h2 className="text-sm font-bold text-white tracking-wide">歷屆企劃回顧 (Past Events)</h2>
            </div>
            <span className="text-[11px] text-gray-500 font-mono">2 筆歷史書籤</span>
          </div>

          {/* ═══════════════ 書籤 1：JUMP KING HOLORACE ═══════════════ */}
          <div className="w-full rounded-2xl border border-gray-800/90 bg-gray-900/30 overflow-hidden shadow-xl backdrop-blur-md transition-all">
            {/* 書籤頂部觸發列 */}
            <div
              onClick={toggleJumpKingBookmark}
              className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-850/50 transition-colors select-none group"
            >
              <div className="flex items-center gap-3 truncate">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-sm shadow-amber-950/30 group-hover:border-amber-400/60 transition-colors">
                  <Bookmark className="w-4 h-4 fill-amber-400/40" />
                </div>

                <div className="flex flex-col gap-1 truncate text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm sm:text-base font-black text-white group-hover:text-amber-200 transition-colors truncate">
                      JUMP KING HOLORACE 優勝者到達地點預測
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-400/30 shrink-0">
                      📑 歷史企劃書籤
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-800/80 text-gray-400 border border-gray-700 shrink-0">
                      🔒 賽事已圓滿落幕
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-gray-400 font-mono flex-wrap">
                    <span className="text-amber-200/90 font-semibold">
                      總獎金池 {jumpKingTotalPool.toLocaleString()} $TEE
                    </span>
                    <span className="text-gray-600">•</span>
                    {jumpKingConfirmedChoice ? (
                      <span className="text-[#00FFA3] font-semibold">你的預測：【{jumpKingConfirmedChoice}】</span>
                    ) : (
                      <span className="text-gray-500">未參與預測</span>
                    )}
                    {jumpKingIsSettled && jumpKingWinningChoice && (
                      <>
                        <span className="text-gray-600">•</span>
                        <span className="text-yellow-400 font-semibold">優勝：【{jumpKingWinningChoice}】</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800/60 group-hover:bg-gray-800 text-xs font-bold text-amber-300/90 group-hover:text-amber-200 border border-gray-700/60 shrink-0 transition-all">
                <span className="hidden sm:inline">{isJumpKingBookmarkExpanded ? "收合書籤" : "展開查閱"}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isJumpKingBookmarkExpanded ? "rotate-180" : ""}`} />
              </div>
            </div>

            {/* 書籤展開內部內容 */}
            {isJumpKingBookmarkExpanded && (
              <div className="p-4 sm:p-6 border-t border-gray-800/80 bg-gray-950/40 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                {/* 說明與獎金 */}
                <div className="text-center space-y-3">
                  <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
                    挑戰極限，誰能登頂！本企劃已於 2026 年 10 月 30 日賽事圓滿落幕。
                  </p>

                  {/* YouTube 賽事回放按鈕 */}
                  <div className="pt-1">
                    <a
                      href={JUMP_KING_LIVE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/40 text-red-200 hover:text-white text-xs font-bold transition-all shadow-md group select-none"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                      <span>📺 前往 YouTube 觀看賽事回放 ↗</span>
                      <ExternalLink className="w-3.5 h-3.5 text-red-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>

                  <div className="inline-flex items-center justify-center px-5 py-2 rounded-xl bg-gradient-to-b from-[#1c160c] to-[#0e0b06] border border-amber-500/40 shadow-lg shadow-amber-950/20 backdrop-blur-md">
                    <div className="flex items-center gap-2 font-black text-white text-xs">
                      <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-amber-200">活動總獎金池</span>
                      <span className="font-mono text-sm text-[#FFD700] tracking-wider drop-shadow-[0_0_8px_rgba(255,215,0,0.4)]">
                        {jumpKingTotalPool.toLocaleString()} $TEE
                      </span>
                    </div>
                  </div>

                  {jumpKingIsSettled && jumpKingWinningChoice && (
                    <div className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 border border-amber-400/50 text-amber-200 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-950/30 text-center">
                      <span>🏆 JUMP KING HOLORACE 優勝最高到達地點：【{jumpKingWinningChoice}】</span>
                    </div>
                  )}
                </div>

                {/* 六個選項卡片展示 (回顧檢視) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  {JUMP_KING_OPTIONS.map((opt) => {
                    const isSelected = jumpKingConfirmedChoice === opt.name;
                    const isWinner = jumpKingIsSettled && jumpKingWinningChoice === opt.name;

                    return (
                      <div
                        key={opt.id}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-2 select-none ${
                          isWinner
                            ? "bg-amber-950/40 border-amber-400 text-white"
                            : isSelected
                            ? "bg-[#142320]/80 border-[#00FFA3]/60 text-white"
                            : "bg-[#0b0e14] border-[#181f2c] text-gray-500 opacity-60"
                        }`}
                      >
                        <span className="text-xs font-bold leading-snug break-words flex-1 min-w-0">
                          {opt.name}
                        </span>
                        <div className="shrink-0 flex items-center gap-1.5">
                          {isWinner && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950">
                              🏆 優勝
                            </span>
                          )}
                          {isSelected && !isWinner && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#00FFA3]/20 text-[#00FFA3]">
                              你的選擇
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 個人紀錄與成果反饋 */}
                <div className="w-full space-y-3">
                  {jumpKingIsSettled ? (
                    jumpKingHasWon ? (
                      <div className="w-full p-4 rounded-xl bg-gradient-to-b from-[#142320] to-[#0d1715] border border-[#00FFA3]/70 text-center space-y-1">
                        <div className="text-sm font-black text-[#00FFA3] flex items-center justify-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>🎉 恭喜預測正確！已瓜分發放獎金！</span>
                        </div>
                        <p className="text-xs text-emerald-200/90 font-mono">
                          你預測的【{jumpKingConfirmedChoice}】為本屆大賽最終優勝地點！
                        </p>
                      </div>
                    ) : jumpKingConfirmedChoice ? (
                      <div className="w-full p-4 rounded-xl bg-gray-900/60 border border-gray-800 text-center space-y-1">
                        <div className="text-xs font-bold text-gray-300">
                          你選擇了【{jumpKingConfirmedChoice}】{jumpKingWinningChoice ? `，本屆優勝為【${jumpKingWinningChoice}】` : ''}。感謝熱情參與！
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
                    jumpKingConfirmedChoice ? (
                      <div className="w-full p-3.5 rounded-xl bg-[#142320]/60 border border-[#00FFA3]/40 text-center">
                        <p className="text-xs text-gray-300 font-mono">
                          你在本企劃中留下的預測選擇：<span className="text-[#00FFA3] font-bold">【{jumpKingConfirmedChoice}】</span>
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

          {/* ═══════════════ 書籤 2：ホロライブ甲子園2026 ═══════════════ */}
          <div className="w-full rounded-2xl border border-gray-800/90 bg-gray-900/30 overflow-hidden shadow-xl backdrop-blur-md transition-all">
            {/* 書籤頂部觸發列 */}
            <div
              onClick={toggleKoushienBookmark}
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
                    {koushienConfirmedChoice ? (
                      <span className="text-[#00FFA3] font-semibold">你的預測：【{koushienConfirmedChoice}】</span>
                    ) : (
                      <span className="text-gray-500">未參與預測</span>
                    )}
                    {koushienIsSettled && koushienWinningChoice && (
                      <>
                        <span className="text-gray-600">•</span>
                        <span className="text-yellow-400 font-semibold">冠軍：【{koushienWinningChoice}】</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800/60 group-hover:bg-gray-800 text-xs font-bold text-amber-300/90 group-hover:text-amber-200 border border-gray-700/60 shrink-0 transition-all">
                <span className="hidden sm:inline">{isKoushienBookmarkExpanded ? "收合書籤" : "展開查閱"}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isKoushienBookmarkExpanded ? "rotate-180" : ""}`} />
              </div>
            </div>

            {/* 書籤展開內部內容 */}
            {isKoushienBookmarkExpanded && (
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

                  {koushienIsSettled && koushienWinningChoice && (
                    <div className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 border border-amber-400/50 text-amber-200 text-xs sm:text-base font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-950/30 text-center">
                      <span>🏆 ホロライブ甲子園2026 冠軍預測 結果：【{koushienWinningChoice}】</span>
                    </div>
                  )}
                </div>

                {/* 六校卡片展示 (回顧檢視) */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  <div className="flex flex-col gap-3">
                    {PAST_SCHOOLS_LEFT.map((school) => {
                      const isSelected = koushienConfirmedChoice === school.name;
                      const isWinner = koushienIsSettled && koushienWinningChoice === school.name;

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
                      const isSelected = koushienConfirmedChoice === school.name;
                      const isWinner = koushienIsSettled && koushienWinningChoice === school.name;

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
                  {koushienIsSettled ? (
                    koushienConfirmedChoice === koushienWinningChoice ? (
                      <div className="w-full p-4 rounded-xl bg-gradient-to-b from-[#142320] to-[#0d1715] border border-[#00FFA3]/70 text-center space-y-1">
                        <div className="text-sm font-black text-[#00FFA3] flex items-center justify-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>🎉 恭喜預測正確！已發放獎金 500 $TEE</span>
                        </div>
                        <p className="text-xs text-emerald-200/90 font-mono">
                          你預測的【{koushienConfirmedChoice}】榮獲本屆大賽冠軍！
                        </p>
                      </div>
                    ) : koushienConfirmedChoice ? (
                      <div className="w-full p-4 rounded-xl bg-gray-900/60 border border-gray-800 text-center space-y-1">
                        <div className="text-xs font-bold text-gray-300">
                          你選擇了【{koushienConfirmedChoice}】，本屆冠軍為【{koushienWinningChoice}】。感謝熱情參與！
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
                    koushienConfirmedChoice ? (
                      <div className="w-full p-3.5 rounded-xl bg-[#142320]/60 border border-[#00FFA3]/40 text-center">
                        <p className="text-xs text-gray-300 font-mono">
                          你在本企劃中留下的預測選擇：<span className="text-[#00FFA3] font-bold">【{koushienConfirmedChoice}】</span>
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

