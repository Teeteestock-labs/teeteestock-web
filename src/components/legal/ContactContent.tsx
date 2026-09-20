'use client';

import React from 'react';
import { useLegalLanguage } from '@/context/LegalLanguageContext';
import ContactForm from '@/components/ContactForm';

export default function ContactContent() {
  const { lang } = useLegalLanguage();

  if (lang === 'en') {
    return (
      <div className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 font-normal text-slate-300">
        {/* Header */}
        <div className="border-b border-slate-800/80 pb-6">
          <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
            Contact Us
          </h1>
        </div>

        {/* Intro */}
        <section className="space-y-4">
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            Something not working the way it should? Found a bug or have an idea for the market?
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            You can use the contact form below to get in touch with us. Rights holders and other relevant parties are also welcome to contact us regarding inquiries or matters related to their content.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            Once submitted, your message will be sent directly to our platform management team for review and follow-up.
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            We appreciate your feedback and reports, and we&apos;ll do our best to look into them.
          </p>
        </section>

        {/* Contact Form */}
        <ContactForm />
      </div>
    );
  }

  if (lang === 'ja') {
    return (
      <div className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 font-normal text-slate-300">
        {/* Header */}
        <div className="border-b border-slate-800/80 pb-6">
          <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
            お問い合わせ
          </h1>
        </div>

        {/* Intro */}
        <section className="space-y-4">
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            teeteeStock のご利用中に問題が発生しましたか？
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            バグの発見、システムや操作上の問題、市場メカニズムへのご提案、その他運営チームに伝えたいことがございましたら、下記のフォームよりお気軽にお知らせください。
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            関連する権利者様や利害関係者様からの、プラットフォーム上のコンテンツに関するお問い合わせも歓迎いたします。
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            送信されたメッセージはプラットフォーム管理チームへ直接届き、内容を確認の上対応いたします。
          </p>
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            どんな小さなバグでも、「ここをもっと良くできる」というアイデアでも大歓迎です。teeteeStock を共により良いものにしていただき、ありがとうございます。
          </p>
        </section>

        {/* Contact Form */}
        <ContactForm />
      </div>
    );
  }

  // Default: Traditional Chinese
  return (
    <div className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 font-normal text-slate-300">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6">
        <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
          聯絡我們
        </h1>
      </div>

      {/* Intro */}
      <section className="space-y-4">
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          在使用 teeteeStock 的過程中遇到問題嗎？
        </p>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          無論是發現了 Bug、遇到系統或操作上的問題、對市場機制有任何想法，或是有其他希望讓我們知道的事情，都歡迎透過下方的聯絡表單告訴我們。
        </p>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          相關權利人或其他利害關係人，如有與平台內容相關的洽詢，也歡迎與我們聯絡。
        </p>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          送出表單後，訊息會直接送至平台管理團隊，我們會依內容進行查看與處理。
        </p>
        <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
          不管是小小的 Bug，還是一個讓你覺得「這裡應該可以更好」的想法，都歡迎告訴我們。謝謝你一起讓 teeteeStock 變得更好。
        </p>
      </section>

      {/* Contact Form */}
      <ContactForm />
    </div>
  );
}
