export const LOCALES = ['fr', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'fr';
export const LOCALE_STORAGE_KEY = 'disto:lang';
export const LOCALE_COOKIE_NAME = 'disto_lang';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function isLocale(value: unknown): value is Locale {
  return value === 'fr' || value === 'en';
}

export function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    // localStorage unavailable (private mode, etc.)
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language : '';
  return nav.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}
