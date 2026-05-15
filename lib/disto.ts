/* DISTO design system constants — single source of truth for colors */
export const C = {
  black:      '#000000',
  white:      '#FFFFFF',
  ink:        '#0B0B0B',
  panel:      '#141414',
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
  yellowDark: '#B8A800',
  cyan:       '#199BB9',
  clay:       '#BEB4A0',
  stone:      '#E1DCD2',
  border1:    'rgba(0,0,0,0.12)',
  border2:    'rgba(0,0,0,0.24)',
} as const;

export type PillKind =
  | 'draft' | 'active' | 'archived'
  | 'auto' | 'validated' | 'modified'
  | 'invited' | 'disabled' | 'default';

export const PILL_MAP: Record<PillKind, { bg: string; fg: string; dot: string }> = {
  draft:     { bg: 'rgba(190,180,160,0.18)', fg: C.clay,      dot: C.clay },
  active:    { bg: 'rgba(240,45,20,0.12)',   fg: C.red,       dot: C.red },
  archived:  { bg: 'rgba(154,149,140,0.15)', fg: C.fg3,       dot: C.fg3 },
  auto:      { bg: 'rgba(25,155,185,0.14)',  fg: C.cyan,      dot: C.cyan },
  validated: { bg: 'rgba(240,45,20,0.10)',   fg: C.red,       dot: C.red },
  modified:  { bg: 'rgba(245,230,25,0.16)',  fg: '#B8A800',   dot: '#B8A800' },
  invited:   { bg: 'rgba(25,155,185,0.14)',  fg: C.cyan,      dot: C.cyan },
  disabled:  { bg: 'rgba(154,149,140,0.14)', fg: C.fg3,       dot: C.fg3 },
  default:   { bg: 'rgba(0,0,0,0.05)',       fg: C.muted,     dot: C.muted },
};

export const STATUS_LABEL: Record<string, string> = {
  active:   'Actif',
  invited:  'Invité',
  disabled: 'Désactivé',
  draft:    'Brouillon',
  archived: 'Archivé',
};
