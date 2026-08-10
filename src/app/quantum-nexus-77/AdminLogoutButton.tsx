'use client';

import { useRouter } from 'next/navigation';

export default function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin-auth', { method: 'DELETE' });
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 hover:bg-rose-950/60 border border-gray-800 hover:border-rose-500/40 text-gray-400 hover:text-rose-300 transition-all flex items-center gap-1.5"
    >
      <span>🚪</span>
      <span>登出管理權限</span>
    </button>
  );
}
