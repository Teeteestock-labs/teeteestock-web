"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, User as UserIcon, Lock, Check, AlertCircle, Loader2 } from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, updateProfile } = useAuth();
  const [nickname, setNickname] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      setNickname(user.name || "");
      setErrorMessage("");
      setSuccessMessage("");
      // 自動聚焦輸入框
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, user]);

  // 按下 ESC 鍵時關閉
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const currentName = user.name || "";
  const isChanged = nickname.trim() !== currentName;
  const isValidLength = nickname.trim().length > 0 && nickname.trim().length <= 20;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const trimmed = nickname.trim();
    if (!trimmed) {
      setErrorMessage("交易暱稱不可為空白。");
      return;
    }

    if (trimmed.length > 20) {
      setErrorMessage("交易暱稱上限為 20 個字元。");
      return;
    }

    if (!isChanged) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    const result = await updateProfile({ name: trimmed });
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage("交易暱稱已成功更新！");
      setTimeout(() => {
        onClose();
      }, 900);
    } else {
      setErrorMessage(result.error || "更新失敗，請稍後再試。");
    }
  };

  const getProviderLabel = () => {
    switch (user.provider?.toLowerCase()) {
      case "google":
        return "Google 帳號登入";
      case "discord":
        return "Discord 帳號登入";
      case "github":
        return "GitHub 帳號登入";
      default:
        return "本地帳號登入";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* 點選背景關閉 */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* 彈窗卡片 */}
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-sm bg-[#12161C] border border-[#2B2F36] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200"
      >
        {/* 頂部標題列 */}
        <div className="px-5 py-3.5 bg-gray-950/80 border-b border-[#2B2F36] flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FFA3] animate-pulse shadow-[0_0_8px_#00FFA3]" />
            <h2 className="text-sm font-bold text-white tracking-wider">個人帳戶資料</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="關閉"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 內部表單內容 */}
        <form onSubmit={handleSave} className="p-5 space-y-5">
          {/* 1. 頭像展示區 */}
          <div className="flex flex-col items-center text-center space-y-2 select-none">
            <div className="relative w-20 h-20 rounded-full border-2 border-slate-700 bg-slate-900 shadow-xl overflow-hidden flex items-center justify-center group">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-950 to-slate-900">
                  <UserIcon className="w-10 h-10 text-emerald-400" />
                </div>
              )}
            </div>

            <div className="space-y-0.5">
              <span className="inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {getProviderLabel()}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* 2. 電子郵件信箱 (Email) - 反灰不可修改 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                <span className="flex items-center gap-1">
                  <span>電子郵件 (Email)</span>
                  <Lock className="w-3 h-3 text-gray-500" />
                </span>
                <span className="text-[10px] text-gray-500 font-mono">不可修改</span>
              </div>
              <div className="relative">
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  disabled
                  className="w-full bg-slate-950/60 border border-slate-800/80 rounded-lg px-3 py-2 text-xs text-gray-400 font-mono cursor-not-allowed select-all"
                  title="註冊信箱為唯一身份標識，無法進行變更"
                />
              </div>
              <p className="text-[10px] text-gray-500 font-sans leading-tight">
                此信箱為您的交易所身份綁定帳號，系統已進行安全鎖定。
              </p>
            </div>

            {/* 3. 交易暱稱 (Nickname) - 可編輯修改 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-gray-200">
                <span>交易暱稱 (Nickname)</span>
                <span className={`text-[10px] font-mono ${nickname.length > 20 ? 'text-red-400' : 'text-gray-400'}`}>
                  {nickname.length} / 20
                </span>
              </div>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="請輸入交易暱稱"
                  maxLength={20}
                  className="w-full bg-[#0B0E11] border border-[#2B2F36] focus:border-[#FF69B4] focus:ring-1 focus:ring-[#FF69B4]/40 rounded-lg px-3 py-2 text-xs font-medium text-white placeholder-gray-600 outline-none transition-all font-sans"
                />
              </div>
              <p className="text-[10px] text-gray-500 font-sans leading-tight">
                暱稱將於交易大廳、委託撮合看板及各大企劃榜單中公開呈現。
              </p>
            </div>
          </div>

          {/* 訊息反饋提示 */}
          {errorMessage && (
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-medium animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-medium animate-in fade-in">
              <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 底部按鈕區 */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2 px-3 rounded-lg border border-[#2B2F36] text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isChanged || !isValidLength}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg ${
                isSubmitting || !isChanged || !isValidLength
                  ? "bg-gray-800 text-gray-500 border border-gray-700/50 cursor-not-allowed opacity-60"
                  : "bg-gradient-to-r from-[#FF69B4] to-pink-600 hover:from-pink-500 hover:to-pink-700 text-white cursor-pointer active:scale-98 shadow-pink-950/30"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>儲存中...</span>
                </>
              ) : (
                <span>儲存修改</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
