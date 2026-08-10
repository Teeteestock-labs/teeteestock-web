'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginForm() {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('請輸入管理者通行密碼');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.refresh();
      } else {
        setErrorMsg(data.error || '通行密碼錯誤，存取拒絕');
      }
    } catch (err) {
      setErrorMsg('連線異常，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 font-sans select-none selection:bg-pink-500/30 selection:text-pink-200">
      <div className="w-full max-w-md bg-gray-900/60 border border-gray-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow accent decoration */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-2 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-pink-500/20 text-2xl font-bold text-white mb-3">
            🔒
          </div>
          <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
            極密主控樞紐驗證
          </h1>
          <p className="text-xs text-gray-500">此區域僅限 teeteeStock 最高管理者存取</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">
              管理者通行密碼 (Admin Passcode)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入極密驗證碼..."
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl bg-gray-950/80 border border-gray-800 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/60 transition-all font-mono"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2 animate-shake">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-pink-500/20 border border-pink-400/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>身分驗證中...</span>
              </>
            ) : (
              <span>登入最高管理中樞</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2 text-[10px] text-gray-600 relative z-10">
          teeteeStock Security System • Access Protected
        </div>
      </div>
    </div>
  );
}
