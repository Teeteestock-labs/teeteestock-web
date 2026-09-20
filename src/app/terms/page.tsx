import React from 'react';
import { Metadata } from 'next';
import StatementPageLayout from '@/components/StatementPageLayout';
import TermsContent from '@/components/legal/TermsContent';

export const metadata: Metadata = {
  title: '服務條款 | teeteeStock 虛擬交易所',
  description: '規範使用者在本交易所之帳號使用、虛擬點數交易與社群行為準則。',
};

export default function TermsPage() {
  return (
    <StatementPageLayout
      currentPath="/terms"
      isUnderConstruction={false}
      hideHeaderCard={true}
    >
      <TermsContent />
    </StatementPageLayout>
  );
}
