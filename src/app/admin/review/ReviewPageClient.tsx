'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReviewStatus, EventType } from '@/types/enums';
import { 
  approveEvent, 
  rejectEvent, 
  approveOneAndRejectOthers, 
  rejectMultipleEvents,
  dispatchEventToCP 
} from '../actions';
import AdminAdjustForm from './AdminAdjustForm';
import ProcessedEventEditor from './ProcessedEventEditor';

interface PreviewData {
  id: string;
  name: string;
  statusBefore: string;
  statusAfter: string;
  currentNV: number;
  collabBonusSum: number;
  collabBonus: number;
  decay: number;
  adminAdjust: number;
  adminAdjustReason: string;
  adminAdjustUrl: string;
  predictedNV: number;
  wasDelisted: boolean;
  currentPrice: number;
  premiumDiscount: number;
}

interface Props {
  previews: PreviewData[];
  allEvents: any[];
}

const MEMBER_JP_MAP: Record<string, string> = {
  'AZKi': 'AZKi',
  'KazamaIroha': '風真いろは',
  'ShirakamiFubuki': '白上フブキ',
  'OokamiMio': '大神ミオ',
  'SakuraMiko': 'さくらみこ',
  'HoshimachiSuisei': '星街すいせい',
  'ShiraganeNoel': '白銀ノエル',
  'ShiranuiFurea': '不知火フレア',
  'NekomataOkayu': '猫又おかゆ',
  'InugamiKorone': '戌神ころね',
  'UsadaPekora': '兎田ぺこら',
  'HoshoMarin': '寶鐘マリン',
  'ShishiroBotan': '獅白ぼたん',
  'TsunomakiWatame': '角卷わため',
  'TokinoSora': 'ときのそら',
  'OozoraSubaru': '大空スバル',
  'HimemoriRuna': '姫森ルーナ'
};

const MEMBER_CP_MAP: Record<string, string[]> = {
  'AZIR': ['AZKi', 'KazamaIroha'],
  'FBMO': ['ShirakamiFubuki', 'OokamiMio'],
  'MCMT': ['SakuraMiko', 'HoshimachiSuisei'],
  'NEFL': ['ShiraganeNoel', 'ShiranuiFurea'],
  'OKKR': ['NekomataOkayu', 'InugamiKorone'],
  'PKMR': ['UsadaPekora', 'HoshoMarin'],
  'SSWT': ['ShishiroBotan', 'TsunomakiWatame'],
  'SRAZ': ['TokinoSora', 'AZKi'],
  'SBRN': ['OozoraSubaru', 'HimemoriRuna']
};

// Tokenize title for duplicate grouping
function tokenize(text: string): Set<string> {
  const clean = text
    .toLowerCase()
    .replace(/[【】\[\]\(\)#\s\-_★🔴🟢🟣✧]/g, ' ')
    .replace(/[^\w\s\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff]/g, ' ');
  
  const skipWords = new Set(['ホロライブ', 'hololive', 'ch', 'channel', '配信', 'live', 'コラボ', '連動', '剪輯', '精華', '切り抜き']);
  const tokens = clean.split(/\s+/).filter(w => w.length > 1 && !skipWords.has(w));
  return new Set(tokens);
}

function getTitleSimilarity(title1: string, title2: string): number {
  const words1 = tokenize(title1);
  const words2 = tokenize(title2);
  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  return intersection.size / union.size;
}

function hasSharedLongToken(title1: string, title2: string): boolean {
  const words1 = tokenize(title1);
  const words2 = tokenize(title2);
  for (const w1 of words1) {
    if (w1.length >= 3 && words2.has(w1)) {
      return true;
    }
  }
  return false;
}

export default function ReviewPageClient({ previews, allEvents }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>(previews[0]?.id || '');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const selectedPair = previews.find(p => p.id === selectedId) || previews[0];

  if (!selectedPair) {
    return <div className="text-center text-gray-500 py-8">目前無可用的 CP 組合數據。</div>;
  }

  const pairEvents = allEvents.filter(e => e.pairId.toLowerCase() === selectedPair.id.toLowerCase());
  const pendingEvents = pairEvents.filter(e => e.status === ReviewStatus.PENDING);
  const processedEvents = pairEvents.filter(e => e.status === ReviewStatus.APPROVED || e.status === ReviewStatus.REJECTED);
  
  const pendingCount = pendingEvents.length;

  // Duplicate grouping logic for this CP
  interface PendingEventGroup {
    isDuplicateGroup: boolean;
    events: typeof pendingEvents;
  }
  const cpGroups: PendingEventGroup[] = [];
  const cpProcessedIds = new Set<string>();

  for (let i = 0; i < pendingEvents.length; i++) {
    const evt = pendingEvents[i];
    if (cpProcessedIds.has(evt.id)) continue;

    const groupEvents = [evt];
    cpProcessedIds.add(evt.id);

    for (let j = i + 1; j < pendingEvents.length; j++) {
      const other = pendingEvents[j];
      if (cpProcessedIds.has(other.id)) continue;

      const timeDiff = Math.abs(evt.createdAt.getTime() - other.createdAt.getTime());
      if (timeDiff < 12 * 60 * 60 * 1000) {
        const similarity = getTitleSimilarity(evt.title, other.title);
        const hasSharedLong = hasSharedLongToken(evt.title, other.title);
        if (similarity >= 0.15 || hasSharedLong) {
          groupEvents.push(other);
          cpProcessedIds.add(other.id);
        }
      }
    }

    cpGroups.push({
      isDuplicateGroup: groupEvents.length > 1,
      events: groupEvents
    });
  }

  const displayMembers = MEMBER_CP_MAP[selectedPair.id]
    ? MEMBER_CP_MAP[selectedPair.id].map(m => MEMBER_JP_MAP[m] || m).join(' × ')
    : selectedPair.name;

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch min-h-[600px]">
      {/* 左側商品清單 Sidebar */}
      <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0 select-none border-b lg:border-b-0 lg:border-r border-gray-800/80 pb-4 lg:pb-0 lg:pr-4">
        <div className="text-[10px] text-gray-500 font-bold tracking-wider uppercase pl-2 mb-1">
          CP 組合列表
        </div>
        <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
          {previews.map((pair) => {
            const isSelected = pair.id === selectedId;
            const isWarning = pair.statusBefore === 'WARNING';
            const isDelisted = pair.statusBefore === 'DELISTED';
            const cpPendingCount = allEvents.filter(e => e.pairId.toLowerCase() === pair.id.toLowerCase() && e.status === ReviewStatus.PENDING).length;

            let btnClass = "flex flex-row items-center justify-between gap-2 py-1.5 px-3 rounded-lg border text-left font-mono transition-all duration-150 cursor-pointer min-w-[120px] lg:min-w-0 flex-shrink-0 ";

            if (isSelected) {
              if (isWarning) {
                btnClass += "bg-amber-950/40 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]";
              } else if (isDelisted) {
                btnClass += "bg-rose-950/40 border-rose-500 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.15)]";
              } else {
                btnClass += "bg-pink-600/10 border-pink-500 text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.15)]";
              }
            } else {
              if (isWarning) {
                btnClass += "bg-amber-950/10 border-amber-950/20 text-amber-500/80 hover:bg-amber-950/20";
              } else if (isDelisted) {
                btnClass += "bg-rose-950/10 border-rose-950/20 text-rose-500/80 hover:bg-rose-950/20";
              } else {
                btnClass += "bg-gray-900/10 border-gray-950 text-gray-400 hover:bg-gray-900/30";
              }
            }

            if (pair.id === 'hololive') {
              let hololiveBtnClass = "flex flex-row items-center justify-between gap-2 py-1.5 px-3 rounded-lg border text-left font-mono transition-all duration-150 cursor-pointer min-w-[120px] lg:min-w-0 flex-shrink-0 ";
              if (isSelected) {
                hololiveBtnClass += "bg-sky-600/10 border-sky-500 text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.15)]";
              } else {
                hololiveBtnClass += "bg-gray-900/10 border-gray-950 text-gray-400 hover:bg-gray-900/30";
              }
              return (
                <div 
                  key={pair.id} 
                  onClick={() => setSelectedId(pair.id)}
                  className={hololiveBtnClass}
                >
                  <span className="text-xs font-bold tracking-wider">HOLOLIVE</span>
                  {cpPendingCount > 0 && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black rounded-full scale-90">
                      {cpPendingCount}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <div 
                key={pair.id} 
                onClick={() => setSelectedId(pair.id)}
                className={btnClass}
              >
                <span className="text-xs font-bold tracking-wider">{pair.id.toUpperCase()}</span>
                {cpPendingCount > 0 && (
                  <span className="text-[9px] px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black rounded-full scale-90">
                    {cpPendingCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 右側中央詳情面板 (一律展開，無 details 折疊) */}
      <div className="flex-1 space-y-6">
        <div className="border border-gray-800 rounded-2xl bg-gray-900/10 backdrop-blur-md overflow-hidden p-6 space-y-6">
          {/* 標頭與資料區 */}
          {selectedPair.id === 'hololive' ? (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-850 pb-4 gap-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm tracking-wider bg-sky-950/60 border border-sky-500/30 px-2.5 py-1 rounded text-sky-400 font-bold shrink-0">
                  HOLOLIVE
                </span>
                <span className="text-lg font-black text-white">官方頻道影片採集池</span>
              </div>
              <div className="text-xs text-gray-500 font-mono">
                偵測頻道: UCJFZiqLMntJufDCHc6bQixg (hololive ホロライブ - 官方YouTube)
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-850 pb-4 gap-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm tracking-wider bg-gray-800 px-2.5 py-1 rounded text-gray-300 font-bold shrink-0">
                  {selectedPair.id.toUpperCase()}
                </span>
                <span className="text-lg font-black text-white">{displayMembers}</span>
              </div>
              
              <div className="grid grid-cols-4 gap-3 text-center text-xs w-full md:w-auto md:min-w-[450px]">
                <div className="border-r border-gray-850/60">
                  <span className="text-gray-500 block text-[9px]">隱藏淨值 (NV)</span>
                  <span className="font-mono font-bold text-gray-200 text-xs sm:text-sm">{selectedPair.currentNV.toFixed(2)}</span>
                </div>
                <div className="border-r border-gray-850/60">
                  <span className="text-gray-500 block text-[9px]">累積加成</span>
                  <span className="font-mono font-bold text-emerald-400 text-xs sm:text-sm">
                    +{(selectedPair.collabBonusSum * 100).toFixed(0)}% (+{selectedPair.collabBonus.toFixed(2)})
                  </span>
                </div>
                <div className="border-r border-gray-850/60">
                  <span className="text-gray-500 block text-[9px]">預估下期淨值</span>
                  <span className="font-mono font-bold text-pink-400 text-xs sm:text-sm">{selectedPair.predictedNV.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[9px]">預估下期狀態</span>
                  <span className="font-bold text-xs sm:text-sm block mt-0.5">
                    {selectedPair.statusAfter === 'NORMAL' && <span className="text-emerald-400">NORMAL</span>}
                    {selectedPair.statusAfter === 'WARNING' && <span className="text-amber-400">WARNING</span>}
                    {selectedPair.statusAfter === 'DELISTED' && <span className="text-rose-400">DELISTED</span>}
                  </span>
                </div>
              </div>
            </div>
          )}


          {/* 2. 待處理情報審查區 (完全展開) */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase border-b border-gray-850 pb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              待處理情報 (Pending Event Pipeline)
            </h4>
            
            {pendingCount === 0 ? (
              <div className="text-xs text-gray-600 py-3 bg-gray-950/20 px-4 rounded-lg border border-gray-900">
                該組合目前無待審查情報。
              </div>
            ) : selectedPair.id === 'hololive' ? (
              <div className="space-y-3">
                {pendingEvents.map((event) => (
                  <div key={event.id} className="bg-gray-900/20 p-4 rounded-xl border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-0.5 flex-1">
                      <h3 className="font-semibold text-xs text-gray-200">{event.title}</h3>
                      <div className="text-[9px] text-gray-500 flex gap-3 font-mono">
                        <span>來源: {event.reporter}</span>
                        <a href={event.url} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">連結 ↗</a>
                      </div>
                    </div>

                    <form
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (actionLoading) return;
                        const formData = new FormData(e.currentTarget);
                        const targetPairId = formData.get('targetPairId') as string;
                        const actionType = formData.get('actionType') as string;
                        setActionLoading(event.id);
                        try {
                          if (actionType === 'REJECT') {
                            await rejectEvent(event.id, '非本站追蹤CP之連動內容');
                          } else {
                            await dispatchEventToCP(event.id, targetPairId);
                          }
                          router.refresh();
                        } finally {
                          setActionLoading(null);
                        }
                      }}
                    >
                      <div className="flex gap-1.5 w-full sm:w-auto">
                        <select name="actionType" className="bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-white focus:outline-none" defaultValue="DISPATCH">
                          <option value="DISPATCH">分流至CP ➔</option>
                          <option value="REJECT">🔴 拒絕/忽略此案</option>
                        </select>
                        
                        <select name="targetPairId" className="bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-white focus:outline-none">
                          <option value="AZIR">AZIR (AZIro)</option>
                          <option value="FBMO">FBMO (FubuMio)</option>
                          <option value="MCMT">MCMT (miComet)</option>
                          <option value="NEFL">NEFL (NoeFure)</option>
                          <option value="OKKR">OKKR (OkaKoro)</option>
                          <option value="PKMR">PKMR (PekoMarin)</option>
                          <option value="SSWT">SSWT (ShishiWata)</option>
                          <option value="SRAZ">SRAZ (SorAZ)</option>
                          <option value="SBRN">SBRN (SubaRuna)</option>
                        </select>

                        <button 
                          type="submit" 
                          disabled={actionLoading !== null}
                          className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3 py-1 rounded transition-all disabled:opacity-50 active:scale-95 whitespace-nowrap"
                        >
                          {actionLoading === event.id ? '處理中...' : '確定'}
                        </button>
                      </div>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {cpGroups.map((group) => {
                  if (group.isDuplicateGroup) {
                    const allIds = group.events.map(e => e.id);
                    const firstEvt = group.events[0];
                    return (
                      <div key={`group-${firstEvt.id}`} className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-800/60 pb-2">
                          <span className="text-amber-400 font-bold text-[10px]">⚠️ 偵測到重複開台/同日聯動 (Co-Stream Group)</span>
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              if (actionLoading) return;
                              const formData = new FormData(e.currentTarget);
                              const reason = formData.get('rejectReason') as string;
                              setActionLoading(`reject-group-${firstEvt.id}`);
                              try {
                                await rejectMultipleEvents(allIds, reason);
                                router.refresh();
                              } finally {
                                setActionLoading(null);
                              }
                            }}
                            className="flex items-center gap-2"
                          >
                            <input 
                              type="text" 
                              name="rejectReason" 
                              placeholder="整組拒絕理由 (選填)..." 
                              className="w-36 bg-gray-900 border border-gray-850 rounded px-2 py-0.5 text-xs focus:outline-none"
                            />
                            <button 
                              type="submit" 
                              disabled={actionLoading !== null}
                              className="text-[10px] font-bold bg-rose-950/80 hover:bg-rose-700 text-rose-400 hover:text-white px-2 py-1 rounded transition-colors disabled:opacity-50"
                            >
                              {actionLoading === `reject-group-${firstEvt.id}` ? '處理中...' : '整組拒絕'}
                            </button>
                          </form>
                        </div>

                        <div className="space-y-3">
                          {group.events.map((event) => {
                            const otherIds = group.events.filter(e => e.id !== event.id).map(e => e.id);
                            return (
                              <div key={event.id} className="bg-gray-900/40 p-3 rounded-lg border border-gray-850 flex flex-col sm:flex-row justify-between gap-3">
                                <div className="space-y-1">
                                  <h3 className="font-semibold text-xs text-gray-200">{event.title}</h3>
                                  <div className="text-[9px] text-gray-500 flex gap-3 font-mono">
                                    <span>來源: {event.reporter}</span>
                                    <a href={event.url} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">連結 ↗</a>
                                  </div>
                                </div>

                                <form
                                  onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (actionLoading) return;
                                    const formData = new FormData(e.currentTarget);
                                    const reason = formData.get('reason') as string;
                                    const type = formData.get('type') as string;
                                    setActionLoading(event.id);
                                    try {
                                      await approveOneAndRejectOthers(
                                        event.id, 
                                        otherIds, 
                                        type, 
                                        reason, 
                                        `此情報已在同日聯動中核可他案 (核可ID: ${event.id})`
                                      );
                                      router.refresh();
                                    } finally {
                                      setActionLoading(null);
                                    }
                                  }}
                                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                                >
                                  <input
                                    type="text"
                                    name="reason"
                                    placeholder="核可理由 (選填)..."
                                    className="bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-white focus:outline-none"
                                  />
                                  <div className="flex gap-1">
                                    <select name="type" className="bg-gray-900 border border-gray-800 rounded px-1.5 py-1 text-xs text-white">
                                      <option value={EventType.STREAM}>日常 (9%)</option>
                                      <option value={EventType.STREAM_3D}>3D/大型 (15%)</option>
                                      <option value={EventType.VIDEO}>影片 (30%)</option>
                                    </select>
                                    <button 
                                      type="submit" 
                                      disabled={actionLoading !== null}
                                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2 py-1 rounded transition-all disabled:opacity-50 whitespace-nowrap"
                                    >
                                      {actionLoading === event.id ? '處理中...' : '核可此案/退他案'}
                                    </button>
                                  </div>
                                </form>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  const event = group.events[0];
                  return (
                    <div key={event.id} className="bg-gray-900/20 p-4 rounded-xl border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="space-y-0.5 flex-1">
                        <h3 className="font-semibold text-xs text-gray-200">{event.title}</h3>
                        <div className="text-[9px] text-gray-500 flex gap-3 font-mono">
                          <span>來源: {event.reporter}</span>
                          <a href={event.url} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">連結 ↗</a>
                        </div>
                      </div>

                      <form
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (actionLoading) return;
                          const formData = new FormData(e.currentTarget);
                          const actionType = formData.get('actionType') as string;
                          const reason = formData.get('reason') as string;
                          setActionLoading(event.id);
                          try {
                            if (actionType === 'REJECT') {
                              await rejectEvent(event.id, reason);
                            } else {
                              await approveEvent(event.id, actionType, reason);
                            }
                            router.refresh();
                          } finally {
                            setActionLoading(null);
                          }
                        }}
                      >
                        <input
                          type="text"
                          name="reason"
                          placeholder="請輸入加成或拒絕理由 (選填)..."
                          className="bg-gray-900 border border-gray-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-pink-500 flex-1 sm:w-48"
                        />
                        <div className="flex gap-1">
                          <select name="actionType" className="bg-gray-900 border border-gray-800 rounded px-1.5 py-1 text-xs text-white">
                            <option value={EventType.STREAM}>日常 (9%)</option>
                            <option value={EventType.STREAM_3D}>3D/大型 (15%)</option>
                            <option value={EventType.VIDEO}>影片 (30%)</option>
                            <option value="REJECT">🔴 拒絕此案</option>
                          </select>
                          <button 
                            type="submit" 
                            disabled={actionLoading !== null}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-2.5 py-1 rounded transition-all disabled:opacity-50 active:scale-95 whitespace-nowrap"
                          >
                            {actionLoading === event.id ? '處理中...' : '送出'}
                          </button>
                        </div>
                      </form>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 1. 行政干預微調區 (完全展開) */}
          {selectedPair.id !== 'hololive' && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase border-b border-gray-850 pb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                行政干預微調 (Override)
              </h4>
              <AdminAdjustForm pairId={selectedPair.id} />
            </div>
          )}

          {/* 3. 已覆核情報區 (完全展開) */}
          {selectedPair.id !== 'hololive' && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase border-b border-gray-850 pb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                本週已覆核情報牆 (Processed events)
              </h4>
              {processedEvents.length === 0 ? (
                <div className="text-xs text-gray-655 bg-gray-950/10 px-3 py-2 rounded-lg border border-gray-900">
                  本週目前無已處理情報。
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {processedEvents.map((event) => (
                    <ProcessedEventEditor key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
