'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User as UserIcon, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck,
  ArrowLeft 
} from 'lucide-react';

interface AuthCardProps {
  initialTab?: 'login' | 'register';
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthCard({ initialTab = 'login' }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const { login, register } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [oauthNotice, setOauthNotice] = useState<string | null>(null);

  // 監聽 URL 參數中的 OAuth 回應或錯誤通知
  useEffect(() => {
    const error = searchParams.get('error');
    const notice = searchParams.get('notice');
    if (error) {
      setErrorMessage(decodeURIComponent(error));
    }
    if (notice) {
      setOauthNotice(decodeURIComponent(notice));
    }
  }, [searchParams]);

  // 即時驗證邏輯
  const isEmailValid = useMemo(() => {
    if (!email) return false;
    return EMAIL_REGEX.test(email.trim());
  }, [email]);

  // 密碼強度判定 (0~3 分)
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', hasLength: false, hasLetter: false, hasNumber: false };
    const hasLength = password.length >= 8;
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    let score = 0;
    if (hasLength) score++;
    if (hasLetter) score++;
    if (hasNumber) score++;

    let label = '弱';
    if (score === 2) label = '中等';
    if (score === 3) label = '高強度安全';

    return { score, label, hasLength, hasLetter, hasNumber };
  }, [password]);

  // 確認密碼是否一致
  const isPasswordMatch = useMemo(() => {
    if (!confirmPassword) return false;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  // 表單是否可送出
  const canSubmit = useMemo(() => {
    if (isSubmitting) return false;
    if (!isEmailValid) return false;

    if (activeTab === 'login') {
      return password.length > 0;
    } else {
      return passwordStrength.score === 3 && isPasswordMatch;
    }
  }, [activeTab, isSubmitting, isEmailValid, password, passwordStrength, isPasswordMatch]);

  // 切換 Tab 時清理表單提示
  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setErrorMessage(null);
    setSuccessMessage(null);
    setOauthNotice(null);
  };

  // 送出處理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (activeTab === 'login') {
      const res = await login(email, password, rememberMe);
      if (res.success) {
        setSuccessMessage('登入成功！即將為您跳轉...');
        setTimeout(() => {
          router.push(redirectPath);
        }, 800);
      } else {
        setErrorMessage(res.error || '登入失敗');
        setIsSubmitting(false);
      }
    } else {
      const res = await register(email, password, name);
      if (res.success) {
        setSuccessMessage('註冊成功！已為您存入 10,000 $TEE 初始資產，正在進入大廳...');
        setTimeout(() => {
          router.push(redirectPath);
        }, 1200);
      } else {
        setErrorMessage(res.error || '註冊失敗');
        setIsSubmitting(false);
      }
    }
  };

  const handleOAuthClick = (provider: string) => {
    const p = provider.toLowerCase();
    if (p === 'google' || p === 'discord') {
      setIsSubmitting(true);
      window.location.href = `/api/auth/oauth/${p}?redirect=${encodeURIComponent(redirectPath)}`;
      return;
    }
    setOauthNotice(`目前已開通 Google 與 Discord 快速登入！${provider} 快速登入即將上線。`);
    setTimeout(() => setOauthNotice(null), 4000);
  };

  return (
    <div className="w-full max-w-md bg-[#0a111a] border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-white">
      {/* 頂部返回與標題 */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          href="/" 
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> 返回大廳
        </Link>
        <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
          teeteeStock Auth
        </span>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center justify-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          {activeTab === 'login' ? '歡迎回到交易所' : '註冊新交易帳號'}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {activeTab === 'login' 
            ? '請輸入您的帳號密碼以進入個人資產與交易操作' 
            : '立即加入！開戶即領取 10,000 $TEE 初始模擬資金'}
        </p>
      </div>

      {/* Tab 切換分頁 */}
      <div className="grid grid-cols-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800 mb-6">
        <button
          type="button"
          onClick={() => handleTabChange('login')}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'login'
              ? 'bg-slate-800 text-emerald-400 shadow-md border border-slate-700/80'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          帳號登入
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('register')}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'register'
              ? 'bg-slate-800 text-emerald-400 shadow-md border border-slate-700/80'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          會員註冊
        </button>
      </div>

      {/* 錯誤橫幅 */}
      {errorMessage && (
        <div className="mb-5 flex items-start gap-2.5 bg-red-950/70 border border-red-800/80 p-3 rounded-xl text-red-300 text-xs animate-shake">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* 成功橫幅 */}
      {successMessage && (
        <div className="mb-5 flex items-start gap-2.5 bg-emerald-950/70 border border-emerald-800/80 p-3 rounded-xl text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{successMessage}</div>
        </div>
      )}

      {/* OAuth 提示通知 */}
      {oauthNotice && (
        <div className="mb-5 flex items-start gap-2.5 bg-blue-950/70 border border-blue-800/80 p-3 rounded-xl text-blue-300 text-xs">
          <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{oauthNotice}</div>
        </div>
      )}

      {/* 表單主體 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 電子信箱 */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            電子郵件信箱
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className={`w-full bg-slate-900/90 border ${
                email && !isEmailValid ? 'border-red-500/80 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'
              } rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors`}
            />
          </div>
          {email && !isEmailValid && (
            <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> 請輸入正確的電子郵件格式
            </p>
          )}
        </div>

        {/* 註冊可選填暱稱 */}
        {activeTab === 'register' && (
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                交易暱稱 <span className="text-slate-500 font-normal">(選填)</span>
              </label>
            </div>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：超天醬單推人"
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors"
              />
            </div>
          </div>
        )}

        {/* 密碼 */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            登入密碼
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入密碼"
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

          {/* 註冊時的密碼強度儀 */}
          {activeTab === 'register' && password && (
            <div className="mt-2 space-y-1.5">
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

        {/* 註冊確認密碼 */}
        {activeTab === 'register' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              確認密碼
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="請再次輸入密碼"
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
        )}

        {/* 登入選項：保持登入 */}
        {activeTab === 'login' && (
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-800 text-emerald-500 focus:ring-0 focus:ring-offset-0"
              />
              保持登入 (Remember Me)
            </label>
          </div>
        )}

        {/* 送出按鈕 */}
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
              處理中...
            </>
          ) : activeTab === 'login' ? (
            '確認登入'
          ) : (
            '立即註冊並領取 10,000 $TEE'
          )}
        </button>

        {activeTab === 'register' && (
          <p className="text-[11px] text-slate-500 text-center mt-2.5 leading-relaxed">
            點擊註冊即表示您同意遵守 teeteeStock 的{' '}
            <Link href="/terms" className="text-emerald-400 hover:underline">
              服務條款
            </Link>
            {' '}與{' '}
            <Link href="/privacy" className="text-emerald-400 hover:underline">
              隱私權政策
            </Link>
          </p>
        )}
      </form>

      {/* 分隔線 */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
          <span className="bg-[#0a111a] px-3 text-slate-500 font-medium">
            或透過第三方帳號快速登入
          </span>
        </div>
      </div>

      {/* OAuth 快速登入入口按鈕 (Google / Discord / GitHub) */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleOAuthClick('Google')}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-xs text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Google 登入"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8 0-1 .1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
            />
          </svg>
          <span>Google</span>
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleOAuthClick('Discord')}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-[#5865F2]/50 rounded-xl text-xs text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Discord 登入"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#5865F2">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          <span>Discord</span>
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleOAuthClick('GitHub')}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="GitHub 登入"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          <span>GitHub</span>
        </button>
      </div>
    </div>
  );
}
