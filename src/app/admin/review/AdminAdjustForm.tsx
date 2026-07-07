'use client';

import { useState } from 'react';
import { updateAdminAdjust } from '../actions';

interface Props {
  pairId: string;
}

export default function AdminAdjustForm({ pairId }: Props) {
  const [adjust, setAdjust] = useState<string>('');
  const [reason, setReason] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const val = parseFloat(adjust) || 0;
    if (val === 0) {
      alert('微調加成百分比不能為 0！');
      return;
    }
    if (!reason.trim()) {
      alert('行政理由必須填寫！');
      return;
    }
    if (!url.trim()) {
      alert('網址必須填寫！');
      return;
    }

    setLoading(true);
    try {
      await updateAdminAdjust(pairId, val, reason, url);
      alert(`個股 [${pairId}] 行政微調成功套用為已核可情報！`);
      // 成功後自動清除可填欄位
      setAdjust('');
      setReason('');
      setUrl('');
    } catch (err) {
      alert(`套用失敗：${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="bg-gray-900/20 border border-gray-900/80 p-3 rounded-lg flex flex-col xl:flex-row gap-3 items-stretch xl:items-center"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 whitespace-nowrap">微調加成（％）:</span>
        <input
          type="number"
          step="0.1"
          placeholder="5.0"
          value={adjust}
          onChange={(e) => setAdjust(e.target.value)}
          disabled={loading}
          required
          className="w-20 bg-gray-950 border border-gray-800 rounded px-2 py-1 text-center font-mono text-xs text-white focus:outline-none focus:border-purple-500"
        />
      </div>
      <div className="flex-1 flex items-center gap-2">
        <span className="text-xs text-gray-400 whitespace-nowrap">行政理由:</span>
        <input
          type="text"
          placeholder="輸入加成理由 (必填)..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={loading}
          required
          className="w-full bg-gray-950 border border-gray-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
        />
      </div>
      <div className="flex-1 flex items-center gap-2">
        <span className="text-xs text-gray-400 whitespace-nowrap">網址:</span>
        <input
          type="text"
          placeholder="輸入情報網址 (必填)..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          required
          className="w-full bg-gray-950 border border-gray-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`px-4 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold transition-all active:scale-95 whitespace-nowrap ${loading ? 'opacity-50 cursor-not-allowed animate-pulse' : ''}`}
      >
        {loading ? '套用中...' : '套用微調'}
      </button>
    </form>
  );
}
