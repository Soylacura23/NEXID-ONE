import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language } from '@/types/nexid';

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (es: string, en: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const LANG_STORAGE_KEY = 'nexid_one_lang';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'es' || saved === 'en') return saved;
    } catch {
      // ignore
    }
    return 'es';
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang]);

  const setLang = (next: Language) => setLangState(next);
  const toggleLang = () => setLangState((prev) => (prev === 'es' ? 'en' : 'es'));
  const t = (es: string, en: string) => (lang === 'es' ? es : en);

  return <I18nContext.Provider value={{ lang, setLang, toggleLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
