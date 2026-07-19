import { prisma } from '@/lib/prisma';
import { ReviewStatus, EventType } from '@/types/enums';
import Link from 'next/link';
import { getNextSettlementBoundary } from '@/utils/marketHours';
import TriggerCrawlerButton from './TriggerCrawlerButton';
import { INITIAL_PAIRS } from '@/app/constants/market';
import ReviewPageClient from './ReviewPageClient';

export const dynamic = 'force-dynamic';

const WARNING_LINE = 10;
const DELISTING_LINE = 5;
const MIN_VALUE = 0.1;

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
  'HoshoMarin': '宝鐘マリン',
  'ShishiroBotan': '獅白ぼたん',
  'TsunomakiWatame': '角巻わため',
  'TokinoSora': 'ときのそら',
  'OozoraSubaru': '大空スバル',
  'HimemoriRuna': '姫森ルーナ'
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

export default async function AdminReviewPage() {
  // Fetch all events (including PENDING, APPROVED, REJECTED)
  const allEvents = await prisma.teeteeEvents.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Fetch recent archived events
  const archivedEvents = await prisma.archivedEvents.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  // Ensure special 'hololive' system pair exists in the database
  await prisma.cpPairs.upsert({
    where: { id: 'hololive' },
    update: {},
    create: {
      id: 'hololive',
      name: 'hololive',
      netValue: 100.0,
      currentPrice: 100.0,
      openingPrice: 100.0,
      last_close_price: 100.0,
      next_open_price: 100.0,
      total_shares: BigInt(1000000),
      status: 'SYSTEM',
    }
  });

  const pairs = await prisma.cpPairs.findMany({
    where: { 
      status: { not: 'DELISTED' },
      id: { not: 'hololive' }
    },
    orderBy: { name: 'asc' }
  });

  const previews = [];

  for (const pair of pairs) {
    const statusBefore = pair.status;
    const currentNV = pair.netValue;

    const nextSettlementBoundary = getNextSettlementBoundary(new Date());
    const approvedEvents = allEvents.filter(
      e => e.pairId.toLowerCase() === pair.id.toLowerCase() &&
           e.status === ReviewStatus.APPROVED &&
           !e.isSettled &&
           e.createdAt < nextSettlementBoundary
    );

    // 取得本週尚未結算的行政干預加成情報
    const activeOverride = approvedEvents.find(e => e.type.startsWith('OVERRIDE:'));
    const adminAdjust = activeOverride ? parseFloat(activeOverride.type.split(':')[1]) || 0 : 0;
    const adminAdjustReason = activeOverride ? activeOverride.title.replace('[行政干預] ', '') : '';
    const adminAdjustUrl = activeOverride ? activeOverride.url : '';

    const collabBonusSum = approvedEvents.reduce(
      (sum, evt) => {
        if (evt.type === EventType.STREAM) return sum + 0.09;
        if (evt.type === EventType.STREAM_3D) return sum + 0.15;
        if (evt.type === EventType.VIDEO) return sum + 0.30;
        if (evt.type.startsWith('OVERRIDE:')) {
          const val = parseFloat(evt.type.split(':')[1]) || 0;
          return sum + val;
        }
        return sum;
      },
      0
    );

    const settledNV = currentNV * (1 + collabBonusSum);
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
      adminAdjustReason,
      adminAdjustUrl,
      predictedNV: nextWeekNV,
      statusBefore,
      statusAfter,
      wasDelisted,
      currentPrice,
      premiumDiscount
    });
  }

  // Append 'hololive' special preview
  previews.push({
    id: 'hololive',
    name: 'hololive',
    currentNV: 100.0,
    collabBonusSum: 0,
    collabBonus: 0,
    decay: 0,
    adminAdjust: 0,
    adminAdjustReason: '',
    adminAdjustUrl: '',
    predictedNV: 100.0,
    statusBefore: 'SYSTEM',
    statusAfter: 'SYSTEM',
    wasDelisted: false,
    currentPrice: 100.0,
    premiumDiscount: 0
  });

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

        <header className="bg-gray-900/40 border border-gray-800/80 p-6 rounded-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 tracking-tight">
              數據監控與情報審查中樞
            </h1>
            <p className="text-xs text-gray-500 mt-1">外顯數據主控牆 • 行政干預與情報審查風箱</p>
          </div>
          <div className="flex gap-3">
            <TriggerCrawlerButton />
          </div>
        </header>

        {/* CP Accordions (九大組合數據監控牆) */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
            <h2 className="text-lg font-bold text-white tracking-tight">組合監控牆 (CP Monitoring Wall)</h2>
          </div>

          <ReviewPageClient previews={previews} allEvents={allEvents} />
        </section>

        {/* 歷史已歸檔情報牆 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-850 pb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h2 className="text-lg font-bold text-white tracking-tight">歷史已歸檔情報牆 (Archived Events History)</h2>
          </div>

          <div className="bg-gray-900/20 border border-gray-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
            {archivedEvents.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">目前資料庫中尚無歸檔的歷史情報。</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-500 font-bold">
                      <th className="py-2.5 pb-3">歸檔時間</th>
                      <th className="py-2.5 pb-3">商品</th>
                      <th className="py-2.5 pb-3">情報標題</th>
                      <th className="py-2.5 pb-3">來源</th>
                      <th className="py-2.5 pb-3 text-center">結算狀態</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900/60">
                    {archivedEvents.map((evt) => {
                      let statusBadge = "";
                      if (evt.status === 'APPROVED') {
                        statusBadge = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                      } else if (evt.status === 'REJECTED') {
                        statusBadge = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                      } else {
                        statusBadge = "bg-amber-500/10 text-amber-400 border-amber-500/20"; // PENDING / Unapplied
                      }

                      return (
                        <tr key={evt.id} className="text-gray-300 hover:bg-gray-900/10">
                          <td className="py-2.5 font-mono text-[10px] text-gray-500">
                            {new Date(evt.createdAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false })}
                          </td>
                          <td className="py-2.5 font-mono font-bold text-gray-400">{evt.pairId.toUpperCase()}</td>
                          <td className="py-2.5">
                            <div className="font-semibold text-gray-200">{evt.title}</div>
                            {evt.reason && <div className="text-[10px] text-gray-500 mt-0.5">理由: {evt.reason}</div>}
                          </td>
                          <td className="py-2.5 font-mono text-[10px] text-gray-500">{evt.reporter}</td>
                          <td className="py-2.5 text-center">
                            <span className={`px-2.5 py-0.5 border text-[10px] rounded-full font-bold inline-block ${statusBadge}`}>
                              {evt.status === 'APPROVED' && '已套用'}
                              {evt.status === 'REJECTED' && '已拒絕'}
                              {evt.status === 'PENDING' && '未審查/過期'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
