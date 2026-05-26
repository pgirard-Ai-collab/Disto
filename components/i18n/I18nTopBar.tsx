'use client';

import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import TopBar from '@/components/layout/TopBar';

interface Props {
  crumbKeys?: string[];
  crumbValues?: Record<string, Record<string, string | number>>;
  right?: ReactNode;
  theme?: 'dark' | 'light';
}

export default function I18nTopBar({ crumbKeys = [], crumbValues, right, theme = 'dark' }: Props) {
  const t = useTranslations();
  const crumbs = crumbKeys.map((k) => {
    const values = crumbValues?.[k];
    return values ? t(k, values) : t(k);
  });
  return <TopBar crumbs={crumbs} right={right} theme={theme} />;
}
