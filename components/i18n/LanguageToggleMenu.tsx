'use client';

import { useTranslations } from 'next-intl';
import { C } from '@/lib/disto';
import { LOCALES, type Locale } from '@/i18n/config';
import { useLocalePreference } from './I18nProvider';

interface Props {
  theme?: 'light' | 'dark';
}

export default function LanguageToggleMenu({ theme = 'light' }: Props) {
  const { locale, setLocale } = useLocalePreference();
  const t = useTranslations('language');

  const labels: Record<Locale, string> = {
    fr: t('french'),
    en: t('english'),
  };

  const borderColor = theme === 'light' ? C.border1 : C.line;
  const labelFg = C.muted;

  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${borderColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: labelFg,
        }}
      >
        {t('label')}
      </span>
      <div style={{ display: 'inline-flex', gap: 4 }}>
        {LOCALES.map((l) => {
          const isActive = l === locale;
          return (
            <button
              key={l}
              type="button"
              onClick={() => {
                if (!isActive) setLocale(l);
              }}
              aria-pressed={isActive}
              style={{
                padding: '4px 8px',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: isActive ? (theme === 'light' ? C.bone : C.black) : labelFg,
                background: isActive ? C.red : 'transparent',
                border: `1px solid ${isActive ? C.red : borderColor}`,
                cursor: isActive ? 'default' : 'pointer',
                fontFamily: 'Archivo, sans-serif',
              }}
            >
              {labels[l]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
