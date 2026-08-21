'use client';

import React, { useState, useEffect } from 'react';

interface DividendLogItem {
  id: string;
  pairId: string;
  sharesOwned: number;
  dividendPerShare: number;
  totalPayout: number;
  createdAt: string;
}

const STOCK_NAME_MAP: Record<string, string> = {
  AZIR: 'AZIro',
  FBMO: 'FubuMio',
  MCMT: 'miComet',
  NEFL: 'NoeFure',
  OKKR: 'OkaKoro',
  PKMR: 'PekoMarin',
  SSWT: 'ShishiWata',
  SRAZ: 'SorAZ',
  SBRN: 'SubaRuna'
};

export default function DividendNotificationModal() {
  const [unnotifiedLogs, setUnnotifiedLogs] = useState<DividendLogItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function checkDividends() {
      try {
        const res = await fetch('/api/player');
        if (!res.ok) return;
        const data = await res.json();
        const logs: DividendLogItem[] = data.dividendLogs || [];

        if (logs.length === 0) return;

        const storedNotifiedIds = localStorage.getItem('notified_dividend_ids');
        const notifiedSet = new Set<string>(storedNotifiedIds ? JSON.parse(storedNotifiedIds) : []);

        const pending = logs.filter(l => !notifiedSet.has(l.id));

        if (pending.length > 0) {
          setUnnotifiedLogs(pending);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Failed to check dividend notifications:', err);
      }
    }

    checkDividends();

    const handlePreviewEvent = () => {
      const mockItems: DividendLogItem[] = [
        { id: 'mock-1', pairId: 'MCMT', sharesOwned: 100, dividendPerShare: 8.33, totalPayout: 833.00, createdAt: new Date().toISOString() },
        { id: 'mock-2', pairId: 'OKKR', sharesOwned: 100, dividendPerShare: 7.47, totalPayout: 747.00, createdAt: new Date().toISOString() },
        { id: 'mock-3', pairId: 'PKMR', sharesOwned: 50, dividendPerShare: 6.50, totalPayout: 325.00, createdAt: new Date().toISOString() },
      ];
      setUnnotifiedLogs(mockItems);
      setIsOpen(true);
    };

    window.addEventListener('trigger_dividend_modal_preview', handlePreviewEvent);
    (window as any).previewDividendModal = handlePreviewEvent;

    return () => {
      window.removeEventListener('trigger_dividend_modal_preview', handlePreviewEvent);
    };
  }, []);

  const handleClose = () => {
    const storedNotifiedIds = localStorage.getItem('notified_dividend_ids');
    const notifiedSet = new Set<string>(storedNotifiedIds ? JSON.parse(storedNotifiedIds) : []);

    unnotifiedLogs.forEach(l => notifiedSet.add(l.id));

    localStorage.setItem('notified_dividend_ids', JSON.stringify(Array.from(notifiedSet)));
    setIsOpen(false);
  };

  if (!isOpen || unnotifiedLogs.length === 0) return null;

  const totalPayoutSum = unnotifiedLogs.reduce((sum, item) => sum + item.totalPayout, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn font-mono select-none">
      <div className="bg-[#121418] border border-[#2B2F36] rounded-2xl p-6 max-w-xl w-full space-y-5 shadow-2xl relative text-[#EAECEF]">
        
        {/* 1, 2, 3. 標題與說明（極簡高雅，無禮物圖示與炫彩裝飾） */}
        <div className="text-center space-y-2 border-b border-[#2B2F36] pb-4">
          <h2 className="text-xl font-extrabold text-white tracking-wider">
            現金股利發放通知
          </h2>
          <div className="text-xs text-gray-400 leading-relaxed space-y-1">
            <p>親愛的股東您好，以下為您所持股份之現金股利發放通知，請檢視下欄您的明細資料。</p>
            <p className="text-gray-500 font-semibold">貼貼結算所敬上</p>
          </div>
        </div>

        {/* 4. 持股配息明細清單 (Breakdown Table) */}
        <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl overflow-hidden">
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-[#1E2329] text-gray-400 text-[11px] font-bold border-b border-[#2B2F36] whitespace-nowrap">
                  <th className="py-2.5 px-3">證券名稱（證券代號）</th>
                  <th className="py-2.5 px-3 text-right">基準日持有股數</th>
                  <th className="py-2.5 px-3 text-right">每股股利</th>
                  <th className="py-2.5 px-3 text-right">應發股利</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B2F36]/60">
                {unnotifiedLogs.map((item) => {
                  const upperId = item.pairId.toUpperCase();
                  const stockName = STOCK_NAME_MAP[upperId] || upperId;
                  return (
                    <tr key={item.id} className="hover:bg-[#2B2F36]/30 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-white">
                        {stockName} <span className="text-gray-500 text-[10px]">({upperId})</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-300">
                        {item.sharesOwned.toLocaleString()} 股
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-300">
                        {item.dividendPerShare.toFixed(2)} $TEE
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#00FFA3]">
                        {item.totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $TEE
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. 總計應發股利卡片（沉穩極簡風格，無符號） */}
        <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-300">總計應發股利</span>
          <span className="text-lg font-black text-white font-mono">
            {totalPayoutSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $TEE
          </span>
        </div>

        {/* 6. 確認按鈕（相同沉穩高雅風格） */}
        <button
          onClick={handleClose}
          className="w-full py-3 rounded-xl font-bold text-xs bg-[#2B2F36] hover:bg-[#363B44] text-white border border-gray-700 hover:border-gray-500 transition-all active:scale-[0.99] cursor-pointer shadow-md"
        >
          確認
        </button>
      </div>
    </div>
  );
}
