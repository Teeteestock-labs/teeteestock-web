'use client';

import React from 'react';
import { useLegalLanguage } from '@/context/LegalLanguageContext';

export default function DisclaimerContent() {
  const { lang } = useLegalLanguage();

  if (lang === 'en') {
    return (
      <div className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 font-normal text-slate-300">
        <div className="border-b border-slate-800/80 pb-6 space-y-2">
          <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
            Disclaimer
          </h1>
          <p className="text-xs font-normal text-slate-400">
            Last Updated: September 2026
          </p>
        </div>

        <section className="space-y-3">
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            This Disclaimer applies to all visitors and users who access, browse, or use the teeteeStock exchange (&quot;the Platform&quot;). By entering or using this Platform, you acknowledge that you fully understand and unconditionally agree to all terms of this Disclaimer.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            1. Non-Financial Institution & Investment Risk Exemption
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. Non-Regulated Financial Market:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              This Platform is an independent fan community entertainment and simulation project. It is not a securities broker, futures dealer, banking institution, or financial investment advisory regulated by any financial supervisory authority or government agency.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. Data Must Not Be Used as Investment Advice:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              All ticker symbols, market fluctuations, candlestick charts, NAV metrics, and order prices displayed on this Platform are the outputs of simulated fan community algorithms and hold zero analytical or reference value for real financial markets. Nothing on this Platform constitutes investment advice or financial solicitation. The Platform assumes no legal responsibility for any financial loss resulting from real-world trading based on data from this Platform.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            2. Algorithms, Scraped Data & System Stability Exemption
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. External Data Sources & Algorithmic Margins:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              NAV calculations rely on publicly accessible third-party platforms (e.g., YouTube live streaming statuses and official activity). Due to third-party API limits, network delays, or scheduling frequencies, the Platform cannot guarantee absolute real-time accuracy, completeness, or faultlessness.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. System Anomalies & Data Rollbacks:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The Platform reserves the right to suspend operations, reset, or rollback historical matching data due to scheduled maintenance, server hardware issues, software bug repairs, or cyber attacks. The Platform bears no liability for any virtual data delays, discrepancies, or lost orders caused by such events.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            3. Fan-Made Community Nature & Copyright Notice
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. Unofficial Fan Project:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              This Platform is an independent, non-profit community fan project and has no official licensing, commercial partnership, sponsorship, or affiliation with any VTuber talent, group, or agency (including but not limited to COVER Corporation, ANYCOLOR Inc., Brave group, etc.).
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. Fair Use & Notice and Takedown Policy:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              All talent names, pairing titles, public livestream thumbnails, and media referenced on this Platform belong to their respective copyright holders. References are made under the doctrine of Fair Use for non-profit fan appreciation. If any copyright holder objects to content cited on this Platform, please reach out via our contact channels and we will promptly review and take down the material.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            4. External Links & Third-Party Websites Disclaimer
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            This Platform may contain links directing to external third-party sites (e.g. YouTube channels, livestream broadcasts). These websites are operated independently by third parties. The Platform has no control over their content or security practices and accepts no responsibility for any risks or damages incurred while visiting external services.
          </p>
        </section>
      </div>
    );
  }

  if (lang === 'ja') {
    return (
      <div className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 font-normal text-slate-300">
        <div className="border-b border-slate-800/80 pb-6 space-y-2">
          <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
            免責事項
          </h1>
          <p className="text-xs font-normal text-slate-400">
            最終更新日：2026年9月
          </p>
        </div>

        <section className="space-y-3">
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            本免責事項は、teeteeStock（以下「本プラットフォーム」）を訪問・利用されるすべての利用者に適用されます。本プラットフォームを利用することで、本免責事項の全条項に同意したものとみなされます。
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            一、非金融機関および投資リスクに関する免責
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 金融規制対象外の模擬プラットフォーム：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本プラットフォームは非営利の同人ファンコミュニティによるエンターテインメント模擬プロジェクトであり、金融監督庁や政府機関の認可・監督を受ける証券会社、金融商品取引業者、投資顧問会社ではありません。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 現実の投資判断への利用禁止：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本プラットフォームで表示される銘柄コード、値動き、ローソク足チャート、1株あたり純資産（NAV）、および気配値は、すべてコミュニティ独自の模擬アルゴリズムによる計算結果であり、実際の金融市場における分析・参考価値は一切有しません。本サービス上の情報に基づく現実の投資損害について、本運営は一切の法的責任・賠償責任を負いません。
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            二、アルゴリズム・クローラーデータおよびシステム安定性に関する免責
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 外部データ収集と誤差：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              各概念株のNAVは、公開されている外部情報（YouTubeのライブ配信状況や公式活動）を自動アルゴリズムにより参照しています。外部APIの制限や通信遅延により、データの完全性、リアルタイム性、正確性を保証するものではありません。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. システム障害およびデータのロールバック：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              定期メンテナンス、サーバー障害、バグ修正、またはサイバー攻撃等が発生した場合、本プラットフォームは事前の通知なくサービスの中断、仮想データの初期化やロールバックを行う権利を有します。これらに起因するいかなる仮想データ損失に対しても補償は行いません。
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            三、二次創作・同人ファンコミュニティの性質および著作権表示
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 非公式ファンメイド企画：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本プラットフォームは独立した非営利の同人ファンプロジェクトであり、いかなるVTuber個人、グループ、または所属事務所（カバー株式会社、ANYCOLOR株式会社、Brave group等を含むがこれらに限定されません）とも公認、提携、協賛関係にはありません。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 引用・フェアユースおよび削除要請への対応：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本プラットフォームで引用されているタレント名、ユニット名、公開配信サムネイル画像等の知的財産権・商標権は、すべて各権利者に帰属します。引用は非営利ファン活動における正当な範囲内で行われています。権利者様からの要請があった場合、速やかに事実確認を行い、対象コンテンツの削除対応を実施いたします。
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            四、外部リンクおよび第三者サービスに関する免責
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            本プラットフォームには、第三者の外部サイト（YouTubeチャンネル、配信ページ等）へのリンクが含まれる場合があります。外部サイトのコンテンツやプライバシー規程は各運営者によって管理されており、本プラットフォームは外部サイトの利用によって生じた損害について一切責任を負いません。
          </p>
        </section>
      </div>
    );
  }

  // 預設繁體中文 (zh)
  return (
    <div className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 font-normal text-slate-300">
      <div className="border-b border-slate-800/80 pb-6 space-y-2">
        <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
          免責聲明
        </h1>
        <p className="text-xs font-normal text-slate-400">
          最後更新日期：2026 年 9 月
        </p>
      </div>

      <section className="space-y-3">
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          本免責聲明適用於所有造訪、瀏覽或使用 teeteeStock 貼貼交易所（以下簡稱「本平台」）之訪客與使用者。當您進入或使用本平台時，即代表您已充分理解並同意本聲明之全部內容。
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-normal text-slate-100">
          一、非金融機構與投資風險免責
        </h2>

        <div className="space-y-2">
          <h3 className="text-base font-normal text-slate-200">
            1. 非受監管之金融市場：
          </h3>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            本平台為同好社群娛樂模擬專案，並非受金融監督管理委員會或任何政府主管機關監管之證券經紀商、期貨商、金融機構或投資顧問公司。
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-normal text-slate-200">
            2. 數據不得作為投資依據：
          </h3>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            本平台所顯示之代號、行情走勢、K 線圖、每股淨值與買賣報價，均為虛擬社群模擬演算法之運算結果，絕不具備任何現實金融市場之分析與參考價值。本平台所載任何資訊，均不得解讀為證券投資建議、理財諮詢或買賣招攬。任何人若逕自將本平台資訊應用於現實金融證券投資而導致之任何直接、間接或衍生性財產損失，本平台概不承擔任何法律與賠償責任。
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-normal text-slate-100">
          二、演算法、爬蟲數據與系統穩定性免責
        </h2>

        <div className="space-y-2">
          <h3 className="text-base font-normal text-slate-200">
            1. 外部數據與演算法誤差：
          </h3>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            各概念股之每股淨值主要依賴第三方公開平台（如 YouTube 公開直播狀態、官方頻道活動）進行自動化演算法加成。受限於第三方 API 限制、網路延遲或排程頻率，本平台不保證數據之絕對即時性、完整性與無誤性。
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-normal text-slate-200">
            2. 系統異常與數據回溯：
          </h3>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            本平台保留因定期維護、伺服器突發性軟硬體故障、程式錯誤修復或駭客惡意攻擊，而暫停服務、重置或回溯歷史撮合數據之權利。因前述狀況導致之虛擬數據延遲、遺失或撮合未成功，本平台不負任何補償或賠償責任。
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-normal text-slate-100">
          三、同人社群性質與版權宣告
        </h2>

        <div className="space-y-2">
          <h3 className="text-base font-normal text-slate-200">
            1. 非官方同人性質：
          </h3>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            本平台為獨立之非營利社群同好專案，與任何 VTuber 個人、團體或其所屬之經紀公司／事務所（包括但不限於 COVER Corporation、ANYCOLOR Inc.、Brave group 等）無任何官方授權、商業合作、贊助或附屬關係。
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-normal text-slate-200">
            2. 合理使用與通知移除機制：
          </h3>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            本平台引用之藝人名稱、組合稱呼、公開直播封面縮圖與影音公開資訊，其智慧財產權與商標權均歸屬原權利人所有，本平台僅基於非營利社群同好應援目的於「合理使用（Fair Use）」範圍內引用。若相關權利人認為本平台引用內容有所不妥或涉及侵權，請透過官方聯絡管道告知，本平台接獲通知後將會立即進行查核並配合移除。
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-normal text-slate-100">
          四、外部連結與第三方網站免責
        </h2>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          本平台頁面可能包含連往第三方網站或服務（例如 YouTube 頻道、直播串流頁面等）之超連結。該等外部網站之內容、服務與隱私權規範均由該第三方獨立維運，本平台無法控制其內容與安全性，亦不對您因造訪第三方網站所生之任何風險或損害承擔責任。
        </p>
      </section>
    </div>
  );
}
