"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TickerTape from "@/components/TickerTape";
import BottomNav from "@/components/BottomNav";
import { Trophy, CheckCircle2, Circle, Coins, Lock, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface BannerNotification {
  id: string;
  type: 'success' | 'failed';
  message: string;
  isFading: boolean;
}

interface SchoolItem {
  id: string;
  name: string;
}

const SCHOOLS_LEFT: SchoolItem[] = [
  { id: "waooon", name: "WAOOON高校" },
  { id: "shirogane", name: "白銀学園高校" },
  { id: "ahoy", name: "AHOY高校" },
];

const SCHOOLS_RIGHT: SchoolItem[] = [
  { id: "polpol", name: "ポルポル高校" },
  { id: "konkoyo", name: "こんこよ高校" },
  { id: "kabesaki", name: "壁咲高校" },
];

export default function EventsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [confirmedSchool, setConfirmedSchool] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isSettled, setIsSettled] = useState<boolean>(false);
  const [winningChoice, setWinningChoice] = useState<string | null>(null);
  const [hasWon, setHasWon] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<BannerNotification[]>([]);

  // 載入預測狀態與先前的選擇紀錄 (後端 API)
  useEffect(() => {
    let isMounted = true;
    const searchParams = new URLSearchParams(window.location.search);
    const testUnlock = searchParams.get("test_unlock");
    const url = testUnlock ? `/api/events/prediction?test_unlock=${testUnlock}` : `/api/events/prediction`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.isLocked !== undefined) {
          setIsLocked(data.isLocked);
        }
        if (data.isSettled !== undefined) {
          setIsSettled(data.isSettled);
          setWinningChoice(data.winningChoice);
          setHasWon(data.hasWon);
        }
        if (data.choice) {
          setSelectedSchool(data.choice);
          setConfirmedSchool(data.choice);
        } else {
          setConfirmedSchool(null);
          const pending = localStorage.getItem("holo_koushien_pending_choice");
          if (pending) {
            setSelectedSchool(pending);
            localStorage.removeItem("holo_koushien_pending_choice");
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load prediction status", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

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
      if (selectedSchool) {
        localStorage.setItem("holo_koushien_pending_choice", selectedSchool);
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

    if (!selectedSchool) {
      addNotification("failed", "請選擇一個選項");
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
        body: JSON.stringify({ choice: selectedSchool }),
      });

      const data = await res.json();
      if (!res.ok) {
        addNotification("failed", data.error || "操作失敗，無法儲存預測");
        if (res.status === 403) {
          setIsLocked(true);
        }
        return;
      }

      setConfirmedSchool(selectedSchool);
      localStorage.setItem("holo_koushien_2026_choice", selectedSchool);
      addNotification("success", `你在《ホロライブ甲子園2026 冠軍預測》選擇了【${selectedSchool}】`);
    } catch (err) {
      console.error("Failed to submit prediction", err);
      addNotification("failed", "網路錯誤，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSchoolCard = (school: SchoolItem) => {
    const isSelected = selectedSchool === school.name;
    const isWinner = isSettled && winningChoice === school.name;

    return (
      <button
        key={school.id}
        type="button"
        disabled={isLocked || isSettled}
        onClick={() => {
          if (!isLocked && !isSettled) {
            setSelectedSchool(school.name);
          }
        }}
        className={`w-full p-3.5 rounded-xl border text-left transition-all duration-200 flex items-center justify-between gap-2.5 select-none ${
          isWinner
            ? "bg-amber-950/40 border-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/80 text-white cursor-default"
            : isSettled
            ? isSelected
              ? "bg-[#142320]/80 border-[#00FFA3]/50 text-white cursor-default opacity-80"
              : "bg-[#0b0e14] border-[#181f2c] text-gray-500 cursor-default opacity-40"
            : isLocked
            ? isSelected
              ? "bg-[#142320]/80 border-[#00FFA3]/60 text-white cursor-not-allowed opacity-95"
              : "bg-[#0b0e14] border-[#181f2c] text-gray-500 cursor-not-allowed opacity-45"
            : isSelected
            ? "bg-[#142320] border-[#00FFA3] shadow-[0_0_16px_rgba(0,255,163,0.22)] text-white active:scale-[0.98] cursor-pointer"
            : "bg-[#10141d] border-[#222a3a] text-gray-300 hover:border-gray-600 hover:bg-[#141a26] active:scale-[0.98] cursor-pointer"
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-xs sm:text-sm font-black tracking-wide truncate">
            {school.name}
          </span>
          {isWinner && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shrink-0">
              🏆 冠軍
            </span>
          )}
        </div>

        <div className="shrink-0">
          {isWinner ? (
            <Trophy className="w-4 h-4 text-amber-400" />
          ) : isSelected ? (
            <CheckCircle2 className={`w-4 h-4 ${isLocked || isSettled ? "text-[#00FFA3]/80" : "text-[#00FFA3]"}`} />
          ) : (
            <Circle className={`w-4 h-4 ${isLocked || isSettled ? "text-gray-700" : "text-gray-600"}`} />
          )}
        </div>
      </button>
    );
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

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full">
        {/* 企劃標題區 */}
        <div className="text-center mb-6 w-full">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181a20] border border-[#2b2f36] text-[11px] text-[#ff69b4] font-bold mb-3 shadow-inner">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            特別企劃 · 期間限定
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide mb-2">
            ホロライブ甲子園2026 冠軍預測
          </h1>

          <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto mb-4">
            六校爭霸，誰能登頂！請選擇你心目中的優勝高校（單選）。
          </p>

          {/* 獎金展示區 */}
          <div className="inline-flex items-center justify-center px-6 py-2.5 rounded-2xl bg-gradient-to-b from-[#1c160c] to-[#0e0b06] border border-amber-500/40 shadow-xl shadow-amber-950/20 backdrop-blur-md mb-4">
            <div className="flex items-center gap-2 font-black text-white">
              <Coins className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs sm:text-sm text-amber-200">預測正確者獎金</span>
              <span className="font-mono text-base sm:text-lg text-[#FFD700] tracking-wider drop-shadow-[0_0_10px_rgba(255,215,0,0.4)]">
                500 $TEE
              </span>
            </div>
          </div>

          {/* 提示條：僅保留確認冠軍後（已結算公佈階段） */}
          {isSettled && (
            <div className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 border border-amber-400/50 text-amber-200 text-sm sm:text-base font-black flex items-center justify-center gap-2 shadow-xl shadow-amber-950/30 text-center">
              <span>🏆 ホロライブ甲子園2026 冠軍預測 結果：【{winningChoice}】</span>
            </div>
          )}
        </div>

        {/* 六個選項：左右排列各 3 個 */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          {/* 左邊 3 個 */}
          <div className="flex flex-col gap-3">
            {SCHOOLS_LEFT.map(renderSchoolCard)}
          </div>

          {/* 右邊 3 個 */}
          <div className="flex flex-col gap-3">
            {SCHOOLS_RIGHT.map(renderSchoolCard)}
          </div>
        </div>

        {/* 結算結果回饋區 或 下方確定按鈕 */}
        <div className="w-full flex flex-col items-center gap-3">
          {isSettled ? (
            <div className="w-full space-y-3">
              {/* 依使用者猜中狀況呈現客製化反饋 */}
              {confirmedSchool === winningChoice ? (
                <div className="w-full p-4 rounded-2xl bg-gradient-to-b from-[#142320] to-[#0d1715] border border-[#00FFA3]/70 shadow-xl shadow-emerald-950/30 text-center space-y-1.5 animate-in fade-in duration-300">
                  <div className="text-base sm:text-lg font-black text-[#00FFA3] tracking-wide flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>🎉 恭喜預測正確！已發放獎金 500 $TEE</span>
                  </div>
                  <p className="text-xs text-emerald-200/90 font-mono">
                    你預測的【{confirmedSchool}】榮獲本屆大賽冠軍！獎金 500 $TEE 已發放至您的帳戶。
                  </p>
                </div>
              ) : confirmedSchool ? (
                <div className="w-full p-4 rounded-2xl bg-gray-900/60 border border-gray-800 text-center space-y-1.5 animate-in fade-in duration-300">
                  <div className="text-sm sm:text-base font-bold text-gray-200">
                    很遺憾你沒猜中，感謝你的熱情參與！
                  </div>
                  <p className="text-xs text-gray-400 font-mono">
                    你選擇了【{confirmedSchool}】，本屆冠軍為【{winningChoice}】。感謝熱情支持，期待下次企劃！
                  </p>
                </div>
              ) : (
                <div className="w-full p-4 rounded-2xl bg-gray-900/60 border border-gray-800 text-center space-y-1.5 animate-in fade-in duration-300">
                  <div className="text-sm font-bold text-gray-300">
                    本屆企劃已圓滿結算，感謝大家的熱情支持！
                  </div>
                  <p className="text-xs text-gray-500 font-mono">
                    本屆冠軍高校為【{winningChoice}】，敬請期待未來的特別企劃！
                  </p>
                </div>
              )}

              <button
                type="button"
                disabled
                className="w-full py-3.5 px-6 rounded-xl font-black text-sm tracking-widest uppercase shadow-none bg-[#12161f] border border-gray-800 text-gray-500 cursor-not-allowed select-none flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4 text-amber-500/60" />
                <span>賽事已圓滿落幕</span>
              </button>
            </div>
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

              {confirmedSchool ? (
                <p className="text-[11px] text-gray-400 font-mono text-center">
                  你最終的預測選擇：<span className="text-[#00FFA3] font-bold">【{confirmedSchool}】</span>（已鎖定禁止變更）
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
                {isSubmitting ? "儲存中..." : "確定（將於10/17（六）12：00截止預測）"}
              </button>

              {!user && (
                <p className="text-[13.5px] text-amber-400/90 font-mono text-center">
                  ⚠️ 目前為未登入狀態，預測前請先登入以保存紀錄與領取獎金
                </p>
              )}

              {confirmedSchool && (
                <p className="text-[11px] text-gray-400 font-mono text-center">
                  你目前的選擇：<span className="text-[#00FFA3] font-bold">【{confirmedSchool}】</span>（可重新選擇並點確定更新）
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
