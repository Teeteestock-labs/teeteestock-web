"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTee } from "@/context/TeeContext";
import SettlementTimer from "@/components/SettlementTimer";
import TickerTape from "@/components/TickerTape";
import BottomNav from "@/components/BottomNav";
import CandlestickChart from "@/components/CandlestickChart";

type Mode = 'list' | 'trade' | 'asset';

export default function Home() {
  const [mode, setMode] = useState<Mode>('list');
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null);
  const { balance, holdings, marketData, simulateMarketMove, buyPair, sellPair } = useTee();
  
  // 交易相關狀態
  const [amount, setAmount] = useState<number>(0);
  const [isBuy, setIsBuy] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'orderbook' | 'history' | 'dynamic'>('orderbook');

  const selectedPair = marketData.find(p => p.id === selectedPairId);
  const holdingInfo = holdings.find(h => h.pairId === selectedPairId);
  const myHolding = holdingInfo?.shares || 0;

  const handleTrade = () => {
    if (!selectedPair || amount <= 0) return;
    if (isBuy) {
      if (buyPair(selectedPair.id, amount, selectedPair.price)) {
        setAmount(0);
        alert(`成功買入 ${amount} 股 ${selectedPair.name}`);
      } else {
        alert("餘額不足");
      }
    } else {
      if (sellPair(selectedPair.id, amount, selectedPair.price)) {
        setAmount(0);
        alert(`成功賣出 ${amount} 股 ${selectedPair.name}`);
      } else {
        alert("庫存不足");
      }
    }
  };

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
          <div className="flex flex-col h-full bg-[#0B0E11]">
            {!selectedPair ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-[#848e9c]">
                <p>請從報價列表選擇交易對</p>
                <button 
                  onClick={() => setMode('list')}
                  className="mt-4 px-6 py-2 bg-[#2B2F36] text-white rounded-full text-sm"
                >
                  前往報價列表
                </button>
              </div>
            ) : (
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* 交易對標題欄 */}
                <div className="p-3 bg-[#181A20] border-b border-[#2B2F36] flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setMode('list')} className="text-[#848E9C] pr-2 text-xl">«</button>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-sm">{selectedPair.name}</span>
                        <span className="text-[10px] text-[#848E9C] bg-[#2B2F36] px-1 rounded uppercase">{selectedPair.id}</span>
                      </div>
                      <div className={`text-xs font-mono font-bold ${selectedPair.change24h >= 0 ? 'text-[#FF3B3B]' : 'text-[#00FFA3]'}`}>
                        {selectedPair.price.toLocaleString()} <span className="text-[10px] ml-1">{selectedPair.change24h >= 0 ? '▲' : '▼'} {Math.abs(selectedPair.change24h).toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-[#848E9C] uppercase">淨值 (NV)</div>
                    <div className="text-[10px] font-bold text-[#FF69B4]">{selectedPair.netValue.toLocaleString()}</div>
                  </div>
                </div>

                {/* 圖表區 (縮減高度以留空間給標籤頁) */}
                <div className="h-48 shrink-0">
                  <CandlestickChart data={selectedPair.history} />
                </div>

                {/* 標籤頁切換 */}
                <div className="flex border-b border-[#2B2F36] bg-[#181A20]">
                  {[
                    { id: 'orderbook', label: '五檔' },
                    { id: 'history', label: '成交' },
                    { id: 'dynamic', label: '動態' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 py-2 text-xs font-bold transition-colors ${activeTab === tab.id ? 'text-[#FF69B4] border-b-2 border-[#FF69B4]' : 'text-[#848E9C]'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* 標籤內容區 */}
                <div className="flex-1 overflow-y-auto bg-[#181A20] p-2">
                  {activeTab === 'orderbook' && (
                    <div className="space-y-1">
                      {/* 模擬五檔數據 */}
                      <div className="grid grid-cols-2 gap-4 text-[11px] font-mono">
                        <div className="space-y-1">
                          {[5,4,3,2,1].map(i => (
                            <div key={i} className="flex justify-between items-center group">
                              <span className="text-[#00FFA3]">{Math.round(selectedPair.price * (1 + i*0.001))}</span>
                              <span className="text-gray-500">{Math.floor(Math.random() * 500)}</span>
                              <div className="absolute left-0 h-4 bg-[#00FFA3]/5 -z-10 transition-all" style={{ width: `${Math.random() * 40}%` }} />
                            </div>
                          ))}
                        </div>
                        <div className="space-y-1">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className="flex justify-between items-center">
                              <span className="text-gray-500">{Math.floor(Math.random() * 500)}</span>
                              <span className="text-[#FF3B3B]">{Math.round(selectedPair.price * (1 - i*0.001))}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="py-2 text-center border-y border-[#2B2F36] my-2">
                        <span className={`text-sm font-bold font-mono ${selectedPair.change24h >= 0 ? 'text-[#FF3B3B]' : 'text-[#00FFA3]'}`}>
                          {selectedPair.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {activeTab === 'history' && (
                    <div className="text-[10px] font-mono">
                      <div className="flex justify-between text-[#848E9C] border-b border-[#2B2F36] pb-1 mb-1">
                        <span>時間</span>
                        <span>價格</span>
                        <span>數量</span>
                      </div>
                      {[...selectedPair.history].reverse().slice(0, 10).map((h, i) => (
                        <div key={i} className="flex justify-between py-1 border-b border-[#2B2F36]/30">
                          <span className="text-gray-500">{h.time}</span>
                          <span className={h.close >= h.open ? 'text-[#FF3B3B]' : 'text-[#00FFA3]'}>{h.close.toLocaleString()}</span>
                          <span className="text-white">{Math.floor(Math.random() * 100) + 1}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'dynamic' && (
                    <div className="space-y-3">
                      <div className="bg-[#2B3139] p-3 rounded border border-[#3E454D]">
                        <h4 className="text-[10px] font-bold text-[#FF69B4] mb-2 uppercase">目前影響因子</h4>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-[8px] text-[#848E9C]">直播</div>
                            <div className="text-xs text-white font-mono">{selectedPair.pendingInteractions.sharedLive}</div>
                          </div>
                          <div>
                            <div className="text-[8px] text-[#848E9C]">聯動</div>
                            <div className="text-xs text-white font-mono">{selectedPair.pendingInteractions.collab}</div>
                          </div>
                          <div>
                            <div className="text-[8px] text-[#848E9C]">X 提及</div>
                            <div className="text-xs text-white font-mono">{selectedPair.pendingInteractions.xMention}</div>
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#848E9C] leading-relaxed italic">
                        * 動態反映了 VTuber 之間的互動對組合價值的影響，高頻率互動會顯著提升淨值表現。
                      </p>
                    </div>
                  )}
                </div>

                {/* 交易控制面板 (吸附在底部導覽上方) */}
                <div className="bg-[#1E2329] border-t border-[#2B2F36] p-3 space-y-3">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsBuy(true)}
                      className={`flex-1 py-1.5 rounded text-[11px] font-bold border transition-all ${isBuy ? 'bg-[#FF3B3B]/10 border-[#FF3B3B] text-[#FF3B3B]' : 'bg-transparent border-[#2B2F36] text-[#848E9C]'}`}
                    >
                      買進
                    </button>
                    <button 
                      onClick={() => setIsBuy(false)}
                      className={`flex-1 py-1.5 rounded text-[11px] font-bold border transition-all ${!isBuy ? 'bg-[#00FFA3]/10 border-[#00FFA3] text-[#00FFA3]' : 'bg-transparent border-[#2B2F36] text-[#848E9C]'}`}
                    >
                      賣出
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 bg-[#0B0E11] border border-[#2B2F36] rounded px-3 py-1.5 flex flex-col">
                      <span className="text-[8px] text-[#848E9C] uppercase font-bold">數量</span>
                      <input 
                        type="number"
                        value={amount || ""}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="bg-transparent text-white font-mono text-sm outline-none"
                        placeholder="0"
                      />
                    </div>
                    <button 
                      onClick={handleTrade}
                      className={`px-8 py-3 rounded font-black text-sm shadow-lg active:scale-95 transition-all ${isBuy ? 'bg-[#FF3B3B] text-white' : 'bg-[#00FFA3] text-black'}`}
                    >
                      {isBuy ? '買進' : '賣出'}
                    </button>
                  </div>

                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#848E9C]">{isBuy ? '可用' : '持有'}</span>
                    <span className="text-white font-mono">{isBuy ? `${balance.toLocaleString()} $TEE` : `${myHolding.toLocaleString()} 股`}</span>
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
