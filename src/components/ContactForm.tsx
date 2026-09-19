'use client';

import React, { useState } from 'react';

const CATEGORY_OPTIONS = [
  '系統異常與 Bug 回報',
  '帳號與資產相關問題',
  'VTuber 聯動數據與每股淨值建議',
  '版權與權利人下架通知',
  '平台功能建議與意見回饋',
  '其他聯絡事項',
] as const;

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<string>(CATEGORY_OPTIONS[0]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          category,
          subject,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '傳送失敗，請稍後再試。');
      }

      setSubmitted(true);
      // 清空表單
      setName('');
      setEmail('');
      setCategory(CATEGORY_OPTIONS[0]);
      setSubject('');
      setMessage('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('發生未知錯誤，請稍後再試。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {submitted ? (
        <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-700/80 text-sm space-y-4 text-slate-300">
          <div className="space-y-1.5">
            <h3 className="text-base text-slate-100 font-normal">
              訊息已成功送達管理後台
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              感謝您的聯絡與回饋！管理團隊已收到您的訊息，若有需要回覆的事項，我們將會透過您所留下的電子郵件與您聯繫。
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs transition-colors"
            >
              再發送一則訊息
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
              {errorMessage}
            </div>
          )}

          {/* 稱呼與回覆 Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="contact-name" className="block text-sm text-slate-200">
                您的稱呼 <span className="text-rose-400">*</span>
              </label>
              <input
                id="contact-name"
                type="text"
                required
                disabled={isSubmitting}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="請輸入您的暱稱或姓名"
                className="w-full bg-[#05080e] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-colors disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contact-email" className="block text-sm text-slate-200">
                電子郵件信箱 <span className="text-rose-400">*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                required
                disabled={isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="供回覆使用，例如：user@example.com"
                className="w-full bg-[#05080e] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* 聯絡事項類別 */}
          <div className="space-y-1.5">
            <label htmlFor="contact-category" className="block text-sm text-slate-200">
              事項類別 <span className="text-rose-400">*</span>
            </label>
            <select
              id="contact-category"
              disabled={isSubmitting}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#05080e] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-slate-600 transition-colors disabled:opacity-50"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-[#0a111a] text-slate-100">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* 主旨 */}
          <div className="space-y-1.5">
            <label htmlFor="contact-subject" className="block text-sm text-slate-200">
              訊息主旨
            </label>
            <input
              id="contact-subject"
              type="text"
              disabled={isSubmitting}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="簡述您的問題或事由（選填）"
              className="w-full bg-[#05080e] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-colors disabled:opacity-50"
            />
          </div>

          {/* 內容 */}
          <div className="space-y-1.5">
            <label htmlFor="contact-message" className="block text-sm text-slate-200">
              訊息內容 <span className="text-rose-400">*</span>
            </label>
            <textarea
              id="contact-message"
              required
              rows={6}
              disabled={isSubmitting}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="請詳細填寫您欲諮詢、回報或建議之具體內容（至少 5 個字）..."
              className="w-full bg-[#05080e] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-colors resize-y leading-relaxed disabled:opacity-50"
            />
          </div>

          {/* 提示與送出按鈕 */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-normal">
              ※ 點擊送出後，表單將直接傳送至平台管理後台。
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-850 text-slate-100 border border-slate-700 rounded-xl text-sm font-normal transition-colors shrink-0 flex items-center justify-center gap-2"
            >
              {isSubmitting ? '正在傳送至後台...' : '送出訊息至後台'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
