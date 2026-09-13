import React, { Suspense } from 'react';
import AuthCard from '@/components/AuthCard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '註冊新交易帳號 | teeteeStock 虛擬交易所',
  description: '註冊 teeteeStock 交易帳號，立即領取 10,000 $TEE 初始資產參與 VTuber 概念股投資',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#05080e] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* 科技感背景裝飾光效 */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Suspense fallback={
          <div className="w-full max-w-md bg-[#0a111a] border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
            載入註冊模組中...
          </div>
        }>
          <AuthCard initialTab="register" />
        </Suspense>
      </div>

      <div className="mt-8 text-center text-xs text-slate-600 relative z-10">
        &copy; 2026 teeteeStock Exchange. All rights reserved.
      </div>
    </div>
  );
}
