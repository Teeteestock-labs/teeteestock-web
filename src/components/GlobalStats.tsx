"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";
import UserProfileModal from "./UserProfileModal";

export default function GlobalStats() {
  const { user, isLoading, logout } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <>
      <div className="bg-[#000000] border-b border-[#2b2f36] px-3.5 py-2 flex justify-between items-center sticky top-0 z-30 select-none">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-2xl sm:text-[32px] font-black tracking-tight text-white hover:text-pink-400 transition-colors font-mono leading-none select-none"
          >
            teeteeStock
          </Link>
        </div>

        <div className="flex items-center gap-2 shrink-0 pl-2">
          {isLoading ? (
            <span className="text-slate-600 text-[11px]">載入身分中...</span>
          ) : user ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-1.5 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-pink-500/50 px-2 py-0.5 rounded-full text-[11px] transition-all cursor-pointer group select-none shadow-sm"
                title="點擊查看或編輯個人資料"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-3.5 h-3.5 rounded-full object-cover group-hover:ring-1 group-hover:ring-pink-500" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon className="w-3 h-3 text-emerald-400 group-hover:text-pink-400 transition-colors" />
                )}
                <span className="max-w-[90px] truncate font-medium">{user.name || user.email.split('@')[0]}</span>
              </button>
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

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}
