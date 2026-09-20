'use client';

import React from 'react';
import { useLegalLanguage } from '@/context/LegalLanguageContext';

export default function TermsContent() {
  const { lang } = useLegalLanguage();

  if (lang === 'en') {
    return (
      <div className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 font-normal text-slate-300">
        {/* Header */}
        <div className="border-b border-slate-800/80 pb-6 space-y-2">
          <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
            Terms of Service
          </h1>
          <p className="text-xs font-normal text-slate-400">
            Last Updated: September 2026
          </p>
        </div>

        {/* Intro */}
        <section className="space-y-3">
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            Welcome to teeteeStock (the &ldquo;Platform&rdquo; or the &ldquo;Service&rdquo;), a fan-made virtual stock market simulation operated by the teeteeStock development team (the &ldquo;Team,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            These Terms of Service (the &ldquo;Terms&rdquo;) govern your access to and use of the Service.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            By creating an account, accessing the Service, or using any feature of the Platform, you acknowledge that you have read and understood these Terms and agree to be bound by them. If you do not agree with these Terms, please do not access or use the Service.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            If you have any questions about these Terms, please contact us through the contact information provided on the Platform.
          </p>
        </section>

        {/* Section 1 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            1. About the Service
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1.1 Fan-Made Entertainment Platform
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              teeteeStock is a fan-made virtual stock market simulation designed for VTuber fans and online communities.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The Platform is intended solely for entertainment, community interaction, and fan engagement. It is designed to simulate the experience of a market using fictional shares, prices, orders, virtual assets, and other game mechanics.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1.2 Not a Financial Product or Investment Service
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              teeteeStock is not a securities exchange, brokerage service, investment platform, payment service, financial product, or other financial service.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Nothing available through the Service constitutes:
            </p>
            <div className="text-sm font-normal text-slate-300 space-y-1.5 pl-[2em]">
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>an offer or solicitation to buy or sell securities;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>investment, financial, tax, or legal advice;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>a recommendation to invest in any person, company, project, or asset;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>an ownership interest in any VTuber, talent, agency, company, or other entity; or</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>a promise of financial return.</span>
              </div>
            </div>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em] mt-2">
              All prices, charts, ticker symbols, NAV figures, dividends, order-book activity, settlement figures, and other market data displayed by the Platform are fictional or simulated game data.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1.3 No Real-World Economic Value
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Unless expressly stated otherwise in a separate written agreement, all of the following are virtual game elements only:
            </p>
            <div className="text-sm font-normal text-slate-300 space-y-1.5 pl-[2em]">
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>TEE Tokens;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>virtual shares;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>virtual dividends;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>virtual cash balances;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>simulated market prices;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>virtual portfolios;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>rankings and scores; and</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>other in-game assets or credits.</span>
              </div>
            </div>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em] mt-2">
              These virtual assets do not represent fiat currency, securities, equity, debt, ownership interests, or claims against the Team or any third party.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Virtual assets cannot be redeemed for cash or other real-world property.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1.4 Unofficial Fan Project
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              teeteeStock is an independent and unofficial fan project.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Unless expressly stated otherwise, the Platform is not sponsored, endorsed, authorized, operated by, or affiliated with any VTuber, VTuber agency, talent management company, rights holder, or other third party, including but not limited to COVER Corporation or ANYCOLOR Inc.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The appearance of a VTuber, talent, agency, company, trademark, character, or other third-party reference on the Platform does not imply endorsement, authorization, partnership, or affiliation.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            2. Eligibility and Account Registration
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2.1 Eligibility
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              You may use the Service only if you are legally permitted to enter into these Terms under the laws applicable to you.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              If you are under the age of majority in your jurisdiction, you may use the Service only where permitted by applicable law and, where required, with the consent of your parent or legal guardian.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The Team may impose additional age or access restrictions for particular features.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2.2 Registration Information
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Where account registration is required, you agree to provide accurate and current information.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              You must provide an email address that you control and must keep your registration information reasonably up to date.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              You must not knowingly provide false, misleading, or fraudulent information.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2.3 Account Security
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              You are responsible for maintaining the confidentiality of your login credentials and for activities conducted through your account.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              If you believe that your account has been compromised or accessed without authorization, you should notify the Team as soon as reasonably possible.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The Team will not be responsible for losses resulting from your failure to maintain reasonable account security, except to the extent otherwise required by applicable law.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2.4 One Account Per User
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Unless the Team expressly permits otherwise, each person may maintain only one account.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              You must not create or operate multiple accounts for the purpose of obtaining additional rewards, circumventing restrictions, manipulating the market, or otherwise gaining an unfair advantage.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            3. Virtual Assets and Market Rules
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3.1 TEE Tokens and Virtual Shares
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              TEE Tokens and virtual shares are fictional game assets created solely for use within the Service.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              They do not constitute money, securities, cryptocurrency, stored-value instruments, or property that may be redeemed for cash.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3.2 No Real-Money Trading
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              You must not sell, purchase, transfer, exchange, pledge, or otherwise trade:
            </p>
            <div className="text-sm font-normal text-slate-300 space-y-1.5 pl-[2em]">
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>TEE Tokens;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>virtual shares;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>virtual dividends;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>virtual balances;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>accounts; or</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>other in-game assets</span>
              </div>
            </div>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em] mt-2">
              for real money, cryptocurrency, goods, services, or anything of real-world value.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              This prohibition applies whether the transaction occurs on or off the Platform, including through third-party websites, social media, private messages, marketplaces, or other channels.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The Team may suspend or terminate accounts involved in real-money trading and may reverse or invalidate virtual assets obtained through prohibited transactions.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3.3 Market Simulation
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Market prices and trading activity are generated by the Platform&apos;s simulation and matching mechanisms.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The Team may modify market rules, price limits, tick sizes, matching logic, order types, dividend calculations, or other game mechanics when reasonably necessary for:
            </p>
            <div className="text-sm font-normal text-slate-300 space-y-1.5 pl-[2em]">
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>game balance;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>technical maintenance;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>security;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>bug fixes;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>fraud prevention;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>system performance; or</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>feature updates.</span>
              </div>
            </div>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em] mt-2">
              Such changes may affect virtual prices, balances, rankings, or other game outcomes.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3.4 Virtual Dividends
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Any &ldquo;dividend&rdquo; distributed by the Platform is a Virtual Dividend and is solely a game reward or virtual credit.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Virtual Dividends are not cash payments, investment returns, interest, profit distributions, or claims against the Team or any third party.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The Team may modify the calculation, eligibility requirements, timing, or amount of Virtual Dividends when reasonably necessary for the operation or balance of the Service.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3.5 Errors and Corrections
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The Platform may occasionally contain technical, calculation, data-collection, or display errors.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Where reasonably necessary, the Team may correct erroneous transactions, prices, balances, dividends, rankings, or other virtual records.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The Team may also roll back or restore virtual game data when required to correct material errors, security incidents, exploits, or technical failures.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            4. Prohibited Conduct
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            You agree not to use the Service to:
          </p>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              4.1 Manipulate the Platform
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              You must not:
            </p>
            <div className="text-sm font-normal text-slate-300 space-y-1.5 pl-[2em]">
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>exploit bugs or unintended game mechanics;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>use unauthorized scripts, bots, plugins, or automation;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>submit excessive or unauthorized API requests;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>interfere with the matching engine or other Platform systems;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>conduct wash trades or coordinated transactions intended to manipulate prices or trading activity;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>create multiple accounts to circumvent restrictions;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>intentionally disrupt other users&apos; access to the Service; or</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>attempt to gain unauthorized access to the Platform or its underlying systems.</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              4.2 Abuse Other Users or Third Parties
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              You must not use the Service to:
            </p>
            <div className="text-sm font-normal text-slate-300 space-y-1.5 pl-[2em]">
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>threaten, stalk, harass, or intimidate others;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>publish unlawful or seriously abusive content;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>engage in targeted harassment;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>impersonate another user, VTuber, talent, agency, Team member, or corporate representative;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>publish content intended to deceive users about an affiliation or endorsement; or</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>use the Platform to facilitate fraud or other unlawful activities.</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              4.3 Circumvent Enforcement Measures
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              You must not attempt to circumvent an account suspension, termination, trading restriction, rate limit, security measure, or other enforcement action imposed by the Team.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            5. Third-Party Content and Intellectual Property
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              5.1 Our Materials
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Except for third-party materials, the original software, source code, UI design, database structure, graphics, documentation, text, and other original materials created for the Platform are owned by or licensed to the Team or the applicable rights holders.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Nothing in these Terms grants you ownership of such materials.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              You may not copy, modify, distribute, reverse engineer, publicly display, commercially exploit, or create derivative works from Platform materials except where permitted by applicable law or expressly authorized by the Team.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              5.2 Third-Party Rights
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Names, trademarks, logos, artwork, character designs, images, videos, music, stream materials, and other content relating to VTubers, talents, agencies, and other third parties remain the property of their respective rights holders.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              teeteeStock does not claim ownership of third-party materials merely because they are referenced or displayed on the Platform.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The Platform may reference publicly available information or third-party materials for fan-community, identification, commentary, informational, or entertainment purposes.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Nothing in these Terms is intended to represent that the Team has obtained rights that it does not possess.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              5.3 Intellectual Property Complaints
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              If you believe that material displayed on the Platform infringes your copyright, trademark, publicity right, or other legal right, please contact the Team through the designated contact channel and provide sufficient information for us to review the matter.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Where appropriate, the Team may remove, modify, or restrict access to disputed material while the matter is reviewed.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            6. Third-Party Services and Data Sources
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            The Service may rely on third-party platforms, APIs, websites, hosting providers, analytics services, authentication services, or publicly available data sources.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            The availability and accuracy of third-party services are outside the Team&apos;s complete control.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            Third-party services may change their APIs, access policies, availability, content, or technical requirements without notice.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            As a result, information displayed on the Platform may be delayed, incomplete, unavailable, or inaccurate.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            The Team does not guarantee that data obtained from third-party sources will always be complete, current, or error-free.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            Your use of third-party services may also be subject to the third party&apos;s own terms and privacy policies.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            7. Privacy and Personal Information
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            Your use of the Service may involve the collection and processing of personal information, such as account information, email addresses, login records, technical information, and usage information.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            Our collection, use, retention, and protection of personal information are described in our Privacy Policy, which forms part of the rules governing your use of the Service.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            Where applicable, personal information will be handled in accordance with the laws and regulations applicable to the Service, including Taiwan&apos;s Personal Data Protection Act.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            You should review the Privacy Policy before using the Service.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            8. Service Availability and Disclaimers
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              8.1 Service Provided on an &ldquo;As Is&rdquo; Basis
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              To the maximum extent permitted by applicable law, the Service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              We do not guarantee that the Service will:
            </p>
            <div className="text-sm font-normal text-slate-300 space-y-1.5 pl-[2em]">
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>always be available;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>operate without interruption;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>be free from bugs or errors;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>produce perfectly accurate calculations;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>provide real-time data at all times;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>remain compatible with every device or browser; or</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>remain unchanged indefinitely.</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              8.2 Data and Calculation Accuracy
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The Platform may use automated data collection, processing, calculations, and matching systems.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Such systems may contain errors or experience delays.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              You should not rely on Platform data for financial, commercial, legal, tax, or other real-world decisions.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              8.3 Maintenance and Suspension
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              We may temporarily suspend or restrict access to all or part of the Service for:
            </p>
            <div className="text-sm font-normal text-slate-300 space-y-1.5 pl-[2em]">
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>scheduled maintenance;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>emergency maintenance;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>security incidents;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>system upgrades;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>bug fixes;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>infrastructure failures;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>third-party service outages; or</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>other operational reasons.</span>
              </div>
            </div>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em] mt-2">
              Where reasonably practicable, we may provide advance notice of scheduled maintenance.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              8.4 Force Majeure
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The Team will not be responsible for delays or failures caused by circumstances beyond its reasonable control, including natural disasters, telecommunications failures, internet outages, cyberattacks, government actions, third-party service failures, infrastructure failures, or other force majeure events, to the extent permitted by applicable law.
            </p>
          </div>
        </section>

        {/* Section 9 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            9. Account Suspension and Termination
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              9.1 Suspension or Termination
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The Team may suspend, restrict, or terminate your account or access to the Service if we reasonably believe that you:
            </p>
            <div className="text-sm font-normal text-slate-300 space-y-1.5 pl-[2em]">
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>violated these Terms;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>engaged in fraud or abuse;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>manipulated the Platform;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>used unauthorized automation;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>conducted prohibited real-money trading;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>compromised the security of the Service;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>infringed the rights of others; or</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>otherwise used the Service in a manner that creates a significant risk to the Platform, its users, or third parties.</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              9.2 Enforcement Actions
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Depending on the circumstances, the Team may:
            </p>
            <div className="text-sm font-normal text-slate-300 space-y-1.5 pl-[2em]">
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>issue a warning;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>cancel or reverse pending orders;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>remove improperly obtained virtual assets;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>reset affected game data;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>temporarily restrict trading;</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>suspend an account; or</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 select-none">●</span>
                <span>permanently terminate an account.</span>
              </div>
            </div>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em] mt-2">
              The Team will take reasonable measures to distinguish legitimate users from accounts involved in abuse or manipulation where technically and operationally practicable.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              9.3 Account Review
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Where appropriate, users may contact the Team to request a review of an account restriction or termination.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Nothing in this section limits any rights that cannot lawfully be waived under applicable law.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              9.4 Effect of Termination
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Upon termination, you will no longer be entitled to access your account or virtual assets, except where otherwise required by applicable law.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              Virtual assets are not redeemable for cash or other real-world value upon termination.
            </p>
          </div>
        </section>

        {/* Section 10 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            10. Changes to the Service
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            We may add, remove, modify, or discontinue features of the Service from time to time.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            This may include changes to:
          </p>
          <div className="text-sm font-normal text-slate-300 space-y-1.5 pl-[2em]">
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span>market mechanics;</span>
            </div>
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span>virtual asset balances;</span>
            </div>
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span>dividend formulas;</span>
            </div>
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span>price limits;</span>
            </div>
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span>matching rules;</span>
            </div>
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span>rankings;</span>
            </div>
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span>charts;</span>
            </div>
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span>data sources; and</span>
            </div>
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span>other game features.</span>
            </div>
          </div>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em] mt-2">
            Where reasonably necessary, we may make such changes without prior notice, particularly where required for security, maintenance, bug fixes, or prevention of abuse.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            We do not guarantee that any particular feature or game mechanic will remain available indefinitely.
          </p>
        </section>

        {/* Section 11 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            11. Changes to These Terms
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            We may update these Terms from time to time.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            If we make material changes, we will provide reasonable notice through the Platform or another appropriate channel where reasonably practicable.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            The updated Terms will become effective on the date specified in the notice.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            Your continued use of the Service after the updated Terms become effective constitutes acceptance of the revised Terms, to the extent permitted by applicable law.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            If you do not agree to the revised Terms, you should stop using the Service.
          </p>
        </section>

        {/* Section 12 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            12. Limitation of Liability
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            To the maximum extent permitted by applicable law, the Team will not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of data, virtual assets, expected benefits, or other intangible losses arising from your use of or inability to use the Service.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            This includes losses arising from:
          </p>
          <div className="text-sm font-normal text-slate-300 space-y-1.5 pl-[2em]">
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span>service interruptions;</span>
            </div>
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span>technical failures;</span>
            </div>
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span>incorrect or delayed data;</span>
            </div>
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span>calculation errors;</span>
            </div>
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span>third-party service failures;</span>
            </div>
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span>unauthorized access;</span>
            </div>
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span>account suspension or termination;</span>
            </div>
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span>virtual asset rollback; or</span>
            </div>
            <div className="flex items-start gap-2 leading-relaxed">
              <span className="shrink-0 select-none">●</span>
              <span>changes to game mechanics.</span>
            </div>
          </div>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em] mt-2">
            Nothing in these Terms excludes or limits liability to the extent such exclusion or limitation is prohibited by applicable law.
          </p>
        </section>

        {/* Section 13 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            13. Indemnification
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            To the extent permitted by applicable law, you agree to be responsible for losses, claims, liabilities, costs, and reasonable expenses arising from your unlawful use of the Service, your violation of these Terms, or your infringement of the rights of another person.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            This section does not require you to indemnify the Team for losses caused by the Team&apos;s own unlawful conduct or for liability that cannot legally be transferred to you.
          </p>
        </section>

        {/* Section 14 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            14. Governing Law and Dispute Resolution
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            These Terms shall be governed by and construed in accordance with the laws of the Republic of China (Taiwan), without regard to conflict-of-law principles, except to the extent that mandatory laws applicable to a user require otherwise.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            Nothing in these Terms is intended to deprive a consumer of mandatory rights or protections that cannot lawfully be excluded or waived.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            To the extent permitted by applicable law, disputes arising out of or relating to these Terms or the Service shall be submitted to the Taipei District Court, Taiwan, as the court of first instance.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            Where applicable law provides a consumer with a different mandatory forum or dispute-resolution right, that right shall prevail.
          </p>
        </section>

        {/* Section 15 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            15. General Provisions
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              15.1 Severability
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              If any provision of these Terms is held to be invalid, illegal, or unenforceable, the remaining provisions will remain in effect to the extent permitted by law.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              15.2 No Waiver
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              A failure by the Team to enforce any provision of these Terms does not constitute a waiver of our right to enforce that provision later.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              15.3 Assignment
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              You may not transfer or assign your rights or obligations under these Terms without our prior written consent.
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              The Team may transfer or assign its rights and obligations in connection with a restructuring, transfer of the Service, or other legitimate business purpose, subject to applicable law.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              15.4 Entire Agreement
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              These Terms, together with the Privacy Policy and any additional rules expressly incorporated into the Service, constitute the agreement between you and the Team concerning your use of the Service, except where additional written terms expressly apply.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              15.5 Language
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              If these Terms are provided in multiple languages, the version designated by the Team as the governing version will control to the extent permitted by applicable law.
            </p>
          </div>
        </section>

        {/* Section 16 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            16. Contact
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            If you have questions, complaints, intellectual property concerns, or requests relating to these Terms, please contact the teeteeStock development team through the contact information provided on the Platform.
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
            利用規約
          </h1>
          <p className="text-xs font-normal text-slate-400">
            最終更新日：2026年9月
          </p>
        </div>

        {/* Intro */}
        <section className="space-y-3">
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            この利用規約（以下「本規約」といいます。）は、teeteeStock開発チーム（以下「運営チーム」といいます。）が提供・運営する「teeteeStock（てぇてぇ取引所）」（以下「本サービス」といいます。）の利用条件を定めるものです。
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            本サービスをご利用になる方（以下「ユーザー」といいます。）は、本規約および別途定める「プライバシーポリシー」をご確認のうえ、本サービスをご利用ください。
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            ユーザーが本サービスに登録、ログイン、または本サービスの機能を利用した時点で、本規約に同意したものとみなします。本規約に同意いただけない場合は、本サービスをご利用いただけません。
          </p>
        </section>

        {/* 第1条 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            第1条（適用）
          </h2>
          <div className="space-y-2 text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            <p>1. 本規約は、ユーザーと運営チームとの間における、本サービスの利用に関する一切の関係に適用されます。</p>
            <p>2. 運営チームが本サービス上で別途定めるガイドライン、ルール、注意事項その他の個別の規定（以下「個別規定等」といいます。）は、本規約の一部を構成するものとします。</p>
            <p>3. 本規約と個別規定等の内容が異なる場合は、特段の定めがない限り、本規約が優先して適用されます。</p>
            <p>4. 未成年者が本サービスを利用する場合は、親権者その他の法定代理人の同意を得たうえで利用するものとします。</p>
          </div>
        </section>

        {/* 第2条 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            第2条（本サービスの性質）
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. エンターテインメントを目的としたシミュレーション
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              teeteeStockは、VTuberのリスナーやファンが、好きなコンビ・ユニット・関係性などを「株化した」として楽しむための、仮想的な株式取引シミュレーションサービスです。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本サービスは、現実の証券取引所、金融商品取引サービス、投資サービスその他これらに類するものではありません。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 実際の金融商品ではありません
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本サービス内で表示される銘柄、模擬株式、株価、NAV、気配値、チャート、指数、TEEその他の数値やデータは、すべて本サービス上のシミュレーションを目的としたものです。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              これらは現実の金融商品、証券、通貨、投資商品その他の資産を表すものではありません。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本サービス上の情報は、投資判断を目的としたものではなく、投資助言、金融商品取引の勧誘、その他の金融サービスの提供を構成するものではありません。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. 非公式のファンプロジェクト
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本サービスは、VTuber文化やファンコミュニティを楽しむことを目的とした非公式のファンプロジェクトです。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本サービスは、特定のVTuber事務所、企業、タレント本人その他の権利者によって運営、承認、後援、提携または公式認定されたものではありません。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              特に、COVER株式会社、ANYCOLOR株式会社その他のVTuber関連企業・事務所および所属タレントとは、別途明示されている場合を除き、公式な提携関係その他の関係を有するものではありません。
            </p>
          </div>
        </section>

        {/* 第3条 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            第3条（アカウント登録）
          </h2>
          <div className="space-y-2 text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            <p>1. ユーザーは、本サービスの利用登録を行う際、正確かつ最新の情報を登録するものとします。</p>
            <p>2. ユーザーは、登録した情報に変更が生じた場合、可能な範囲で速やかに情報を更新するものとします。</p>
            <p>3. 運営チームは、以下のいずれかに該当すると判断した場合、利用登録を承認しない、または登録後にアカウントの利用を制限することがあります。</p>
          </div>
          <div className="space-y-1.5 pl-10 text-sm font-normal text-slate-300">
            <p>(1) 登録情報に虚偽、誤りまたは不正確な情報が含まれている場合</p>
            <p>(2) 過去に本規約に違反したことがある場合</p>
            <p>(3) 複数アカウントの不正利用など、本サービスの公平性を損なうおそれがある場合</p>
            <p>(4) その他、運営チームが本サービスの利用を適切でないと判断した場合</p>
          </div>
        </section>

        {/* 第4条 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            第4条（アカウントおよび認証情報の管理）
          </h2>
          <div className="space-y-2 text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            <p>1. ユーザーは、自身のアカウントおよび認証情報を適切に管理する責任を負うものとします。</p>
            <p>2. ユーザーは、自身のアカウントを第三者に貸与、譲渡、共有または利用させてはなりません。</p>
            <p>3. ユーザーのアカウントを通じて行われた注文、取引、設定変更その他の操作は、当該ユーザーによる操作とみなします。</p>
            <p>4. ユーザーの管理不十分、認証情報の漏洩、第三者による不正利用その他ユーザー側の事情によって生じた損害について、運営チームは、運営チームに故意または重大な過失がある場合を除き、責任を負わないものとします。</p>
          </div>
        </section>

        {/* 第5条 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            第5条（複数アカウントおよび自動化行為）
          </h2>
          <div className="space-y-2 text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            <p>1. 原則として、ユーザー1人につき1つのアカウントを利用するものとします。</p>
            <p>2. 以下のような行為は禁止します。</p>
          </div>
          <div className="space-y-1.5 pl-10 text-sm font-normal text-slate-300">
            <p>(1) 大量のサブアカウントを作成または運用する行為</p>
            <p>(2) 複数アカウントを利用して、ランキング、報酬、TEEその他の利益を不正に取得する行為</p>
            <p>(3) ボット、自動化スクリプトその他の自動化された手段を利用して注文、ログイン、報酬取得その他の操作を行う行為</p>
            <p>(4) 複数アカウントを利用した自作自演の取引、相場操縦その他市場の公平性を損なう行為</p>
          </div>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            3. 運営チームは、不正利用の防止およびサービスの公平性を維持するため、必要な範囲でアカウントや取引データを確認することがあります。
          </p>
        </section>

        {/* 第6条 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            第6条（仮想資産およびTEE）
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 仮想資産としての性質
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本サービス内の模擬株式、TEE、配当その他の数値・ポイントは、すべて本サービス上のシミュレーションおよびゲーム体験のために提供される仮想的なものです。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              これらは現実の法定通貨、電子マネー、暗号資産、証券その他の金融資産ではありません。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 換金および譲渡の禁止
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              TEE、模擬株式、アカウントその他本サービス内の資産について、現実の金銭その他の財産的利益との交換、売買、譲渡、貸与、担保設定その他これらに類する行為を行ってはなりません。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              いわゆるリアルマネートレード（RMT）も禁止します。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              3. 残高・計算方法等の変更
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              運営チームは、サービスの運営、ゲームバランスの調整、システム変更その他の必要に応じて、模擬株式の計算方法、NAV、配当条件、TEEの付与条件その他の仕様を変更することがあります。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              これらの変更により、ユーザーの保有する仮想資産の数値や評価額等が変動する場合があります。
            </p>
          </div>
        </section>

        {/* 第7条 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            第7条（禁止事項）
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。
          </p>
          <div className="space-y-1.5 pl-10 text-sm font-normal text-slate-300">
            <p>1. 法令または公序良俗に違反する行為</p>
            <p>2. 犯罪行為または犯罪行為につながるおそれのある行為</p>
            <p>3. 本サービスのサーバー、ネットワークまたはシステムに過度な負荷を与える行為</p>
            <p>4. DDoS攻撃その他、本サービスの運営を妨害する行為</p>
            <p>5. バグ、仕様上の不具合または脆弱性を意図的に悪用する行為</p>
            <p>6. 不正なツール、プログラム、スクリプトその他の手段を利用して、本サービスを不正に操作する行為</p>
            <p>7. 自作自演の取引、相場操縦その他、市場の公平性を意図的に損なう行為</p>
            <p>8. 複数アカウントを利用した報酬、TEEその他の不正取得</p>
            <p>9. 他のユーザーの個人情報を不正に収集、公開または利用する行為</p>
            <p>10. 他のユーザー、運営チーム、VTuber本人その他の第三者になりすます行為</p>
            <p>11. 他者に対する嫌がらせ、脅迫、誹謗中傷その他の迷惑行為</p>
            <p>12. 差別的、暴力的、露骨に性的またはその他他者に著しい不快感を与える内容を投稿または送信する行為</p>
            <p>13. 他者の著作権、商標権、肖像権、プライバシーその他の権利または利益を侵害する行為</p>
            <p>14. VTuber、タレント、企業、団体その他の第三者について、公式な関係があるかのように誤認させる行為</p>
            <p>15. 本サービスを利用した営利目的の活動、広告、宣伝、勧誘その他運営チームが認めていない商業活動</p>
            <p>16. その他、運営チームが本サービスの趣旨または運営上適切でないと判断する行為</p>
          </div>
        </section>

        {/* 第8条 */}
        <section className="space-y-6">
          <h2 className="text-xl font-normal text-slate-100">
            第8条（知的財産権）
          </h2>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              1. 本サービスに関する権利
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本サービスのプログラム、ソースコード、UIデザイン、ロゴ、文章、システム構成その他、本サービスに関して運営チームが作成したコンテンツおよび素材に関する著作権その他の権利は、運営チームまたは正当な権利者に帰属します。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本規約に基づく本サービスの利用は、これらの権利をユーザーに譲渡または許諾するものではありません。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-normal text-slate-200">
              2. 第三者の権利
            </h3>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本サービス上で取り扱われるVTuber、タレント、企業、キャラクター、名称、ロゴ、楽曲その他のコンテンツに関する知的財産権その他の権利は、それぞれの正当な権利者に帰属します。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              本サービスは、これらの権利者との関係を不当に示したり、権利者の権利を侵害したりすることを意図するものではありません。
            </p>
            <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
              権利者から適切な申し立てや削除要請等を受けた場合、運営チームは内容を確認のうえ、必要に応じて適切に対応します。
            </p>
          </div>
        </section>

        {/* 第9条 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            第9条（サービスの変更・停止・中断）
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            1. 運営チームは、以下の場合、本サービスの全部または一部を変更、停止または一時中断することがあります。
          </p>
          <div className="space-y-1.5 pl-10 text-sm font-normal text-slate-300">
            <p>(1) サーバー、ネットワークその他のシステムの保守、更新または修理を行う場合</p>
            <p>(2) システム障害、通信障害その他の技術的な問題が発生した場合</p>
            <p>(3) 地震、台風、火災、停電その他の不可抗力が発生した場合</p>
            <p>(4) セキュリティ上の問題または不正アクセス等への対応が必要な場合</p>
            <p>(5) その他、運営チームが必要と判断した場合</p>
          </div>
          <div className="space-y-2 text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            <p>2. サービスの停止、中断、変更または終了により、ユーザーの仮想資産、取引履歴その他のデータに遅延、消失、ロールバックまたは不整合が発生する場合があります。</p>
            <p>3. 運営チームは、故意または重大な過失がある場合を除き、これらによって生じた損害について責任を負わないものとします。</p>
          </div>
        </section>

        {/* 第10条 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            第10条（アカウントの利用制限および停止）
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            1. 運営チームは、ユーザーが以下のいずれかに該当すると判断した場合、事前の通知なく、アカウントの利用制限、注文の取消し、仮想資産の調整、投稿内容の削除、一時停止またはアカウントの永久停止等の措置を行うことがあります。
          </p>
          <div className="space-y-1.5 pl-10 text-sm font-normal text-slate-300">
            <p>(1) 本規約に違反した場合</p>
            <p>(2) 不正な取引または市場操作が確認された場合</p>
            <p>(3) バグやシステム上の不具合を悪用した場合</p>
            <p>(4) 複数アカウントや自動化ツール等を利用して不正な利益を得た場合</p>
            <p>(5) 第三者になりすました場合</p>
            <p>(6) その他、本サービスの安全性、公平性または運営を著しく損なう行為を行った場合</p>
          </div>
          <div className="space-y-2 text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            <p>2. 運営チームは、必要に応じて、不正に取得されたTEE、仮想資産その他のゲーム内データを無効化または修正することがあります。</p>
            <p>3. 運営チームは、サービスの安全性や調査への影響を考慮し、措置の具体的な理由や調査方法の詳細を開示しない場合があります。</p>
          </div>
        </section>

        {/* 第11条 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            第11条（免責事項）
          </h2>
          <div className="space-y-2 text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            <p>1. 本サービスは、現状有姿（As Is）で提供されます。</p>
            <p>2. 運営チームは、本サービスについて、継続的に利用できること、エラーやバグが存在しないこと、データが完全かつ正確であること、ユーザーの特定の目的に適合すること等を保証するものではありません。</p>
            <p>3. 本サービス上の株価、NAV、指数、チャート、配当その他のデータについて、その正確性、完全性、将来の結果等を保証するものではありません。</p>
            <p>4. 本サービスは実際の金融商品取引ではないため、本サービス上の損益、価格変動、配当その他のシミュレーション結果について、現実の金銭的利益を保証するものではありません。</p>
            <p>5. 通信障害、サーバー障害、メンテナンス、天災その他運営チームの合理的な支配を超える事情によって生じた損害について、運営チームは責任を負わないものとします。</p>
            <p>6. ユーザーと第三者との間で、本サービスに関連して生じた取引、連絡、紛争その他の問題について、運営チームは、運営チームに故意または重大な過失がある場合を除き、責任を負わないものとします。</p>
          </div>
        </section>

        {/* 第12条 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            第12条（サービス内容の変更および終了）
          </h2>
          <div className="space-y-2 text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            <p>1. 運営チームは、サービスの改善、運営上の都合、技術的な事情その他の理由により、本サービスの内容、仕様、機能または提供方法を変更することがあります。</p>
            <p>2. 運営チームは、必要に応じて本サービスの全部または一部を終了することがあります。</p>
            <p>3. 本サービスの変更または終了により、ユーザーが保有していた仮想資産、TEE、取引履歴その他のゲーム内データが利用できなくなる場合があります。</p>
            <p>4. 本サービス終了時点で保有しているTEE、模擬株式その他の仮想資産について、現実の金銭その他の補償を行うものではありません。</p>
          </div>
        </section>

        {/* 第13条 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            第13条（退会およびアカウント削除）
          </h2>
          <div className="space-y-2 text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            <p>1. ユーザーは、運営チームが定める方法により、いつでもアカウントの削除または退会を申請することができます。</p>
            <p>2. アカウント削除後は、当該アカウントに関連する仮想資産、TEE、取引履歴その他のデータを利用できなくなる場合があります。</p>
            <p>3. 個人情報の取扱いおよび削除については、別途定める「プライバシーポリシー」に従うものとします。</p>
          </div>
        </section>

        {/* 第14条 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            第14条（個人情報の取扱い）
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            運営チームは、本サービスの利用によって取得する個人情報について、別途定める「プライバシーポリシー」に従い、適切に取り扱います。
          </p>
        </section>

        {/* 第15条 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            第15条（本規約の変更）
          </h2>
          <div className="space-y-2 text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            <p>1. 運営チームは、必要に応じて本規約を変更することがあります。</p>
            <p>2. 重要な変更を行う場合、運営チームは本サービス上への掲載その他適切な方法により、変更内容をユーザーに知らせるよう努めます。</p>
            <p>3. 変更後の本規約は、本サービス上に掲載された時点または別途定める効力発生日から効力を生じるものとします。</p>
            <p>4. 変更後も本サービスの利用を継続した場合、変更後の本規約に同意したものとみなします。</p>
          </div>
        </section>

        {/* 第16条 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            第16条（通知および連絡）
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            ユーザーと運営チームとの間の通知または連絡は、本サービス上に設置するお問い合わせフォーム、登録されたメールアドレスその他運営チームが指定する方法により行うものとします。
          </p>
        </section>

        {/* 第17条 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            第17条（権利義務の譲渡禁止）
          </h2>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            ユーザーは、運営チームによる事前の書面による承諾なく、本規約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡、移転、貸与または担保に供することはできません。
          </p>
        </section>

        {/* 第18条 */}
        <section className="space-y-4">
          <h2 className="text-xl font-normal text-slate-100">
            第18条（準拠法および管轄裁判所）
          </h2>
          <div className="space-y-2 text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            <p>1. 本規約は、中華民国（台湾）の法律に準拠し、同法に従って解釈されるものとします。</p>
            <p>2. 本規約または本サービスに関して、ユーザーと運営チームとの間で紛争が生じた場合、台湾台北地方裁判所（臺灣臺北地方法院）を第一審の専属的合意管轄裁判所とします。</p>
          </div>
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
