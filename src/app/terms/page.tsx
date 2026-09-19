import React from 'react';
import { Metadata } from 'next';
import StatementPageLayout from '@/components/StatementPageLayout';

export const metadata: Metadata = {
  title: '服務條款 | teeteeStock 虛擬交易所',
  description: '規範使用者在本交易所之帳號使用、虛擬點數交易與社群行為準則。',
};

export default function TermsPage() {
  return (
    <StatementPageLayout
      currentPath="/terms"
      isUnderConstruction={false}
      hideHeaderCard={true}
    >
      <div className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 font-normal text-slate-300">
        {/* 頂部大標題 */}
        <div className="border-b border-slate-800/80 pb-6 space-y-2">
          <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
            服務條款
          </h1>
          <p className="text-xs font-normal text-slate-400">
            最後更新日期：2026 年 9 月
          </p>
        </div>

        {/* 前言導言 */}
        <section className="space-y-3">
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            歡迎使用 teeteeStock 貼貼交易所（以下簡稱「本平台」或「本服務」）。本服務由 teeteeStock 開發團隊（以下簡稱「本團隊」或「我們」）營運。為了保障您的權益，請在註冊、登入或使用本服務前，詳細閱讀本服務條款（以下簡稱「本條款」）。
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            當您註冊帳號、登入或開始使用本平台所提供之各項功能時，即視為您已充分閱讀、瞭解並完全同意遵守本條款之所有約定。若您不同意本條款之任一部分，請立即停止使用本服務。
          </p>
        </section>

        {/* 第一章 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            一、認知與服務性質說明（非真實金融交易）
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 純屬社群娛樂性質：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              teeteeStock 為專為 VTuber 粉絲與觀眾所打造的「概念股虛擬撮合模擬系統」。本平台之目的在於提供愛好者互動、應援與娛樂體驗，絕非真實金融證券交易市場。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 不具任何投資價值與建議：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本平台內所呈現之所有代號、概念股、K 線圖、每股淨值、漲跌幅、撮合行情及結算指標，均為基於公開資料（如直播活動、聯動紀錄等）之趣味性模擬數據。本服務所載之任何資訊均不構成任何形式的投資、理財、證券買賣建議或要約。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. 非官方與同人應援宣告：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本平台為獨立之非官方同人社群娛樂專案，與任何 VTuber 經紀公司、事務所（包括但不限於 COVER Corporation、ANYCOLOR Inc. 等）或 VTuber 個人無任何官方贊助、授權、商業合作或從屬關係。
            </p>
          </div>
        </section>

        {/* 第二章 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            二、帳號註冊與安全責任
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 帳號資料真實性：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              您於註冊時應提供有效且由您合法持有之電子信箱與基本資訊，並維持其正確性與最新狀態。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 帳號保管責任：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              您應妥善保管您的帳號與密碼安全。任何透過您帳號進行之一切操作、掛單及交易行為，均推定為您本人之行為，並由您負完全責任。若您發現帳號遭未授權盜用或有任何安全異常，應立即通報本平台。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. 禁止多重分身與機器人洗號：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              原則上每位使用者僅限註冊一個帳號。嚴禁蓄意大量註冊免洗分身帳號、利用自動化腳本洗取每日登入獎勵或操控市場交易。
            </p>
          </div>
        </section>

        {/* 第三章 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            三、虛擬資產與遊戲代幣（TEE 幣）規範
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 無實質法幣價值：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本平台中所使用之「TEE 幣」、虛擬股份、每週股利分配及所有帳戶結餘，僅為平台內部模擬計算與遊戲體驗所用之虛擬點數，不具備任何法定貨幣價值、實體資產價值或可變現之財產權。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 嚴格禁止現金買賣：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              使用者不得透過任何管道（包括但不限於第三方支付、線下交易、網拍等）進行 TEE 幣、虛擬股份或遊戲帳號之真實貨幣買賣、轉讓、質押或利益交換。一經查獲，本平台得逕行永久凍結或註銷涉案帳號。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. 資產調整與管理權限：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              因應市場機制平衡調整、每週除息結算、版本更新或系統除錯修復之需要，本團隊保留隨時對虛擬資產計算公式、初始資本、股利比率及發放規則進行調整之權利。
            </p>
          </div>
        </section>

        {/* 第四章 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            四、使用者守則與禁止事項
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            在使用本服務時，您同意遵守中華民國相關法令及網際網路常規，且不得從事下列行為：
          </p>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 破壞系統公平性：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              惡意利用程式漏洞（Bug）、外掛程式、非授權 API 腳本大量送出請求、進行自買自賣對敲或意圖癱瘓撮合引擎與伺服器。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 不當言論與行為：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              於平台留言、回報系統或個人資訊中發布包含仇恨言論、侮辱誹謗、性騷擾、猥褻、侵權或針對特定 VTuber、觀眾及第三方之惡意攻擊與人身威脅。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. 侵害權利與冒充他人：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              未經授權使用他人商標、肖像或智慧財產權，或冒充本平台官方人員、VTuber 本人或事務所名義進行誤導或欺詐。
            </p>
          </div>
        </section>

        {/* 第五章 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            五、智慧財產權歸屬
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 平台版權：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              teeteeStock 平台之原始碼、程式架構、介面設計、資料庫與原創文案，其智慧財產權與著作權均屬本團隊所有。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 第三方權利尊重：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本平台引用之 VTuber 名稱、組合標籤、直播封面與公開影音資訊，其商標權與著作權均屬於原創作者、相關個人或其所屬經紀公司所有。本平台之引用皆基於非營利社群同好交流之合理使用範疇。
            </p>
          </div>
        </section>

        {/* 第六章 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            六、免責聲明與服務異動
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 服務現狀提供：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本服務以「現狀」及「現有技術基礎」提供。本團隊不對服務之完全不中斷性、即時性、無錯誤性或外部資料爬蟲（如 YouTube API / 直播狀態更新）之準確性作出絕對保證。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 免責範疇：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              因電信網路障礙、伺服器定期維護、天災等不可抗力因素，或因資料源異動導致之虛擬數據延遲、暫停服務或數據回滾，本團隊不承擔任何實體賠償責任。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. 帳號懲處權限：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              若使用者經合理判定違反本條款，本團隊有權在不事先通知的情況下，對其帳號採取警告、撤銷掛單、扣除違規所得 TEE 幣、暫時凍結或永久終止服務之措施。
            </p>
          </div>
        </section>

        {/* 第七章 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            七、條款修訂與管轄法律
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 條款修改權：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本團隊保留隨時修改、增刪本條款之權利。修改後之內容將於本平台公告日起生效。若您在條款修改後繼續使用本服務，即表示您同意接受修改後之約定。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 準據法與管轄法院：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本條款之解釋、效力及履行，均以中華民國法律為準據法。因本條款或使用本服務所生之爭議，雙方同意以台灣台北地方法院為第一審管轄法院。
            </p>
          </div>
        </section>
      </div>
    </StatementPageLayout>
  );
}
