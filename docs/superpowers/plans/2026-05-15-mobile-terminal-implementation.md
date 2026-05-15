# 行動端交易終端 (Mobile Trading Terminal) 實作計劃

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推薦）或 superpowers:executing-plans 逐任務實現此計劃。步驟使用複選框（`- [ ]`）語法來跟踪進度。

**目標：** 實現一個符合台灣股市 App 風格的高密度行動端交易介面，包含頂部跑馬燈、即時資訊條與底部導航切換。

**架構：** 
- 使用單一頁面 (`src/app/page.tsx`) 作為容器，透過 React 狀態控制顯示模式 (`mode`: 'list' | 'trade' | 'asset')。
- 抽離導覽組件 (`BottomNav`)、資訊顯示組件 (`TopTicker`, `GlobalStats`)。
- 響應式適配：主要針對行動端佈局，同時保留基礎的桌面端相容性。

**技術棧：** Next.js (App Router), Tailwind CSS, Lucide React (圖示), TeeContext (現有狀態管理)。

---

## 檔案結構變更

- `src/components/TickerTape.tsx`: 新增，頂部跑馬燈公告。
- `src/components/GlobalStats.tsx`: 新增，大盤指數資訊條。
- `src/components/BottomNav.tsx`: 新增，底部切換導航。
- `src/app/page.tsx`: 修改，整合模式切換邏輯與各模式視圖。
- `src/components/CandlestickChart.tsx`: 修改，優化行動端尺寸適配。

---

### 任務 1：實現頂部跑馬燈組件 (TickerTape)

**文件：**
- 創建：`src/components/TickerTape.tsx`

- [ ] **步驟 1：編寫組件代碼**

```tsx
"use client";

export default function TickerTape() {
  const announcements = [
    "[公告] 本日 12:00 進行系統維護",
    "[即時] AzuIro 達成萬人聯動，淨值提升中",
    "[市場] 虛擬 $TEE 交易火熱，注意波動風險"
  ];

  return (
    <div className="bg-[#181a20] border-b border-[#2b2f36] py-1 overflow-hidden whitespace-nowrap">
      <div className="animate-marquee inline-block text-[10px] text-[#ff69b4] font-medium">
        {announcements.join(" | ")}
      </div>
    </div>
  );
}
```

- [ ] **步驟 2：添加 Tailwind 動畫配置**

修改 `tailwind.config.ts` (或在 globals.css 添加關鍵幀)。

```css
/* src/app/globals.css */
@keyframes marquee {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
.animate-marquee {
  animation: marquee 20s linear infinite;
}
```

- [ ] **步驟 3：Commit**

```bash
git add src/components/TickerTape.tsx src/app/globals.css
git commit -m "feat: add TickerTape component with marquee animation"
```

---

### 任務 2：實現底部導航組件 (BottomNav)

**文件：**
- 創建：`src/components/BottomNav.tsx`

- [ ] **步驟 1：編寫組件代碼**

```tsx
"use client";

import { LayoutGrid, TrendingUp, Wallet, Settings } from "lucide-react";

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
    <nav className="fixed bottom-0 left-0 right-0 bg-[#181a20] border-t border-[#2b2f36] flex items-center h-16 pb-safe">
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
```

- [ ] **步驟 2：Commit**

```bash
git add src/components/BottomNav.tsx
git commit -m "feat: add BottomNav component for mode switching"
```

---

### 任務 3：重構首頁為多模式視圖

**文件：**
- 修改：`src/app/page.tsx`

- [ ] **步驟 1：實現狀態與模式切換基礎**

```tsx
// src/app/page.tsx
"use client";

import { useState } from "react";
import TickerTape from "@/components/TickerTape";
import BottomNav from "@/components/BottomNav";
import { useTee } from "@/context/TeeContext";
// ... 其他 import

type Mode = 'list' | 'trade' | 'asset';

export default function Home() {
  const [mode, setMode] = useState<Mode>('list');
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null);
  const { balance, holdings, marketData } = useTee();

  // 計算邏輯保持不變 ...

  return (
    <main className="min-h-screen bg-[#0b0e11] text-[#eaecef] flex flex-col pb-20">
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
             {/* 這裡搬移原本的 table 邏輯，並在點擊時 setSelectedPairId + setMode('trade') */}
           </div>
        )}
        
        {mode === 'trade' && (
           <div className="p-4">
             {/* 實現詳細交易介面，包含 K 線與標籤頁 */}
           </div>
        )}

        {mode === 'asset' && (
           <div className="p-4">
             {/* 實現資產管理介面 */}
           </div>
        )}
      </div>

      <BottomNav currentMode={mode} setMode={setMode} />
    </main>
  );
}
```

- [ ] **步驟 2：Commit**

```bash
git add src/app/page.tsx
git commit -m "refactor: implement multi-mode view logic in home page"
```

---

### 任務 4：優化圖表與標籤頁實作

**文件：**
- 修改：`src/components/CandlestickChart.tsx`
- 修改：`src/app/page.tsx` (Trade mode implementation)

- [ ] **步驟 1：調整 CandlestickChart 為響應式寬度**
確保 `viewBox` 與容器寬度匹配，避免溢出。

- [ ] **步驟 2：在首頁實現 [交易] 模式的五檔標籤**

- [ ] **步驟 3：Commit**

```bash
git add src/components/CandlestickChart.tsx src/app/page.tsx
git commit -m "feat: enhance trade view with tabs and responsive chart"
```

---

## 驗證計畫

1. **視覺驗證**: 
   - 檢查頂部跑馬燈是否正常滾動。
   - 檢查底部導航是否固定在螢幕下方且不遮擋內容。
   - 檢查深色主題與紅綠配色是否正確。
2. **功能驗證**:
   - 點擊底部導航，確認模式切換是否正確（DOM 是否隨之更新）。
   - 在「自選」列表點擊股票，確認是否跳轉至「交易」模式且顯示正確股票數據。
   - 模擬成交，確認「資產」模式中的數值是否更新。
