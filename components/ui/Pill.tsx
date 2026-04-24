import { C, PILL_MAP, PillKind } from '@/lib/disto';
import { ReactNode } from 'react';

interface PillProps {
  kind?: PillKind;
  children: ReactNode;
  dot?: boolean;
}

export default function Pill({ kind = 'default', children, dot = true }: PillProps) {
  const m = PILL_MAP[kind] ?? PILL_MAP.default;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      borderRadius: 2,
      background: m.bg,
      color: m.fg,
      fontFamily: 'Archivo, sans-serif',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
    }}>
      {dot && (
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: m.dot,
          flexShrink: 0,
        }} />
      )}
      {children}
    </span>
  );
}
