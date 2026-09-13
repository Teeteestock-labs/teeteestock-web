'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Construction } from 'lucide-react';
import Footer from '@/components/Footer';

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

const NAV_LINKS = [
  { href: '/about', label: '關於本站', en: 'About' },
  { href: '/terms', label: '服務條款', en: 'Terms' },
  { href: '/disclaimer', label: '免責聲明', en: 'Disclaimer' },
  { href: '/privacy', label: '隱私權政策', en: 'Privacy' },
  { href: '/contact', label: '聯絡我們', en: 'Contact' },
] as const;

export default function StatementPageLayout({
  title,
  englishTitle,
  icon,
  description,
  currentPath,
  isUnderConstruction = true,
  hideHeaderCard = false,
  children,
}: StatementPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#05080e] text-slate-100 flex flex-col justify-between relative overflow-hidden font-normal">
      {/* 科技感背景環境光效 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* 主內容容器 */}
      <main className="w-full max-w-3xl mx-auto px-4 pt-8 pb-16 relative z-10">
        {/* 頂部導覽 */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/" 
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors font-normal"
          >
            <ArrowLeft className="w-4 h-4" /> 返回交易大廳
          </Link>
          {isUnderConstruction && (
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 bg-amber-950/50 border border-amber-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-normal">
              <Construction className="w-3 h-3 text-amber-400" />
              UNDER CONSTRUCTION
            </span>
          )}
        </div>

        {/* 快速切換子選單 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 hide-scrollbar border-b border-slate-800/80 font-normal">
          {NAV_LINKS.map((item) => {
            const isActive = currentPath === item.href;
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
                {item.label}
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
              頁面內容建置中 (Under Construction)
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed mb-6 font-normal">
              本聲明與詳細內容正在研擬與修訂中，後續版本將於此處正式發布完整的條款與說明細節。
            </p>

            <div className="inline-flex items-center gap-2 text-xs text-slate-500 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg font-normal">
              <span>預計發布時間：</span>
              <span className="font-mono text-slate-400 font-normal">待後續公告發布</span>
            </div>
          </div>
        )}
      </main>

      {/* 頁尾 */}
      <Footer />
    </div>
  );
}
