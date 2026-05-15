"use client";

export default function TickerTape() {
  const announcements = [
    "[公告] 本日 12:00 進行系統維護",
    "[即時] AzuIro 達成萬人聯動，淨值提升中",
    "[市場] 虛擬 $TEE 交易火熱，注意波動風險"
  ];

  return (
    <div 
      role="region" 
      aria-label="公告跑馬燈"
      className="bg-[var(--card-bg)] border-b border-[var(--border-color)] py-1 overflow-hidden whitespace-nowrap"
    >
      <div className="animate-marquee inline-block text-xs text-[var(--teetee-pink)] font-medium pl-[100%]">
        {announcements.join(" | ")}
      </div>
    </div>
  );
}
