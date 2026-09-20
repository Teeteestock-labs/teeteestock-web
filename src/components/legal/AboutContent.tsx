'use client';

import React from 'react';
import { useLegalLanguage } from '@/context/LegalLanguageContext';

export default function AboutContent() {
  const { lang } = useLegalLanguage();

  if (lang === 'en') {
    return (
      <div className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 font-normal text-slate-300">
        <div className="border-b border-slate-800/80 pb-6 space-y-1">
          <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
            About teeteeStock
          </h1>
          <p className="text-xs sm:text-sm font-normal text-slate-400">
            teeteeStock: A Virtual Exchange for VTuber Fans
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            1. Platform Philosophy: Putting a Value on &ldquo;TeeTee&rdquo;
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            In Japanese VTuber culture, &ldquo;てぇてぇ (TeeTee)&rdquo; is that special feeling you get when two talents have a moment that just hits different.
          </p>
          <div className="space-y-2 pl-[2em] text-sm text-slate-300">
            <p className="leading-relaxed">
              A great collab. A sweet interaction. A duet that makes the whole chat go:
            </p>
            <p className="leading-relaxed py-1 font-normal text-slate-200">
              &ldquo;THE TEE TEE IS REAL.&rdquo;
            </p>
            <p className="leading-relaxed">
              At teeteeStock, we believe those moments are worth celebrating.
            </p>
            <p className="leading-relaxed">
              So why not give them a market?
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            2. Core Features &amp; Market Mechanics
          </h2>

          {/* Subsection A */}
          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              Real-World Activities Drive Fundamental Value
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Each unit&apos;s Fundamental Value is influenced by their real-world activities:
            </p>
            <div className="text-sm font-normal text-slate-300 space-y-1.5 pl-[2em]">
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>Regular Duet Streams &amp; Collabs: Add to the unit&apos;s weekly fundamental value.</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>Major 3D Live Performances: Trigger major value increases.</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>Original Songs &amp; Landmark Collaborations: Trigger significant fundamental value boosts.</span>
              </div>
            </div>
          </div>

          {/* Subsection B */}
          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              A Real-Time Matching Engine &amp; Order Book
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              teeteeStock goes beyond simple score-based systems with a trading engine inspired by modern financial markets:
            </p>
            <div className="text-sm font-normal text-slate-300 space-y-1.5 pl-[2em]">
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>Real-Time Quotes: Live five-level order book showing bids and asks.</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>Price Limits &amp; Tick Sizes: &plusmn;20% price limits.</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>Candlestick Charts: View 1-minute, 5-minute, daily, weekly, and monthly charts, with dividend-adjusted charting available.</span>
              </div>
            </div>
          </div>

          {/* Subsection C */}
          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              Weekly Cash Dividends
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Every weekend, dividend settlements are calculated based on the week&apos;s collaborative activities. Eligible shareholders automatically receive virtual cash dividends.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Dividend-adjusted cost tracking also lets you see your net holding performance after accounting for cumulative dividends.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            3. Built for Fun and Cheering
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            teeteeStock is first and foremost a fan community experience.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            All market prices, charts, and indices are designed purely for entertainment. There is no need to take the market too seriously&mdash;just relax, have fun, and enjoy cheering for your favorite VTuber pairings and units!
          </p>
          <div className="pt-2 pl-[2em]">
            <p className="text-sm font-normal text-slate-300 leading-relaxed">
              TeeTee goes up. You cheer. The market moves.
            </p>
          </div>
        </section>
      </div>
    );
  }

  if (lang === 'ja') {
    return (
      <div className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 font-normal text-slate-300">
        {/* Header */}
        <div className="border-b border-slate-800/80 pb-6 space-y-1">
          <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
            teeteeStockについて
          </h1>
          <p className="text-xs sm:text-sm font-normal text-slate-400">
            VTuberの「てぇてぇ」を楽しむ、それを株化したコミュニティ・シミュレーション取引所
          </p>
        </div>

        {/* Intro */}
        <section className="space-y-3">
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            <strong className="font-normal text-slate-100">teeteeStock（てぇてぇ取引所）</strong>は、VTuberを応援するリスナーやファンのために生まれた、<strong className="font-normal text-slate-100">株のシミュレーション取引サイト</strong>です。
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            好きなコンビやユニットの「てぇてぇ」を、株を通して楽しんでみませんか？
          </p>
        </section>

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            1. 当サイトの基本の方針：「てぇてぇ」を数値化し、可視化する
          </h2>
          <div className="space-y-2 text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            <p>
              コラボ配信で見せる息ぴったりのやり取り。
            </p>
            <p>
              一緒に歌うデュエット。
            </p>
            <p>
              何気ない会話の中に見える二人だけの空気感。
            </p>
          </div>
          <div className="space-y-2 text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            <p>
              メンバー同士の仲の良さや、推し同士の尊い関係性。
            </p>
            <p>
              そんな瞬間を見ていると、「ああ、てぇてぇ……」と思うことがありますね。
            </p>
          </div>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            teeteeStockは、そんなファンならではの楽しさを株化したという形にして、市場として楽しめるようにしました。
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            好きなコンビやユニットを模擬株として保有し、コラボや活動によって変化する「てぇてぇ」の価値を追いかけながら、みんなで推しの活躍を楽しむ。
          </p>
          <p className="text-sm font-normal text-slate-200 leading-relaxed [text-indent:2em]">
            それが、teeteeStockの目指す「てぇてぇ取引所」である。
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            2. 特徴と仕組み
          </h2>

          {/* 2.1 */}
          <div className="space-y-3">
            <h3 className="text-base font-normal text-slate-200">
              1. コンビの活動と連動
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              各コンビのてぇてぇ価値は、実際の活動やコラボ実績などをもとに変動する。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              たとえば、
            </p>
            <div className="text-sm font-normal text-slate-300 space-y-1.5 pl-[2em]">
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span className="text-slate-200">通常のコラボ配信</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span className="text-slate-200">大型3Dライブでの共演</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span className="text-slate-200">オリジナル楽曲の公開・大型コラボ</span>
              </div>
            </div>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              など、さまざまな活動が市場の変化につながる。
            </p>
          </div>

          {/* 2.2 */}
          <div className="space-y-3">
            <h3 className="text-base font-normal text-slate-200">
              2. 本格的なシミュレーション取引システム
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              単純なスコア集計だけではなく、実際の株式市場を参考にした取引システムを採用している。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              <strong className="font-normal text-slate-200">リアルタイムの情報</strong>では、買い注文・売り注文それぞれ上位5本の気配値を確認できる。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              また、
            </p>
            <div className="text-sm font-normal text-slate-300 space-y-1.5 pl-[2em]">
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span className="text-slate-200">ストップ高・ストップ安（&plusmn;20%）</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span className="text-slate-200">呼値ルール</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span className="text-slate-200">歩み値</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span className="text-slate-200">複数の時間軸に対応したローソク足チャート</span>
              </div>
            </div>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              など、より本格的な市場体験を楽しめる仕組みを用意している。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              チャートは<strong className="font-normal text-slate-200">1分足・5分足・日足・週足・月足</strong>に対応し、配当落ちなどを考慮した<strong className="font-normal text-slate-200">調整後チャート</strong>も確認できる。
            </p>
          </div>

          {/* 2.3 */}
          <div className="space-y-3">
            <h3 className="text-base font-normal text-slate-200">
              3. シミュレーション配当
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              各ユニットのコラボ実績などをもとに、<strong className="font-normal text-slate-200">配当落ち処理</strong>を行い、シミュレーション上の配当として<strong className="font-normal text-slate-200">TEE</strong>を付与する。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              さらに、これまでに受け取った配当を考慮した<strong className="font-normal text-slate-200">「還元コスト」</strong>を確認できるため、現在の保有状況だけでなく、累計でどのくらいのリターンになっているのかもチェックできる。
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            3. ファンコミュニティとしての楽しみ方
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            teeteeStockの価格変動や各種インデックスは、<strong className="font-normal text-slate-200">ファンコミュニティのためのエンターテインメントとして設計されている。</strong>
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            実際のお金を使った投資ではなく、好きなVTuberやコンビ、ユニットの活動をきっかけに、みんなで市場の動きを楽しむためのシミュレーションである。
          </p>
          <div className="py-2 pl-[2em] text-sm text-slate-200 font-normal leading-relaxed">
            <p>「今日はこの二人、めちゃくちゃてぇてぇだった！」</p>
          </div>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            そんな気持ちを、ちょっとだけ市場っぽく楽しんでみる。
          </p>
          <p className="text-sm font-normal text-slate-200 leading-relaxed [text-indent:2em]">
            teeteeStockで、推し活と「てぇてぇ」の新しい楽しみ方を見つけてください。
          </p>
        </section>
      </div>
    );
  }

  // 預設繁體中文 (zh)
  return (
    <div className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 font-normal text-slate-300">
      <div className="border-b border-slate-800/80 pb-6">
        <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
          關於 teeteeStock
        </h1>
        <p className="text-xs font-normal text-slate-400 mt-1">
          VTuber 概念指數與社群娛樂虛擬撮合交易所
        </p>
      </div>

      <section className="space-y-3">
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          teeteeStock（貼貼交易所）是專為 VTuber 觀眾所打造的概念股虛擬交易所。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-normal text-slate-100">
          一、平台理念：將「貼貼」數值化
        </h2>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          在日語裡，「てぇてぇ（TeeTee）」主要以 VTuber 社群中，用來形容「同伴、成員或推的角色之間感情融洽、互動親密」象徵著兩位之間真摯、珍貴且令人心動的互動。我們深信，粉絲們每一次因直播同台而激動、因雙人合唱而感動的情緒，都具有真實且不可磨滅的「精神價值」。
        </p>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          而每次感受到這個精神時，總會想說：「這兩人的價值已經漲停！」。因此，TeeteeStock 將這種美好的情感具象化——讓您推的每一組 VTuber CP / 組合化身為交易所中的個股。在這裡，您的應援不再只是單向的觀看，而是能透過虛擬股份共同見證她們的成長與榮耀！
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-normal text-slate-100">
          二、核心特色與運作機制
        </h2>

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

        <div className="space-y-2">
          <h3 className="text-base font-normal text-slate-200">
            3. 每週現金股利發放
          </h3>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            每週定期根據各組合當週聯動結果除息結算，並固定發放股利。支援「還原成本」計算，得以清楚檢視扣除歷年配息後的真實持倉損益。
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-normal text-slate-100">
          三、友善應援宗旨
        </h2>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          本交易所之走勢與指數僅供粉絲娛樂同歡，請帶著輕鬆、愉快的心情享受應援與市場波動的樂趣！
        </p>
      </section>
    </div>
  );
}
