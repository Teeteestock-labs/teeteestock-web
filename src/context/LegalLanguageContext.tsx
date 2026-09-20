'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type LegalLang = 'zh' | 'en' | 'ja';

interface LegalLanguageContextValue {
  lang: LegalLang;
  setLang: (lang: LegalLang) => void;
}

const LegalLanguageContext = createContext<LegalLanguageContextValue>({
  lang: 'zh',
  setLang: () => {},
});

const STORAGE_KEY = 'teeteestock_legal_lang';

export function LegalLanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LegalLang>('zh');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as LegalLang;
      if (saved === 'zh' || saved === 'en' || saved === 'ja') {
        setLangState(saved);
      }
    } catch {
      // Ignore localStorage errors (e.g. in private browsing mode)
    }
  }, []);

  const setLang = (newLang: LegalLang) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <LegalLanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LegalLanguageContext.Provider>
  );
}

export function useLegalLanguage() {
  return useContext(LegalLanguageContext);
}
