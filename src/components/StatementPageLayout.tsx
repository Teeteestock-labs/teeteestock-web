'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Construction } from 'lucide-react';
import Footer from '@/components/Footer';
import { LegalLanguageProvider, useLegalLanguage, LegalLang } from '@/context/LegalLanguageContext';

interface StatementPageLayoutProps {
  title?: string;
  englishTitle?: string;
  icon?: React.ReactNode;
  description?: string;
  currentPath: '/about' | '/terms' | '/disclaimer' | '/privacy' | '/contact';
  isUnderConstruction?: boolean;
  hideHeaderCard?: boolean;
  children?: React.ReactNode;
}

const NAV_CONFIG = [
  { href: '/about', zh: '關於本站', en: 'About', ja: '当サイトについて' },
  { href: '/terms', zh: '服務條款', en: 'Terms of Service', ja: '利用規約' },
  { href: '/disclaimer', zh: '免責聲明', en: 'Disclaimer', ja: '免責事項' },
  { href: '/privacy', zh: '隱私權政策', en: 'Privacy Policy', ja: 'プライバシーポリシー' },
  { href: '/contact', zh: '聯絡我們', en: 'Contact Us', ja: 'お問い合わせ' },
] as const;

function StatementPageLayoutInner({
  title,
  englishTitle,
  icon,
  description,
  currentPath,
  isUnderConstruction = false,
  hideHeaderCard = false,
  children,
}: StatementPageLayoutProps) {
  const { lang, setLang } = useLegalLanguage();

  return (
    <div className="min-h-screen bg-[#05080e] text-slate-100 flex flex-col justify-between relative overflow-hidden font-normal">
      {/* 科技感背景環境光效 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* 主內容容器 */}
      <main className="w-full max-w-3xl mx-auto px-4 pt-8 pb-16 relative z-10">
        {/* 頂部導覽列：左側返回大廳、右側多語言切換（繁體中文 / English / 日本語） */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <Link 
            href="/" 
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors font-normal w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {lang === 'en' ? 'Return to Lobby' : lang === 'ja' ? '取引所ロビーに戻る' : '返回交易大廳'}
            </span>
          </Link>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {isUnderConstruction && (
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 bg-amber-950/50 border border-amber-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-normal">
                <Construction className="w-3 h-3 text-amber-400" />
                {lang === 'en' ? 'UNDER CONSTRUCTION' : lang === 'ja' ? '準備中' : '施工建置中'}
              </span>
            )}

            {/* 右上角多語言切換選單 */}
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-0.5 rounded-xl shadow-inner text-xs font-normal">
              <button
                type="button"
                onClick={() => setLang('zh')}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                  lang === 'zh'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                繁體中文
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                  lang === 'en'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang('ja')}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                  lang === 'ja'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                日本語
              </button>
            </div>
          </div>
        </div>

        {/* 快速切換子選單 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 hide-scrollbar border-b border-slate-800/80 font-normal">
          {NAV_CONFIG.map((item) => {
            const isActive = currentPath === item.href;
            const label = item[lang] || item.zh;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-normal ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* 標題卡片 */}
        {!hideHeaderCard && (
          <div className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl mb-6 font-normal">
            <div className="flex items-center gap-3.5 mb-2">
              {icon && (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 shrink-0">
                  {icon}
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white">
                  {title}
                </h1>
                <p className="text-xs font-mono text-slate-400 mt-0.5 font-normal">
                  {englishTitle}
                </p>
              </div>
            </div>
            {description && (
              <p className="text-xs text-slate-400 mt-3 leading-relaxed font-normal">
                {description}
              </p>
            )}
          </div>
        )}

        {/* 內容區塊 */}
        {children ? (
          children
        ) : (
          /* 施工中提示區塊 */
          <div className="bg-[#0a111a]/70 border border-dashed border-slate-800 rounded-2xl p-8 sm:p-12 text-center shadow-lg font-normal">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-400 mb-4">
              <Construction className="w-7 h-7 animate-pulse" />
            </div>
            <h2 className="text-base font-normal text-slate-200 mb-1.5">
              {lang === 'en' ? 'Under Construction' : lang === 'ja' ? 'コンテンツ準備中' : '頁面內容建置中 (Under Construction)'}
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed mb-6 font-normal">
              {lang === 'en'
                ? 'The content for this section is currently being drafted and updated.'
                : lang === 'ja'
                ? '本規約の条文は現在策定および更新作業中です。'
                : '本聲明與詳細內容正在研擬與修訂中，後續版本將於此處正式發布完整的條款與說明細節。'}
            </p>
          </div>
        )}
      </main>

      {/* 頁尾 */}
      <Footer />
    </div>
  );
}

export default function StatementPageLayout(props: StatementPageLayoutProps) {
  return (
    <LegalLanguageProvider>
      <StatementPageLayoutInner {...props} />
    </LegalLanguageProvider>
  );
}
