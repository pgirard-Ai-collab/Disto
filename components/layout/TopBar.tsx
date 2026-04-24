import { C } from '@/lib/disto';
import { ReactNode } from 'react';

interface TopBarProps {
  crumbs?: string[];
  right?: ReactNode;
  theme?: 'dark' | 'light';
}

export default function TopBar({ crumbs = [], right, theme = 'dark' }: TopBarProps) {
  const bg   = theme === 'dark' ? C.ink   : C.bone;
  const fg   = theme === 'dark' ? C.bone  : C.black;
  const line = theme === 'dark' ? C.line  : 'rgba(0,0,0,0.12)';
  const dim  = theme === 'dark' ? C.fg3   : C.muted;

  return (
    <div style={{
      minHeight: 64,
      borderBottom: `1px solid ${line}`,
      background: bg,
      color: fg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      fontFamily: 'Archivo, sans-serif',
      flexShrink: 0,
      flexWrap: 'wrap',
      gap: 12,
    }}>
      {/* Breadcrumbs */}
      <div className="topbar-crumbs" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {crumbs.map((c, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {i > 0 && (
              <span className="topbar-sep" style={{ color: dim, fontSize: 12 }}>/</span>
            )}
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: i === crumbs.length - 1 ? fg : dim,
            }}>
              {c}
            </span>
          </span>
        ))}
      </div>

      {/* Right slot */}
      {right && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          {right}
        </div>
      )}
    </div>
  );
}
