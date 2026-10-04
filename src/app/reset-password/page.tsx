'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Loader2, 
  ShieldCheck 
} from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resetPassword } = useAuth();

  const token = searchParams.get('token');

  // Token 驗證狀態
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenEmail, setTokenEmail] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // 表單狀態
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  // 1. 初次載入驗證 Token 有效性
  useEffect(() => {
    if (!token) {
      setIsVerifying(false);
      setTokenValid(false);
      setTokenError('無效或缺少重設密碼憑證 (Token)，請重新前往申請忘記密碼。');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (res.ok && data.valid) {
          setTokenValid(true);
          setTokenEmail(data.email || null);
        } else {
          setTokenValid(false);
          setTokenError(data.error || '重設密碼連結已逾期（有效期限 15 分鐘）或已被使用，請重新申請。');
        }
      } catch (err) {
        setTokenValid(false);
        setTokenError('驗證憑證時發生連線錯誤，請稍後再試。');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  // 2. 密碼強度檢核
  const passwordStrength = React.useMemo(() => {
    if (!password) return { score: 0, label: '尚未輸入', hasLength: false, hasLetter: false, hasNumber: false };
    const hasLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    let score = 0;
    if (hasLength) score += 1;
    if (hasLetter) score += 1;
    if (hasNumber) score += 1;

    let label = '過弱';
    if (score === 2) label = '中等';
    if (score === 3) label = '良好 (符合標準)';

    return { score, label, hasLength, hasLetter, hasNumber };
  }, [password]);

  const isPasswordMatch = password && confirmPassword && password === confirmPassword;
  const canSubmit = passwordStrength.score === 3 && isPasswordMatch;

  // 3. 成功後倒數導向登入頁
  useEffect(() => {
    if (!successMessage) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [successMessage, router]);

  // 4. 表單提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await resetPassword(token, password);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage(res.message || '密碼已成功重設！請使用新密碼重新登入。');
    } else {
      setErrorMessage(res.error || '密碼重設失敗，請確認連結是否仍有效。');
    }
  };

  return (
    <div className="w-full max-w-md bg-[#0a111a] border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-white relative z-10">
      {/* 頂部導航 */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          href="/login" 
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> 返回登入
        </Link>
        <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
          teeteeStock Security
        </span>
      </div>

      {/* 標題 */}
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 mb-3">
          <KeyRound className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          設定新交易密碼
        </h1>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          {tokenEmail ? (
            <span>
              正在為帳號 <span className="text-emerald-400 font-mono">{tokenEmail}</span> 設定新密碼
            </span>
          ) : (
            '請輸入符合安全標準的新密碼以完成身分重設'
          )}
        </p>
      </div>

      {/* 驗證 Token 中狀態 */}
      {isVerifying && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-xs text-slate-400">正在驗證重設憑證安全性...</p>
        </div>
      )}

      {/* Token 無效或逾期 */}
      {!isVerifying && !tokenValid && (
        <div className="space-y-5">
          <div className="flex items-start gap-3 bg-red-950/70 border border-red-800/80 p-4 rounded-xl text-red-300 text-xs">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <div className="font-bold text-red-200 mb-1">憑證無效或已過期</div>
              {tokenError}
            </div>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" /> 返回登入並重新申請忘記密碼
            </Link>
          </div>
        </div>
      )}

      {/* 重設成功狀態 */}
      {!isVerifying && tokenValid && successMessage && (
        <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start gap-3 bg-emerald-950/70 border border-emerald-800/80 p-4 rounded-xl text-emerald-300 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <div className="font-bold text-emerald-200 mb-1">密碼重設成功！</div>
              {successMessage}
            </div>
          </div>
          <p className="text-xs text-center text-slate-400">
            將在 <span className="text-emerald-400 font-bold font-mono text-sm">{countdown}</span> 秒後自動跳轉至登入頁面...
          </p>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
          >
            立即前往登入頁面 →
          </button>
        </div>
      )}

      {/* 重設表單 */}
      {!isVerifying && tokenValid && !successMessage && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2.5 bg-red-950/70 border border-red-800/80 p-3 rounded-xl text-red-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* 新密碼 */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              新密碼 (New Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="請輸入新密碼"
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* 密碼強度檢測指標 */}
            {password && (
              <div className="mt-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">密碼強度：</span>
                  <span className={`font-medium ${
                    passwordStrength.score === 3 ? 'text-emerald-400' :
                    passwordStrength.score === 2 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 h-1.5">
                  <div className={`rounded-full transition-all ${
                    passwordStrength.score >= 1 ? (passwordStrength.score === 1 ? 'bg-red-500' : passwordStrength.score === 2 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-800'
                  }`} />
                  <div className={`rounded-full transition-all ${
                    passwordStrength.score >= 2 ? (passwordStrength.score === 2 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-800'
                  }`} />
                  <div className={`rounded-full transition-all ${
                    passwordStrength.score >= 3 ? 'bg-emerald-500' : 'bg-slate-800'
                  }`} />
                </div>
                <div className="text-[10px] text-slate-400 flex flex-wrap gap-x-3 gap-y-0.5 pt-1">
                  <span className={passwordStrength.hasLength ? 'text-emerald-400' : 'text-slate-500'}>
                    {passwordStrength.hasLength ? '✓' : '•'} 8 碼以上
                  </span>
                  <span className={passwordStrength.hasLetter ? 'text-emerald-400' : 'text-slate-500'}>
                    {passwordStrength.hasLetter ? '✓' : '•'} 含英文字母
                  </span>
                  <span className={passwordStrength.hasNumber ? 'text-emerald-400' : 'text-slate-500'}>
                    {passwordStrength.hasNumber ? '✓' : '•'} 含數字
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 確認新密碼 */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              確認新密碼 (Confirm Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="請再次輸入新密碼"
                className={`w-full bg-slate-900/90 border ${
                  confirmPassword && !isPasswordMatch ? 'border-red-500/80 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'
                } rounded-xl pl-9 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && (
              <p className={`text-[11px] mt-1 flex items-center gap-1 ${
                isPasswordMatch ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {isPasswordMatch ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> 兩次密碼輸入一致
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" /> 兩次密碼輸入不一致
                  </>
                )}
              </p>
            )}
          </div>

          {/* 提交按鈕 */}
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className={`w-full mt-2 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
              canSubmit && !isSubmitting
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/50 active:scale-[0.98]'
                : 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-800'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                更新密碼中...
              </>
            ) : (
              '確認重設密碼'
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#05080e] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* 科技感背景裝飾光效 */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      <Suspense fallback={
        <div className="w-full max-w-md bg-[#0a111a] border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto mb-2" />
          載入安全性重設模組中...
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>

      <div className="mt-8 text-center text-xs text-slate-600 relative z-10">
        &copy; 2026 teeteeStock Security Protocol. All rights reserved.
      </div>
    </div>
  );
}
