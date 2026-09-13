import React from 'react';
import { Metadata } from 'next';
import StatementPageLayout from '@/components/StatementPageLayout';

export const metadata: Metadata = {
  title: '免責聲明 (Disclaimer) | teeteeStock 虛擬交易所',
  description: '說明本平台虛擬娛樂性質、數據參考性質與使用者自負風險之重要聲明。',
};

export default function DisclaimerPage() {
  return (
    <StatementPageLayout
      currentPath="/disclaimer"
      isUnderConstruction={false}
      hideHeaderCard={true}
    >
      <div className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 font-normal text-slate-300">
        {/* 頂部大標題 */}
        <div className="border-b border-slate-800/80 pb-6 space-y-2">
          <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
            免責聲明 (Disclaimer)
          </h1>
          <p className="text-xs font-normal text-slate-400">
            最後更新日期：2026 年 9 月
          </p>
        </div>

        {/* 前言導言 */}
        <section className="space-y-3">
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            本免責聲明適用於所有造訪、瀏覽或使用 teeteeStock 貼貼交易所（以下簡稱「本平台」）之訪客與使用者。當您進入或使用本平台時，即代表您已充分理解並同意本聲明之全部內容。
          </p>
        </section>

        {/* 第一章 */}
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

        {/* 第二章 */}
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

        {/* 第三章 */}
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

        {/* 第四章 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            四、外部連結與第三方網站免責
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            本平台頁面可能包含連往第三方網站或服務（例如 YouTube 頻道、直播串流頁面等）之超連結。該等外部網站之內容、服務與隱私權規範均由該第三方獨立維運，本平台無法控制其內容與安全性，亦不對您因造訪第三方網站所生之任何風險或損害承擔責任。
          </p>
        </section>
      </div>
    </StatementPageLayout>
  );
}
