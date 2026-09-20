'use client';

import React, { useState, useEffect } from 'react';
import { useLegalLanguage } from '@/context/LegalLanguageContext';

const FORM_TEXT = {
  zh: {
    successTitle: '訊息已成功送達管理後台',
    successDesc: '感謝您的聯絡與回饋！管理團隊已收到您的訊息，若有需要回覆的事項，我們將會透過您所留下的電子郵件與您聯繫。',
    sendAnother: '再發送一則訊息',
    nameLabel: '您的稱呼',
    namePlaceholder: '請輸入您的暱稱或姓名',
    emailLabel: '電子郵件信箱',
    emailPlaceholder: '供回覆使用，例如：user@example.com',
    categoryLabel: '事項類別',
    subjectLabel: '訊息主旨',
    subjectPlaceholder: '簡述您的問題或事由（選填）',
    messageLabel: '訊息內容',
    messagePlaceholder: '請詳細填寫您欲諮詢、回報或建議之具體內容（至少 5 個字）...',
    submitNote: '※ 點擊送出後，表單將直接傳送至平台管理後台。',
    submitting: '正在傳送至後台...',
    submit: '送出訊息至後台',
    categories: [
      '系統異常與 Bug 回報',
      '帳號與資產相關問題',
      'VTuber 聯動數據與每股淨值建議',
      '版權與權利人下架通知',
      '平台功能建議與意見回饋',
      '其他聯絡事項',
    ],
  },
  en: {
    successTitle: 'Message Sent Successfully',
    successDesc: 'Thank you for reaching out! Our platform management team has received your message and will follow up with you via email if needed.',
    sendAnother: 'Send Another Message',
    nameLabel: 'Your Name or Display Name',
    namePlaceholder: 'Enter your nickname or name',
    emailLabel: 'Email Address',
    emailPlaceholder: 'Used for reply, e.g. user@example.com',
    categoryLabel: 'Category',
    subjectLabel: 'Subject',
    subjectPlaceholder: 'Brief summary of your inquiry (optional)',
    messageLabel: 'Message',
    messagePlaceholder: 'Please describe your inquiry, bug report, or suggestion in detail (at least 5 characters)...',
    submitNote: '※ Once submitted, your message will be sent directly to the platform management team.',
    submitting: 'Sending...',
    submit: 'Send Message',
    categories: [
      'System Issue or Bug Report',
      'Account or Asset Inquiries',
      'VTuber Collab Data & NAV Suggestions',
      'Copyright or Rights Holder Notice',
      'Platform Suggestions & Feedback',
      'Other Inquiries',
    ],
  },
  ja: {
    successTitle: 'メッセージが正常に送信されました',
    successDesc: 'お問い合わせ・ご報告ありがとうございます！管理チームにて受信いたしました。返信が必要な事項については、ご記入いただいたメールアドレス宛にご連絡いたします。',
    sendAnother: 'もう1通送信する',
    nameLabel: 'お名前・ニックネーム',
    namePlaceholder: 'ニックネームまたはお名前を入力してください',
    emailLabel: 'メールアドレス',
    emailPlaceholder: '返信用、例：user@example.com',
    categoryLabel: 'お問い合わせ種別',
    subjectLabel: '件名',
    subjectPlaceholder: 'お問い合わせの概要（任意）',
    messageLabel: 'メッセージ内容',
    messagePlaceholder: 'ご質問、バグ報告、ご提案の内容を具体的にご記入ください（5文字以上）...',
    submitNote: '※ 送信後、メッセージはプラットフォーム管理チームへ直接送信されます。',
    submitting: '送信中...',
    submit: 'メッセージを送信',
    categories: [
      'システム異常・バグ報告',
      'アカウント・資産に関するお問い合わせ',
      'VTuberコラボデータ・NAVに関するご提案',
      '権利者様からのご連絡・削除申請',
      'プラットフォーム機能へのご提案・ご意見',
      'その他のお問い合わせ',
    ],
  },
};

export default function ContactForm() {
  const { lang } = useLegalLanguage();
  const t = FORM_TEXT[lang] || FORM_TEXT.zh;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<string>(t.categories[0]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // When language changes, update default category if currently on a default option
  useEffect(() => {
    setCategory(t.categories[0]);
  }, [lang]);

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
        throw new Error(data.error || (lang === 'en' ? 'Submission failed, please try again.' : lang === 'ja' ? '送信に失敗しました。後ほど再試行してください。' : '傳送失敗，請稍後再試。'));
      }

      setSubmitted(true);
      // 清空表單
      setName('');
      setEmail('');
      setCategory(t.categories[0]);
      setSubject('');
      setMessage('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(lang === 'en' ? 'An unexpected error occurred. Please try again.' : lang === 'ja' ? '予期せぬエラーが発生しました。' : '發生未知錯誤，請稍後再試。');
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
              {t.successTitle}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t.successDesc}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs transition-colors"
            >
              {t.sendAnother}
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
                {t.nameLabel} <span className="text-rose-400">*</span>
              </label>
              <input
                id="contact-name"
                type="text"
                required
                disabled={isSubmitting}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="w-full bg-[#05080e] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-colors disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contact-email" className="block text-sm text-slate-200">
                {t.emailLabel} <span className="text-rose-400">*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                required
                disabled={isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full bg-[#05080e] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* 聯絡事項類別 */}
          <div className="space-y-1.5">
            <label htmlFor="contact-category" className="block text-sm text-slate-200">
              {t.categoryLabel} <span className="text-rose-400">*</span>
            </label>
            <select
              id="contact-category"
              disabled={isSubmitting}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#05080e] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-slate-600 transition-colors disabled:opacity-50"
            >
              {t.categories.map((opt) => (
                <option key={opt} value={opt} className="bg-[#0a111a] text-slate-100">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* 主旨 */}
          <div className="space-y-1.5">
            <label htmlFor="contact-subject" className="block text-sm text-slate-200">
              {t.subjectLabel}
            </label>
            <input
              id="contact-subject"
              type="text"
              disabled={isSubmitting}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t.subjectPlaceholder}
              className="w-full bg-[#05080e] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-colors disabled:opacity-50"
            />
          </div>

          {/* 內容 */}
          <div className="space-y-1.5">
            <label htmlFor="contact-message" className="block text-sm text-slate-200">
              {t.messageLabel} <span className="text-rose-400">*</span>
            </label>
            <textarea
              id="contact-message"
              required
              rows={6}
              disabled={isSubmitting}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.messagePlaceholder}
              className="w-full bg-[#05080e] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-colors resize-y leading-relaxed disabled:opacity-50"
            />
          </div>

          {/* 提示與送出按鈕 */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-normal">
              {t.submitNote}
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-850 text-slate-100 border border-slate-700 rounded-xl text-sm font-normal transition-colors shrink-0 flex items-center justify-center gap-2"
            >
              {isSubmitting ? t.submitting : t.submit}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
