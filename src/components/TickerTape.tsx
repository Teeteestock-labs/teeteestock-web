"use client";

export default function TickerTape() {
  const announcements = [
    "[公告] 本日 12:00 進行系統維護",
    "[即時] AzuIro 達成萬人聯動，淨值提升中",
    "[市場] 虛擬 $TEE 交易火熱，注意波動風險"
  ];

  return (
    <div className="bg-[#181a20] border-b border-[#2b2f36] py-1 overflow-hidden whitespace-nowrap">
      <div className="animate-marquee inline-block text-[10px] text-[#ff69b4] font-medium">
        {announcements.join(" | ")}
      </div>
    </div>
  );
}
