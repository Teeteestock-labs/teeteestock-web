import React from 'react';
import { Metadata } from 'next';
import StatementPageLayout from '@/components/StatementPageLayout';

export const metadata: Metadata = {
  title: '隱私權政策 | teeteeStock 虛擬交易所',
  description: '詳細說明本站如何收集、儲存、使用與保護您的帳號與個人數據資料。',
};

export default function PrivacyPage() {
  return (
    <StatementPageLayout
      currentPath="/privacy"
      isUnderConstruction={false}
      hideHeaderCard={true}
    >
      <div className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 font-normal text-slate-300">
        {/* 頂部大標題 */}
        <div className="border-b border-slate-800/80 pb-6 space-y-2">
          <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
            隱私權政策
          </h1>
          <p className="text-xs font-normal text-slate-400">
            最後更新日期：2026 年 9 月
          </p>
        </div>

        {/* 前言導言 */}
        <section className="space-y-3">
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            歡迎使用 teeteeStock 貼貼交易所（以下簡稱「本平台」或「我們」）。我們非常重視您的個人隱私權與資訊安全。為了讓您能安心享受本平台所提供之各項 VTuber 概念股模擬撮合與社群應援功能，特此向您說明本平台之隱私權保護政策（以下簡稱「本政策」）。當您造訪、註冊或使用本平台時，即視為您已充分閱讀並同意本政策之全部內容。
          </p>
        </section>

        {/* 第一章 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            一、個人資料之蒐集範圍
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 帳號註冊與登入資訊：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              當您於本平台建立帳號時，我們僅蒐集維持會員登入功能所必要之基本資訊，包括您的電子郵件信箱（Email）、經單向加密之登入密碼以及自訂使用者暱稱。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 虛擬交易與活動紀錄：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              為維持撮合引擎之連續計算與每週股利結算，系統會記錄您的虛擬持股部位、委託買賣掛單明細、歷史撮合成交紀錄、TEE 幣資產餘額及每日登入簽到紀錄。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. 伺服器技術日誌：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              當您瀏覽本平台時，伺服器會自動記錄連線設備之網際網路協定位址（IP Address）、瀏覽器類型、作業系統版本、造訪時間及站內瀏覽路徑。此等資料僅用於防範網路惡意攻擊、維護伺服器效能與整體流量分析，不與特定個人資料進行比對。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              4. 敏感資料免蒐集聲明：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本平台純屬社群同好娛樂模擬專案，不涉及任何真實金流交易，因此本平台絕不會主動要求您提供身分證字號、真實姓名、戶籍地址、信用卡卡號或銀行帳戶等高度敏感之個人財務隱私資訊。
            </p>
          </div>
        </section>

        {/* 第二章 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            二、個人資料之利用目的
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 會員驗證與帳號安全：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              用於驗證使用者登入身分、發送密碼重設通知、維持登入權限狀態並防止帳號遭未授權存取。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 撮合運算與資產管理：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              用於執行概念股買賣撮合、計算每股淨值變動、計算投資報酬率、發放每週現金股利以及核算 TEE 幣資產。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. 系統監控與防弊維護：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              用於偵測並防範惡意腳本、多重分身洗取登入獎勵、異常流量阻斷（DDoS）等破壞市場公平性或危害系統安全之行為。
            </p>
          </div>
        </section>

        {/* 第三章 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            三、Cookie 與本機儲存技術之使用
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 保持登入狀態：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本平台使用瀏覽器之 Cookie 與本機儲存技術，用以儲存身分驗證憑證及介面偏好設定，讓您無須於每次切換頁面時重複輸入登入憑證。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 自行管理設定：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              您可以隨時透過瀏覽器設定管理、清除或拒絕 Cookie 與本機儲存資料。惟若您選擇停用，可能導致部分功能（如維持登入狀態）無法正常運作。
            </p>
          </div>
        </section>

        {/* 第四章 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            四、資訊安全與防護措施
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 傳輸與儲存加密：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本平台全站採用標準 HTTPS 安全加密協定進行資料傳輸。使用者的登入密碼在儲存至資料庫前，均經過不可逆之單向加密演算法（Salted Hash）處理，本平台團隊人員亦無法得知您的真實密碼。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 存取權限控管：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              僅有經授權之核心技術維運人員，基於系統除錯、伺服器維護之必要目的，始得在受限制之權限範圍內檢視資料庫資料。
            </p>
          </div>
        </section>

        {/* 第五章 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            五、第三方資料分享與對外揭露
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 絕不販售個人資料：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本平台絕不會將您的個人資訊販售、出租、出借或提供給任何無關之第三方機構、公關行銷公司或商業廣告商。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 法令配合之例外情形：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              僅在司法機關或政府主管機關依法定程序出具正式公文要求協助調查，或為保護本平台、其他使用者或公眾生命財產安全之緊急情況下，本平台始得依法提供必要之資訊。
            </p>
          </div>
        </section>

        {/* 第六章 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            六、使用者權利與資料刪除
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 查閱與修改權利：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              您可以隨時登入本平台檢視、修改您的個人帳號設定與暱稱。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 請求刪除帳號（被遺忘權）：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              若您希望終止使用本平台並請求永久刪除您的帳號及所有關聯之歷史紀錄，您可以透過官方聯絡管道提出申請，我們將於核對身分無誤後依法將您的資料自資料庫中清除。
            </p>
          </div>
        </section>

        {/* 第七章 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            七、隱私權政策之修訂與聯絡方式
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 政策修訂權：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本平台保留隨時修訂本隱私權政策之權利。修訂後之條款一經公布於本平台即行生效。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 聯絡窗口：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              若您對本隱私權政策、個人資料保護措施或個人權益行使有任何疑問，歡迎隨時透過本站「聯絡我們」頁面與我們取得聯繫。
            </p>
          </div>
        </section>
      </div>
    </StatementPageLayout>
  );
}
