'use client';

import { useState, useMemo } from 'react';
import { C } from '@/lib/disto';
import Eyebrow from '@/components/ui/Eyebrow';

const ALL_SECTIONS = [
  { key: 'brand_identity',      label: 'Identité de la marque',   n: '01' },
  { key: 'mission',             label: 'Mission & Vision',         n: '02' },
  { key: 'brand_intention',     label: 'Intention de marque',      n: '03' },
  { key: 'archetype',           label: 'Archétype',                n: '04' },
  { key: 'value_proposition',   label: 'Proposition de valeur',    n: '05' },
  { key: 'positioning',         label: 'Positionnement',           n: '06' },
  { key: 'tone_of_voice',       label: 'Ton & Personnalité',       n: '07' },
  { key: 'personas',            label: 'Cibles & Personas',        n: '08' },
  { key: 'key_messages',        label: 'Messages clés',            n: '09' },
  { key: 'manifesto',           label: 'Manifeste',                n: '10' },
  { key: 'competitive_context', label: 'Contexte concurrentiel',   n: '11' },
  { key: 'brand_values',        label: 'Valeurs & Principes',      n: '12' },
  { key: 'always_say',          label: 'Toujours dire',            n: '13' },
  { key: 'dont_say',            label: 'Ne jamais dire',           n: '14' },
] as const;

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
      return s.label.toLowerCase().includes(q) || content.toLowerCase().includes(q);
    });
  }, [query, sections]);

  const activeSection = ALL_SECTIONS.find(s => s.key === activeKey) ?? ALL_SECTIONS[0];
  const activeContent = sections[activeSection.key] ?? '';

  function selectSection(key: string) {
    if (proposing && proposalText !== activeContent) {
      const ok = window.confirm('Annuler la proposition en cours et changer de section ?');
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
        const data = await res.json().catch(() => ({ error: 'Erreur inconnue.' }));
        setSubmitError(data.error ?? 'Impossible d\'envoyer la proposition.');
      }
    } catch {
      setSubmitError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="panel-split" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Inner nav */}
      <div className="inner-nav" style={{
        width: 280, background: C.ink,
        borderRight: `1px solid ${C.line}`,
        overflowY: 'auto', padding: 0,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Search */}
        <div style={{ padding: '16px 16px 8px', borderBottom: `1px solid ${C.line}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.panel, border: `1px solid ${C.line2}`, padding: '8px 12px' }}>
            <span style={{ color: C.fg3, fontSize: 14 }}>⌕</span>
            <input
              type="text"
              placeholder="Rechercher…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Rechercher dans la stratégie"
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: C.bone, fontSize: 13, flex: 1, fontFamily: 'inherit',
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Effacer la recherche"
                style={{ background: 'none', border: 'none', color: C.fg3, cursor: 'pointer', fontSize: 14, padding: 0 }}
              >×</button>
            )}
          </div>
        </div>

        {/* Section list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          <Eyebrow color={C.fg3} style={{ padding: '0 24px', marginBottom: 10 }}>Structure</Eyebrow>
          {filteredSections.length === 0 && (
            <div style={{ padding: '16px 24px', fontSize: 13, color: C.muted, fontStyle: 'italic' }}>
              Aucun résultat pour &ldquo;{query}&rdquo;
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
                <span style={{ fontSize: 13.5, fontWeight: on ? 700 : 500 }}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 56px 56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <span style={{ color: C.red, fontSize: 14, fontWeight: 700, letterSpacing: '0.16em', fontVariantNumeric: 'tabular-nums' }}>{activeSection.n} /</span>
          <Eyebrow color={C.fg3}>Stratégie · {brand}</Eyebrow>
        </div>

        <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.96, marginBottom: 24 }}>
          {activeSection.label}.
        </div>

        {activeContent ? (
          <div style={{ fontSize: 15, color: C.boneDim, lineHeight: 1.75, maxWidth: 720, whiteSpace: 'pre-wrap', marginBottom: 32 }}>
            {highlight(activeContent, query)}
          </div>
        ) : (
          <div style={{ fontSize: 15, color: C.muted, fontStyle: 'italic', marginBottom: 32 }}>
            Cette section n&apos;a pas encore été définie.
          </div>
        )}

        {/* Meta */}
        <div style={{ paddingTop: 20, borderTop: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <Eyebrow color={C.muted} style={{ fontSize: 10, marginBottom: 4 }}>Structure mise à jour</Eyebrow>
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
              Modifier
            </button>
          )}
        </div>

        {/* Proposal form */}
        {isAdmin && proposing && (
          <div style={{ marginTop: 28, padding: '24px', background: C.panel, border: `1px solid ${C.line2}` }}>
            <Eyebrow color={C.red} style={{ marginBottom: 12 }}>Proposition de modification</Eyebrow>
            <textarea
              value={proposalText}
              onChange={e => setProposalText(e.target.value)}
              rows={8}
              aria-label="Contenu proposé"
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
                {submitting ? 'Envoi…' : 'Proposer la mise à jour'}
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
                Annuler
              </button>
            </div>
          </div>
        )}

        {submitted && (
          <div role="status" style={{ marginTop: 16, padding: '14px 18px', background: 'rgba(240,45,20,0.10)', border: `1px solid ${C.red}`, color: C.red, fontSize: 13, fontWeight: 600 }}>
            Votre proposition a été envoyée à l&apos;agence pour validation.
          </div>
        )}
      </div>
    </div>
  );
}
