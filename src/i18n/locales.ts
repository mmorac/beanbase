import ar from './locales/ar.json';
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import zh from './locales/zh.json';

export const LOCALES = ['en', 'es', 'pt', 'de', 'ar', 'zh'] as const;

export type Locale = (typeof LOCALES)[number];
export type Messages = typeof en;

export const DEFAULT_LOCALE: Locale = 'en';
export const STORAGE_KEY = 'beanbase-locale';

export const LOCALE_META: Record<
  Locale,
  { nativeLabel: string; dir: 'ltr' | 'rtl'; htmlLang: string; intl: string }
> = {
  en: { nativeLabel: 'English', dir: 'ltr', htmlLang: 'en', intl: 'en-US' },
  es: { nativeLabel: 'Español', dir: 'ltr', htmlLang: 'es', intl: 'es-ES' },
  pt: { nativeLabel: 'Português', dir: 'ltr', htmlLang: 'pt', intl: 'pt-PT' },
  de: { nativeLabel: 'Deutsch', dir: 'ltr', htmlLang: 'de', intl: 'de-DE' },
  ar: { nativeLabel: 'العربية', dir: 'rtl', htmlLang: 'ar', intl: 'ar' },
  zh: { nativeLabel: '中文', dir: 'ltr', htmlLang: 'zh', intl: 'zh-CN' },
};

export const MESSAGES: Record<Locale, Messages> = {
  en,
  es: es as Messages,
  pt: pt as Messages,
  de: de as Messages,
  ar: ar as Messages,
  zh: zh as Messages,
};

export type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

export const isLocale = (value: string | null | undefined): value is Locale =>
  !!value && (LOCALES as readonly string[]).includes(value);

export const interpolate = (template: string, vars?: Record<string, string | number>) => {
  if (!vars) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    vars[key] === undefined || vars[key] === null ? match : String(vars[key])
  );
};

export const getMessage = (messages: Messages, key: string): string | undefined => {
  const value = key.split('.').reduce<unknown>((current, part) => {
    if (current && typeof current === 'object' && part in current) {
      return (current as Record<string, unknown>)[part];
    }

    return undefined;
  }, messages);

  return typeof value === 'string' ? value : undefined;
};

export const translate = (locale: Locale, key: string, vars?: Record<string, string | number>) => {
  const message = getMessage(MESSAGES[locale], key) ?? getMessage(MESSAGES[DEFAULT_LOCALE], key) ?? key;
  return interpolate(message, vars);
};
