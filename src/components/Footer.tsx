'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#070b12]/80 mt-12 pt-8 pb-24 px-4 text-center select-none">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* 聲明連結導覽列 */}
        <nav className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-400">
          <Link 
            href="/about" 
            className="hover:text-emerald-400 transition-colors"
          >
            關於本站 (About)
          </Link>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <Link 
            href="/terms" 
            className="hover:text-emerald-400 transition-colors"
          >
            服務條款 (Terms of Service)
          </Link>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <Link 
            href="/disclaimer" 
            className="hover:text-emerald-400 transition-colors"
          >
            免責聲明 (Disclaimer)
          </Link>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <Link 
            href="/privacy" 
            className="hover:text-emerald-400 transition-colors"
          >
            隱私權政策 (Privacy Policy)
          </Link>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <Link 
            href="/contact" 
            className="hover:text-emerald-400 transition-colors"
          >
            聯絡我們 (Contact)
          </Link>
        </nav>

        {/* 免責提醒小字 */}
        <p className="text-[11px] text-slate-500 leading-relaxed max-w-2xl mx-auto">
          * 本站為 VTuber 虛擬粉絲娛樂概念交易所，所有 $TEE 幣、持股部位與成交紀錄均為虛擬遊戲數據，不涉及真實金融資產與法幣交易。
        </p>

        {/* 版權宣告 */}
        <p className="text-[11px] text-slate-600 font-mono">
          &copy; {new Date().getFullYear()} teeteeStock Exchange. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
