/* global React */
/* Shared primitives for the Brand Intelligence Portal.
   All components follow the DISTO system: square corners, hairlines, one red,
   sentence-case body, ALL-CAPS eyebrows, numeral 01/02/03 labels.          */
const { useState, useRef, useEffect } = React;

/* ────────────────────────────── PALETTE ─────────────────────────────── */
const C = {
  black:      '#000000',
  ink:        '#0B0B0B',
  panel:      '#141414',
  panel2:     '#1B1B1B',
  line:       'rgba(235,232,230,0.14)',
  line2:      'rgba(235,232,230,0.28)',
  lineStrong: 'rgba(235,232,230,0.55)',
  bone:       '#EBE8E6',
  boneDim:    '#D4D1CC',
  fg3:        '#9A958C',
  muted:      '#5E5A52',
  red:        '#F02D14',
  redHover:   '#D62410',
  yellow:     '#F5E619',
  cyan:       '#199BB9',
  clay:       '#BEB4A0',
  stone:      '#E1DCD2',
};

/* ────────────────────────────── TEXT ───────────────────────────────── */
const Eyebrow = ({ children, color = C.fg3, style = {}, as: Tag = 'div' }) => (
  <Tag style={{
    fontFamily: 'Archivo, sans-serif',
    fontSize: 11, fontWeight: 700, letterSpacing: '0.16em',
    textTransform: 'uppercase', color, lineHeight: 1.35, ...style,
  }}>{children}</Tag>
);

const Numeral = ({ n, color = C.red, style = {} }) => (
  <span style={{
    fontFamily: 'Archivo, sans-serif',
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 700, color, ...style,
  }}>{String(n).padStart(2, '0')}</span>
);

/* ────────────────────────────── SIDEBAR ─────────────────────────────── */
/* Shared sidebar used across agency + client portals.
   variant: 'agency' | 'client' changes the section title + items.            */
function Sidebar({ variant = 'agency', active, brand }) {
  const items = variant === 'agency'
    ? [
        { id: 'clients',   n: '01', label: 'Clients' },
        { id: 'import',    n: '02', label: 'Import Disto' },
        { id: 'editor',    n: '03', label: 'Éditeur de structure' },
        { id: 'access',    n: '04', label: 'Accès' },
      ]
    : [
        { id: 'dashboard', n: '01', label: 'Dashboard' },
        { id: 'strategy',  n: '02', label: 'Stratégie' },
        { id: 'chat',      n: '03', label: 'Interroger la marque' },
        { id: 'export',    n: '04', label: 'System Prompt' },
      ];

  return (
    <aside style={{
      width: 256, background: C.black, color: C.bone,
      borderRight: `1px solid ${C.line}`,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Archivo, sans-serif',
    }}>
      {/* Wordmark block */}
      <div style={{
        padding: '22px 24px 24px', borderBottom: `1px solid ${C.line}`,
        display: 'flex', alignItems: 'baseline', gap: 8,
      }}>
        <span style={{ color: C.red, fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em' }}>
          DISTO.
        </span>
        <span style={{ color: C.muted, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Brand OS
        </span>
      </div>

      {/* Tenant / context block */}
      <div style={{ padding: '20px 24px 18px', borderBottom: `1px solid ${C.line}` }}>
        <Eyebrow color={C.muted} style={{ fontSize: 10, marginBottom: 8 }}>
          {variant === 'agency' ? 'Agence' : 'Marque'}
        </Eyebrow>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>
            {variant === 'agency' ? 'betula' : (brand || 'SARTIGA')}
          </div>
          <span style={{ color: C.fg3, fontSize: 12 }}>⌄</span>
        </div>
        {variant === 'client' && (
          <div style={{ color: C.fg3, fontSize: 11, marginTop: 4, letterSpacing: '0.04em' }}>
            Centre de thermothérapie
          </div>
        )}
      </div>

      {/* Section */}
      <div style={{ padding: '20px 0', flex: 1 }}>
        <Eyebrow color={C.muted} style={{ padding: '0 24px', marginBottom: 10, fontSize: 10 }}>
          {variant === 'agency' ? 'Console agence' : 'Portail marque'}
        </Eyebrow>
        {items.map(it => {
          const on = it.id === active;
          return (
            <div key={it.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 24px',
              background: on ? C.panel : 'transparent',
              borderLeft: `2px solid ${on ? C.red : 'transparent'}`,
              color: on ? C.bone : C.boneDim,
              cursor: 'pointer',
            }}>
              <span style={{
                fontFamily: 'Archivo, sans-serif', fontSize: 11, fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                color: on ? C.red : C.muted, letterSpacing: '0.08em',
                minWidth: 20,
              }}>{it.n}</span>
              <span style={{ fontSize: 14, fontWeight: on ? 700 : 500, letterSpacing: '-0.005em' }}>
                {it.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer meta */}
      <div style={{
        padding: '16px 24px', borderTop: `1px solid ${C.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        color: C.fg3, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700,
      }}>
        <span>v 1.4.0</span>
        <span>·</span>
        <span>Signal clair</span>
      </div>
    </aside>
  );
}

/* ────────────────────────────── TOP BAR ─────────────────────────────── */
function TopBar({ crumbs = [], right = null, theme = 'dark' }) {
  const bg = theme === 'dark' ? C.ink : C.bone;
  const fg = theme === 'dark' ? C.bone : C.black;
  const line = theme === 'dark' ? C.line : 'rgba(0,0,0,0.12)';
  const dim = theme === 'dark' ? C.fg3 : C.muted;
  return (
    <div style={{
      height: 64, borderBottom: `1px solid ${line}`,
      background: bg, color: fg,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', fontFamily: 'Archivo, sans-serif', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: dim, fontSize: 12 }}>/</span>}
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: i === crumbs.length - 1 ? fg : dim,
            }}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        {right}
      </div>
    </div>
  );
}

/* ────────────────────────────── BUTTONS ─────────────────────────────── */
const Btn = ({ variant = 'primary', size = 'md', children, icon, style = {}, onDark = false }) => {
  const base = {
    fontFamily: 'Archivo, sans-serif', fontWeight: 700, letterSpacing: '0.04em',
    border: '1.5px solid transparent', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: size === 'sm' ? '8px 14px' : '12px 22px',
    fontSize: size === 'sm' ? 12 : 13,
    transition: 'all 140ms cubic-bezier(0.2,0.8,0.2,1)',
    borderRadius: 0,
  };
  const styles = {
    primary: { background: C.red, color: '#fff' },
    secondary: onDark
      ? { background: C.bone, color: C.black }
      : { background: C.black, color: C.bone },
    ghost: onDark
      ? { background: 'transparent', borderColor: C.lineStrong, color: C.bone }
      : { background: 'transparent', borderColor: C.black, color: C.black },
    ghostDim: onDark
      ? { background: 'transparent', borderColor: C.line2, color: C.boneDim }
      : { background: 'transparent', borderColor: 'rgba(0,0,0,0.24)', color: C.muted },
  };
  return (
    <button style={{ ...base, ...styles[variant], ...style }}>
      {icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      {children}
    </button>
  );
};

/* ────────────────────────────── STATUS PILL ─────────────────────────── */
const Pill = ({ kind = 'default', children, dot = true }) => {
  const map = {
    draft:     { bg: 'rgba(190,180,160,0.18)', fg: C.clay,   dot: C.clay },
    active:    { bg: 'rgba(240,45,20,0.12)',   fg: C.red,    dot: C.red },
    archived:  { bg: 'rgba(154,149,140,0.15)', fg: C.fg3,    dot: C.fg3 },
    auto:      { bg: 'rgba(25,155,185,0.14)',  fg: C.cyan,   dot: C.cyan },
    validated: { bg: 'rgba(240,45,20,0.10)',   fg: C.red,    dot: C.red },
    modified:  { bg: 'rgba(245,230,25,0.16)',  fg: '#B8A800',dot: '#B8A800' },
    invited:   { bg: 'rgba(25,155,185,0.14)',  fg: C.cyan,   dot: C.cyan },
    disabled:  { bg: 'rgba(154,149,140,0.14)', fg: C.fg3,    dot: C.fg3 },
    default:   { bg: 'rgba(0,0,0,0.05)',       fg: C.muted,  dot: C.muted },
  };
  const m = map[kind] || map.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 2,
      background: m.bg, color: m.fg,
      fontFamily: 'Archivo, sans-serif', fontSize: 10, fontWeight: 700,
      letterSpacing: '0.16em', textTransform: 'uppercase',
    }}>
      {dot && <span style={{
        width: 6, height: 6, borderRadius: '50%', background: m.dot,
      }} />}
      {children}
    </span>
  );
};

/* ────────────────────────────── CARD ─────────────────────────────── */
const Card = ({ children, onDark = false, style = {}, pad = 24 }) => (
  <div style={{
    background: onDark ? C.panel : '#FFFFFF',
    border: `1px solid ${onDark ? C.line : 'rgba(0,0,0,0.12)'}`,
    padding: pad,
    borderRadius: 0,
    ...style,
  }}>{children}</div>
);

/* ────────────────────────────── SECTION HEADER ─────────────────────── */
const SectionHead = ({ num, eyebrow, title, subtitle, right, onDark = false }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
    gap: 24, paddingBottom: 24,
    borderBottom: `1px solid ${onDark ? C.line2 : 'rgba(0,0,0,0.24)'}`,
    marginBottom: 28,
  }}>
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end' }}>
      {num && (
        <div style={{
          fontFamily: 'Archivo, sans-serif', fontSize: 14, fontWeight: 700,
          letterSpacing: '0.16em', color: C.red, fontVariantNumeric: 'tabular-nums',
          paddingBottom: 10,
        }}>{String(num).padStart(2, '0')} /</div>
      )}
      <div>
        {eyebrow && <Eyebrow color={onDark ? C.fg3 : C.muted} style={{ marginBottom: 10 }}>{eyebrow}</Eyebrow>}
        <div style={{
          fontFamily: 'Archivo, sans-serif',
          fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05,
          color: onDark ? C.bone : C.black,
        }}>{title}</div>
        {subtitle && (
          <div style={{ color: onDark ? C.fg3 : C.muted, fontSize: 14, marginTop: 10, maxWidth: 560, lineHeight: 1.55 }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
    {right && <div>{right}</div>}
  </div>
);

/* ────────────────────────────── ICON (lucide-ish, hand-rolled) ─────── */
/* 1.5px stroke, square terminals — matches the DISTO discipline */
const Ico = ({ d, size = 16, stroke = 'currentColor', fill = 'none', children, viewBox = '0 0 24 24', style = {} }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke={stroke}
       strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter"
       style={{ flexShrink: 0, ...style }}>
    {d ? <path d={d} /> : children}
  </svg>
);

/* Export everything to window */
Object.assign(window, {
  DISTO_C: C,
  Eyebrow, Numeral, Sidebar, TopBar, Btn, Pill, Card, SectionHead, Ico,
});
