import React from 'react';
import { Metadata } from 'next';
import StatementPageLayout from '@/components/StatementPageLayout';

export const metadata: Metadata = {
  title: '關於本站 (About) | teeteeStock 虛擬交易所',
  description: '了解 teeteeStock 虛擬交易所的創立背景、VTuber 概念指數與社群娛樂宗旨。',
};

export default function AboutPage() {
  return (
    <StatementPageLayout
      currentPath="/about"
      isUnderConstruction={false}
      hideHeaderCard={true}
    >
      <div className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 font-normal text-slate-300">
        {/* 頂部大標題（僅保留關於 teeteeStock） */}
        <div className="border-b border-slate-800/80 pb-6">
          <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
            關於 teeteeStock
          </h1>
        </div>

        {/* 第一章 */}
        <section className="space-y-3">
          <h2 className="text-xl font-normal text-slate-100">
            一、平台理念：將「貼貼」數值化
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            teeteeStock（貼貼交易所）是專為 VTuber 觀眾所打造的概念股虛擬交易所。
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            在日語裡，「てぇてぇ（TeeTee）」主要以 VTuber 社群中，用來形容「同伴、成員或推的角色之間感情融洽、互動親密」象徵著兩位之間真摯、珍貴且令人心動的互動。我們深信，粉絲們每一次因直播同台而激動、因雙人合唱而感動的情緒，都具有真實且不可磨滅的「精神價值」。
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            而每次感受到這個精神時，總會想說：「這兩人的價值已經漲停！」。因此，TeeteeStock 將這種美好的情感具象化——讓您推的每一組 VTuber CP / 組合化身為交易所中的個股。在這裡，您的應援不再只是單向的觀看，而是能透過虛擬股份共同見證她們的成長與榮耀！
          </p>
        </section>

        {/* 第二章 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            二、核心特色與運作機制
          </h2>

          {/* 小節 1 */}
          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 現實連動驅動基本面
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              各組合的基本面「每股淨值 」與其在現實中的活動緊密連動：
            </p>
            <div className="text-sm font-normal text-slate-300 space-y-1.5 pl-[2em]">
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>普通雙人直播 / 聯動：推升當週基本面加成。</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>重大 3D 節目同台：帶來強力的價值突破。</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>原創曲發布 / 重大聯動活動：引爆超高淨值倍率！</span>
              </div>
            </div>
          </div>

          {/* 小節 2 */}
          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 真實連續撮合引擎與盤口深度
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              非單純的數字遊戲，teeteeStock 擁有比照現代股票市場的交易模式：
            </p>
            <div className="text-sm font-normal text-slate-300 space-y-1.5 pl-[2em]">
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>即時報價系統：提供即時買賣五檔深度掛單。</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>漲跌停限制 (±20%) 與檔位規則：維持市場價格穩定有序。</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>分時走勢與多週期 K 線圖：支援 1 分、5 分、日線、週線與月線，以及「還原 K 線」等功能。</span>
              </div>
            </div>
          </div>

          {/* 小節 3 */}
          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. 每週現金股利發放
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              每週定期根據各組合當週聯動結果除息結算，並固定發放股利。支援「還原成本」計算，得以清楚檢視扣除歷年配息後的真實持倉損益。
            </p>
          </div>
        </section>

        {/* 第三章 */}
        <section className="space-y-3">
          <h2 className="text-xl font-normal text-slate-100">
            三、友善應援宗旨
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            本交易所之走勢與指數僅供粉絲娛樂同歡，請帶著輕鬆、愉快的心情享受應援與市場波動的樂趣！
          </p>
        </section>
      </div>
    </StatementPageLayout>
  );
}
