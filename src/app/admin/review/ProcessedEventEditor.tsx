'use client';

import { useState } from 'react';
import { updateProcessedEvent, deleteProcessedEvent } from '../actions';

interface Props {
  event: {
    id: string;
    pairId: string;
    url: string;
    type: string;
    title: string;
    reporter: string;
    status: string;
    reason: string;
  };
}

export default function ProcessedEventEditor({ event }: Props) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState(event.title);
  const [url, setUrl] = useState(event.url);
  const [status, setStatus] = useState(event.status); // 'APPROVED' | 'REJECTED'
  const [reason, setReason] = useState(event.reason || '');

  // Type selection logic
  const isOverrideType = event.type.startsWith('OVERRIDE:');
  const initialOverridePct = isOverrideType ? String(parseFloat(event.type.split(':')[1]) * 100) : '0';

  const [typeCategory, setTypeCategory] = useState<'STREAM' | 'STREAM_3D' | 'VIDEO' | 'OVERRIDE'>(
    isOverrideType ? 'OVERRIDE' : event.type as any
  );
  const [overridePct, setOverridePct] = useState<string>(initialOverridePct);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!title.trim()) {
      alert('標題不能為空！');
      return;
    }
    if (!url.trim()) {
      alert('網址不能為空！');
      return;
    }

    let finalType = typeCategory as string;
    if (typeCategory === 'OVERRIDE') {
      const pctVal = parseFloat(overridePct) || 0;
      if (pctVal === 0) {
        alert('行政微調加成百分比不能為 0！');
        return;
      }
      finalType = `OVERRIDE:${pctVal / 100}`;
    }

    setLoading(true);
    try {
      await updateProcessedEvent(event.id, title, url, finalType, status, reason);
      alert('情報審查更新成功！已即時套用並同步。');
      setEditing(false);
    } catch (err) {
      alert(`更新失敗：${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('您確定要徹底刪除此筆情報紀錄嗎？此動作不可逆。')) return;
    if (loading) return;

    setLoading(true);
    try {
      await deleteProcessedEvent(event.id);
      alert('情報紀錄已成功刪除！');
    } catch (err) {
      alert(`刪除失敗：${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  if (!editing) {
    const isApproved = event.status === 'APPROVED';
    const cardBorderClass = isApproved ? 'border-red-500/50 bg-red-950/5' : 'border-emerald-500/50 bg-emerald-950/5';
    const tagColorClass = isApproved ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    const badgeLabel = isApproved ? '[已核可]' : '[已拒絕]';
    
    let bonusLabel = "";
    if (isApproved) {
      if (event.type === 'STREAM') bonusLabel = "(9%)";
      else if (event.type === 'STREAM_3D') bonusLabel = "(15%)";
      else if (event.type === 'VIDEO') bonusLabel = "(30%)";
      else if (event.type.startsWith('OVERRIDE:')) {
        const val = parseFloat(event.type.split(':')[1]) || 0;
        bonusLabel = `(${val * 100}%)`;
      }
    }

    return (
      <div className={`p-3 rounded-lg border ${cardBorderClass} flex justify-between items-start gap-2`}>
        <div className="space-y-1 flex-1 min-w-0">
          <h3 className="font-semibold text-xs text-gray-300 break-words">{event.title}</h3>
          <div className="text-[9px] text-gray-500 font-mono flex flex-wrap gap-2">
            <span>來源: {event.reporter}</span>
            <a href={event.url} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">連結 ↗</a>
          </div>
          <div className="text-[10px] text-gray-400 bg-gray-900/60 p-1.5 rounded border border-gray-800/50 mt-1.5 font-mono break-all">
            <span className="text-gray-500 mr-1">審查理由:</span>
            {event.reason || '未填寫'}
          </div>
        </div>
        
        <div className="text-right flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${tagColorClass}`}>
            {badgeLabel} {bonusLabel}
          </span>
          <button 
            onClick={() => setEditing(true)}
            className="text-[10px] text-purple-400 hover:text-purple-300 font-bold underline transition-colors"
          >
            ✏️ 編輯
          </button>
        </div>
      </div>
    );
  }

  // Edit Mode JSX
  return (
    <form onSubmit={handleSave} className="p-3 rounded-lg border border-purple-500 bg-gray-950/60 space-y-3">
      <div className="text-[10px] text-purple-400 font-bold">✏️ 編輯情報: {event.pairId}</div>

      <div className="space-y-2">
        <div>
          <label className="block text-[10px] text-gray-400 mb-0.5">標題 / 理由</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-[10px] text-gray-400 mb-0.5">情報連結 (URL)</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-gray-400 mb-0.5">情報類型</label>
            <select
              value={typeCategory}
              onChange={(e) => setTypeCategory(e.target.value as any)}
              disabled={loading}
              className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="STREAM">直播 (9%)</option>
              <option value="STREAM_3D">3D 直播 (15%)</option>
              <option value="VIDEO">影片 (30%)</option>
              <option value="OVERRIDE">行政微調加成 (%)</option>
            </select>
          </div>

          <div>
            {typeCategory === 'OVERRIDE' ? (
              <div>
                <label className="block text-[10px] text-gray-400 mb-0.5">微調加成（％）</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="5.0"
                  value={overridePct}
                  onChange={(e) => setOverridePct(e.target.value)}
                  disabled={loading}
                  className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-[10px] text-gray-400 mb-0.5">固定加成比率</label>
                <div className="w-full bg-gray-900/30 border border-gray-850 rounded px-2 py-1 text-xs text-gray-500 font-mono">
                  {typeCategory === 'STREAM' && '9%'}
                  {typeCategory === 'STREAM_3D' && '15%'}
                  {typeCategory === 'VIDEO' && '30%'}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-gray-400 mb-0.5">審查狀態</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={loading}
              className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="APPROVED">核可 (APPROVED)</option>
              <option value="REJECTED">拒絕 (REJECTED)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 mb-0.5">審查備註 / 說明</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              placeholder="輸入備註或拒絕原因..."
              className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-gray-850">
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="px-3 py-1 bg-red-950/80 hover:bg-red-800 text-red-400 hover:text-white rounded text-xs font-bold transition-all"
        >
          🗑️ 刪除情報
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={loading}
            className="px-3 py-1 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded text-xs transition-all"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold transition-all"
          >
            {loading ? '儲存中...' : '儲存修改'}
          </button>
        </div>
      </div>
    </form>
  );
}
