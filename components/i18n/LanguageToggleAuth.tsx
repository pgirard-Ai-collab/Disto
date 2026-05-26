'use client';

import { useTranslations } from 'next-intl';
import { C } from '@/lib/disto';
import { LOCALES, type Locale } from '@/i18n/config';
import { useLocalePreference } from './I18nProvider';

interface Props {
  theme?: 'light' | 'dark';
}

export default function LanguageToggleAuth({ theme = 'light' }: Props) {
  const { locale, setLocale } = useLocalePreference();
  const t = useTranslations('language');

  const labels: Record<Locale, string> = {
    fr: t('french'),
    en: t('english'),
  };

  const baseColor = theme === 'light' ? C.muted : C.fg3;
  const borderColor = theme === 'light' ? 'rgba(0,0,0,0.12)' : C.line;

  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 20,
        display: 'inline-flex',
        gap: 4,
        background: theme === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.4)',
        padding: 4,
        border: `1px solid ${borderColor}`,
        backdropFilter: 'blur(8px)',
      }}
      role="group"
      aria-label={t('label')}
    >
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
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: isActive ? (theme === 'light' ? C.bone : C.black) : baseColor,
              background: isActive ? C.red : 'transparent',
              border: 'none',
              cursor: isActive ? 'default' : 'pointer',
              fontFamily: 'Archivo, sans-serif',
            }}
          >
            {labels[l]}
          </button>
        );
      })}
    </div>
  );
}
