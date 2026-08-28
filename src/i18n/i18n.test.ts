import { DEFAULT_LOCALE, LOCALES, interpolate, isLocale, translate } from './locales';

describe('i18n helpers', () => {
  test('supports the requested locales', () => {
    expect(LOCALES).toEqual(['en', 'es', 'pt', 'de', 'ar', 'zh']);
    expect(isLocale(DEFAULT_LOCALE)).toBe(true);
    expect(isLocale('fr')).toBe(false);
  });

  test('interpolates placeholders', () => {
    expect(interpolate('{count} roasters nearby', { count: 7 })).toBe('7 roasters nearby');
  });

  test('loads copy from translation files and falls back to English', () => {
    expect(translate('es', 'home.search')).toBe('Buscar');
    expect(translate('zh', 'home.inspirationTitle')).toBe('热门目的地');
    expect(translate('en', 'missing.key')).toBe('missing.key');
  });
});
