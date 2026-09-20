'use client';

import React from 'react';
import { useLegalLanguage } from '@/context/LegalLanguageContext';

export default function DisclaimerContent() {
  const { lang } = useLegalLanguage();

  if (lang === 'en') {
    return (
      <div className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 font-normal text-slate-300">
        {/* Header */}
        <div className="border-b border-slate-800/80 pb-6 space-y-2">
          <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
            Disclaimer
          </h1>
          <p className="text-xs font-normal text-slate-400">
            Last Updated: September 2026
          </p>
        </div>

        {/* Intro */}
        <section className="space-y-3">
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            This Disclaimer applies to information, data, charts, virtual assets, and other content made available through teeteeStock (the &ldquo;Platform&rdquo; or the &ldquo;Service&rdquo;).
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            teeteeStock is a fan-made virtual market simulation created for entertainment and community engagement. Your use of the Platform is also subject to our Terms of Service and Privacy Policy.
          </p>
        </section>

        {/* Section 1 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            1. Not a Financial Service or Investment Platform
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1.1 Virtual Market Simulation
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              teeteeStock is a fictional market simulation designed for VTuber fans and online communities.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The Platform is not a securities exchange, securities broker, futures dealer, bank, investment adviser, payment service, or other financial service.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              No feature of the Platform is intended to constitute an offer, solicitation, recommendation, or provision of financial products or investment services.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1.2 No Investment Advice
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Ticker symbols, market prices, order books, candlestick charts, NAV figures, percentage changes, dividends, rankings, and other market-related information displayed on the Platform are generated for entertainment and game-simulation purposes.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Such information should not be relied upon for making real-world investment, trading, financial, tax, or other commercial decisions.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Nothing on the Platform constitutes investment advice, financial advice, a securities recommendation, or a solicitation to buy or sell any real-world financial instrument.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1.3 No Real-World Economic Value
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              TEE Tokens, virtual shares, Virtual Dividends, virtual balances, simulated prices, and other in-platform assets are fictional game elements.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              They:
            </p>
            <ul className="space-y-1.5 pl-10 text-sm font-normal text-slate-300 list-disc">
              <li>have no cash or monetary value;</li>
              <li>cannot be redeemed for fiat currency;</li>
              <li>do not represent securities or ownership interests;</li>
              <li>do not represent an interest in any VTuber, agency, company, or other entity; and</li>
              <li>do not create any payment obligation or other financial claim against the Team.</li>
            </ul>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Users must not buy, sell, or exchange these virtual assets for real-world money or other things of value.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            2. Data Sources, Algorithms, and Accuracy
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2.1 Third-Party and Public Data
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Certain Platform features may use publicly available information or data obtained from third-party services, including livestream schedules, collaboration information, public announcements, and other publicly available activity data.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The availability and accuracy of such information may depend on third-party websites, APIs, data providers, network conditions, and automated data-collection systems.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2.2 No Guarantee of Real-Time Accuracy
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              We do not guarantee that Platform data will always be:
            </p>
            <ul className="space-y-1.5 pl-10 text-sm font-normal text-slate-300 list-disc">
              <li>accurate;</li>
              <li>complete;</li>
              <li>current;</li>
              <li>available in real time;</li>
              <li>free from technical errors; or</li>
              <li>consistent with information displayed by an original third-party source.</li>
            </ul>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Data may be delayed, incomplete, incorrectly classified, or unavailable due to API limitations, network conditions, changes to third-party platforms, or technical errors.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2.3 Simulated Calculations
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              NAV, market prices, dividends, rankings, and other values may be calculated using proprietary or automated game logic.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              These calculations are intended solely for the operation of the Platform&apos;s simulation and should not be interpreted as objective valuations of any VTuber, talent, agency, company, collaboration, or real-world asset.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            3. System Availability and Virtual Data
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3.1 Service Interruptions
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The Platform may occasionally become unavailable or experience degraded performance due to:
            </p>
            <ul className="space-y-1.5 pl-10 text-sm font-normal text-slate-300 list-disc">
              <li>scheduled maintenance;</li>
              <li>emergency maintenance;</li>
              <li>software or hardware failures;</li>
              <li>infrastructure problems;</li>
              <li>network outages;</li>
              <li>third-party service failures;</li>
              <li>security incidents;</li>
              <li>cyberattacks;</li>
              <li>bugs; or</li>
              <li>other circumstances beyond our reasonable control.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3.2 Corrections and Rollbacks
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              To maintain the integrity of the simulation, the Team may correct, cancel, reverse, reset, or roll back virtual transactions and other game data where reasonably necessary.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              This may include circumstances involving:
            </p>
            <ul className="space-y-1.5 pl-10 text-sm font-normal text-slate-300 list-disc">
              <li>technical errors;</li>
              <li>incorrect data;</li>
              <li>calculation errors;</li>
              <li>duplicated transactions;</li>
              <li>exploits or unauthorized activity;</li>
              <li>security incidents; or</li>
              <li>major system failures.</li>
            </ul>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              As a result, virtual orders, transactions, balances, prices, dividends, rankings, or historical records may be changed or removed.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3.3 No Guarantee of Data Preservation
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              We do not guarantee that virtual portfolios, transaction histories, rankings, or other game data will be permanently preserved.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Users should not treat Platform records as a substitute for financial, accounting, legal, or other official records.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            4. Unofficial Fan-Made Project
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              4.1 No Affiliation
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              teeteeStock is an independent and unofficial fan project.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Unless expressly stated otherwise, the Platform is not sponsored, endorsed, authorized, operated by, or affiliated with any VTuber, talent, group, management agency, company, or rights holder, including but not limited to COVER Corporation, ANYCOLOR Inc., or Brave group.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              References to any third party do not imply endorsement, sponsorship, authorization, or partnership.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              4.2 Third-Party Intellectual Property
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Names, trademarks, logos, character designs, artwork, photographs, thumbnails, videos, music, stream materials, and other third-party content remain the property of their respective rights holders.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              teeteeStock does not claim ownership of such third-party materials.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The Platform may reference publicly available information or third-party materials for purposes such as identification, commentary, fan-community interaction, information, and entertainment.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The use of any third-party material on the Platform does not necessarily imply that the Team owns or has exclusive rights to that material.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              4.3 Rights Complaints and Takedown Requests
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              If you believe that material displayed on the Platform infringes your copyright, trademark, publicity right, or other legal right, please contact the Team through the designated contact channel.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Please provide sufficient information to identify the relevant material and explain the basis of your request.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              We will review reported material in good faith and may remove, restrict, modify, or replace material where appropriate.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Nothing in this section is intended to determine or concede the legal status of any particular use of third-party material.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            5. External Links and Third-Party Websites
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            The Platform may contain links to third-party websites and services, including official VTuber websites, YouTube channels, livestream pages, social-media accounts, and other external resources.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            These third-party services are operated independently from teeteeStock.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            We do not control and are not responsible for:
          </p>
          <ul className="space-y-1.5 pl-10 text-sm font-normal text-slate-300 list-disc">
            <li>their availability;</li>
            <li>their content;</li>
            <li>their security practices;</li>
            <li>their privacy practices;</li>
            <li>their terms of service; or</li>
            <li>their handling of personal information.</li>
          </ul>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            A link to a third-party website does not constitute an endorsement, sponsorship, authorization, or affiliation with that website or its operator.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            Your use of third-party services is subject to the terms and policies of the applicable third party.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            6. Limitation of Responsibility
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            To the maximum extent permitted by applicable law, the Team is not responsible for losses arising from a user&apos;s reliance on Platform information for real-world financial, investment, commercial, or other decisions.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            The Team is also not responsible for losses or disruption resulting from third-party data sources, third-party services, network failures, technical problems, or other circumstances beyond the Team&apos;s reasonable control.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            Nothing in this Disclaimer excludes or limits any liability, right, or protection that cannot lawfully be excluded or limited under applicable law.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            7. Changes to This Disclaimer
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            We may update this Disclaimer from time to time to reflect changes to the Platform, its features, data sources, or applicable requirements.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            The updated version will be posted on the Platform with a revised &ldquo;Last Updated&rdquo; date.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            Where appropriate, material changes may be communicated through the Platform or another reasonable channel.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            8. Governing Terms
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            This Disclaimer should be read together with the teeteeStock Terms of Service and Privacy Policy.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            If there is a conflict between this Disclaimer and the Terms of Service, the Terms of Service will control to the extent permitted by applicable law.
          </p>
          <div className="pt-2 pl-[2em]">
            <p className="text-sm font-normal text-slate-200">
              teeteeStock Development Team
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
        <div className="border-b border-slate-800/80 pb-6 space-y-2">
          <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
            免責事項
          </h1>
          <p className="text-xs font-normal text-slate-400">
            最終更新日：2026年9月
          </p>
        </div>

        {/* Intro */}
        <section className="space-y-3">
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            本免責事項は、teeteeStock（以下「本サービス」といいます。）を利用するすべてのユーザーに適用されます。本サービスを利用することにより、本免責事項の内容に同意したものとみなされます。
          </p>
        </section>

        {/* Section 一 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            一、サービスの性質および投資に関する免責
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 金融サービスではありません
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本サービスは、VTuberを応援するファンコミュニティのための、非公式かつ非営利のエンターテインメント目的のシミュレーションサービスです。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              現実の証券取引所、証券会社、金融商品取引業者、投資顧問その他の金融機関が提供するサービスではなく、金融商品の販売、投資助言その他の金融サービスを提供するものではありません。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本サービスは、台湾その他の地域における金融監督当局から、証券取引または金融サービスを行うための認可・登録・免許等を受けたものではありません。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 現実の投資判断には利用しないでください
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本サービス上に表示される模擬銘柄コード、株価、チャート、1株あたり純資産（NAV）、気配値、取引データその他の情報は、本サービス独自のシミュレーションルールおよびアルゴリズムに基づいて生成されたものです。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              これらの情報は、現実の金融市場における価格、価値、業績その他の状況を示すものではなく、現実の投資判断のための情報として提供されるものでもありません。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本サービス上の情報をもとに、ユーザーが現実の金融商品その他の資産について行った投資・取引等によって生じた損失または損害について、運営チームは責任を負いません。
            </p>
          </div>
        </section>

        {/* Section 二 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            二、外部データ、アルゴリズムおよびシステムに関する免責
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 外部情報および自動処理による誤差
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              各模擬銘柄のNAVその他の数値は、公開されている外部情報やVTuberの活動状況、配信・イベント等の情報を、本サービス独自のルールおよび自動処理によって反映しています。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              外部サービスの仕様変更、APIの利用制限、通信障害、取得遅延、データの欠損その他の事情により、情報の正確性、完全性、最新性またはリアルタイム性を保証するものではありません。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              また、自動処理による判定や計算が、実際の活動内容や状況と一致しない場合があります。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. システム障害およびデータのロールバック
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              メンテナンス、サーバー障害、システム上の不具合、バグ修正、外部サービスの障害、サイバー攻撃その他の事情により、本サービスは、事前の通知なくサービスの全部または一部を停止、変更または一時的に利用できない状態とする場合があります。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              また、必要に応じて、取引履歴、仮想資産、模擬銘柄の株価その他の仮想データを修正、初期化またはロールバックする場合があります。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              これらによってユーザーの仮想資産、取引履歴その他のデータに影響が生じた場合であっても、運営チームは、現金その他による補償を行いません。
            </p>
          </div>
        </section>

        {/* Section 三 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            三、非公式ファンプロジェクトおよび知的財産権について
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 非公式のファンプロジェクト
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本サービスは、VTuberを応援するファンコミュニティによって独立して運営される、非公式のファンプロジェクトです。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              特定のVTuber本人、VTuberグループ、所属事務所、企業その他の権利者によって運営、承認、後援、提携または公式認定されたものではありません。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              これには、COVER株式会社、ANYCOLOR株式会社、Brave groupその他のVTuber関連企業・団体が含まれますが、これらに限りません。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 第三者の知的財産権について
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本サービス上で使用または表示されるVTuberの名前、ユニット名、活動情報、配信情報、サムネイルその他の第三者に関するコンテンツについて、著作権、商標権その他の知的財産権が存在する場合、それらの権利は各権利者に帰属します。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本サービスは、これらの権利を取得または所有するものではありません。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              権利者または正当な権利を有する方から、掲載内容についてのご連絡や削除等の要請を受けた場合には、内容を確認したうえで、必要に応じて掲載内容の修正、非表示または削除等の対応を行います。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. 権利に関するお問い合わせ
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本サービス上のコンテンツについて、著作権、商標権その他の権利に関する問題がある場合は、運営チームまでご連絡ください。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              権利関係を確認するため、必要に応じて、対象となるコンテンツや権利関係を確認できる情報の提供をお願いする場合があります。
            </p>
          </div>
        </section>

        {/* Section 四 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            四、外部リンクおよび第三者サービスについて
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            本サービスには、YouTubeその他の第三者が運営するウェブサイト、配信ページ、SNS等へのリンクが含まれる場合があります。
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            これらの外部サービスは、それぞれの運営者が独自に提供・管理するものであり、本サービスの管理下にはありません。
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            外部サービスの内容、提供状況、利用規約、プライバシーポリシーその他の事項について、本サービスが保証するものではありません。
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            外部サービスの利用については、各サービスの利用規約およびプライバシーポリシー等をご確認ください。
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            外部サービスの利用または利用できないことによって生じた損害について、運営チームは責任を負いません。
          </p>
        </section>

        {/* Section 五 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            五、本規約との適用関係
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            本免責事項は、teeteeStock「利用規約」および「プライバシーポリシー」と一体として解釈され、適用されるものとします。
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            本免責事項と利用規約の規定に矛盾または抵触が生じた場合は、適用法令の許容する最大限の範囲において、利用規約の定めが優先するものとします。
          </p>
          <div className="pt-2 pl-[2em]">
            <p className="text-sm font-normal text-slate-200">
              teeteeStock開発チーム
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
            本平台所顯示之代號、行情走勢、K 線圖、每股淨值與買賣報價，均為虛擬社群模擬演算法之運算結果，絕不具備任何現實金融市場之分析與參考價值。本平台所載任何資訊，均不得解讀為證券投資建議、理財諮詢或買賣招攬。任何人若逕自將本平台資訊應用於現實金融證券投資而導致之任何直接、間接或衍生性財產損失，本平台及營運團隊概不承擔任何法律與賠償責任。
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
            2. 系統異常與資料回溯：
          </h3>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            本平台及營運團隊保留因定期維護、伺服器突發性軟硬體故障、程式錯誤修復或駭客惡意攻擊，而暫停服務、重置或回溯歷史撮合數據之權利。因前述狀況導致之虛擬數據延遲、遺失或撮合未成功，本平台及營運團隊概不負任何補償或賠償責任。
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
            本平台引用之 VTuber 名稱、組合稱呼、公開直播封面縮圖與公開影音資訊，其智慧財產權與商標權均歸屬原權利人所有，本平台僅基於非營利社群同好應援目的於「合理使用（Fair Use）」範圍內引用。若相關權利人認為本平台引用內容有所不妥或涉及侵權，請透過官方聯絡管道告知，營運團隊接獲通知後將會立即進行查核並配合移除。
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-normal text-slate-100">
          四、外部連結與第三方網站免責
        </h2>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          本平台頁面可能包含連往第三方網站或服務（例如 YouTube 頻道、直播串流頁面等）之超連結。該等外部網站之內容、服務與隱私權規範均由該第三方獨立維運，本平台及營運團隊無法控制其內容與安全性，亦不對您因造訪第三方網站所生之任何風險或損害承擔責任。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-normal text-slate-100">
          五、條款準據與合併適用
        </h2>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          本免責聲明應與 teeteeStock《服務條款》及《隱私權政策》合併閱讀並共同適用。
        </p>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          若本免責聲明之內容與《服務條款》有任何牴觸或解釋歧異，在法令允許之最大範圍內，應以《服務條款》之約定為準。
        </p>
        <div className="pt-2 pl-[2em]">
          <p className="text-sm font-normal text-slate-200">
            teeteeStock 開發團隊
          </p>
        </div>
      </section>
    </div>
  );
}
