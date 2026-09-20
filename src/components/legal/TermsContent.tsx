'use client';

import React from 'react';
import { useLegalLanguage } from '@/context/LegalLanguageContext';

export default function TermsContent() {
  const { lang } = useLegalLanguage();

  if (lang === 'en') {
    return (
      <div className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 font-normal text-slate-300">
        <div className="border-b border-slate-800/80 pb-6 space-y-2">
          <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
            Terms of Service
          </h1>
          <p className="text-xs font-normal text-slate-400">
            Last Updated: September 2026
          </p>
        </div>

        <section className="space-y-3">
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            Welcome to teeteeStock exchange (&quot;the Platform&quot; or &quot;the Service&quot;), operated by the teeteeStock dev team (&quot;the Team&quot; or &quot;we&quot;). To safeguard your rights and interests, please carefully read these Terms of Service (&quot;these Terms&quot;) before registering, logging in, or using our services.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            By registering an account, logging in, or beginning to use any functionality provided by this Platform, you are deemed to have fully read, understood, and unconditionally agreed to be bound by all stipulations of these Terms. If you disagree with any part, please immediately cease using this Service.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            1. Nature of Service (Virtual Simulation, Not Real Financial Trading)
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. Exclusively Community Entertainment:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              teeteeStock is a concept stock virtual matching simulation system created exclusively for VTuber audiences. Its purpose is to deliver fan engagement and entertainment experiences, and it is under no circumstances a real financial securities exchange.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. No Real Investment Value or Financial Advice:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              All ticker symbols, concept shares, K-line charts, NAVs, percentage changes, matching prices, and settlement metrics presented on this Platform are playful simulated calculations based on public livestream information. Nothing in this Service constitutes any form of investment advice, financial planning, or securities offering.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. Unofficial Fan-Made Project Declaration:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              This Platform is an independent, unofficial fan project and is not sponsored, authorized, commercially partnered with, or affiliated with any VTuber management agency (including but not limited to COVER Corporation, ANYCOLOR Inc.) or any individual VTuber.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            2. Account Registration and Security Obligations
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. Authenticity of Registration Information:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              You must provide a valid email address and profile information legally owned by you upon registration, and keep it accurate and up-to-date.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. Account Security Responsibilities:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              You are responsible for maintaining the confidentiality of your account credentials. All orders and trading actions initiated through your account shall be deemed your own actions, and you bear full responsibility for them.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. Prohibition of Sybil Accounts and Automated Bots:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              In principle, each user is restricted to one account. Malicious batch registration of disposable accounts, using automated scripts to farm login rewards, or manipulating market matching is strictly prohibited.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            3. Virtual Assets & Game Currency (TEE Tokens) Rules
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. Zero Legal Tender Value:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The &quot;TEE Tokens&quot;, virtual shares, weekly dividend allocations, and balance credits on this Platform are solely simulated game tokens. They hold zero fiat currency value, physical asset value, or cashable property rights.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. Strict Ban on Real-Money Trading (RMT):
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Users are strictly forbidden from selling, transferring, pledging, or trading TEE tokens, virtual shares, or accounts for real currency through any channel. Accounts caught violating this rule will be permanently frozen or terminated.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. Asset Balancing and Management Discretion:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              To balance game mechanics, resolve ex-dividend settlements, deploy version updates, or fix bugs, the Team reserves the right to adjust virtual asset calculation formulas, initial capital, dividend rates, and distribution parameters at any time.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            4. User Conduct and Prohibited Activities
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            When using this Service, you agree to comply with relevant internet standards and refrain from:
          </p>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. Disrupting System Fairness:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Exploiting program bugs, using third-party plugins, firing massive unauthorized API requests, conducting wash trades with oneself, or attempting to overload matching engines and servers.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. Inappropriate Speech and Behavior:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Publishing hate speech, defamation, sexual harassment, obscenities, or malicious harassment and threats targeting any VTuber, viewer, or third party.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. Rights Infringement & Impersonation:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Impersonating platform staff, VTuber talents, or corporate representatives to mislead or defraud others.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            5. Intellectual Property Rights
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. Platform Copyright:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The source code, software architecture, UI design, database schema, and original text of the teeteeStock platform are owned by the Team.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. Respect for Third-Party Rights:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              VTuber names, tags, stream cover art, and public media cited belong to their original creators, talents, or affiliated agencies. Their citation is conducted under non-profit community fair use.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            6. Disclaimers and Service Modifications
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. Service Provided &quot;As-Is&quot;:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The Service is provided on an &quot;as-is&quot; and &quot;as-available&quot; basis without warranties of uninterrupted service, instantaneous delivery, or absolute crawler precision.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. Force Majeure & Limitation of Liability:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The Team bears no monetary liability for delays, downtime, or virtual rollbacks caused by telecommunication failures, server maintenance, or force majeure events.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. Account Sanction Discretion:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The Team reserves the right to issue warnings, cancel pending orders, confiscate illicitly acquired TEE tokens, or terminate accounts of users reasonably judged to have breached these Terms.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            7. Amendments and Governing Law
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. Amendment Rights:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The Team reserves the right to amend these Terms at any time. Continued use of the Service following amendments constitutes agreement to revised terms.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. Applicable Law & Jurisdiction:
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              These Terms shall be interpreted and governed in accordance with the laws of the Republic of China (Taiwan). Any disputes arising from these Terms shall be submitted to the Taiwan Taipei District Court as the court of first instance.
            </p>
          </div>
        </section>
      </div>
    );
  }

  if (lang === 'ja') {
    return (
      <div className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 font-normal text-slate-300">
        <div className="border-b border-slate-800/80 pb-6 space-y-2">
          <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
            利用規約
          </h1>
          <p className="text-xs font-normal text-slate-400">
            最終更新日：2026年9月
          </p>
        </div>

        <section className="space-y-3">
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            teeteeStock（以下「本プラットフォーム」または「本サービス」）へようこそ。本サービスはteeteeStock開発チーム（以下「当チーム」）が運営しています。利用者の権利を保護するため、登録・利用前に本利用規約（以下「本規約」）をよくお読みください。
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            アカウントを登録、ログイン、または本サービスの機能を利用開始した時点で、本規約のすべての内容を理解し同意したものとみなされます。不同意の場合は、直ちに本サービスの利用を中止してください。
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            一、サービスの性質（実際の金融商品取引ではありません）
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. コミュニティエンターテインメント目的：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              teeteeStockは、VTuberリスナーとファンの交流と応援のために作られた概念株の模擬板寄せシミュレーションシステムです。実際の金融商品取引所ではありません。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 投資価値および助言の不存在：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本プラットフォームで表示されるすべての銘柄コード、概念株、チャート、NAV、および気配値は、公開配信情報等に基づくシミュレーションデータです。投資助言や金融勧誘を構成するものではありません。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. 非公式同人プロジェクトの表明：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本プラットフォームは非公式の同人ファンプロジェクトであり、VTuber事務所（カバー株式会社、ANYCOLOR株式会社等）やタレント本人とは一切の商業的提携・公認関係はありません。
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            二、アカウント登録および安全管理責任
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 登録情報の正確性：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              登録時は自身が正当に保有する有効なメールアドレスおよび情報を登録し、常に最新の状態を保つものとします。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. アカウントの管理義務：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              アカウントおよび認証情報の管理責任は利用者に帰属します。自身のアカウントを通じて行われた一切の注文・操作は、利用者本人の行為とみなされます。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. 複数アカウント・ボット行為の禁止：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              原則として1人1アカウントとします。大量のサブアカウント作成や自動化スクリプトによる市場操作・ログインボーナス不正取得は固く禁止します。
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            三、仮想資産およびゲーム内通貨（TEEコイン）に関する規定
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 法定通貨価値の不存在：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本プラットフォーム内の「TEEコイン」、模擬株式、配当金等はすべてゲーム内シミュレーション用途の仮想ポイントであり、現実の法定通貨価値や換金可能性はありません。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. リアルマネートレード（RMT）の全面禁止：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              いかなる手段によるTEEコインやアカウントの現金売買、譲渡、担保設定も厳禁とします。違反が確認された場合、当該アカウントを永久停止とします。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. バランス調整と管理権限：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              システムバランスの調整やアップデートに伴い、仮想資産の計算式や配当比率を改定する権利を当チームが留保します。
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            四、利用者規律および禁止事項
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            本サービスの利用にあたり、以下の行為を行ってはなりません：
          </p>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. システムの公平性を損なう行為：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              バグの悪用、不正ツールの使用、過剰なAPIリクエストの送信、自己対当売買による相場操縦等。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 不適切な発言・迷惑行為：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              ヘイトスピーチ、誹謗中傷、嫌がらせ、公序良俗に反する投稿、またはVTuberや他者への悪意ある攻撃。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. 権利侵害およびなりすまし：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              他者の知的財産権の無断侵害、運営スタッフやVTuber本人を詐称する行為。
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            五、知的財産権の帰属
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. プラットフォームの権利：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              teeteeStockのソースコード、UIデザイン、システム仕様、および文章の著作権は当チームに帰属します。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 第三者の権利尊重：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              引用されているVTuber関連の商標・著作権は各権利者に帰属します。引用は非営利ファン活動におけるフェアユースの範囲で行われています。
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            六、免責事項およびサービスの変更・中断
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 現状有姿での提供：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本サービスは現状有姿（As-Is）で提供され、無中断性やエラーの完全な不存在を保証するものではありません。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 免責範囲：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              通信障害、サーバー保守、天災等の不可抗力による仮想データの遅延やロールバックについて、金銭的賠償責任を負いません。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. 違反時の措置：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              利用規約への違反が認められた場合、当チームは予告なく警告、注文取消、アカウントの一時停止または永久剥奪を行うことができます。
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            七、規約の変更および準拠法
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 規約変更権：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              当チームは本規約を随時改定する権利を有します。改定後の規約は本プラットフォーム上に掲載された時点で効力を生じます。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 準拠法および管轄裁判所：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本規約の準拠法は中華民国法とします。本規約に起因する紛争については、台湾台北地方法院を第一審の専属的合意管轄裁判所とします。
            </p>
          </div>
        </section>
      </div>
    );
  }

  // 預設繁體中文 (zh)
  return (
    <div className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 font-normal text-slate-300">
      <div className="border-b border-slate-800/80 pb-6 space-y-2">
        <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
          服務條款
        </h1>
        <p className="text-xs font-normal text-slate-400">
          最後更新日期：2026 年 9 月
        </p>
      </div>

      <section className="space-y-3">
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          歡迎使用 teeteeStock 貼貼交易所（以下簡稱「本平台」或「本服務」）。本服務由 teeteeStock 開發團隊（以下簡稱「本團隊」或「我們」）營運。為了保障您的權益，請在註冊、登入或使用本服務前，詳細閱讀本服務條款（以下簡稱「本條款」）。
        </p>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          當您註冊帳號、登入或開始使用本平台所提供之各項功能時，即視為您已充分閱讀、瞭解並完全同意遵守本條款之所有約定。若您不同意本條款之任一部分，請立即停止使用本服務。
        </p>
      </section>

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
  );
}
