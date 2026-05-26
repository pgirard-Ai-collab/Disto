'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import frMessages from '@/messages/fr.json';
import enMessages from '@/messages/en.json';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_COOKIE_NAME,
  LOCALE_STORAGE_KEY,
  type Locale,
  isLocale,
} from '@/i18n/config';

type Messages = typeof frMessages;

type LocalePreferenceContext = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const Ctx = createContext<LocalePreferenceContext | null>(null);

const MESSAGES: Record<Locale, Messages> = {
  fr: frMessages as Messages,
  en: enMessages as Messages,
};

declare global {
  interface Window {
    __distoLang?: string;
  }
}

function readInitialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  // The inline <head> script in app/layout.tsx resolved the locale before
  // React mounted and stored it on window.__distoLang. Reading it here lets
  // useState initialize synchronously, with no "FR flash" before the swap.
  if (isLocale(window.__distoLang)) return window.__distoLang;
  return DEFAULT_LOCALE;
}

function persistLocale(locale: Locale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // localStorage unavailable (private mode); fall back to cookie only
  }
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export default function I18nProvider({
  children,
  serverLocale,
}: {
  children: React.ReactNode;
  serverLocale?: Locale;
}) {
  // Initial state: server passes the locale it rendered with (from cookie).
  // Client reads window.__distoLang on first paint — if it differs from
  // serverLocale (rare: cookie wasn't there yet), React will re-render once.
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return serverLocale ?? DEFAULT_LOCALE;
    return readInitialLocale();
  });

  useEffect(() => {
    // Ensure document.lang matches state (the inline script already set it,
    // but if the cookie was missing it may have been written for next time).
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.documentElement.lang = next;
    persistLocale(next);
  }, []);

  const ctxValue = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return (
    <Ctx.Provider value={ctxValue}>
      <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="America/Montreal">
        {children}
      </NextIntlClientProvider>
    </Ctx.Provider>
  );
}

export function useLocalePreference(): LocalePreferenceContext {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error('useLocalePreference must be used inside <I18nProvider>');
  }
  return ctx;
}
