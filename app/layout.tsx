import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import './globals.css';
import I18nProvider from '@/components/i18n/I18nProvider';
import { type Locale, isLocale, DEFAULT_LOCALE } from '@/i18n/config';

export const metadata: Metadata = {
  title: 'DISTO · Brand OS',
  description: 'Le portail brand intelligence de betula.',
};

// Runs before React mounts. Resolves the user's locale from (1) localStorage,
// (2) cookie, (3) navigator.language — sets <html lang>, writes the cookie
// back so RSCs pick it up on the *next* navigation, and exposes the resolved
// value on `window.__distoLang` so I18nProvider initializes state synchronously.
const setInitialLangScript = `
(function(){try{
  var s=localStorage.getItem('disto:lang');
  var c=document.cookie.match(/(?:^|; )disto_lang=([^;]+)/);
  var l=(s==='fr'||s==='en')?s:(c&&(c[1]==='fr'||c[1]==='en')?c[1]:((navigator.language||'').toLowerCase().indexOf('fr')===0?'fr':'en'));
  document.documentElement.lang=l;
  window.__distoLang=l;
  if(!c||c[1]!==l){document.cookie='disto_lang='+l+'; path=/; max-age=31536000; SameSite=Lax';}
}catch(e){}})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const serverLocaleRaw = await getLocale();
  const serverLocale: Locale = isLocale(serverLocaleRaw) ? serverLocaleRaw : DEFAULT_LOCALE;

  return (
    <html lang={serverLocale} style={{ height: '100%' }} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: setInitialLangScript }} />
      </head>
      <body style={{ height: '100%', margin: 0 }}>
        <I18nProvider serverLocale={serverLocale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
