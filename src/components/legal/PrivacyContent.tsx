'use client';

import React from 'react';
import { useLegalLanguage } from '@/context/LegalLanguageContext';

export default function PrivacyContent() {
  const { lang } = useLegalLanguage();

  if (lang === 'en') {
    return (
      <div className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 font-normal text-slate-300">
        {/* Header */}
        <div className="border-b border-slate-800/80 pb-6 space-y-2">
          <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-xs font-normal text-slate-400">
            Last Updated: September 2026
          </p>
        </div>

        {/* Intro */}
        <section className="space-y-3">
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            Welcome to teeteeStock Exchange (&ldquo;teeteeStock,&rdquo; the &ldquo;Platform,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            teeteeStock is a fan-focused entertainment platform built around VTuber concept matching and simulated trading. We care about keeping the experience fun, simple, and respectful of your privacy.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            This Privacy Policy explains what information we collect, why we collect it, how we use it, and the choices you have over your information.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            By using teeteeStock, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </section>

        {/* Section 1 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            1. What Information We Collect
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            We aim to collect only the information we need to run the Platform and provide its features.
          </p>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1.1 Account Information
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              When you create an account or sign in, we may collect:
            </p>
            <ul className="space-y-1.5 pl-10 text-sm font-normal text-slate-300 list-disc">
              <li>Your email address</li>
              <li>Your password, if you use email and password sign-in</li>
              <li>A third-party account identifier when you sign in with Google or Discord</li>
              <li>Your display name</li>
              <li>Your avatar</li>
            </ul>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Passwords for local accounts are stored using salted, one-way cryptographic hashing. We do not store them as plain text.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              You do not need to provide your real name, home address, or other unnecessary personal information to use a standard account.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1.2 Simulated Trading and Activity
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Because teeteeStock includes a simulated trading system, we keep records needed to make that system work, such as:
            </p>
            <ul className="space-y-1.5 pl-10 text-sm font-normal text-slate-300 list-disc">
              <li>Virtual shareholdings</li>
              <li>Orders and transaction history</li>
              <li>TEE token balances</li>
              <li>Daily check-in rewards</li>
              <li>Simulated returns and other trading-related activity</li>
            </ul>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              This information allows us to maintain your portfolio, calculate market activity, and provide features such as weekly simulated dividends and matching calculations.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1.3 Technical Information
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              When you visit the Platform, our servers may automatically receive some basic technical information, such as:
            </p>
            <ul className="space-y-1.5 pl-10 text-sm font-normal text-slate-300 list-disc">
              <li>IP address</li>
              <li>Browser type</li>
              <li>Operating system</li>
              <li>Date and time of access</li>
              <li>Pages or features you use</li>
              <li>General usage and clickstream information</li>
            </ul>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              We use this information mainly to keep the Platform secure and reliable, troubleshoot problems, prevent abuse, and understand how the Platform is being used.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              We do not use this information to build advertising profiles or sell it to advertisers.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1.4 Information We Don&apos;t Ask For
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              teeteeStock is an entertainment and fan-community simulation. It does not process real-money trades or payments.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Because of this, we do not ask you to provide:
            </p>
            <ul className="space-y-1.5 pl-10 text-sm font-normal text-slate-300 list-disc">
              <li>Government-issued ID numbers</li>
              <li>Legal names</li>
              <li>Home or mailing addresses</li>
              <li>Credit card numbers</li>
              <li>Bank account details</li>
              <li>Real-money payment credentials</li>
            </ul>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Please avoid submitting sensitive information through the Platform unless we specifically ask for it for a reason explained in this Privacy Policy.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            2. How We Use Your Information
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            We use the information we collect to run teeteeStock and keep it safe.
          </p>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2.1 Account and Login
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Your account information helps us:
            </p>
            <ul className="space-y-1.5 pl-10 text-sm font-normal text-slate-300 list-disc">
              <li>Sign you in</li>
              <li>Keep your session active</li>
              <li>Manage your account</li>
              <li>Protect your account from unauthorized access</li>
              <li>Detect suspicious or abusive activity</li>
            </ul>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Where appropriate, we use secure HttpOnly cookies or similar technologies to manage login sessions.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2.2 Simulated Trading
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              We use your trading activity to:
            </p>
            <ul className="space-y-1.5 pl-10 text-sm font-normal text-slate-300 list-disc">
              <li>Process simulated orders</li>
              <li>Maintain your virtual portfolio</li>
              <li>Calculate simulated share values and NAV</li>
              <li>Calculate simulated returns</li>
              <li>Distribute weekly simulated dividends</li>
              <li>Manage TEE tokens and rewards</li>
              <li>Keep the Platform&apos;s market and matching systems consistent</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2.3 Keeping the Platform Safe
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              We may use technical and activity information to help detect and prevent:
            </p>
            <ul className="space-y-1.5 pl-10 text-sm font-normal text-slate-300 list-disc">
              <li>Bots and automated abuse</li>
              <li>Fake or duplicate accounts</li>
              <li>Attempts to manipulate the simulated market</li>
              <li>DDoS and other attacks</li>
              <li>Activity that disrupts the Platform or other users</li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            3. Cookies and Browser Storage
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            Like many websites, teeteeStock uses cookies and browser storage technologies to make the Platform work properly.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            These technologies may help us:
          </p>
          <ul className="space-y-1.5 pl-10 text-sm font-normal text-slate-300 list-disc">
            <li>Keep you signed in</li>
            <li>Maintain your session</li>
            <li>Remember your preferences</li>
            <li>Save settings such as language or display preferences</li>
            <li>Support essential Platform features</li>
          </ul>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            You can control cookies through your browser settings. Keep in mind that turning off certain cookies or browser storage features may affect things such as login and other parts of the Platform.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            4. How We Protect Your Information
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            We take reasonable steps to protect the information we hold.
          </p>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              4.1 Encryption and Password Security
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Connections to teeteeStock are protected using HTTPS/TLS.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Passwords for local accounts are processed using salted, one-way cryptographic hashing before being stored. They are not stored in plain text.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              4.2 Access to Data
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Access to user and system data is limited to authorized people who need it for legitimate reasons, such as development, maintenance, troubleshooting, or security work.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              We aim to keep access limited to what is reasonably necessary for those purposes.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            5. When We Share Information
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              5.1 We Don&apos;t Sell Your Personal Information
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              We do not sell, rent, or lease your personal information to advertisers, marketing companies, or other businesses for their own marketing purposes.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              5.2 Legal and Safety Reasons
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              There may be situations where we need to disclose information, for example when it is reasonably necessary to:
            </p>
            <ul className="space-y-1.5 pl-10 text-sm font-normal text-slate-300 list-disc">
              <li>Comply with applicable law</li>
              <li>Respond to a valid subpoena, court order, or other lawful request</li>
              <li>Respond to requests from government or judicial authorities</li>
              <li>Protect the security or rights of teeteeStock or its users</li>
              <li>Respond to an emergency involving a serious threat to someone&apos;s safety</li>
            </ul>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              We aim to disclose only the information that is reasonably necessary for the relevant purpose.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            6. Your Choices and Account Deletion
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              6.1 Updating Your Information
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              You can manage certain account information directly through the Platform, including your display name and account settings.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              6.2 Deleting Your Account
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              If you decide to leave teeteeStock, you can contact us through our official contact channels and ask us to delete your account and associated personal information.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              We will take reasonable steps to remove the applicable information from our active systems. Some information may need to be retained for legal, security, fraud-prevention, or other legitimate operational reasons.
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            7. Changes to This Policy
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            As teeteeStock grows and changes, this Privacy Policy may change too.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            When we update it, we&apos;ll change the &ldquo;Last Updated&rdquo; date at the top of this page. Unless we say otherwise, the updated policy will take effect when it is posted on the Platform.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            We recommend checking this page occasionally so you know what information we collect and how we use it.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            8. Contact Us
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            Have a question about privacy, your account, or how your information is handled?
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            Please reach out through our Contact Us page. We&apos;re happy to hear from you and will do our best to help.
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
            プライバシーポリシー
          </h1>
          <p className="text-xs font-normal text-slate-400">
            最終更新日：2026年9月
          </p>
        </div>

        <section className="space-y-3">
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            teeteeStock（以下「本サービス」または「運営チーム」）へようこそ。運営チームはユーザーのプライバシーと個人情報の保護を極めて重視しています。VTuber模擬銘柄の模擬板寄せ取引やコミュニティ機能を安心してご利用いただくため、本プライバシーポリシー（以下「本ポリシー」）を定めます。本サービスの利用をもって、本ポリシーの全内容に同意したものとみなされます。
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            一、収集する個人情報の範囲
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. アカウント登録および認証情報：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              アカウント作成時に、メールアドレス、不可逆的にハッシュ化されたパスワード、またはサードパーティ認証情報（Google、Discordの識別IDおよびアバター）、任意の表示ニックネーム等、ログイン維持に必要な最小限の情報を取得します。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 模擬取引およびアクティビティ履歴：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              約定エンジンの継続計算および週間配当金決算のため、保有銘柄残高、注文明細、約定履歴、TEEコイン残高、およびデイリーログイン実績を記録します。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. サーバー技術ログ：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              アクセス時に、IPアドレス、ブラウザ種別、OS、アクセス日時、ページ遷移経路が自動的に記録されます。これらは不正攻撃対策、サーバーパフォーマンス維持、統計分析のみに用いられ、個人を特定する目的では使用されません。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              4. 機密財務情報の非収集方針：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本サービスは非営利の同人エンターテインメント模擬企画であり、現実の金銭決済は一切行いません。マイナンバー、本名、現住所、クレジットカード番号、銀行口座番号等の機密性の高い個人財務情報を要求することは一切ありません。
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            二、個人情報の利用目的
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 会員認証とアカウント保護：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              ユーザーのログイン認証、セッション管理、および不正アクセスの防止に利用します。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 約定シミュレーションと仮想資産管理：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              模擬銘柄の注文約定処理、NAV変動計算、損益計算、および週間配当金・TEEコインの付与処理に利用します。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. 不正対策およびシステム監視：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              不正スクリプト、複数アカウントによるボーナス不正取得、DDoS攻撃等の検知・防御に利用します。
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            三、クッキー（Cookie）およびローカルストレージの利用
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. ログイン状態と設定の保持：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              セッション認証情報、表示モード、言語選択設定を保持するためにブラウザのCookieおよびローカルストレージを利用します。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. ブラウザによる設定管理：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              ユーザーはブラウザ設定によりCookieの無効化や削除が可能です。ただし、無効化によりログイン維持等の一部の機能が正常に動作しない場合があります。
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            四、情報セキュリティおよび安全管理措置
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 暗号化通信とパスワード管理：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              全通信においてHTTPS（TLS）暗号化を適用しています。パスワードは不可逆的なソルト付きハッシュ化処理を施してデータベースに格納されます。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. アクセス権限の厳格化：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              システム保守・障害対応に必要な最小限の担当者のみが厳格な管理下でデータベースにアクセスします。
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            五、第三者提供および開示の制限
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 個人情報の売却・譲渡禁止：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              運営チームは、ユーザーの個人情報をマーケティング業者や第三者に売却、賃貸、または譲渡することは一切ありません。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 法令に基づく例外開示：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              法令に基づく裁判所・警察等の公的機関からの正当な要請がある場合、または生命・財産保護のために緊急を要する場合に限り、必要最小限の情報を提供することがあります。
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            六、ユーザーの権利およびデータ削除（忘れられる権利）
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 情報の確認と修正：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              ユーザーはいつでもログインし、自身のニックネームや設定情報を確認・変更できます。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. アカウントおよびデータの完全削除：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              サービスの利用終了および個人情報の完全削除を希望される場合、公式のお問い合わせ窓口より申請いただけます。本人確認の上、速やかに削除処理を実施します。
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            七、プライバシーポリシーの改定およびお問い合わせ先
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 改定手続き：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              当運営は本ポリシーを随時改定する権利を有します。改定後の内容は本ウェブサイト上に掲載された時点で有効となります。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. お問い合わせ先：
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本ポリシーまたは個人情報管理に関するご質問は、本プラットフォームの「お問い合わせ」フォームよりご連絡ください。
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
          隱私權政策
        </h1>
        <p className="text-xs font-normal text-slate-400">
          最後更新日期：2026 年 9 月
        </p>
      </div>

      <section className="space-y-3">
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          歡迎使用 teeteeStock 貼貼交易所（以下簡稱「本平台」或「我們」）。我們非常重視您的個人隱私權與資訊安全。為了讓您能安心享受本平台所提供之各項 VTuber 概念股模擬撮合與社群應援功能，特此向您說明本平台之隱私權保護政策（以下簡稱「本政策」）。當您造訪、註冊或使用本平台時，即視為您已充分閱讀並同意本政策之全部內容。
        </p>
      </section>

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
  );
}
