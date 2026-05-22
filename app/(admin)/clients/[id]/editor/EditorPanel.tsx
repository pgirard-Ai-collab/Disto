'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { C } from '@/lib/disto';
import Btn from '@/components/ui/Btn';
import Eyebrow from '@/components/ui/Eyebrow';
import Pill from '@/components/ui/Pill';
import { saveBrandStructure, publishBrandStructure } from '@/app/actions/brand-structure';
import VersionHistoryDrawer from './VersionHistoryDrawer';

const SECTION_KEYS = [
  'brand_identity', 'mission', 'brand_intention', 'archetype',
  'value_proposition', 'positioning', 'tone_of_voice', 'personas',
  'key_messages', 'manifesto', 'competitive_context', 'brand_values',
  'always_say', 'dont_say',
] as const;

type SectionKey = typeof SECTION_KEYS[number];

const SECTION_LABELS: Record<SectionKey, { num: string; name: string; desc: string }> = {
  brand_identity:       { num: '01', name: 'Identité',              desc: 'Nom, sous-titre, tagline.' },
  mission:              { num: '02', name: 'Mission',               desc: 'Raison d\'être de la marque.' },
  brand_intention:      { num: '03', name: 'Intention',             desc: 'Ce que la marque veut créer.' },
  archetype:            { num: '04', name: 'Archétype',             desc: 'Archétype de marque + description.' },
  value_proposition:    { num: '05', name: 'Value Proposition',     desc: 'Proposition de valeur unique.' },
  positioning:          { num: '06', name: 'Positionnement',        desc: 'Positionnement concurrentiel.' },
  tone_of_voice:        { num: '07', name: 'Ton',                   desc: 'Ton et personnalité de la marque.' },
  personas:             { num: '08', name: 'Personas',              desc: 'Cibles principales.' },
  key_messages:         { num: '09', name: 'Messages clés',         desc: 'Messages clés par cible.' },
  manifesto:            { num: '10', name: 'Manifeste',             desc: 'Texte manifeste de la marque.' },
  competitive_context:  { num: '11', name: 'Contexte concurrent.',  desc: 'Contexte concurrentiel.' },
  brand_values:         { num: '12', name: 'Valeurs',               desc: 'Valeurs fondamentales.' },
  always_say:           { num: '13', name: 'Toujours dire',         desc: 'Mots-clés et phrases types à privilégier (un par ligne, préfixé de "- ").' },
  dont_say:             { num: '14', name: 'Ne jamais dire',        desc: 'Mots-clés interdits (un par ligne, préfixé de "- ").' },
};

type StructureStatus = 'draft' | 'published' | 'modified';

type Props = {
  clientId: string;
  structureId: string;
  brandName: string;
  initialSections: Record<string, string>;
  initialStatus: StructureStatus;
};

export default function EditorPanel({ clientId, structureId: initialStructureId, brandName, initialSections, initialStatus }: Props) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [structureId, setStructureId] = useState(initialStructureId);
  const [sections, setSections] = useState<Record<string, string>>(initialSections);
  const [activeKey, setActiveKey] = useState<SectionKey>('brand_identity');
  const [status, setStatus] = useState<StructureStatus>(initialStatus);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  // Refs to avoid stale closures in autosave callback
  const structureIdRef = useRef(initialStructureId);
  const sectionsRef = useRef(initialSections);
  const lastSavedRef = useRef<Record<string, string>>(initialSections);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { structureIdRef.current = structureId; }, [structureId]);
  useEffect(() => { sectionsRef.current = sections; }, [sections]);

  const save = useCallback(async () => {
    const data = sectionsRef.current;
    setSaveState('saving');

    const result = await saveBrandStructure(structureIdRef.current, data);
    if (!result.success) { setSaveState('error'); return; }

    // Each save creates a new row, so capture its id for the next save
    setStructureId(result.structureId);
    setStatus(result.status);
    lastSavedRef.current = data;
    setSaveState('saved');
    setTimeout(() => setSaveState(prev => (prev === 'saved' ? 'idle' : prev)), 2000);
  }, []);

  function handleChange(val: string) {
    const updated = { ...sectionsRef.current, [activeKey]: val };
    setSections(updated);

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      const changed = JSON.stringify(sectionsRef.current) !== JSON.stringify(lastSavedRef.current);
      if (changed) save();
    }, 1500);
  }

  async function handleSaveNow() {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    await save();
  }

  async function handlePublish() {
    setPublishing(true);
    setPublishError(null);

    // Cancel any pending autosave to avoid races with the publish update
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);

    const result = await publishBrandStructure(structureIdRef.current, sectionsRef.current);
    if (!result.success) { setPublishError(result.error); setPublishing(false); return; }

    lastSavedRef.current = sectionsRef.current;
    setStatus('published');
    setPublishing(false);
    setShowPublishDialog(false);
  }

  const statusLabel: Record<StructureStatus, string> = {
    draft: 'Brouillon',
    published: 'Publié',
    modified: 'Modifié depuis publication',
  };
  const statusPill: Record<StructureStatus, 'draft' | 'validated' | 'modified'> = {
    draft: 'draft',
    published: 'validated',
    modified: 'modified',
  };

  const unsaved = JSON.stringify(sections) !== JSON.stringify(lastSavedRef.current);

  return (
    <>
      <VersionHistoryDrawer
        clientId={clientId}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />

      {showPublishDialog && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: C.bone, padding: '36px 40px', maxWidth: 440, width: '100%' }}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 10 }}>
              Publier la structure ?
            </div>
            <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.55, marginBottom: 28 }}>
              Le Portail Client de <strong>{brandName}</strong> reflétera immédiatement cette structure.
              {unsaved && <span style={{ display: 'block', marginTop: 8, color: C.yellowDark }}>⚠ Des modifications non sauvegardées seront incluses.</span>}
            </div>
            {publishError && <div style={{ color: C.red, fontSize: 13, marginBottom: 12 }}>{publishError}</div>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="ghost" size="sm" onClick={() => setShowPublishDialog(false)}>Annuler</Btn>
              <Btn variant="primary" size="sm" onClick={handlePublish} disabled={publishing}>
                {publishing ? 'Publication…' : 'Publier →'}
              </Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '0 0 20px', borderBottom: `1px solid ${C.border1}`,
      }}>
        <Pill kind={statusPill[status]}>{statusLabel[status]}</Pill>
        <span style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginLeft: 4 }}>
          {saveState === 'saving' && '● Sauvegarde…'}
          {saveState === 'saved' && '✓ Sauvegardé'}
          {saveState === 'error' && '✕ Erreur de sauvegarde'}
          {saveState === 'idle' && unsaved && '● Modifications non sauvegardées'}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <Btn variant="ghost" size="sm" onClick={() => setHistoryOpen(true)}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span aria-hidden style={{ fontSize: 13 }}>⟲</span> Historique
            </span>
          </Btn>
          <Btn variant="ghost" size="sm" onClick={handleSaveNow} disabled={saveState === 'saving'}>
            Sauvegarder
          </Btn>
          <Btn variant="primary" size="sm" onClick={() => setShowPublishDialog(true)}>
            Publier →
          </Btn>
        </div>
      </div>

      <div className="panel-split" style={{ flex: 1, display: 'flex', overflow: 'hidden', marginTop: 20 }}>
        <div className="inner-nav" style={{
          width: 280, background: C.white, borderRight: `1px solid ${C.border1}`,
          overflowY: 'auto', padding: '20px 0', flexShrink: 0,
        }}>
          <Eyebrow color={C.muted} style={{ padding: '0 22px', marginBottom: 14 }}>
            Structure · 14 sections
          </Eyebrow>
          {SECTION_KEYS.map(k => {
            const s = SECTION_LABELS[k];
            const on = activeKey === k;
            const filled = !!(sections[k]?.trim());
            return (
              <button
                key={k}
                onClick={() => setActiveKey(k)}
                style={{
                  width: '100%', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 22px',
                  background: on ? 'rgba(240,45,20,0.05)' : 'transparent',
                  border: 'none', borderLeft: `2px solid ${on ? C.red : 'transparent'}`,
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', fontVariantNumeric: 'tabular-nums', color: on ? C.red : C.muted, minWidth: 22 }}>
                  {s.num}
                </span>
                <span style={{ fontSize: 13.5, flex: 1, fontWeight: on ? 700 : 500, letterSpacing: '-0.005em' }}>
                  {s.name}
                </span>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: filled ? C.red : 'rgba(0,0,0,0.16)', flexShrink: 0 }} />
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(20px,3vw,44px)', background: C.bone }}>
          {(() => {
            const s = SECTION_LABELS[activeKey];
            return (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ color: C.red, fontSize: 13, fontWeight: 700, letterSpacing: '0.16em', fontVariantNumeric: 'tabular-nums' }}>
                    {s.num} /
                  </span>
                </div>
                <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: 8 }}>
                  {s.name}.
                </div>
                <div style={{ color: C.muted, fontSize: 13, marginBottom: 24, maxWidth: 560, lineHeight: 1.55 }}>
                  {s.desc}
                </div>
                <textarea
                  value={sections[activeKey] ?? ''}
                  onChange={e => handleChange(e.target.value)}
                  placeholder={`Contenu de la section « ${s.name} »…`}
                  style={{
                    width: '100%', minHeight: 320, padding: '20px 24px',
                    border: `1px solid ${C.border1}`, background: C.white,
                    fontSize: 14, lineHeight: 1.65, color: C.black,
                    fontFamily: 'inherit', resize: 'vertical', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted }}>
                  Markdown supporté
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </>
  );
}
