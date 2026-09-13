import React from 'react';
import { Metadata } from 'next';
import { Mail } from 'lucide-react';
import StatementPageLayout from '@/components/StatementPageLayout';

export const metadata: Metadata = {
  title: '聯絡我們 (Contact) | teeteeStock 虛擬交易所',
  description: '提供平台技術諮詢、錯誤回報、意見反饋與官方社群連結管道。',
};

export default function ContactPage() {
  return (
    <StatementPageLayout
      title="聯絡我們"
      englishTitle="Contact"
      icon={<Mail className="w-5 h-5" />}
      description="若您在體驗 teeteeStock 時遇到技術錯誤、Bug、交易異常或有任何改善建議，歡迎隨時與我們取得聯繫。"
      currentPath="/contact"
    />
  );
}
