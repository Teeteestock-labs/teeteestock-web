import React from 'react';
import { Metadata } from 'next';
import StatementPageLayout from '@/components/StatementPageLayout';
import AboutContent from '@/components/legal/AboutContent';

export const metadata: Metadata = {
  title: '關於本站 (About) | teeteeStock 虛擬交易所',
  description: '了解 teeteeStock 虛擬交易所的創立背景、VTuber 概念指數與社群娛樂宗旨。',
};

export default function AboutPage() {
  return (
    <StatementPageLayout
      currentPath="/about"
      isUnderConstruction={false}
      hideHeaderCard={true}
    >
      <AboutContent />
    </StatementPageLayout>
  );
}
