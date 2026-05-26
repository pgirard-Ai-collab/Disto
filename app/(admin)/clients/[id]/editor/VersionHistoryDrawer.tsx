'use client';

import { useEffect, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { C, PillKind } from '@/lib/disto';
import Btn from '@/components/ui/Btn';
import Pill from '@/components/ui/Pill';
import Eyebrow from '@/components/ui/Eyebrow';
import {
  listBrandStructureVersions,
  restoreBrandStructureVersion,
  type VersionListEntry,
} from '@/app/actions/brand-structure';

type Props = {
  clientId: string;
  open: boolean;
  onClose: () => void;
};

const STATUS_TO_PILL: Record<VersionListEntry['status'], PillKind> = {
  draft: 'draft',
  published: 'validated',
  modified: 'modified',
  archived: 'archived',
};

type SectionI18nKey =
  | 'identity' | 'mission' | 'intention' | 'archetype'
  | 'valueProposition' | 'positioning' | 'tone' | 'personas'
  | 'keyMessages' | 'manifesto' | 'competitiveContext' | 'values'
  | 'alwaysSay' | 'neverSay';

const SECTION_I18N: Record<string, SectionI18nKey> = {
  brand_identity: 'identity',
  mission: 'mission',
  brand_intention: 'intention',
  archetype: 'archetype',
  value_proposition: 'valueProposition',
  positioning: 'positioning',
  tone_of_voice: 'tone',
  personas: 'personas',
  key_messages: 'keyMessages',
  manifesto: 'manifesto',
  competitive_context: 'competitiveContext',
  brand_values: 'values',
  always_say: 'alwaysSay',
  dont_say: 'neverSay',
};

export default function VersionHistoryDrawer({ clientId, open, onClose }: Props) {
  const t = useTranslations('admin.versionHistory');
  const tCommon = useTranslations('common');
  const tSection = useTranslations('admin.editor.section');
  const locale = useLocale();
  const dateLocale = locale === 'fr' ? 'fr-CA' : 'en-CA';

  // Anchor "now" to first render so formatRelative stays pure (lazy useState
  // init runs once outside the render path — Date.now() in render trips the
  // React Compiler lint rule otherwise).
  const [now] = useState(() => Date.now());

  const formatRelative = (iso: string): string => {
    const then = new Date(iso).getTime();
    const diffMs = now - then;
    const sec = Math.round(diffMs / 1000);
    if (sec < 60) return t('relative.now');
    const min = Math.round(sec / 60);
    if (min < 60) return t('relative.minutes', { n: min });
    const hr = Math.round(min / 60);
    if (hr < 24) return t('relative.hours', { n: hr });
    const days = Math.round(hr / 24);
    if (days < 30) return t('relative.days', { n: days });
    const months = Math.round(days / 30);
    if (months < 12) return t('relative.months', { n: months });
    const years = Math.round(months / 12);
    return years === 1 ? t('relative.yearsSingular', { n: years }) : t('relative.yearsPlural', { n: years });
  };
  const formatAbsolute = (iso: string): string =>
    new Date(iso).toLocaleString(dateLocale, {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const [versions, setVersions] = useState<VersionListEntry[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setVersions(null);
    setLoadError(null);
    setSelectedId(null);
    setConfirmId(null);
    setRestoreError(null);
    listBrandStructureVersions(clientId).then((res) => {
      if (res.success) setVersions(res.versions);
      else setLoadError(res.error);
    });
  }, [open, clientId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmId) setConfirmId(null);
        else if (selectedId) setSelectedId(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, selectedId, confirmId]);

  if (!open) return null;

  const selected = selectedId && versions ? versions.find((v) => v.id === selectedId) ?? null : null;
  const confirmTarget = confirmId && versions ? versions.find((v) => v.id === confirmId) ?? null : null;

  function handleRestore(versionId: string) {
    setRestoreError(null);
    startTransition(async () => {
      const res = await restoreBrandStructureVersion(versionId);
      if (!res.success) {
        setRestoreError(res.error);
        return;
      }
      window.location.reload();
    });
  }

  const sectionLabel = (key: string): string => {
    const i18nKey = SECTION_I18N[key];
    return i18nKey ? tSection(i18nKey) : key;
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 90,
          background: 'rgba(0,0,0,0.45)',
        }}
      />
      <aside
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 91,
          width: 'min(440px, 100vw)',
          background: C.bone, color: C.black,
          display: 'flex', flexDirection: 'column',
          boxShadow: '-12px 0 32px rgba(0,0,0,0.2)',
        }}
      >
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: `1px solid ${C.border1}`,
        }}>
          <div>
            <Eyebrow color={C.muted}>{t('title')}</Eyebrow>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', marginTop: 2 }}>
              {selected ? t('subtitleVersion', { version: selected.version }) : t('subtitlePrevious')}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={tCommon('close')}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 24, color: C.muted, lineHeight: 1, padding: 4,
            }}
          >
            ×
          </button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadError && (
            <div style={{ padding: 24, color: C.red, fontSize: 13 }}>{loadError}</div>
          )}

          {!versions && !loadError && (
            <div style={{ padding: 24, color: C.muted, fontSize: 13 }}>{t('loading')}</div>
          )}

          {versions && versions.length <= 1 && !selected && (
            <div style={{ padding: 24, color: C.muted, fontSize: 13, lineHeight: 1.6 }}>
              {t('empty')}
            </div>
          )}

          {versions && !selected && versions.length > 1 && (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {versions.map((v) => {
                const clickable = !v.is_current;
                return (
                  <li key={v.id}>
                    <button
                      onClick={() => clickable && setSelectedId(v.id)}
                      disabled={!clickable}
                      style={{
                        width: '100%', textAlign: 'left',
                        background: 'transparent', border: 'none',
                        borderBottom: `1px solid ${C.border1}`,
                        padding: '16px 24px',
                        cursor: clickable ? 'pointer' : 'default',
                        opacity: clickable ? 1 : 0.85,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                          v{v.version}
                        </span>
                        <Pill kind={STATUS_TO_PILL[v.status]} dot>{t(`status.${v.status}`)}</Pill>
                      </div>
                      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55 }}>
                        <span title={formatAbsolute(v.created_at)}>{formatRelative(v.created_at)}</span>
                        {v.created_by_email && <> · {v.created_by_email}</>}
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                        {v.is_current && (
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.red, background: 'rgba(240,45,20,0.08)', padding: '3px 8px' }}>
                            {t('current')}
                          </span>
                        )}
                        {v.status === 'published' && (
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, background: 'rgba(0,0,0,0.05)', padding: '3px 8px' }}>
                            {t('publishedTag')}
                          </span>
                        )}
                        {v.restored_from_version != null && (
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, background: 'rgba(0,0,0,0.05)', padding: '3px 8px' }}>
                            {t('restoredFrom', { version: v.restored_from_version })}
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {selected && (
            <div style={{ padding: '20px 24px' }}>
              <button
                onClick={() => setSelectedId(null)}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: C.muted, padding: 0, marginBottom: 18,
                }}
              >
                {t('backToList')}
              </button>

              <div style={{ marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid ${C.border1}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <Pill kind={STATUS_TO_PILL[selected.status]} dot>{t(`status.${selected.status}`)}</Pill>
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {formatAbsolute(selected.created_at)}
                  {selected.created_by_email && <> · {selected.created_by_email}</>}
                  {selected.restored_from_version != null && <> · {t('restoredFrom', { version: selected.restored_from_version })}</>}
                </div>
              </div>

              {Object.keys(selected.sections).length === 0 && (
                <div style={{ color: C.muted, fontSize: 13 }}>{t('emptyContent')}</div>
              )}
              {Object.entries(selected.sections).map(([key, content]) => (
                <div key={key} style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: 6 }}>
                    {sectionLabel(key)}
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: content?.trim() ? C.black : C.muted, fontStyle: content?.trim() ? 'normal' : 'italic' }}>
                    {content?.trim() ? content : t('emptySection')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <footer style={{ padding: '16px 24px', borderTop: `1px solid ${C.border1}`, display: 'flex', justifyContent: 'flex-end' }}>
            <Btn variant="primary" size="sm" onClick={() => setConfirmId(selected.id)}>
              {t('restoreThisVersion')}
            </Btn>
          </footer>
        )}
      </aside>

      {confirmTarget && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: C.bone, padding: '36px 40px', maxWidth: 460, width: 'calc(100% - 32px)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 10 }}>
              {t('restoreConfirmTitle', { version: confirmTarget.version })}
            </div>
            <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 24 }}>
              {t('restoreConfirmBody', { date: formatAbsolute(confirmTarget.created_at) })}
            </div>
            {restoreError && (
              <div style={{ color: C.red, fontSize: 13, marginBottom: 14 }}>{restoreError}</div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="ghost" size="sm" onClick={() => { setConfirmId(null); setRestoreError(null); }} disabled={isPending}>
                {tCommon('cancel')}
              </Btn>
              <Btn variant="primary" size="sm" onClick={() => handleRestore(confirmTarget.id)} disabled={isPending}>
                {isPending ? t('restoring') : t('restore')}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
