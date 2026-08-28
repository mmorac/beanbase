import React from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { LOCALES, LOCALE_META, type Locale } from '../../i18n/locales';
import './LanguageSwitcher.css';

const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale, t } = useI18n();

  return (
    <label className="language-switcher">
      <span className="language-switcher-label">{t('language.label')}</span>
      <select
        className="language-switcher-select"
        value={locale}
        onChange={event => setLocale(event.target.value as Locale)}
        aria-label={t('language.label')}
      >
        {LOCALES.map(code => (
          <option key={code} value={code}>
            {LOCALE_META[code].nativeLabel}
          </option>
        ))}
      </select>
    </label>
  );
};

export default LanguageSwitcher;
