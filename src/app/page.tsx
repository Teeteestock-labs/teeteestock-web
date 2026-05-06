"use client";

import { INITIAL_PAIRS } from "./constants/market";

export default function Home() {
  const pairs = INITIAL_PAIRS;

  return (
    <main className="min-h-screen bg-[#0b0E11] text-[#EAECEF] p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto flex justify-between items-end mb-10 border-b border-[#2B2F36] pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#FF69B4] tracking-tighter">
            TEETEESTOCK<span className="text-white ml-2 text-sm font-light">EXCHANGE</span>
          </h1>
          <p className="text-[#848E9C] text-xs mt-1">VTuber 貼貼交易所．實時市場監測</p>
        </div>
        <div className="text-right">
          <p className="text-[#848E9C] text-xs">我的資產</p>
          <p className="text-xl font-mono font-bold text-[#00FFA3]">10,000<span className="text-xs text-gray-400">$TEE</span></p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto bg-[#181A20] rounded-xl border border-[#2B2F36] shadow-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[#848E9C] text-xs uppercase tracking-wider border-b border-[#2B2F36]">
              <th className="px-6 py-4 font-medium">交易對 / 成員</th>
              <th className="px-6 py-4 font-medium">最新價格</th>
              <th className="px-6 py-4 font-medium">24H 漲跌</th>
              <th className="px-6 py-4 font-medium text-center">本週淨值</th>
              <th className="px-6 py-4 font-medium text-right">當前職位</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#21262C]">
            {pairs.map((pair) => (
              <tr key={pair.id} className="hover:bg-[#2B3139] transition-colors group cursor-pointer">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full ring-2 ring-[#181A20] bg-linear-to-tr from-[#FF69B4] to-[#7000FF]"/>
                      <div className="w-8 h-8 rounded-full ring-2 ring-[#181A20] bg-linear-to-tr from-[#00FFA3] to-[#0070FF]"/>
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-[#FF69B4] transition-colors">{pair.name}</div>
                      <div className="text-[10px] text-[#848E9C]">{pair.members.join(' x ')}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 font-mono text-sm font-semibold">${pair.price.toLocaleString()}</td>
                <td className="px-6 py-5 font-mono text-sm">
                  <span className={pair.change24h >=0 ? "text-[#00FFA3]" : "text-[#FF3B3B]"}>
                    {pair.change24h >=0 ? "+" : ""}{pair.change24h}%
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="inline-block px-2 py-1 rounded bg-[#2B2F36] text-[10px] font-mono text-gray-300">
                    NV {pair.netValue}
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <span className="text-xs text-[#FF69B4] bg-[#FF69B4]/10 px-2 py-1 rounded border-[#FF69B4]/20">
                  {pair.ceoTitle} (競逐中)
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}