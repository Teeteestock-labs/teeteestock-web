"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutGrid, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useState, Suspense } from "react";

function BottomNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Keep track of the last visited stock ID (default to MCMT)
  // Use lazy initializer to read from localStorage without triggering cascading renders
  const [lastStockId, setLastStockId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("last_visited_stock") || "MCMT";
    }
    return "MCMT";
  });

  useEffect(() => {
    if (pathname?.startsWith("/market/")) {
      const parts = pathname.split("/");
      const id = parts[parts.length - 1];
      if (id) {
        const upperId = id.toUpperCase();
        setLastStockId(upperId);
        localStorage.setItem("last_visited_stock", upperId);
      }
    }
  }, [pathname]);

  // Determine active tab
  const mode = searchParams.get("mode");
  let activeTab: 'lobby' | 'stock' | 'asset' = 'lobby';
  if (pathname === "/") {
    if (mode === "asset") {
      activeTab = 'asset';
    } else {
      activeTab = 'lobby';
    }
  } else if (pathname?.startsWith("/market/")) {
    activeTab = 'stock';
  }

  const items = [
    { id: 'lobby', label: '交易大廳', icon: LayoutGrid, href: '/?mode=list' },
    { id: 'stock', label: '個股情報', icon: TrendingUp, href: `/market/${lastStockId}` },
    { id: 'asset', label: '個人資產', icon: Wallet, href: '/?mode=asset' },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#181a20] border-t border-[#2b2f36] flex items-center h-16 pb-safe z-50 select-none">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === item.id ? 'text-[#ff69b4]' : 'text-[#848e9c]'
          }`}
        >
          <item.icon size={20} />
          <span className="text-[10px]">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default function BottomNav() {
  return (
    <Suspense fallback={
      <nav className="fixed bottom-0 left-0 right-0 bg-[#181a20] border-t border-[#2b2f36] flex items-center h-16 pb-safe z-50 select-none">
        <div className="flex-1 flex flex-col items-center justify-center text-[#848e9c]">
          <span className="text-[10px]">載入中...</span>
        </div>
      </nav>
    }>
      <BottomNavContent />
    </Suspense>
  );
}
