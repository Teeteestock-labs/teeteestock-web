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
          <p className="text-xs sm:text-sm font-normal text-emerald-400 font-mono">
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
            <blockquote className="my-2 py-2 px-4 rounded-xl bg-slate-900/90 border-l-4 border-emerald-500 text-emerald-400 font-mono text-sm tracking-wide font-bold">
              &ldquo;THE TEE TEE IS REAL.&rdquo;
            </blockquote>
            <p className="leading-relaxed">
              At teeteeStock, we believe those moments are worth celebrating.
            </p>
            <p className="leading-relaxed font-medium text-slate-200">
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
                <span><strong className="text-slate-200 font-normal">Regular Duet Streams &amp; Collabs:</strong> Add to the unit&apos;s weekly fundamental value.</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span><strong className="text-slate-200 font-normal">Major 3D Live Performances:</strong> Trigger major value increases.</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span><strong className="text-slate-200 font-normal">Original Songs &amp; Landmark Collaborations:</strong> Trigger significant fundamental value boosts.</span>
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
                <span><strong className="text-slate-200 font-normal">Real-Time Quotes:</strong> Live five-level order book showing bids and asks.</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span><strong className="text-slate-200 font-normal">Price Limits &amp; Tick Sizes:</strong> &plusmn;20% price limits.</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span><strong className="text-slate-200 font-normal">Candlestick Charts:</strong> View 1-minute, 5-minute, daily, weekly, and monthly charts, with dividend-adjusted charting available.</span>
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
            <p className="text-sm font-mono font-medium text-pink-400">
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
        <div className="border-b border-slate-800/80 pb-6">
          <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
            teeteeStock について
          </h1>
          <p className="text-xs font-normal text-slate-400 mt-1">
            VTuber概念株インデックス・コミュニティ模擬取引所
          </p>
        </div>

        <section className="space-y-3">
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            teeteeStock（てぇてぇ取引所）は、VTuberリスナーとファンのために創設された概念株の模擬取引プラットフォームです。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-normal text-slate-100">
            一、プラットフォーム理念：「てぇてぇ」を数値化・可視化
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            日本語のVTuberカルチャーにおいて「てぇてぇ（TeeTee）」とは、仲間やメンバー、推し同士の温かく親密な絆や尊い関係性を表す特別な言葉です。ファンがコラボ配信で胸を熱くし、デュエット楽曲に感動するその想いには、掛け替えのない「精神的価値」が存在すると私たちは確信しています。
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            その尊さを目撃するたび、「この二人の価値はストップ高だ！」と感じる瞬間があります。teeteeStockはその素晴らしい感情を具現化し、推しCPやユニットを模擬株式として取引所に上場させました。ここでの応援は単なる一方的な視聴にとどまらず、模擬株を通じて彼女たちの成長と輝きを共に分かち合うことができます！
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            二、主な特徴とシステム仕組み
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 現実の配信・活動と連動するファンダメンタルズ
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              各ユニットの基本価値である「1株あたり純資産（NAV）」は、現実の活動とダイナミックに連動します：
            </p>
            <div className="text-sm font-normal text-slate-300 space-y-1.5 pl-[2em]">
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>通常のペア配信・コラボ：当週の基礎NAVバフを押し上げます。</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>大型3Dライブ共演：強力な価値ブレイクスルーを誘発。</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>オリジナル曲公開・大型コラボ企画：超高倍率のNAV急騰をもたらします！</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 本格的な連続板寄せ約定エンジンと気配値深度
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              単なるスコア集計ではなく、近代株式市場に準拠した本格的な取引エンジンを実装しています：
            </p>
            <div className="text-sm font-normal text-slate-300 space-y-1.5 pl-[2em]">
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>リアルタイム板情報：買い・売り各5档のリアルタイム気配値を表示。</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>ストップ高・安制限（±20%）および呼値ルール：市場の秩序ある価格形成を維持。</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>歩み値・複数時間軸ローソク足チャート：1分足、5分足、日足、週足、月足、および権利落ち修正K線を完備。</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. 毎週の現金配当金（TEE）付与
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              毎週末、各ユニットの当週コラボ実績に基づいて配当落ち決済が行われ、配当金が定時付与されます。配当受取後の実質取得コストを算出する「還元コスト」機能により、累計損益も一目で把握できます。
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-normal text-slate-100">
            三、ファンコミュニティ応援の趣旨
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            本取引所の値動きおよびインデックスは、すべてファンコミュニティのエンターテインメント目的で運営されています。気軽で楽しい気持ちで推し活と市場の盛り上がりをお楽しみください！
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
