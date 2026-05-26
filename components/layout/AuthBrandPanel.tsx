'use client';

import { C } from '@/lib/disto';
import { useTranslations } from 'next-intl';
import Eyebrow from '@/components/ui/Eyebrow';

interface AuthBrandPanelProps {
  eyebrow: string;
  heroLine1: string;
  heroLine2: string;
  tagline: string;
}

export default function AuthBrandPanel({ eyebrow, heroLine1, heroLine2, tagline }: AuthBrandPanelProps) {
  const tCommon = useTranslations('common');
  return (
    <div
      className="login-brand-panel"
      style={{
        flex: '1.1',
        borderRight: `1px solid ${C.line}`,
        padding: '40px 56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 40, right: -80, width: 260, height: 1, background: C.red }} />

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ color: C.red, fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em' }}>DISTO.</span>
        <Eyebrow color={C.fg3} style={{ fontSize: 11 }}>{tCommon('brandOs')}</Eyebrow>
      </div>

      <div>
        <Eyebrow color={C.red} style={{ marginBottom: 28 }}>{eyebrow}</Eyebrow>
        <div className="login-brand-hero" style={{
          fontSize: 'clamp(40px, 6vw, 88px)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 0.92,
          marginBottom: 28,
        }}>
          {heroLine1}<br />
          <span style={{ color: C.fg3 }}>{heroLine2}</span>
        </div>
        <div style={{ fontSize: 16, lineHeight: 1.55, maxWidth: 460, color: C.boneDim }}>
          {tagline}
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: C.muted,
      }}>
        <span>{tCommon('betulaDisto')}</span>
        <span>{tCommon('edition')}</span>
        <span>{tCommon('city')}</span>
      </div>
    </div>
  );
}
