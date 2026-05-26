'use client';

import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import SectionHead from '@/components/ui/SectionHead';

interface Props {
  num?: string | number;
  eyebrowKey?: string;
  titleKey: string;
  subtitleKey?: string;
  values?: Record<string, string | number>;
  right?: ReactNode;
  onDark?: boolean;
}

export default function I18nSectionHead({
  num,
  eyebrowKey,
  titleKey,
  subtitleKey,
  values,
  right,
  onDark,
}: Props) {
  const t = useTranslations();
  return (
    <SectionHead
      num={num}
      eyebrow={eyebrowKey ? (values ? t(eyebrowKey, values) : t(eyebrowKey)) : undefined}
      title={values ? t(titleKey, values) : t(titleKey)}
      subtitle={subtitleKey ? (values ? t(subtitleKey, values) : t(subtitleKey)) : undefined}
      right={right}
      onDark={onDark}
    />
  );
}
