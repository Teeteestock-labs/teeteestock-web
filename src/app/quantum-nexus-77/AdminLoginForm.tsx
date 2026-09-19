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
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-mono select-none">
      <form onSubmit={handleLogin} className="w-full max-w-xs space-y-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          disabled={isLoading}
          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
        />

        {errorMsg && (
          <p className="text-xs text-red-500 text-center">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-neutral-200 text-sm font-medium rounded transition-colors disabled:opacity-50"
        >
          {isLoading ? '...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
