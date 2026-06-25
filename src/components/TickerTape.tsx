"use client";

import { useTee } from "@/context/TeeContext";

export default function TickerTape() {
  const { marketData } = useTee();

  const warnings = [
    { text: "[市場] 虛擬股交易有賺有賠，投資前應詳閱公開說明書。", color: "text-[#eaecef]" },
    { text: "[市場] 貼貼指數波動劇烈，請注意個人投資風險！", color: "text-[#eaecef]" },
    { text: "[市場] 貼貼資訊由後端爬蟲擷取，不代表本平台之投資立場。", color: "text-[#eaecef]" },
    { text: "[市場] 虛擬 $TEE 交易火熱，投資有風險，申購前應詳閱公開說明書。", color: "text-[#eaecef]" }
  ];

  // 蒐集所有個股的貼貼資訊
  const newsItems = marketData.flatMap(pair =>
    (pair.teeteeNews || []).map(news => {
      let color = "text-[var(--teetee-pink)]";
      if (news.content.includes("理由") || news.content.includes("%")) {
        color = "text-[#ef4444]"; // 紅漲 (核可基本面加成)
      } else if (news.content.includes("警告") || news.content.includes("警戒")) {
        color = "text-[#22c55e]"; // 綠跌
      }
      return {
        text: `[${pair.name}] ${news.content}`,
        color
      };
    })
  );

  // 從新到舊
  const sortedNews = [...newsItems].reverse();

  // 整理跑馬燈顯示內容
  const announcements: { text: string; color: string }[] = [];
  if (sortedNews.length === 0) {
    announcements.push(...warnings);
  } else {
    announcements.push(warnings[0]); // 最開始
    announcements.push(...sortedNews); // 中間的個股貼貼資訊
    announcements.push(warnings[1]); // 最後
  }

  return (
    <div 
      role="region" 
      aria-label="公告跑馬燈"
      className="bg-[var(--card-bg)] border-b border-[var(--border-color)] py-1 overflow-hidden whitespace-nowrap"
    >
      <div className="animate-marquee inline-block font-medium pl-[100%] whitespace-nowrap">
        {announcements.map((item, idx) => (
          <span key={idx} className={`${item.color} text-xs mx-5 font-mono`}>
            {item.text}
            {idx < announcements.length - 1 && <span className="text-gray-700 ml-10">|</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
