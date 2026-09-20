import React from 'react';
import { Metadata } from 'next';
import StatementPageLayout from '@/components/StatementPageLayout';
import PrivacyContent from '@/components/legal/PrivacyContent';

export const metadata: Metadata = {
  title: '隱私權政策 | teeteeStock 虛擬交易所',
  description: '詳細說明本站如何收集、儲存、使用與保護您的帳號與個人數據資料。',
};

export default function PrivacyPage() {
  return (
    <StatementPageLayout
      currentPath="/privacy"
      isUnderConstruction={false}
      hideHeaderCard={true}
    >
      <PrivacyContent />
    </StatementPageLayout>
  );
}
