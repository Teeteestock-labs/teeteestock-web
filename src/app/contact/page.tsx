import React from 'react';
import { Metadata } from 'next';
import StatementPageLayout from '@/components/StatementPageLayout';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: '聯絡我們 | teeteeStock 虛擬交易所',
  description: '提供平台技術諮詢、錯誤回報、意見反饋與官方聯絡管道。',
};

export default function ContactPage() {
  return (
    <StatementPageLayout
      currentPath="/contact"
      isUnderConstruction={false}
      hideHeaderCard={true}
    >
      <div className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 font-normal text-slate-300">
        {/* 頂部大標題 */}
        <div className="border-b border-slate-800/80 pb-6">
          <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
            聯絡我們
          </h1>
        </div>

        {/* 前言導言 */}
        <section className="space-y-3">
          <p className="text-sm font-normal text-slate-300 leading-relaxed [text-indent:2em]">
            若您在體驗 teeteeStock 交易所時遇到系統問題、程式錯誤（Bug）、對市場機制有任何建議，或是相關權利人需提出洽詢，歡迎填寫下方聯絡表單。表單內容送出後將直接傳送至平台管理後台，由管理團隊查核與處理。
          </p>
        </section>

        {/* 聯絡表單區塊 */}
        <ContactForm />
      </div>
    </StatementPageLayout>
  );
}
