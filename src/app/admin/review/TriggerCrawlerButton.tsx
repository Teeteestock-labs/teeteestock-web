'use client';

import { useState } from 'react';
import { triggerCrawler } from '../actions';

export default function TriggerCrawlerButton() {
  const [loading, setLoading] = useState(false);

  const handlePull = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await triggerCrawler();
      alert(`昨日直播拉取完成！共新增了 ${result.insertedCount} 筆待審查情報。`);
    } catch (err) {
      alert(`拉取失敗：${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePull}
      disabled={loading}
      className={`px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98] ${loading ? 'opacity-50 cursor-not-allowed animate-pulse' : ''}`}
    >
      {loading ? '🔄 正在拉取昨日直播...' : '🔄 拉取昨日直播'}
    </button>
  );
}
