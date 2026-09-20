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
          <div className="space-y-3">
            <h3 className="text-base font-normal text-slate-200">
              Real-World Activities Drive Fundamental Value
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Each unit&apos;s Fundamental Value is influenced by their real-world activities:
            </p>
            <div className="text-sm font-normal text-slate-300 space-y-1.5 pl-[2em]">
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span className="text-slate-200">Regular Duet Streams &amp; Collabs</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span className="text-slate-200">Major 3D Live Performances</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span className="text-slate-200">Original Songs &amp; Landmark Collaborations</span>
              </div>
            </div>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              etc.
            </p>
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
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6 space-y-1">
        <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
          teeteeStock（貼貼交易所）
        </h1>
        <p className="text-xs sm:text-sm font-normal text-slate-400">
          專為 VTuber 觀眾打造的概念股虛擬交易所。
        </p>
      </div>

      {/* Intro */}
      <section className="space-y-3">
        <div className="space-y-1 text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          <p>喜歡的組合今天又貼在一起了？</p>
          <p>這次的「貼貼」有沒有漲停？</p>
        </div>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          在 teeteeStock，你可以把那些讓你忍不住喊出「這組合漲停了吧！」的瞬間，變成一場有趣的虛擬市場遊戲。
        </p>
      </section>

      {/* Section 1 */}
      <section className="space-y-4">
        <h2 className="text-xl font-normal text-slate-100">
          一、我們想做的事：把「貼貼」變成看得見的數字
        </h2>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          在 VTuber 社群裡，「てぇてぇ（TeeTee）」是一個用來形容兩位角色之間親密互動、深厚羈絆，以及那種讓粉絲忍不住感到「好珍貴、好喜歡」的美好瞬間。
        </p>
        <div className="space-y-1 text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          <p>可能是一場直播中的默契互動，</p>
          <p>可能是一首雙人合唱，</p>
          <p>也可能只是兩個人不經意的一句話。</p>
        </div>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          對粉絲來說，這些瞬間都有著特別的價值。
        </p>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          而每當看到這種場景，我們總會忍不住想：
        </p>
        <div className="py-2 pl-[2em] text-sm text-slate-200 font-normal leading-relaxed">
          <p>「這兩個人的股票是不是已經漲停了？」</p>
        </div>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          於是，teeteeStock 就這樣誕生了。
        </p>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          我們把 VTuber 的 CP、組合與各種「貼貼」關係，變成可以在交易所裡持有的<strong className="font-normal text-slate-100">概念股</strong>。
        </p>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          在這裡，應援不只是單純地觀看與等待下一次聯動；你也可以透過虛擬股份，陪著喜歡的組合一起經歷每一次活動、每一次波動，以及每一個值得記住的瞬間。
        </p>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          當然，這裡沒有真的錢，也不用擔心賠錢。
        </p>
        <p className="text-sm font-normal text-slate-200 leading-relaxed [text-indent:2em]">
          我們只是想把「貼貼」這件事，變成一場大家可以一起玩的遊戲。
        </p>
      </section>

      {/* Section 2 */}
      <section className="space-y-6">
        <h2 className="text-xl font-normal text-slate-100">
          二、怎麼玩？看看你的推今天有沒有漲
        </h2>

        {/* 2.1 */}
        <div className="space-y-3">
          <h3 className="text-base font-normal text-slate-200">
            1. VTuber 的活動，會影響「基本面」
          </h3>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            每個組合都有自己的基本價值。
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            而這個數字並不是一成不變的——當你喜歡的組合有新的活動，市場也會跟著發生變化。
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            例如：
          </p>
          <div className="text-sm font-normal text-slate-300 space-y-1.5 pl-[2em]">
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span className="text-slate-200">普通雙人直播／聯動</span>
            </div>
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span className="text-slate-200">重大 3D 節目同台</span>
            </div>
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span className="text-slate-200">原創曲發布／大型聯動活動</span>
            </div>
          </div>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            等等，會影響基本價值變化的各種活動。
          </p>
        </div>

        {/* 2.2 */}
        <div className="space-y-3">
          <h3 className="text-base font-normal text-slate-200">
            2. 不只是看看分數，真的可以「掛單」玩玩看
          </h3>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            teeteeStock 不只是把大家的貼貼程度換成一個分數而已。
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            我們做了一套參考真實股票市場設計的虛擬交易系統，讓你可以實際掛單、買進、賣出，看看自己看好的組合在市場裡會有什麼樣的表現。
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            你可以看到：
          </p>
          <div className="text-sm font-normal text-slate-300 space-y-1.5 pl-[2em]">
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span className="text-slate-200">即時買賣五檔</span>
            </div>
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span className="text-slate-200">漲跌停限制（&plusmn;20%）與檔位規則</span>
            </div>
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span className="text-slate-200">分時走勢與 K 線圖</span>
            </div>
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span className="text-slate-200">還原 K 線</span>
            </div>
          </div>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            可以認真研究市場，也可以只想看自己的推「今天到底有沒有漲」。
          </p>
        </div>

        {/* 2.3 */}
        <div className="space-y-3">
          <h3 className="text-base font-normal text-slate-200">
            3. TEE 配息
          </h3>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            我們會根據各組合的聯動與活動發放<strong className="font-normal text-slate-200">虛擬配息 TEE</strong>。
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            teeteeStock 也提供<strong className="font-normal text-slate-200">「還原成本」</strong>功能。
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            它會把過去收到的配息一起考慮進去，讓你更容易看懂自己的實際持倉表現，以及一路陪著這組 CP 到現在，究竟累積了多少成果。
          </p>
        </div>
      </section>

      {/* Section 3 */}
      <section className="space-y-4">
        <h2 className="text-xl font-normal text-slate-100">
          三、最重要的事：開心推就好
        </h2>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          teeteeStock 的股價、指數與各種市場數據，都是為了<strong className="font-normal text-slate-200">粉絲娛樂與社群互動</strong>而設計的。
        </p>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          這裡沒有真的錢，也不是投資建議。
        </p>
        <div className="space-y-1 text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          <p>你可以認真研究 K 線、研究五檔、研究市場；</p>
          <p>也可以單純因為「今天這兩個人又貼了」就開心買一張。</p>
        </div>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          沒有標準答案。
        </p>
        <p className="text-sm font-normal text-slate-200 leading-relaxed [text-indent:2em]">
          看到喜歡的組合一起出現，就值得開心。
        </p>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          希望 teeteeStock 能成為一個讓大家一邊追 VTuber、一邊玩玩市場，偶爾因為一句「我買xxx連漲三根」而忍不住笑出來的小地方。
        </p>
        <p className="text-sm font-normal text-slate-200 leading-relaxed [text-indent:2em]">
          祝各位推活愉快，也祝大家天天貼貼。
        </p>
      </section>
    </div>
  );
}
