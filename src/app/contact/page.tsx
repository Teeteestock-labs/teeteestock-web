import React from 'react';
import { Metadata } from 'next';
import StatementPageLayout from '@/components/StatementPageLayout';
import ContactContent from '@/components/legal/ContactContent';

export const metadata: Metadata = {
  title: '聯絡我們 (Contact Us) | teeteeStock 虛擬交易所',
  description: '提供平台技術諮詢、錯誤回報、意見反饋與官方聯絡管道。',
};

export default function ContactPage() {
  return (
    <StatementPageLayout
      currentPath="/contact"
      isUnderConstruction={false}
      hideHeaderCard={true}
    >
      <ContactContent />
    </StatementPageLayout>
  );
}
