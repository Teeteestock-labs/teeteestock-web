'use client';

import React, { useState, useTransition } from 'react';
import { updateInquiryStatus, deleteInquiry } from '../actions';

interface ContactInquiryItem {
  id: string;
  name: string;
  email: string;
  category: string;
  subject: string | null;
  message: string;
  status: string;
  ip: string | null;
  createdAt: Date;
}

export default function InquiriesTable({ inquiries }: { inquiries: ContactInquiryItem[] }) {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredInquiries = inquiries.filter((item) => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  const pendingCount = inquiries.filter((i) => i.status === 'PENDING').length;

  const handleStatusChange = (id: string, newStatus: string) => {
    startTransition(async () => {
      await updateInquiryStatus(id, newStatus);
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除這筆聯絡記錄嗎？')) {
      startTransition(async () => {
        await deleteInquiry(id);
      });
    }
  };

  return (
    <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-6 backdrop-blur-md space-y-4">
      {/* 篩選標籤 */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-gray-850">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'ALL'
                ? 'bg-slate-700 text-white'
                : 'text-gray-400 hover:text-white bg-gray-800/40'
            }`}
          >
            全部 ({inquiries.length})
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'PENDING'
                ? 'bg-amber-600/80 text-white'
                : 'text-amber-400/80 hover:text-amber-300 bg-amber-950/30 border border-amber-800/40'
            }`}
          >
            待處理 ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('RESOLVED')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'RESOLVED'
                ? 'bg-emerald-600/80 text-white'
                : 'text-emerald-400/80 hover:text-emerald-300 bg-emerald-950/30 border border-emerald-800/40'
            }`}
          >
            已處理 ({inquiries.filter((i) => i.status === 'RESOLVED').length})
          </button>
        </div>

        {isPending && (
          <span className="text-xs text-pink-400 animate-pulse font-mono">
            更新中...
          </span>
        )}
      </div>

      {/* 列表 */}
      {filteredInquiries.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-8">
          目前無符合條件的聯絡記錄。
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-bold">
                <th className="py-2.5 pb-3">時間</th>
                <th className="py-2.5 pb-3">稱呼 / 回覆信箱</th>
                <th className="py-2.5 pb-3">類別</th>
                <th className="py-2.5 pb-3">主旨與內容摘要</th>
                <th className="py-2.5 pb-3 text-center">狀態</th>
                <th className="py-2.5 pb-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900/60">
              {filteredInquiries.map((inq) => {
                const isExpanded = expandedId === inq.id;
                const isPendingStatus = inq.status === 'PENDING';

                return (
                  <tr key={inq.id} className="text-gray-300 hover:bg-gray-900/30 transition-colors">
                    {/* 時間 */}
                    <td className="py-3 font-mono text-[11px] text-gray-500 whitespace-nowrap align-top">
                      {new Date(inq.createdAt).toLocaleString('zh-TW', {
                        timeZone: 'Asia/Taipei',
                        hour12: false,
                      })}
                    </td>

                    {/* 稱呼與回覆信箱 */}
                    <td className="py-3 align-top whitespace-nowrap">
                      <div className="font-semibold text-gray-200">{inq.name}</div>
                      <a
                        href={`mailto:${inq.email}?subject=${encodeURIComponent(`[teeteeStock 回覆] ${inq.subject || inq.category}`)}`}
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-mono mt-0.5"
                        title="點擊以寄信回覆該使用者"
                      >
                        {inq.email}
                      </a>
                      {inq.ip && (
                        <div className="text-[10px] text-gray-600 font-mono">IP: {inq.ip}</div>
                      )}
                    </td>

                    {/* 類別 */}
                    <td className="py-3 align-top whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px] border border-gray-700">
                        {inq.category}
                      </span>
                    </td>

                    {/* 主旨與內容 */}
                    <td className="py-3 align-top max-w-md">
                      {inq.subject && (
                        <div className="font-semibold text-gray-200 mb-1">
                          {inq.subject}
                        </div>
                      )}
                      <div className={`text-gray-400 text-[11px] leading-relaxed ${!isExpanded ? 'line-clamp-2' : 'whitespace-pre-wrap'}`}>
                        {inq.message}
                      </div>
                      {inq.message.length > 80 && (
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : inq.id)}
                          className="text-[10px] text-pink-400 hover:underline mt-1"
                        >
                          {isExpanded ? '收合內容' : '展開完整內容'}
                        </button>
                      )}
                    </td>

                    {/* 狀態 */}
                    <td className="py-3 text-center align-top whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 border text-[10px] rounded-full font-bold inline-block ${
                          isPendingStatus
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {isPendingStatus ? '待處理' : '已處理'}
                      </span>
                    </td>

                    {/* 操作 */}
                    <td className="py-3 text-right align-top whitespace-nowrap space-x-1.5">
                      {isPendingStatus ? (
                        <button
                          onClick={() => handleStatusChange(inq.id, 'RESOLVED')}
                          disabled={isPending}
                          className="px-2.5 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 rounded text-[10px] transition-colors"
                        >
                          標示為已處理
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(inq.id, 'PENDING')}
                          disabled={isPending}
                          className="px-2.5 py-1 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-700/60 text-amber-300 rounded text-[10px] transition-colors"
                        >
                          設為待處理
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(inq.id)}
                        disabled={isPending}
                        className="px-2 py-1 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 text-rose-400 rounded text-[10px] transition-colors"
                      >
                        刪除
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
