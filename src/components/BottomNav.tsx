"use client";

import { LayoutGrid, TrendingUp, Wallet } from "lucide-react";

type Mode = 'list' | 'trade' | 'asset';

interface Props {
  currentMode: Mode;
  setMode: (mode: Mode) => void;
}

export default function BottomNav({ currentMode, setMode }: Props) {
  const items = [
    { id: 'list', label: '自選', icon: LayoutGrid },
    { id: 'trade', label: '交易', icon: TrendingUp },
    { id: 'asset', label: '資產', icon: Wallet },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#181a20] border-t border-[#2b2f36] flex items-center h-16 pb-safe z-50">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setMode(item.id)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
            currentMode === item.id ? 'text-[#ff69b4]' : 'text-[#848e9c]'
          }`}
        >
          <item.icon size={20} />
          <span className="text-[10px]">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
