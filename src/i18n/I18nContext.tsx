import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_LOCALE,
  LOCALE_META,
  STORAGE_KEY,
  isLocale,
  type Locale,
  type TranslateFn,
  translate,
} from './locales';

export type { TranslateFn };

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
  dir: 'ltr' | 'rtl';
  intlLocale: string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const readStoredLocale = (): Locale => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) {
      return stored;
    }
  } catch {
    // Ignore storage access errors and fall back to the default locale.
  }

  return DEFAULT_LOCALE;
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale);

  useEffect(() => {
    const meta = LOCALE_META[locale];
    document.documentElement.lang = meta.htmlLang;
    document.documentElement.dir = meta.dir;

    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // Ignore storage write errors so language switching still works in-session.
    }
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    const meta = LOCALE_META[locale];

    return {
      locale,
      setLocale: setLocaleState,
      t: (key, vars) => translate(locale, key, vars),
      dir: meta.dir,
      intlLocale: meta.intl,
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }

  return context;
};
