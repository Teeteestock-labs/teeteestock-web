"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTee } from "@/context/TeeContext";
import SettlementTimer from "@/components/SettlementTimer";
import TickerTape from "@/components/TickerTape";
import BottomNav from "@/components/BottomNav";

type Mode = 'list' | 'trade' | 'asset';

export default function Home() {
  const [mode, setMode] = useState<Mode>('list');
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null);
  const { balance, holdings, marketData, simulateMarketMove } = useTee();

  // 股票總市值
  const totalStockValue = holdings.reduce((sum, h) => {
    const pair = marketData.find(p => p.id === h.pairId);
    return sum + (h.shares * (pair?.price || 0));
  }, 0);

  // 計算總資產
  const netWorth = balance + totalStockValue;

  return (
    <main className="min-h-screen bg-[#0b0e11] text-[#eaecef] flex flex-col pb-20 font-sans">
      <TickerTape />
      
      {/* 頂部指數條 */}
      <div className="bg-[#181a20] border-b border-[#2b2f36] p-3 flex justify-between items-center sticky top-0 z-10">
        <div className="flex flex-col">
          <span className="text-[10px] text-[#848e9c] uppercase font-bold">TEE 指數</span>
          <span className="text-sm font-black text-[#ff3b3b]">18,234.56 ▲ 123.45</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#848e9c] uppercase font-bold block">可用餘額</span>
          <span className="text-sm font-mono font-bold text-[#00ffa3]">{balance.toLocaleString()} $TEE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {mode === 'list' && (
          <div className="p-2">
            {/* 控制與計時器 */}
            <div className="flex justify-between items-center mb-4 px-2">
              <SettlementTimer />
              <button 
                onClick={simulateMarketMove}
                className="text-[10px] bg-[#2B2F36] hover:bg-[#FF69B4] hover:text-white px-4 py-2 rounded transition-all flex items-center gap-2 border border-[#3E454D]"
              >
                <span>⚡</span> 市場撮合
              </button>
            </div>

            {/* 報價列表 */}
            <div className="bg-[#181A20] rounded border border-[#2B2F36] overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1E2329] text-[#848E9C] text-[10px] uppercase tracking-tight border-b border-[#2B2F36]">
                    <th className="px-3 py-3 font-semibold">交易對</th>
                    <th className="px-3 py-3 font-semibold text-right">成交價</th>
                    <th className="px-3 py-3 font-semibold text-right">幅度</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21262C]">
                  {marketData.map((pair) => {
                    const isUp = pair.change24h >= 0;
                    const changeColor = isUp ? 'text-[#FF3B3B]' : 'text-[#00FFA3]';
                    const bgChangeColor = isUp ? 'bg-[#FF3B3B]/10' : 'bg-[#00FFA3]/10';

                    return (
                      <tr
                        key={pair.id}
                        onClick={() => {
                          setSelectedPairId(pair.id);
                          setMode('trade');
                        }}
                        className="hover:bg-[#2B3139] transition-colors cursor-pointer group"
                      >
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-linear-to-tr from-[#FF69B4] to-[#7000FF]" />
                            <div>
                              <div className="font-bold text-xs text-[#EAECEF] group-hover:text-[#FF69B4] transition-colors">{pair.name}</div>
                              <div className="text-[8px] text-[#848E9C] tracking-tighter">{pair.members.join('/')}</div>
                            </div>
                          </div>
                        </td>

                        <td className={`px-3 py-4 text-right font-mono text-xs font-bold ${changeColor}`}>
                          {pair.price.toLocaleString()}
                        </td>

                        <td className={`px-3 py-4 text-right font-mono text-[10px] font-semibold ${changeColor}`}>
                          <span className={`px-1 py-0.5 rounded ${bgChangeColor}`}>
                            {isUp ? '▲' : '▼'} {Math.abs(pair.change24h).toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {mode === 'trade' && (
          <div className="p-4">
            {/* Detailed trade view for selectedPairId */}
            {!selectedPairId ? (
              <div className="text-center p-10 text-[#848e9c]">請從列表選擇股票</div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-[#FF69B4]">
                    {marketData.find(p => p.id === selectedPairId)?.name}
                  </h2>
                  <button 
                    onClick={() => setMode('list')}
                    className="text-xs text-[#848e9c] hover:text-white"
                  >
                    返回列表
                  </button>
                </div>
                <div className="bg-[#181a20] p-6 rounded border border-[#2b2f36] text-center">
                  <p className="text-[#848e9c] mb-2">下單功能實作中</p>
                  <div className="text-4xl font-mono font-black text-[#eaecef]">
                    {marketData.find(p => p.id === selectedPairId)?.price.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'asset' && (
          <div className="p-4">
            <div className="bg-[#181a20] p-4 rounded border border-[#2b2f36] mb-4">
              <h2 className="text-[#ff69b4] font-bold mb-4">資產概覽</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#848e9c] text-[10px] uppercase">總資產估值</p>
                  <p className="text-lg font-mono font-bold">{netWorth.toLocaleString()} $TEE</p>
                </div>
                <div>
                  <p className="text-[#848e9c] text-[10px] uppercase">可用餘額</p>
                  <p className="text-lg font-mono font-bold text-[#00ffa3]">{balance.toLocaleString()} $TEE</p>
                </div>
              </div>
            </div>

            <div className="bg-[#181a20] rounded border border-[#2b2f36] overflow-hidden">
              <div className="p-3 bg-[#1e2329] border-b border-[#2b2f36]">
                <h3 className="text-xs font-bold text-[#eaecef]">持有部位</h3>
              </div>
              {holdings.length === 0 ? (
                <div className="p-8 text-center text-[#848e9c] text-sm">目前無持股</div>
              ) : (
                <div className="divide-y divide-[#21262C]">
                  {holdings.map(h => {
                    const pair = marketData.find(p => p.id === h.pairId);
                    if (!pair) return null;
                    const value = h.shares * pair.price;
                    const profit = (pair.price - h.avgCost) * h.shares;
                    const roi = ((pair.price - h.avgCost) / h.avgCost) * 100;
                    return (
                      <div key={h.pairId} className="p-3 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-sm">{pair.name}</p>
                          <p className="text-[10px] text-[#848e9c]">{h.shares.toLocaleString()} 股</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm">${value.toLocaleString()}</p>
                          <p className={`text-[10px] font-mono ${profit >= 0 ? 'text-[#FF3B3B]' : 'text-[#00FFA3]'}`}>
                            {profit >= 0 ? '+' : ''}{roi.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <BottomNav currentMode={mode} setMode={setMode} />
    </main>
  );
}
