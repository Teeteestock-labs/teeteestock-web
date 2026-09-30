"use client";

import { memo } from "react";
import { teeteePair } from "@/app/types";

interface NewsReportSectionProps {
    pair: teeteePair;
    newsList: any[];
    reportTargetId: string;
    setReportTargetId: (id: string) => void;
    reportUrl: string;
    setReportUrl: (url: string) => void;
    reportErrorMsg: string;
    reportSuccessMsg: string;
    handleReportSubmit: (e: React.FormEvent) => void;
    marketData: teeteePair[];
    pairIdMap: Record<string, string>;
}

const NewsReportSection = memo(({
    pair,
    newsList,
    reportTargetId,
    setReportTargetId,
    reportUrl,
    setReportUrl,
    reportErrorMsg,
    reportSuccessMsg,
    handleReportSubmit,
    marketData,
    pairIdMap
}: NewsReportSectionProps) => {
    return (
        <>
            {/* 最新貼貼情報 */}
            <div className="bg-[#181A20] border border-[#2B2F36] rounded shadow-xl overflow-hidden">
                <div className="p-3 bg-gray-950 border-b border-[#2B2F36] flex justify-between items-center select-none">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF69B4] animate-pulse shadow-[0_0_8px_#FF69B4]" />
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">最新貼貼情報</h3>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">
                        已核可 ({newsList.length})
                    </span>
                </div>
                <div className="p-4 pt-3">
                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {newsList.length === 0 ? (
                            <p className="text-center text-sm text-[#848E9C] py-4">目前暫無已核可的貼貼情報</p>
                        ) : (
                            newsList.map((news) => {
                                let typeLabel = "未知";
                                let typeColor = "text-gray-400 bg-gray-500/10 border-gray-500/30";
                                if (news.eventType === 'x_mention') { typeLabel = 'X 提及'; typeColor = 'text-sky-400 bg-sky-500/10 border-sky-500/20'; }
                                if (news.eventType === 'live_collab') { typeLabel = '日常連動'; typeColor = 'text-red-400 bg-red-500/10 border-red-500/20'; }
                                if (news.eventType === 'large_event') { typeLabel = '大型/3D'; typeColor = 'text-purple-400 bg-purple-500/10 border-purple-500/20'; }
                                if (news.eventType === 'new_song') { typeLabel = '新曲/MV'; typeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'; }
                                if (news.eventType === 'video') { typeLabel = '影片/首播'; typeColor = 'text-purple-400 bg-purple-500/10 border-purple-500/30'; }
                                if (news.eventType === 'crowdsourced') { typeLabel = '股民回報'; typeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30'; }
                                if (news.eventType === 'totsumachi') { typeLabel = '突發/凸待'; typeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'; }

                                return (
                                    <div key={news.id} className="bg-[#0B0E11] border border-[#2B2F36] p-3 rounded-lg hover:border-[#FF69B4]/50 transition-colors">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${typeColor}`}>
                                                {typeLabel}
                                            </span>
                                            <span className="text-[10px] text-pink-400 font-bold bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                                                聯動加成
                                            </span>
                                            <span className="text-[10px] text-[#848E9C] ml-auto">
                                                {new Date(news.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#EAECEF] mb-2">{news.rawText}</p>
                                        <a href={news.url} target="_blank" rel="noreferrer" className="text-[10px] text-[#FF69B4] hover:underline flex items-center gap-1">
                                            <span>🔗 前往精華來源</span>
                                            {news.url.includes('&t=') && <span className="bg-[#FF69B4]/20 text-[#FF69B4] px-1 rounded">帶有時間戳</span>}
                                        </a>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* 股民貼貼回報 */}
            <div className="bg-[#181A20] border border-[#2B2F36] rounded shadow-xl overflow-hidden relative group/form hover:border-[#FF69B4]/30 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF69B4]/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="p-3 bg-gray-950 border-b border-[#2B2F36] flex justify-between items-center select-none">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E] animate-pulse shadow-[0_0_8px_#F43F5E]" />
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">股民貼貼回報</h3>
                    </div>
                </div>
                <div className="p-4 pt-3">

                <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
                    <div className="space-y-1">
                        <label className="text-[10px] text-[#848E9C] font-semibold">目標個股組合</label>
                        <select 
                            value={reportTargetId}
                            onChange={(e) => setReportTargetId(e.target.value)}
                            className="w-full bg-[#0B0E11] border border-[#2B2F36] focus:border-[#FF69B4] rounded p-2 text-white outline-none font-mono text-[11px] transition-colors"
                        >
                            {[...marketData]
                                .sort((a, b) => {
                                    const codeA = pairIdMap[a.id.toLowerCase()] || a.id.toUpperCase();
                                    const codeB = pairIdMap[b.id.toLowerCase()] || b.id.toUpperCase();
                                    return codeA.localeCompare(codeB);
                                })
                                .map((p) => {
                                    const stockId = pairIdMap[p.id.toLowerCase()] || p.id.toUpperCase();
                                    return (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({stockId})
                                        </option>
                                    );
                                })}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] text-[#848E9C] font-semibold flex justify-between">
                            <span>互動網址 (URL)</span>
                            <span className="text-[9px] text-[#474D57]">(限 YouTube)</span>
                        </label>
                        <input 
                            type="text" 
                            placeholder="https://youtube.com/..." 
                            value={reportUrl}
                            onChange={(e) => setReportUrl(e.target.value)}
                            className="w-full bg-[#0B0E11] border border-[#2B2F36] focus:border-[#FF69B4] rounded p-2 text-white outline-none font-mono text-[11px] transition-colors"
                        />
                    </div>

                    {reportErrorMsg && (
                        <p className="text-[10px] text-[#FF3B3B] bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 p-2 rounded">
                            ⚠️ {reportErrorMsg}
                        </p>
                    )}
                    {reportSuccessMsg && (
                        <p className="text-[10px] text-[#00FFA3] bg-[#00FFA3]/10 border border-[#00FFA3]/20 p-2 rounded">
                            ✅ {reportSuccessMsg}
                        </p>
                    )}

                    <button 
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-r from-[#FF69B4] to-[#7000FF] hover:from-[#ff85c2] hover:to-[#8a2be2] text-white font-bold rounded shadow-lg shadow-pink-500/20 active:scale-[0.98] transition-all text-center text-xs"
                    >
                        遞交貼貼回報 (待審查)
                    </button>
                </form>
                </div>
            </div>
        </>
    );
});

NewsReportSection.displayName = 'NewsReportSection';
export default NewsReportSection;
