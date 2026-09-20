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
