"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TickerTape from "@/components/TickerTape";
import BottomNav from "@/components/BottomNav";
import {
  Trophy,
  Coins,
  Lock,
  Sparkles,
  Bookmark,
  ChevronDown,
  ExternalLink,
  Timer,
  X,
  RotateCcw,
  GripVertical,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  HOLO_TRIATHLON_EVENT_ID,
  HOLO_TRIATHLON_TITLE,
  HOLO_TRIATHLON_LIVE_URL,
  TRIATHLON_CONTESTANTS,
  parseTriathlonTrifecta,
  formatTriathlonTrifecta,
  evaluateTriathlonPayout,
  type TriathlonPayoutTier,
  YUBI_SUMO_EVENT_ID,
  YUBI_SUMO_LIVE_URL,
  YUBI_SUMO_CHOICES,
  YUBI_SUMO_PRIORITY_CHOICE,
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

const PODIUM_SLOTS = [
  {
    idx: 0 as const,
    rank: "1st",
    medal: "🥇",
    boxClass:
      "border-amber-400/80 bg-gradient-to-b from-amber-500/20 via-amber-950/35 to-[#120d04] shadow-[0_0_24px_rgba(251,191,36,0.16)]",
    activeClass: "ring-2 ring-amber-300 shadow-[0_0_28px_rgba(251,191,36,0.35)]",
    textClass: "text-amber-300",
    emptyBorder: "border-amber-400/45",
  },
  {
    idx: 1 as const,
    rank: "2nd",
    medal: "🥈",
    boxClass:
      "border-slate-300/75 bg-gradient-to-b from-slate-300/18 via-slate-800/35 to-[#0b0e14] shadow-[0_0_20px_rgba(203,213,225,0.12)]",
    activeClass: "ring-2 ring-slate-200 shadow-[0_0_26px_rgba(226,232,240,0.3)]",
    textClass: "text-slate-200",
    emptyBorder: "border-slate-400/45",
  },
  {
    idx: 2 as const,
    rank: "3rd",
    medal: "🥉",
    boxClass:
      "border-orange-500/75 bg-gradient-to-b from-orange-600/20 via-orange-950/35 to-[#130a05] shadow-[0_0_20px_rgba(234,88,12,0.14)]",
    activeClass: "ring-2 ring-orange-400 shadow-[0_0_26px_rgba(249,115,22,0.32)]",
    textClass: "text-orange-300",
    emptyBorder: "border-orange-500/45",
  },
] as const;

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

  // ── 當前進行中企劃：ホロドリトライアスロン 三連單 ──
  const [slots, setSlots] = useState<[string | null, string | null, string | null]>([null, null, null]);
  const [confirmedChoice, setConfirmedChoice] = useState<string | null>(null);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isSettled, setIsSettled] = useState<boolean>(false);
  const [winningChoice, setWinningChoice] = useState<string | null>(null);
  const [payoutInfo, setPayoutInfo] = useState<{
    tier: TriathlonPayoutTier | null;
    amount: number | null;
    label: string | null;
  }>({ tier: null, amount: null, label: null });
  const [liveStreamUrl, setLiveStreamUrl] = useState<string | null>(HOLO_TRIATHLON_LIVE_URL);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // ── 歷屆企劃 1：ゆび相撲大会 預測 ──
  const [isYubiSumoBookmarkExpanded, setIsYubiSumoBookmarkExpanded] = useState<boolean>(false);
  const [yubiSumoConfirmedChoice, setYubiSumoConfirmedChoice] = useState<string | null>(null);
  const [yubiSumoIsSettled, setYubiSumoIsSettled] = useState<boolean>(false);
  const [yubiSumoWinningChoice, setYubiSumoWinningChoice] = useState<string | null>(null);
  const [yubiSumoHasWon, setYubiSumoHasWon] = useState<boolean | null>(null);
  const [yubiSumoTotalPool, setYubiSumoTotalPool] = useState<number>(5000);
  const [yubiSumoChoices, setYubiSumoChoices] = useState<readonly string[]>(YUBI_SUMO_CHOICES);
  const [yubiSumoLiveStreamUrl, setYubiSumoLiveStreamUrl] = useState<string | null>(YUBI_SUMO_LIVE_URL);

  // ── 歷屆企劃 2：JUMP KING HOLORACE ──
  const [isJumpKingBookmarkExpanded, setIsJumpKingBookmarkExpanded] = useState<boolean>(false);
  const [jumpKingConfirmedChoice, setJumpKingConfirmedChoice] = useState<string | null>(null);
  const [jumpKingIsSettled, setJumpKingIsSettled] = useState<boolean>(false);
  const [jumpKingWinningChoice, setJumpKingWinningChoice] = useState<string | null>(null);
  const [jumpKingHasWon, setJumpKingHasWon] = useState<boolean | null>(null);
  const [jumpKingTotalPool, setJumpKingTotalPool] = useState<number>(5000);

  // ── 歷屆企劃 3：ホロライブ甲子園2026 ──
  const [isKoushienBookmarkExpanded, setIsKoushienBookmarkExpanded] = useState<boolean>(false);
  const [koushienConfirmedChoice, setKoushienConfirmedChoice] = useState<string | null>(null);
  const [koushienIsSettled, setKoushienIsSettled] = useState<boolean>(false);
  const [koushienWinningChoice, setKoushienWinningChoice] = useState<string | null>(null);

  // ── 提示通知 ──
  const [notifications, setNotifications] = useState<BannerNotification[]>([]);

  // 讀取書籤展開偏好
  useEffect(() => {
    const savedYubiSumo = localStorage.getItem("yubi_sumo_bookmark_expanded");
    if (savedYubiSumo !== null) {
      setIsYubiSumoBookmarkExpanded(savedYubiSumo === "true");
    }

    const savedJumpKing = localStorage.getItem("jump_king_bookmark_expanded");
    if (savedJumpKing !== null) {
      setIsJumpKingBookmarkExpanded(savedJumpKing === "true");
    }

    const savedKoushien = localStorage.getItem("koushien_bookmark_expanded");
    if (savedKoushien !== null) {
      setIsKoushienBookmarkExpanded(savedKoushien === "true");
    }
  }, []);

  const toggleYubiSumoBookmark = () => {
    setIsYubiSumoBookmarkExpanded((prev) => {
      const next = !prev;
      localStorage.setItem("yubi_sumo_bookmark_expanded", String(next));
      return next;
    });
  };

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

  // 載入當前企劃與歷屆企劃預測紀錄
  useEffect(() => {
    let isMounted = true;
    const searchParams = new URLSearchParams(window.location.search);
    const testUnlock = searchParams.get("test_unlock");

    // 1. 載入當前進行中企劃：ホロドリトライアスロン 三連單
    const triathlonUrl = testUnlock
      ? `/api/events/prediction?eventId=${HOLO_TRIATHLON_EVENT_ID}&test_unlock=${testUnlock}`
      : `/api/events/prediction?eventId=${HOLO_TRIATHLON_EVENT_ID}`;

    fetch(triathlonUrl)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.isLocked !== undefined) setIsLocked(data.isLocked);
        if (data.isSettled !== undefined) {
          setIsSettled(data.isSettled);
          setWinningChoice(data.winningChoice);
          setPayoutInfo({
            tier: data.payoutTier || null,
            amount: data.payoutAmount ?? null,
            label: data.payoutLabel || null,
          });
        }
        if (data.liveStreamUrl !== undefined) setLiveStreamUrl(data.liveStreamUrl);

        if (data.choice) {
          const parsed = parseTriathlonTrifecta(data.choice);
          if (parsed) {
            setSlots([parsed[0], parsed[1], parsed[2]]);
          }
          setConfirmedChoice(data.choice);
        } else {
          setConfirmedChoice(null);
          const pending = localStorage.getItem("holo_triathlon_pending_choice");
          if (pending) {
            const parsedPending = parseTriathlonTrifecta(pending);
            if (parsedPending) {
              setSlots([parsedPending[0], parsedPending[1], parsedPending[2]]);
            }
            localStorage.removeItem("holo_triathlon_pending_choice");
          }
        }
      })
      .catch((err) => console.error("Failed to load triathlon prediction:", err));

    // 2. 載入歷屆企劃：ゆび相撲大会 預測
    fetch(`/api/events/prediction?eventId=${YUBI_SUMO_EVENT_ID}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.isSettled !== undefined) {
          setYubiSumoIsSettled(data.isSettled);
          setYubiSumoWinningChoice(data.winningChoice);
          setYubiSumoHasWon(data.hasWon);
        }
        if (data.totalPool !== undefined) setYubiSumoTotalPool(data.totalPool);
        if (Array.isArray(data.choices) && data.choices.length > 0) setYubiSumoChoices(data.choices);
        if (data.liveStreamUrl !== undefined) setYubiSumoLiveStreamUrl(data.liveStreamUrl);
        if (data.choice) setYubiSumoConfirmedChoice(data.choice);
      })
      .catch((err) => console.error("Failed to load yubi sumo prediction:", err));

    // 3. 載入歷屆企劃：JUMP KING HOLORACE
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

    // 4. 載入歷屆企劃：甲子園 2026 回顧資料
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

  // ── 拖曳與點擊互動邏輯 ──
  const isDisabled = isLocked || isSettled;

  const findContestant = (jpName: string | null) =>
    jpName ? TRIATHLON_CONTESTANTS.find((c) => c.jp === jpName) || null : null;

  const placeContestantInSlot = (jpName: string, targetIdx: number) => {
    if (isDisabled) return;
    setSlots((prev) => {
      const next: [string | null, string | null, string | null] = [...prev] as [
        string | null,
        string | null,
        string | null
      ];
      const existingIdx = next.indexOf(jpName);
      if (existingIdx !== -1 && existingIdx !== targetIdx) {
        // 交換兩個框位
        next[existingIdx] = next[targetIdx];
      }
      next[targetIdx] = jpName;

      // 自動將目標框切換至下一個空框
      const nextEmpty = next.findIndex((s) => s === null);
      if (nextEmpty !== -1) {
        setActiveSlotIndex(nextEmpty);
      }
      return next;
    });
  };

  const swapOrMoveSlot = (fromIdx: number, toIdx: number) => {
    if (isDisabled || fromIdx === toIdx) return;
    setSlots((prev) => {
      const next: [string | null, string | null, string | null] = [...prev] as [
        string | null,
        string | null,
        string | null
      ];
      const temp = next[toIdx];
      next[toIdx] = next[fromIdx];
      next[fromIdx] = temp;
      return next;
    });
  };

  const clearSlot = (idx: number) => {
    if (isDisabled) return;
    setSlots((prev) => {
      const next: [string | null, string | null, string | null] = [...prev] as [
        string | null,
        string | null,
        string | null
      ];
      next[idx] = null;
      return next;
    });
    setActiveSlotIndex(idx);
  };

  const handleCardClick = (jpName: string) => {
    if (isDisabled) return;
    const assignedIdx = slots.indexOf(jpName);
    if (assignedIdx !== -1) {
      clearSlot(assignedIdx);
      return;
    }
    const targetIdx =
      slots[activeSlotIndex] === null
        ? activeSlotIndex
        : slots.findIndex((s) => s === null) !== -1
        ? slots.findIndex((s) => s === null)
        : activeSlotIndex;
    placeContestantInSlot(jpName, targetIdx);
  };

  const handleCardDragStart = (e: React.DragEvent, jpName: string, fromSlotIdx?: number) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ jpName, fromSlotIdx: fromSlotIdx ?? null })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const handleSlotDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    setDragOverSlot(null);
    if (isDisabled) return;
    try {
      const raw = e.dataTransfer.getData("application/json");
      if (!raw) return;
      const payload = JSON.parse(raw) as { jpName?: string; fromSlotIdx?: number | null };
      if (typeof payload.fromSlotIdx === "number") {
        swapOrMoveSlot(payload.fromSlotIdx, targetIdx);
      } else if (payload.jpName) {
        placeContestantInSlot(payload.jpName, targetIdx);
      }
    } catch {
      // ignore invalid drop payload
    }
  };

  const handlePoolDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverSlot(null);
    if (isDisabled) return;
    try {
      const raw = e.dataTransfer.getData("application/json");
      if (!raw) return;
      const payload = JSON.parse(raw) as { fromSlotIdx?: number | null };
      if (typeof payload.fromSlotIdx === "number") {
        clearSlot(payload.fromSlotIdx);
      }
    } catch {
      // ignore
    }
  };

  const filledCount = slots.filter(Boolean).length;
  const isAllSlotsFilled = Boolean(slots[0] && slots[1] && slots[2]);
  const currentFormattedChoice = isAllSlotsFilled
    ? formatTriathlonTrifecta([slots[0]!, slots[1]!, slots[2]!])
    : null;

  const handleConfirmSubmit = async () => {
    if (!currentFormattedChoice) {
      addNotification("failed", "請先將 3 位參賽者放入 1st、2nd、3rd 框中。");
      return;
    }

    if (!user) {
      localStorage.setItem("holo_triathlon_pending_choice", currentFormattedChoice);
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

    setIsSubmitting(true);
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const testUnlock = searchParams.get("test_unlock");
      const url = testUnlock
        ? `/api/events/prediction?eventId=${HOLO_TRIATHLON_EVENT_ID}&test_unlock=${testUnlock}`
        : `/api/events/prediction?eventId=${HOLO_TRIATHLON_EVENT_ID}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: HOLO_TRIATHLON_EVENT_ID,
          choice: currentFormattedChoice,
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

      setConfirmedChoice(data.choice || currentFormattedChoice);
      addNotification(
        "success",
        `你在《${HOLO_TRIATHLON_TITLE}》已成功鎖定預測：【${data.choice || currentFormattedChoice}】`
      );
    } catch (err) {
      console.error("Failed to submit triathlon prediction", err);
      addNotification("failed", "網路錯誤，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  const winningTuple = parseTriathlonTrifecta(winningChoice);
  const localPayoutPreview =
    isSettled && confirmedChoice && winningChoice
      ? evaluateTriathlonPayout(confirmedChoice, winningChoice)
      : null;
  const effectivePayoutAmount = payoutInfo.amount ?? localPayoutPreview?.amount ?? 0;
  const effectivePayoutLabel = payoutInfo.label ?? localPayoutPreview?.label ?? null;

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
            期間限定重大賽事預測活動，猜中領取高額 $TEE 榮譽獎金！
          </p>
        </div>

        {/* ═══════════════ 當前進行中企劃：ホロドリトライアスロン 三連單 ═══════════════ */}
        <div className="w-full flex flex-col items-center mb-10">
          <div className="text-center mb-5 w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black mb-2">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              <span>特別企劃 · 11/23 18:00 開賽三連單</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-wide mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-300">
              {HOLO_TRIATHLON_TITLE}
            </h2>

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

            {/* 獎金階級說明看板（固定發放・無須均分・不顯示參與人數） */}
            <div className="w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#1c160c] via-[#141009] to-[#0a0805] border border-amber-500/50 shadow-xl shadow-amber-950/30 backdrop-blur-md mb-4 text-left space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-amber-200 font-bold block">
                    三連單獎勵制度（達標全額發放，採最高階級不重複疊加）
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono block">
                    將下方卡片池的 3 名選手拖入（或點選放入）1st 金、2nd 銀、3rd 銅框中。
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/40 flex sm:flex-col items-center sm:items-start justify-between gap-1">
                  <span className="text-[11px] font-bold text-amber-200">🏆 三名順序全中</span>
                  <span className="text-sm font-black text-[#FFD700]">15,000 $TEE</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-400/10 border border-slate-300/35 flex sm:flex-col items-center sm:items-start justify-between gap-1">
                  <span className="text-[11px] font-bold text-slate-200">✨ 三名全中順序錯</span>
                  <span className="text-sm font-black text-slate-100">7,500 $TEE</span>
                </div>
                <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/35 flex sm:flex-col items-center sm:items-start justify-between gap-1">
                  <span className="text-[11px] font-bold text-orange-200">🥇 猜中第一名</span>
                  <span className="text-sm font-black text-orange-300">2,500 $TEE</span>
                </div>
              </div>
            </div>

            {/* 結算結果大橫幅 */}
            {isSettled && winningChoice && (
              <div className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 border border-amber-400/50 text-amber-200 text-xs sm:text-sm font-black flex flex-col sm:flex-row items-center justify-center gap-1.5 shadow-xl shadow-amber-950/30 text-center mb-4">
                <span>🏆 ホロドリトライアスロン 最終結果：</span>
                {winningTuple ? (
                  <span className="text-white">
                    🥇 {winningTuple[0]} / 🥈 {winningTuple[1]} / 🥉 {winningTuple[2]}
                  </span>
                ) : (
                  <span>【{winningChoice}】</span>
                )}
              </div>
            )}
          </div>

          {/* ── 卡片池上方：三個名次框（1st 金色 / 2nd 銀色 / 3rd 銅色） ── */}
          <div className="w-full mb-5 space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-amber-200/90">
                前三名預測席次（拖曳或點擊卡片填入 · 可於框間拖曳對調）
              </span>
              {!isDisabled && filledCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSlots([null, null, null]);
                    setActiveSlotIndex(0);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>清空重選</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
              {PODIUM_SLOTS.map((slotMeta) => {
                const contestant = findContestant(slots[slotMeta.idx]);
                const isTargetActive = !isDisabled && activeSlotIndex === slotMeta.idx;
                const isDragTarget = !isDisabled && dragOverSlot === slotMeta.idx;

                return (
                  <div
                    key={slotMeta.rank}
                    onClick={() => {
                      if (!isDisabled) {
                        setActiveSlotIndex(slotMeta.idx);
                      }
                    }}
                    onDragOver={(e) => {
                      if (isDisabled) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      if (dragOverSlot !== slotMeta.idx) setDragOverSlot(slotMeta.idx);
                    }}
                    onDragLeave={() => {
                      if (dragOverSlot === slotMeta.idx) setDragOverSlot(null);
                    }}
                    onDrop={(e) => handleSlotDrop(e, slotMeta.idx)}
                    className={`relative rounded-2xl border p-3.5 min-h-[104px] flex flex-col justify-between transition-all duration-200 ${
                      slotMeta.boxClass
                    } ${isTargetActive || isDragTarget ? slotMeta.activeClass : ""} ${
                      !isDisabled ? "cursor-pointer" : "cursor-default opacity-90"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-black ${slotMeta.textClass}`}
                      >
                        <span>{slotMeta.medal}</span>
                        <span>{slotMeta.rank}</span>
                      </span>

                      {contestant && !isDisabled && (
                        <button
                          type="button"
                          aria-label={`移除 ${slotMeta.rank}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            clearSlot(slotMeta.idx);
                          }}
                          className="w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {contestant ? (
                      <div
                        draggable={!isDisabled}
                        onDragStart={(e) => handleCardDragStart(e, contestant.jp, slotMeta.idx)}
                        className={`mt-2.5 p-2.5 rounded-xl bg-black/45 border border-white/15 flex items-center justify-between gap-2 ${
                          !isDisabled ? "cursor-grab active:cursor-grabbing hover:border-white/30" : ""
                        }`}
                      >
                        <div className="min-w-0 flex-1 text-left">
                          <div className="text-sm font-black text-white truncate">
                            {contestant.jp}
                          </div>
                          <div className="text-[10px] text-gray-300/80 truncate">
                            {contestant.en}
                          </div>
                        </div>
                        {!isDisabled && (
                          <GripVertical className="w-4 h-4 text-gray-400/70 shrink-0" />
                        )}
                      </div>
                    ) : (
                      <div
                        className={`mt-2.5 py-3 px-2 rounded-xl border border-dashed ${slotMeta.emptyBorder} bg-black/20 text-center`}
                      >
                        <span className="text-[11px] text-gray-400 font-bold block">
                          {isDisabled
                            ? "未填入選手"
                            : isTargetActive
                            ? "點擊下方卡片或拖曳至此"
                            : "拖入或點選指定此位"}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 卡片池（13 名參賽者卡片） ── */}
          <div
            onDragOver={(e) => {
              if (!isDisabled) e.preventDefault();
            }}
            onDrop={handlePoolDrop}
            className="w-full p-4 rounded-2xl bg-[#0d1118]/90 border border-gray-800/90 shadow-xl mb-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-gray-300 tracking-wide">
                參賽選手卡片池（共 13 名）
              </span>
              <span className="text-[11px] text-gray-400 font-mono">
                已選擇 {filledCount} / 3 位
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full">
              {TRIATHLON_CONTESTANTS.map((contestant) => {
                const assignedIdx = slots.indexOf(contestant.jp);
                const isPlaced = assignedIdx !== -1;
                const assignedMeta = isPlaced ? PODIUM_SLOTS[assignedIdx] : null;
                const winningRankIdx =
                  isSettled && winningTuple ? winningTuple.indexOf(contestant.jp) : -1;
                const isActualWinner = winningRankIdx !== -1;

                return (
                  <button
                    key={contestant.id}
                    type="button"
                    draggable={!isDisabled && !isPlaced}
                    onDragStart={(e) => handleCardDragStart(e, contestant.jp)}
                    disabled={isDisabled}
                    onClick={() => handleCardClick(contestant.jp)}
                    className={`p-3 rounded-xl border text-left transition-all duration-150 flex items-center justify-between gap-2 select-none ${
                      isActualWinner
                        ? "bg-amber-950/40 border-amber-400/80 text-white shadow-[0_0_16px_rgba(245,158,11,0.25)]"
                        : isPlaced
                        ? "bg-[#111922]/60 border-dashed border-[#00FFA3]/50 opacity-55 hover:opacity-80 cursor-pointer"
                        : isDisabled
                        ? "bg-[#0b0e14] border-[#181f2c] text-gray-500 opacity-50 cursor-not-allowed"
                        : "bg-[#121722] border-[#263042] hover:border-amber-400/60 hover:bg-[#171e2c] active:scale-[0.98] cursor-grab active:cursor-grabbing"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-black text-white leading-snug truncate">
                        {contestant.jp}
                      </div>
                      <div className="text-[10px] text-gray-400 leading-tight truncate mt-0.5">
                        {contestant.en}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {isActualWinner ? (
                        <span className={`text-[10px] font-black ${PODIUM_SLOTS[winningRankIdx].textClass}`}>
                          {PODIUM_SLOTS[winningRankIdx].medal} {PODIUM_SLOTS[winningRankIdx].rank}
                        </span>
                      ) : assignedMeta ? (
                        <span
                          className={`text-[10px] font-black ${assignedMeta.textClass}`}
                        >
                          {assignedMeta.rank}
                        </span>
                      ) : !isDisabled ? (
                        <GripVertical className="w-3.5 h-3.5 text-gray-500/80" />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── 確定欄 / 鎖定狀態列（不另外彈出視窗，並標示截止時間 11/23 台灣時間 18:00） ── */}
          <div className="w-full flex flex-col items-center gap-3">
            {isSettled ? (
              effectivePayoutAmount > 0 ? (
                <div className="w-full p-4 rounded-xl bg-gradient-to-b from-[#142320] to-[#0d1715] border border-[#00FFA3]/70 text-center space-y-1">
                  <div className="text-sm font-black text-[#00FFA3] flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>
                      🎉 恭喜【{effectivePayoutLabel}】！已發放獎金{" "}
                      {effectivePayoutAmount.toLocaleString()} $TEE！
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/90 font-mono">
                    你的預測：【{confirmedChoice}】
                  </p>
                </div>
              ) : confirmedChoice ? (
                <div className="w-full p-4 rounded-xl bg-gray-900/60 border border-gray-800 text-center space-y-1">
                  <div className="text-xs font-bold text-gray-300">
                    你的預測為【{confirmedChoice}】，本次未達獲獎門檻。感謝熱情參與！
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
                  className="w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm tracking-wide shadow-none bg-[#161a22] border border-gray-700/60 text-gray-400 cursor-not-allowed select-none flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-gray-400" />
                  <span>🔒 本企劃預測已截止（截止時間 11/23 台灣時間 18:00）</span>
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
                  disabled={!isAllSlotsFilled || isSubmitting}
                  onClick={handleConfirmSubmit}
                  className={`w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-lg select-none ${
                    isAllSlotsFilled && !isSubmitting
                      ? "bg-gradient-to-r from-[#00FFA3] to-[#00d688] text-slate-950 hover:brightness-110 shadow-[#00FFA3]/20 active:scale-[0.99] cursor-pointer"
                      : "bg-gray-800 text-gray-500 cursor-not-allowed shadow-none"
                  }`}
                >
                  {isSubmitting ? (
                    <span>鎖定中...</span>
                  ) : !isAllSlotsFilled ? (
                    <span>請選滿前三位（{filledCount}/3）· 截止時間 11/23 台灣時間 18:00</span>
                  ) : confirmedChoice ? (
                    currentFormattedChoice === confirmedChoice ? (
                      <span>預測已鎖定（可更換 · 截止時間 11/23 台灣時間 18:00）</span>
                    ) : (
                      <span>更新鎖定選擇（截止時間 11/23 台灣時間 18:00）</span>
                    )
                  ) : (
                    <span>確認鎖定預測（截止時間 11/23 台灣時間 18:00）</span>
                  )}
                </button>

                {confirmedChoice && (
                  <p className="text-[11px] text-gray-400 font-mono text-center">
                    目前已鎖定預測：<span className="text-[#00FFA3] font-bold">【{confirmedChoice}】</span>（後台截止前皆可自由變更）
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── 歷屆企劃回顧區：以書籤折疊方式保存 ── */}
        <section className="w-full space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              <h2 className="text-sm font-bold text-white tracking-wide">歷屆企劃回顧 (Past Events)</h2>
            </div>
            <span className="text-[11px] text-gray-500 font-mono">3 筆歷史書籤</span>
          </div>

          {/* ═══════════════ 書籤 1：ゆび相撲大会 預測 ═══════════════ */}
          <div className="w-full rounded-2xl border border-gray-800/90 bg-gray-900/30 overflow-hidden shadow-xl backdrop-blur-md transition-all">
            {/* 書籤頂部觸發列 */}
            <div
              onClick={toggleYubiSumoBookmark}
              className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-850/50 transition-colors select-none group"
            >
              <div className="flex items-center gap-3 truncate">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-sm shadow-amber-950/30 group-hover:border-amber-400/60 transition-colors">
                  <Bookmark className="w-4 h-4 fill-amber-400/40" />
                </div>

                <div className="flex flex-col gap-1 truncate text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm sm:text-base font-black text-white group-hover:text-amber-200 transition-colors truncate">
                      ゆび相撲大会 預測
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
                      總獎金池 {yubiSumoTotalPool.toLocaleString()} $TEE
                    </span>
                    <span className="text-gray-600">•</span>
                    {yubiSumoConfirmedChoice ? (
                      <span className="text-[#00FFA3] font-semibold">你的預測：【{yubiSumoConfirmedChoice}】</span>
                    ) : (
                      <span className="text-gray-500">未參與預測</span>
                    )}
                    {yubiSumoIsSettled && yubiSumoWinningChoice && (
                      <>
                        <span className="text-gray-600">•</span>
                        <span className="text-yellow-400 font-semibold">最終結果：【{yubiSumoWinningChoice}】</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800/60 group-hover:bg-gray-800 text-xs font-bold text-amber-300/90 group-hover:text-amber-200 border border-gray-700/60 shrink-0 transition-all">
                <span className="hidden sm:inline">{isYubiSumoBookmarkExpanded ? "收合書籤" : "展開查閱"}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isYubiSumoBookmarkExpanded ? "rotate-180" : ""}`} />
              </div>
            </div>

            {/* 書籤展開內部內容 */}
            {isYubiSumoBookmarkExpanded && (
              <div className="p-4 sm:p-6 border-t border-gray-800/80 bg-gray-950/40 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                {/* 直播回放按鈕與總獎金池 */}
                <div className="text-center space-y-3">
                  {yubiSumoLiveStreamUrl && (
                    <div className="pt-1">
                      <a
                        href={yubiSumoLiveStreamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/40 text-red-200 hover:text-white text-xs font-bold transition-all shadow-md group select-none"
                      >
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                        <span>📺 前往 YouTube 觀看賽事回放 ↗</span>
                        <ExternalLink className="w-3.5 h-3.5 text-red-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </a>
                    </div>
                  )}

                  <div className="w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#1c160c] via-[#141009] to-[#0a0805] border border-amber-500/50 shadow-xl shadow-amber-950/30 backdrop-blur-md text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                          <Coins className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs text-amber-200 font-bold block">
                            累積總獎金池
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono block">
                            根據預測人數增加，猜中者均分。
                          </span>
                          <span className="text-[10px] text-amber-300/90 font-mono block mt-0.5 font-bold">
                            當開出優先選項時預測者全員獲得獎金1,000＄TEE
                          </span>
                        </div>
                      </div>

                      <div className="flex items-baseline gap-1.5 self-end sm:self-center">
                        <span className="font-mono text-2xl sm:text-3xl font-black text-[#FFD700] tracking-wider drop-shadow-[0_0_12px_rgba(255,215,0,0.5)]">
                          {yubiSumoTotalPool.toLocaleString()}
                        </span>
                        <span className="text-xs text-amber-300/80 font-bold">$TEE</span>
                      </div>
                    </div>
                  </div>

                  {yubiSumoIsSettled && yubiSumoWinningChoice && (
                    <div className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 border border-amber-400/50 text-amber-200 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-950/30 text-center">
                      <span>🏆 ゆび相撲大会 最終結果：【{yubiSumoWinningChoice}】</span>
                    </div>
                  )}
                </div>

                {/* 六個選項卡片展示 (回顧檢視) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  {yubiSumoChoices.map((choiceName, idx) => {
                    const isSelected = yubiSumoConfirmedChoice === choiceName;
                    const isWinner = yubiSumoIsSettled && yubiSumoWinningChoice === choiceName;
                    const isSpecialPriority = choiceName === YUBI_SUMO_PRIORITY_CHOICE;

                    return (
                      <div
                        key={choiceName}
                        className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between gap-2 select-none ${
                          isWinner
                            ? "bg-amber-950/40 border-amber-400 text-white"
                            : isSpecialPriority
                            ? "bg-[#0b0e14]/70 border-dashed border-gray-700/60 text-gray-500 opacity-60"
                            : isSelected
                            ? "bg-[#142320]/80 border-[#00FFA3]/60 text-white"
                            : "bg-[#0b0e14] border-[#181f2c] text-gray-500 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className={`w-5 h-5 rounded-md font-mono text-[11px] font-bold flex items-center justify-center shrink-0 ${
                            isSpecialPriority && !isWinner
                              ? "bg-gray-800/60 border border-gray-700 text-gray-500"
                              : "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                          }`}>
                            {idx + 1}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold leading-snug break-words">
                              {choiceName}
                            </span>
                            {isSpecialPriority && (
                              <span className="text-[10px] text-amber-300/80 font-mono mt-0.5 font-bold">
                                ★ 全員特殊加碼項目
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-1.5">
                          {isWinner ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950">
                              🏆 最終結果
                            </span>
                          ) : isSpecialPriority ? (
                            <Lock className="w-3.5 h-3.5 text-gray-600" />
                          ) : isSelected ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#00FFA3]/20 text-[#00FFA3]">
                              你的選擇
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 個人紀錄與成果反饋 */}
                <div className="w-full space-y-3">
                  {yubiSumoIsSettled ? (
                    yubiSumoHasWon || (yubiSumoWinningChoice === YUBI_SUMO_PRIORITY_CHOICE && yubiSumoConfirmedChoice) ? (
                      <div className="w-full p-4 rounded-xl bg-gradient-to-b from-[#142320] to-[#0d1715] border border-[#00FFA3]/70 text-center space-y-1">
                        <div className="text-sm font-black text-[#00FFA3] flex items-center justify-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>
                            {yubiSumoWinningChoice === YUBI_SUMO_PRIORITY_CHOICE
                              ? "🎉 恭喜！開出優先選項【PekoViVi決賽對決】全員獲獎！"
                              : "🎉 恭喜預測正確！已瓜分發放獎金！"}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-200/90 font-mono">
                          {yubiSumoWinningChoice === YUBI_SUMO_PRIORITY_CHOICE
                            ? "大會開出優先選項，所有參與預測者全員獲得 1,000 $TEE 獎金！已發放至您的帳戶！"
                            : `你預測的【${yubiSumoConfirmedChoice}】為本屆大賽最終結果！`}
                        </p>
                      </div>
                    ) : yubiSumoConfirmedChoice ? (
                      <div className="w-full p-4 rounded-xl bg-gray-900/60 border border-gray-800 text-center space-y-1">
                        <div className="text-xs font-bold text-gray-300">
                          你選擇了【{yubiSumoConfirmedChoice}】{yubiSumoWinningChoice ? `，最終結果為【${yubiSumoWinningChoice}】` : ""}。感謝熱情參與！
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
                    yubiSumoConfirmedChoice ? (
                      <div className="w-full p-3.5 rounded-xl bg-[#142320]/60 border border-[#00FFA3]/40 text-center">
                        <p className="text-xs text-gray-300 font-mono">
                          你在本企劃中留下的預測選擇：<span className="text-[#00FFA3] font-bold">【{yubiSumoConfirmedChoice}】</span>
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

          {/* ═══════════════ 書籤 2：JUMP KING HOLORACE ═══════════════ */}
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

          {/* ═══════════════ 書籤 3：ホロライブ甲子園2026 ═══════════════ */}
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

