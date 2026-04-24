import { C } from '@/lib/disto';
import { ReactNode } from 'react';
import Eyebrow from './Eyebrow';

interface SectionHeadProps {
  num?: string | number;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  right?: ReactNode;
  onDark?: boolean;
}

export default function SectionHead({ num, eyebrow, title, subtitle, right, onDark = false }: SectionHeadProps) {
  return (
    <div
      className="section-head-row"
      style={{ borderBottom: `1px solid ${onDark ? C.line2 : 'rgba(0,0,0,0.24)'}` }}
    >
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end' }}>
        {num && (
          <div style={{
            fontFamily: 'Archivo, sans-serif',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.16em',
            color: C.red,
            fontVariantNumeric: 'tabular-nums',
            paddingBottom: 10,
          }}>
            {String(num).padStart(2, '0')} /
          </div>
        )}
        <div>
          {eyebrow && (
            <Eyebrow color={onDark ? C.fg3 : C.muted} style={{ marginBottom: 10 }}>
              {eyebrow}
            </Eyebrow>
          )}
          <div style={{
            fontFamily: 'Archivo, sans-serif',
            fontSize: 'clamp(26px, 4vw, 36px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            color: onDark ? C.bone : C.black,
          }}>
            {title}
          </div>
          {subtitle && (
            <div style={{
              color: onDark ? C.fg3 : C.muted,
              fontSize: 14,
              marginTop: 10,
              maxWidth: 560,
              lineHeight: 1.55,
            }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </div>
  );
}
