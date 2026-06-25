"use client";

export default function GlobalStats() {
  return (
    <div className="bg-[#000000] border-b border-[#2b2f36] px-2 py-1 flex justify-between items-center sticky top-0 z-10 text-xs">
      <div className="flex space-x-4 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 items-center whitespace-nowrap">
          <span className="text-[#eaecef] font-bold">加權指數</span>
          <span className="text-[#ff3b3b] font-mono font-bold">18234.56</span>
          <span className="text-[#ff3b3b] font-mono">▲123.45</span>
        </div>
        <div className="flex gap-2 items-center whitespace-nowrap">
          <span className="text-[#eaecef] font-bold">櫃買指數</span>
          <span className="text-[#ff3b3b] font-mono font-bold">245.67</span>
          <span className="text-[#ff3b3b] font-mono">▲1.23</span>
        </div>
      </div>
    </div>
  );
}
