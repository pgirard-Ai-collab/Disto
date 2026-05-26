import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, isLocale } from './config';
import fr from '../messages/fr.json';
import en from '../messages/en.json';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const stored = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const locale = isLocale(stored) ? stored : DEFAULT_LOCALE;
  const messages = locale === 'en' ? en : fr;
  return { locale, messages, timeZone: 'America/Montreal' };
});
