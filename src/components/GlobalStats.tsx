"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";

export default function GlobalStats() {
  const { user, isLoading, logout } = useAuth();

  return (
    <div className="bg-[#000000] border-b border-[#2b2f36] px-3 py-1.5 flex justify-end items-center sticky top-0 z-30 text-xs select-none">

      <div className="flex items-center gap-2 shrink-0 pl-2">
        {isLoading ? (
          <span className="text-slate-600 text-[11px]">載入身分中...</span>
        ) : user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full text-[11px]">
              <UserIcon className="w-3 h-3 text-emerald-400" />
              <span className="max-w-[90px] truncate font-medium">{user.name || user.email.split('@')[0]}</span>
            </div>
            <button
              onClick={() => logout()}
              className="text-slate-400 hover:text-red-400 text-[11px] flex items-center gap-0.5 transition-colors"
              title="登出目前帳號"
            >
              <LogOut className="w-3 h-3" />
              <span>登出</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all"
          >
            <LogIn className="w-3 h-3" />
            <span>登入 / 註冊</span>
          </Link>
        )}
      </div>
    </div>
  );
}
