import React from 'react';
import { Metadata } from 'next';
import StatementPageLayout from '@/components/StatementPageLayout';
import DisclaimerContent from '@/components/legal/DisclaimerContent';

export const metadata: Metadata = {
  title: '免責聲明 | teeteeStock 虛擬交易所',
  description: '說明本平台虛擬娛樂性質、數據參考性質與使用者自負風險之重要聲明。',
};

export default function DisclaimerPage() {
  return (
    <StatementPageLayout
      currentPath="/disclaimer"
      isUnderConstruction={false}
      hideHeaderCard={true}
    >
      <DisclaimerContent />
    </StatementPageLayout>
  );
}
