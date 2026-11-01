"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  X, 
  User as UserIcon, 
  Lock, 
  Check, 
  AlertCircle, 
  Loader2, 
  Camera, 
  Upload, 
  Link as LinkIcon, 
  Trash2 
} from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, updateProfile } = useAuth();
  const [nickname, setNickname] = useState<string>("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUrlInputOpen, setIsUrlInputOpen] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      setNickname(user.name || "");
      setAvatarPreview(user.avatar || null);
      setIsUrlInputOpen(false);
      setCustomUrl("");
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
  const currentAvatar = user.avatar || null;
  const isNameChanged = nickname.trim() !== currentName;
  const isAvatarChanged = avatarPreview !== currentAvatar;
  const isChanged = isNameChanged || isAvatarChanged;
  const isValidLength = nickname.trim().length > 0 && nickname.trim().length <= 20;

  // 處理本機圖片上傳與自動裁切壓縮
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("請選取有效的圖片檔案（PNG, JPG, WEBP 等）。");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("圖片檔案過大，請選擇 10MB 以下的圖片。");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const size = 256;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            setErrorMessage("瀏覽器暫不支援圖像裁切處理。");
            return;
          }

          // 正方形置中裁切 (Cover)
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

          let dataUrl = canvas.toDataURL("image/webp", 0.85);
          if (!dataUrl.startsWith("data:image/webp")) {
            dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          }

          setAvatarPreview(dataUrl);
          setErrorMessage("");
          setIsUrlInputOpen(false);
        } catch {
          setErrorMessage("圖片處理發生錯誤，請嘗試其他圖片。");
        }
      };
      img.onerror = () => {
        setErrorMessage("無法解析此圖片檔案。");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    // 清除以允許重複選擇同名檔案
    e.target.value = "";
  };

  // 處理套用圖片網址
  const handleApplyUrl = () => {
    const trimmed = customUrl.trim();
    if (!trimmed) {
      setErrorMessage("請輸入有效的圖片網址。");
      return;
    }
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      setErrorMessage("圖片網址必須以 http:// 或 https:// 開頭。");
      return;
    }

    const testImg = new Image();
    testImg.onload = () => {
      setAvatarPreview(trimmed);
      setCustomUrl("");
      setIsUrlInputOpen(false);
      setErrorMessage("");
    };
    testImg.onerror = () => {
      setErrorMessage("無法讀取此圖片網址，請確認網址正確且允許外部連線。");
    };
    testImg.src = trimmed;
  };

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
    const updateData: { name?: string; avatar?: string | null } = {};
    if (isNameChanged) updateData.name = trimmed;
    if (isAvatarChanged) updateData.avatar = avatarPreview;

    const result = await updateProfile(updateData);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage("個人資料已成功更新！");
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

      {/* 隱藏的檔案上傳輸入框 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

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
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="關閉"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 內部表單內容 */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* 1. 頭像展示與更換區 */}
          <div className="flex flex-col items-center text-center space-y-2.5 select-none">
            {/* 頭像圓形容器 */}
            <div className="relative group">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative w-20 h-20 rounded-full border-2 border-slate-700 hover:border-pink-500 bg-slate-900 shadow-xl overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-200"
                title="點擊上傳更換頭像"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="avatar preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-950 to-slate-900">
                    <UserIcon className="w-10 h-10 text-emerald-400" />
                  </div>
                )}

                {/* 滑鼠懸浮遮罩提示 */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
                  <Camera className="w-5 h-5 text-pink-400 mb-0.5" />
                  <span className="text-[10px] font-bold">更換頭像</span>
                </div>
              </div>

              {/* 右下角相機圖示徽章（手機與平板上明顯易點） */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center shadow-md border-2 border-[#12161C] transition-transform active:scale-90 cursor-pointer"
                title="上傳圖片更換頭像"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 頭像動作按鈕群 */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-[11px] font-medium text-slate-200 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                title="從電腦或手機選取照片上傳"
              >
                <Upload className="w-3 h-3 text-pink-400" />
                <span>上傳圖片</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsUrlInputOpen(!isUrlInputOpen);
                  setErrorMessage("");
                }}
                className={`px-2 py-1 rounded-md border text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                  isUrlInputOpen
                    ? "bg-pink-950/60 border-pink-500/60 text-pink-300"
                    : "bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200 hover:text-white"
                }`}
                title="輸入外部圖片網址"
              >
                <LinkIcon className="w-3 h-3 text-pink-400" />
                <span>圖片網址</span>
              </button>

              {avatarPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarPreview(null);
                    setErrorMessage("");
                  }}
                  className="px-2 py-1 rounded-md bg-slate-800/80 hover:bg-red-950/60 border border-slate-700 hover:border-red-500/50 text-[11px] font-medium text-slate-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer"
                  title="移除自訂頭像並恢復預設圖示"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>移除</span>
                </button>
              )}
            </div>

            {/* 展開之圖片網址輸入框 */}
            {isUrlInputOpen && (
              <div className="w-full pt-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  className="flex-1 bg-[#0B0E11] border border-slate-700 focus:border-[#FF69B4] rounded-md px-2.5 py-1 text-xs text-white placeholder-gray-500 outline-none font-mono"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyUrl();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-2.5 py-1 rounded-md bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  套用
                </button>
              </div>
            )}

            <div>
              <span className="inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {getProviderLabel()}
              </span>
            </div>
          </div>

          <div className="space-y-3.5">
            {/* 2. 電子郵件信箱 (Email) - 反灰不可修改 */}
            <div className="space-y-1">
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
                  className="w-full bg-slate-950/60 border border-slate-800/80 rounded-lg px-3 py-1.5 text-xs text-gray-400 font-mono cursor-not-allowed select-all"
                  title="註冊信箱為唯一身份標識，無法進行變更"
                />
              </div>
              <p className="text-[10px] text-gray-500 font-sans leading-tight">
                此信箱為您的交易所身份綁定帳號，系統已進行安全鎖定。
              </p>
            </div>

            {/* 3. 交易暱稱 (Nickname) - 可編輯修改 */}
            <div className="space-y-1">
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
                  className="w-full bg-[#0B0E11] border border-[#2B2F36] focus:border-[#FF69B4] focus:ring-1 focus:ring-[#FF69B4]/40 rounded-lg px-3 py-1.5 text-xs font-medium text-white placeholder-gray-600 outline-none transition-all font-sans"
                />
              </div>
              <p className="text-[10px] text-gray-500 font-sans leading-tight">
                暱稱未來將於交易大廳、委託撮合看板及各大企劃榜單中公開呈現。
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
