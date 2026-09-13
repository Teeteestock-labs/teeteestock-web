import React from 'react';
import { Metadata } from 'next';
import { Shield } from 'lucide-react';
import StatementPageLayout from '@/components/StatementPageLayout';

export const metadata: Metadata = {
  title: '隱私權政策 (Privacy Policy) | teeteeStock 虛擬交易所',
  description: '詳細說明本站如何收集、儲存、使用與保護您的帳號與個人數據資料。',
};

export default function PrivacyPage() {
  return (
    <StatementPageLayout
      title="隱私權政策"
      englishTitle="Privacy Policy"
      icon={<Shield className="w-5 h-5" />}
      description="我們高度重視您的資訊安全與隱私，本政策將清楚說明我們如何管理與防護您的登入帳號、Cookie 與互動數據。"
      currentPath="/privacy"
    />
  );
}
