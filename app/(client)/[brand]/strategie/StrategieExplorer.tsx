'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { C } from '@/lib/disto';
import Eyebrow from '@/components/ui/Eyebrow';

type SectionDef = {
  key: string;
  i18n: 'identity' | 'mission' | 'intention' | 'archetype' | 'valueProposition' | 'positioning' | 'tone' | 'personas' | 'keyMessages' | 'manifesto' | 'competitiveContext' | 'values' | 'alwaysSay' | 'neverSay';
  n: string;
};

const ALL_SECTIONS: readonly SectionDef[] = [
  { key: 'brand_identity',      i18n: 'identity',           n: '01' },
  { key: 'mission',             i18n: 'mission',            n: '02' },
  { key: 'brand_intention',     i18n: 'intention',          n: '03' },
  { key: 'archetype',           i18n: 'archetype',          n: '04' },
  { key: 'value_proposition',   i18n: 'valueProposition',   n: '05' },
  { key: 'positioning',         i18n: 'positioning',        n: '06' },
  { key: 'tone_of_voice',       i18n: 'tone',               n: '07' },
  { key: 'personas',            i18n: 'personas',           n: '08' },
  { key: 'key_messages',        i18n: 'keyMessages',        n: '09' },
  { key: 'manifesto',           i18n: 'manifesto',          n: '10' },
  { key: 'competitive_context', i18n: 'competitiveContext', n: '11' },
  { key: 'brand_values',        i18n: 'values',             n: '12' },
  { key: 'always_say',          i18n: 'alwaysSay',          n: '13' },
  { key: 'dont_say',            i18n: 'neverSay',           n: '14' },
];

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlight(text: string, query: string): React.ReactNode {
  const q = query.trim();
  if (!q) return text;
  const parts = text.split(new RegExp(`(${escapeRegex(q)})`, 'gi'));
  const lower = q.toLowerCase();
  return parts.map((part, i) =>
    part.toLowerCase() === lower
      ? <mark key={i} style={{ background: C.yellow, color: C.black, padding: '0 2px' }}>{part}</mark>
      : <span key={i}>{part}</span>,
  );
}

type Props = {
  sections: Record<string, string>;
  updatedAt: string;
  brand: string;
  isAdmin: boolean;
  brandSlug: string;
};

export default function StrategieExplorer({ sections, updatedAt, brand, isAdmin, brandSlug }: Props) {
  const t = useTranslations('client.strategie');
  const tSection = useTranslations('client.strategie.section');

  const [activeKey, setActiveKey] = useState<string>(ALL_SECTIONS[0].key);
  const [query, setQuery] = useState('');
  const [proposing, setProposing] = useState(false);
  const [proposalText, setProposalText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const filteredSections = useMemo(() => {
    if (!query.trim()) return ALL_SECTIONS;
    const q = query.toLowerCase();
    return ALL_SECTIONS.filter(s => {
      const content = sections[s.key] ?? '';
      const label = tSection(s.i18n).toLowerCase();
      return label.includes(q) || content.toLowerCase().includes(q);
    });
  }, [query, sections, tSection]);

  const activeSection = ALL_SECTIONS.find(s => s.key === activeKey) ?? ALL_SECTIONS[0];
  const activeContent = sections[activeSection.key] ?? '';

  function selectSection(key: string) {
    if (proposing && proposalText !== activeContent) {
      const ok = window.confirm(t('cancelProposalConfirm'));
      if (!ok) return;
    }
    setActiveKey(key);
    setProposing(false);
    setSubmitted(false);
    setSubmitError(null);
  }

  function startProposal() {
    setProposalText(activeContent);
    setProposing(true);
    setSubmitted(false);
    setSubmitError(null);
  }

  async function submitProposal() {
    if (!proposalText.trim() || proposalText === activeContent) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: brandSlug,
          sectionKey: activeSection.key,
          contentBefore: activeContent,
          contentProposed: proposalText,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setProposing(false);
      } else {
        const data = await res.json().catch(() => ({ error: t('sendError') }));
        setSubmitError(data.error ?? t('sendError'));
      }
    } catch {
      setSubmitError(t('networkError'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="panel-split" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      <div className="inner-nav" style={{
        width: 280, background: C.ink,
        borderRight: `1px solid ${C.line}`,
        overflowY: 'auto', padding: 0,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '16px 16px 8px', borderBottom: `1px solid ${C.line}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.panel, border: `1px solid ${C.line2}`, padding: '8px 12px' }}>
            <span style={{ color: C.fg3, fontSize: 14 }}>⌕</span>
            <input
              type="text"
              placeholder={t('search')}
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label={t('searchAria')}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: C.bone, fontSize: 13, flex: 1, fontFamily: 'inherit',
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={t('clearSearch')}
                style={{ background: 'none', border: 'none', color: C.fg3, cursor: 'pointer', fontSize: 14, padding: 0 }}
              >×</button>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          <Eyebrow color={C.fg3} style={{ padding: '0 24px', marginBottom: 10 }}>{t('structureLabel')}</Eyebrow>
          {filteredSections.length === 0 && (
            <div style={{ padding: '16px 24px', fontSize: 13, color: C.muted, fontStyle: 'italic' }}>
              {t('noResults', { query })}
            </div>
          )}
          {filteredSections.map(s => {
            const on = s.key === activeKey;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => selectSection(s.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 24px',
                  borderLeft: `2px solid ${on ? C.red : 'transparent'}`,
                  borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                  background: on ? C.panel : 'transparent',
                  color: on ? C.bone : C.boneDim,
                  cursor: 'pointer',
                  width: '100%', textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', fontVariantNumeric: 'tabular-nums', color: on ? C.red : C.muted, minWidth: 22 }}>{s.n}</span>
                <span style={{ fontSize: 13.5, fontWeight: on ? 700 : 500 }}>{tSection(s.i18n)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 56px 56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <span style={{ color: C.red, fontSize: 14, fontWeight: 700, letterSpacing: '0.16em', fontVariantNumeric: 'tabular-nums' }}>{activeSection.n} /</span>
          <Eyebrow color={C.fg3}>{t('strategieBrand', { brand })}</Eyebrow>
        </div>

        <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.96, marginBottom: 24 }}>
          {tSection(activeSection.i18n)}.
        </div>

        {activeContent ? (
          <div style={{ fontSize: 15, color: C.boneDim, lineHeight: 1.75, maxWidth: 720, whiteSpace: 'pre-wrap', marginBottom: 32 }}>
            {highlight(activeContent, query)}
          </div>
        ) : (
          <div style={{ fontSize: 15, color: C.muted, fontStyle: 'italic', marginBottom: 32 }}>
            {t('sectionEmpty')}
          </div>
        )}

        <div style={{ paddingTop: 20, borderTop: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <Eyebrow color={C.muted} style={{ fontSize: 10, marginBottom: 4 }}>{t('structureUpdated')}</Eyebrow>
            <div style={{ fontSize: 13, color: C.bone, fontWeight: 500 }}>{updatedAt}</div>
          </div>
          {isAdmin && !proposing && (
            <button
              type="button"
              onClick={startProposal}
              style={{
                marginLeft: 'auto', padding: '8px 18px',
                border: `1.5px solid ${C.lineStrong}`,
                background: 'transparent', color: C.bone,
                fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {t('modify')}
            </button>
          )}
        </div>

        {isAdmin && proposing && (
          <div style={{ marginTop: 28, padding: '24px', background: C.panel, border: `1px solid ${C.line2}` }}>
            <Eyebrow color={C.red} style={{ marginBottom: 12 }}>{t('modifyProposalTitle')}</Eyebrow>
            <textarea
              value={proposalText}
              onChange={e => setProposalText(e.target.value)}
              rows={8}
              aria-label={t('proposedContent')}
              style={{
                width: '100%', background: C.ink, border: `1px solid ${C.line2}`,
                color: C.bone, fontSize: 14, lineHeight: 1.65, padding: '14px 16px',
                fontFamily: 'inherit', resize: 'vertical', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {submitError && (
              <div role="alert" style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(240,45,20,0.12)', border: `1px solid ${C.red}`, color: C.red, fontSize: 13 }}>
                {submitError}
              </div>
            )}
            <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={submitProposal}
                disabled={submitting || !proposalText.trim() || proposalText === activeContent}
                style={{
                  padding: '9px 20px', background: C.red, color: '#fff',
                  border: 'none', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? t('submitting') : t('submitProposal')}
              </button>
              <button
                type="button"
                onClick={() => { setProposing(false); setSubmitError(null); }}
                style={{
                  padding: '9px 18px', background: 'transparent',
                  border: `1.5px solid ${C.line2}`, color: C.boneDim,
                  fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        )}

        {submitted && (
          <div role="status" style={{ marginTop: 16, padding: '14px 18px', background: 'rgba(240,45,20,0.10)', border: `1px solid ${C.red}`, color: C.red, fontSize: 13, fontWeight: 600 }}>
            {t('proposalSent')}
          </div>
        )}
      </div>
    </div>
  );
}
