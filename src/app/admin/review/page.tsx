import { prisma } from '@/lib/prisma';
import { 
  approveEvent, 
  rejectEvent, 
  updateAdminAdjust, 
  approveOneAndRejectOthers, 
  rejectMultipleEvents 
} from '../actions';
import { ReviewStatus, EventType } from '@/types/enums';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const WARNING_LINE = 10;
const DELISTING_LINE = 5;
const MIN_VALUE = 0.1;

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

export default async function AdminReviewPage() {
  // Fetch all events (including PENDING, APPROVED, REJECTED)
  const allEvents = await prisma.teeteeEvents.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const pairs = await prisma.cpPairs.findMany({
    where: { status: { not: 'DELISTED' } },
    orderBy: { name: 'asc' }
  });

  const previews = [];

  for (const pair of pairs) {
    const statusBefore = pair.status;
    const currentNV = pair.netValue;
    const adminAdjust = pair.adminAdjust;

    const approvedEvents = allEvents.filter(
      e => e.pairId.toLowerCase() === pair.id.toLowerCase() && e.status === ReviewStatus.APPROVED && !e.isSettled
    );

    const collabBonusSum = approvedEvents.reduce(
      (sum, evt) => {
        if (evt.type === EventType.STREAM) return sum + 0.09;
        if (evt.type === EventType.STREAM_3D) return sum + 0.15;
        if (evt.type === EventType.VIDEO) return sum + 0.30;
        return sum;
      },
      0
    );

    const settledNV = currentNV * (1 + collabBonusSum) + (adminAdjust || 0.0);
    const collabBonus = currentNV * collabBonusSum;
    const decay = parseFloat((settledNV * 0.08).toFixed(2));
    
    let nextWeekNV = settledNV * 0.92;
    nextWeekNV = Math.max(MIN_VALUE, parseFloat(nextWeekNV.toFixed(2)));

    let wasDelisted = false;
    let statusAfter = statusBefore;

    if (nextWeekNV < DELISTING_LINE) {
      statusAfter = 'DELISTED';
      wasDelisted = true;
    } else {
      statusAfter = nextWeekNV <= WARNING_LINE ? 'WARNING' : 'NORMAL';
    }

    // Premium / Discount calculation
    const currentPrice = pair.currentPrice;
    const premiumDiscount = ((currentPrice - currentNV) / currentNV) * 100;

    previews.push({
      ...pair,
      currentNV,
      collabBonusSum,
      collabBonus,
      decay,
      adminAdjust,
      predictedNV: nextWeekNV,
      statusBefore,
      statusAfter,
      wasDelisted,
      currentPrice,
      premiumDiscount
    });
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8 font-sans select-none selection:bg-pink-500/30 selection:text-pink-200">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation back */}
        <div className="flex justify-between items-center">
          <Link href="/" className="text-sm font-semibold text-gray-400 hover:text-pink-400 flex items-center gap-1 transition-colors">
            ← 返回交易大廳
          </Link>
          <span className="text-xs text-gray-600">伺服器本地時間: {new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}</span>
        </div>

        <header className="bg-gray-900/40 border border-gray-800/80 p-6 rounded-2xl backdrop-blur-md">
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 tracking-tight">
            數據監控與情報審查中樞
          </h1>
          <p className="text-xs text-gray-500 mt-1">外顯數據主控牆 • 行政干預與情報審查風箱</p>
        </header>

        {/* CP Accordions (九大組合數據監控牆) */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
            <h2 className="text-lg font-bold text-white tracking-tight">組合監控牆 (CP Monitoring Wall)</h2>
          </div>

          <div className="space-y-3">
            {previews.map((pair) => {
              const pairEvents = allEvents.filter(e => e.pairId.toLowerCase() === pair.id.toLowerCase());
              const pendingEvents = pairEvents.filter(e => e.status === ReviewStatus.PENDING);
              const processedEvents = pairEvents.filter(e => e.status === ReviewStatus.APPROVED || e.status === ReviewStatus.REJECTED);
              
              const pendingCount = pendingEvents.length;
              const hasEvents = pairEvents.length > 0;
              
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

              return (
                <div 
                  key={pair.id} 
                  className={`border rounded-xl overflow-hidden bg-gray-900/10 backdrop-blur-md transition-all duration-200 ${hasEvents ? 'border-gray-800' : 'border-gray-950 bg-gray-950/20'}`}
                >
                  {/* 外顯第一層：全知數據監控標頭 (完全外顯，不可摺疊) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-900/60 border-b border-gray-800/80 gap-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm tracking-wider bg-gray-800 px-2 py-0.5 rounded text-gray-400 font-bold">{pair.id.toUpperCase()}</span>
                      <span className="text-sm font-bold text-white">{pair.name}</span>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-4 gap-2 text-center text-xs px-2 md:px-8">
                      <div className="border-r border-gray-800/50">
                        <span className="text-gray-500 block text-[9px]">隱藏淨值 (NV)</span>
                        <span className="font-mono font-bold text-gray-200 text-xs sm:text-sm">{pair.currentNV.toFixed(2)}</span>
                      </div>
                      <div className="border-r border-gray-800/50">
                        <span className="text-gray-500 block text-[9px]">累積加成</span>
                        <span className="font-mono font-bold text-emerald-400 text-xs sm:text-sm">
                          +{(pair.collabBonusSum * 100).toFixed(0)}% (+{pair.collabBonus.toFixed(2)})
                        </span>
                      </div>
                      <div className="border-r border-gray-800/50">
                        <span className="text-gray-500 block text-[9px]">預估下期淨值</span>
                        <span className="font-mono font-bold text-pink-400 text-xs sm:text-sm">{pair.predictedNV.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[9px]">預估下期狀態</span>
                        <span className="font-bold text-xs sm:text-sm block mt-0.5">
                          {pair.statusAfter === 'NORMAL' && <span className="text-emerald-400">NORMAL</span>}
                          {pair.statusAfter === 'WARNING' && <span className="text-amber-400">WARNING</span>}
                          {pair.statusAfter === 'DELISTED' && <span className="text-rose-400">DELISTED</span>}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-end">
                      {pendingCount > 0 ? (
                        <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] rounded-full font-semibold whitespace-nowrap">
                          [ {pendingCount} 筆待審 ]
                        </span>
                      ) : hasEvents ? (
                        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] rounded-full font-semibold whitespace-nowrap">
                          [ 已全數審查 ]
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-700 whitespace-nowrap">
                          本週無情報
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 折疊隱藏第二層：行政干預與貼貼情報風箱 */}
                  <details 
                    name="cp-accordion" 
                    className="group"
                  >
                    <summary className="flex items-center justify-between px-4 py-2 cursor-pointer select-none bg-gray-950/20 text-[10px] text-gray-500 hover:text-gray-300 font-bold border-b border-gray-900 list-none">
                      <span>⚙️ 點擊展開行政干預與情報審查明細</span>
                      <span className="text-gray-600 group-open:rotate-180 transition-transform duration-200 text-[10px]">▼</span>
                    </summary>

                    <div className="p-4 bg-gray-950/40 space-y-6">

                      {/* 【行政干預區】 */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase border-b border-gray-850 pb-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          行政干預微調 (Override)
                        </h4>
                        <form 
                          action={async (formData: FormData) => {
                            'use server';
                            const val = parseFloat(formData.get('adjust') as string) || 0;
                            const reason = formData.get('reason') as string;
                            await updateAdminAdjust(pair.id, val, reason);
                          }}
                          className="bg-gray-900/20 border border-gray-900/80 p-3 rounded-lg flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 whitespace-nowrap">微調值:</span>
                            <input
                              type="number"
                              name="adjust"
                              step="0.1"
                              placeholder="0.0"
                              defaultValue={pair.adminAdjust || ""}
                              className="w-20 bg-gray-950 border border-gray-800 rounded px-2 py-1 text-center font-mono text-xs text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-xs text-gray-400 whitespace-nowrap">行政理由:</span>
                            <input
                              type="text"
                              name="reason"
                              placeholder="強制寫入微調理由 (必填)..."
                              defaultValue={pair.adminAdjustReason}
                              required
                              className="w-full bg-gray-950 border border-gray-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <button
                            type="submit"
                            className="px-4 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold transition-all active:scale-95 whitespace-nowrap"
                          >
                            套用微調
                          </button>
                        </form>
                      </div>

                      {/* 【情報審查流水線】 */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase border-b border-gray-850 pb-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          情報審查 & 核可紀錄
                        </h4>
                        
                        {/* Pending list */}
                        <div className="space-y-3">
                          <div className="text-[9px] text-gray-500 font-bold tracking-wider">待處理情報專區</div>
                          {pendingCount === 0 ? (
                            <div className="text-xs text-gray-600 py-1 bg-gray-950/20 px-3 rounded-lg border border-gray-900">本組合目前無待審查情報。</div>
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
                                          action={async (formData: FormData) => {
                                            'use server';
                                            const reason = formData.get('rejectReason') as string;
                                            await rejectMultipleEvents(allIds, reason);
                                          }}
                                          className="flex items-center gap-2"
                                        >
                                          <input 
                                            type="text" 
                                            name="rejectReason" 
                                            placeholder="整組拒絕理由 (必填)..." 
                                            required
                                            className="w-36 bg-gray-900 border border-gray-850 rounded px-2 py-0.5 text-xs focus:outline-none"
                                          />
                                          <button type="submit" className="text-[10px] font-bold bg-rose-950/80 hover:bg-rose-700 text-rose-400 hover:text-white px-2 py-1 rounded transition-colors">
                                            整組拒絕
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
                                                action={async (formData: FormData) => {
                                                  'use server';
                                                  const reason = formData.get('reason') as string;
                                                  const type = formData.get('type') as string;
                                                  await approveOneAndRejectOthers(event.id, otherIds, type, reason, `此情報已在同日聯動中核可他案 (核可ID: ${event.id})`);
                                                }}
                                                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                                              >
                                                <input
                                                  type="text"
                                                  name="reason"
                                                  placeholder="核可理由 (必填)..."
                                                  required
                                                  className="bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-white focus:outline-none"
                                                />
                                                <div className="flex gap-1">
                                                  <select name="type" className="bg-gray-900 border border-gray-800 rounded px-1.5 py-1 text-xs text-white">
                                                    <option value={EventType.STREAM}>日常 (9%)</option>
                                                    <option value={EventType.STREAM_3D}>3D/大型 (15%)</option>
                                                    <option value={EventType.VIDEO}>影片 (30%)</option>
                                                  </select>
                                                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2 py-1 rounded transition-all">
                                                    核可此案/退他案
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
                                      action={async (formData: FormData) => {
                                        'use server';
                                        const actionType = formData.get('actionType') as string;
                                        const reason = formData.get('reason') as string;
                                        if (actionType === 'REJECT') {
                                          await rejectEvent(event.id, reason);
                                        } else {
                                          await approveEvent(event.id, actionType, reason);
                                        }
                                      }}
                                    >
                                      <input
                                        type="text"
                                        name="reason"
                                        placeholder="請輸入加成或拒絕理由 (必填)..."
                                        required
                                        className="bg-gray-900 border border-gray-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-pink-500 flex-1 sm:w-48"
                                      />
                                      <div className="flex gap-1">
                                        <select name="actionType" className="bg-gray-900 border border-gray-800 rounded px-1.5 py-1 text-xs text-white">
                                          <option value={EventType.STREAM}>日常 (9%)</option>
                                          <option value={EventType.STREAM_3D}>3D/大型 (15%)</option>
                                          <option value={EventType.VIDEO}>影片 (30%)</option>
                                          <option value="REJECT">🔴 拒絕此案</option>
                                        </select>
                                        <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-2.5 py-1 rounded transition-all active:scale-95">
                                          送出
                                        </button>
                                      </div>
                                    </form>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Processed list */}
                        <div className="space-y-3">
                          <div className="text-[9px] text-gray-500 font-bold tracking-wider">本週已覆核情報牆</div>
                          {processedEvents.length === 0 ? (
                            <div className="text-xs text-gray-650 bg-gray-950/10 px-3 py-1 rounded-lg border border-gray-900">本週目前無已處理情報。</div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {processedEvents.map((event) => {
                                const isApproved = event.status === ReviewStatus.APPROVED;
                                const cardBorderClass = isApproved ? 'border-red-500/80 bg-red-950/5' : 'border-emerald-500/80 bg-emerald-950/5';
                                const tagColorClass = isApproved ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                                const badgeLabel = isApproved ? '[已核可]' : '[已拒絕]';
                                
                                let bonusLabel = "";
                                if (isApproved) {
                                  if (event.type === EventType.STREAM) bonusLabel = "(9%)";
                                  else if (event.type === EventType.STREAM_3D) bonusLabel = "(15%)";
                                  else if (event.type === EventType.VIDEO) bonusLabel = "(30%)";
                                }

                                return (
                                  <div 
                                    key={event.id} 
                                    className={`p-3 rounded-lg border ${cardBorderClass} opacity-60 pointer-events-none select-none flex justify-between items-start gap-2`}
                                  >
                                    <div className="space-y-1 flex-1 min-w-0">
                                      <h3 className="font-semibold text-xs text-gray-300 truncate">{event.title}</h3>
                                      <div className="text-[9px] text-gray-500 font-mono">
                                        <span>來源: {event.reporter}</span>
                                      </div>
                                      <div className="text-[10px] text-gray-400 bg-gray-900/60 p-1.5 rounded border border-gray-800/50 mt-1.5 font-mono break-all">
                                        <span className="text-gray-500 mr-1">審查理由:</span>
                                        {event.reason || '未填寫'}
                                      </div>
                                    </div>
                                    
                                    <div className="text-right flex flex-col items-end gap-1 flex-shrink-0">
                                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${tagColorClass}`}>
                                        {badgeLabel} {bonusLabel}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                      </div>

                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
