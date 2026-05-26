'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { C } from '@/lib/disto';
import Btn from '@/components/ui/Btn';
import Eyebrow from '@/components/ui/Eyebrow';
import Pill from '@/components/ui/Pill';
import { createClient } from '@/lib/supabase/browser';

type StepKey = 'upload' | 'extract' | 'llm' | 'save';
type StepState = 'pending' | 'running' | 'done' | 'error';
type Step = { key: StepKey; state: StepState; meta?: string };

const STEP_I18N: Record<StepKey, 'upload' | 'extraction' | 'structuring' | 'save'> = {
  upload:  'upload',
  extract: 'extraction',
  llm:     'structuring',
  save:    'save',
};

const INITIAL_STEPS: Step[] = [
  { key: 'upload',  state: 'pending' },
  { key: 'extract', state: 'pending' },
  { key: 'llm',     state: 'pending' },
  { key: 'save',    state: 'pending' },
];

type ExistingStructure = { id: string; version: number; status: string } | null;
type ActiveJob = { id: string; status: string; steps: Step[]; error: string | null };

type Props = {
  clientId: string;
  existing: ExistingStructure;
  activeJob: ActiveJob | null;
};

export default function ImportPanel({ clientId, existing, activeJob }: Props) {
  const t = useTranslations('admin.import');
  const tCommon = useTranslations('common');
  const tStep = useTranslations('admin.import.step');
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [steps, setSteps] = useState<Step[]>(activeJob?.steps ?? INITIAL_STEPS);
  const [jobId, setJobId] = useState<string | null>(activeJob?.id ?? null);
  const [jobStatus, setJobStatus] = useState<string>(activeJob?.status ?? 'idle');
  const [error, setError] = useState<string | null>(activeJob?.error ?? null);
  const [showModeDialog, setShowModeDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = useRef(createClient()).current;

  const running = jobStatus === 'pending' || jobStatus === 'running';
  const done = jobStatus === 'done';

  useEffect(() => {
    if (!jobId) return;
    const channel = supabase
      .channel(`ingest:${jobId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'ingestion_jobs', filter: `id=eq.${jobId}` },
        (payload) => {
          const row = payload.new as { status: string; steps: Step[]; error: string | null };
          setSteps(row.steps ?? INITIAL_STEPS);
          setJobStatus(row.status);
          if (row.error) setError(row.error);
        },
      )
      .subscribe((status, err) => {
        if (err) console.error('[Realtime] subscription error', err);
      });

    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  function handleFile(f: File) {
    if (f.type !== 'application/pdf') { setError(t('pdfOnly')); return; }
    if (f.size > 50 * 1024 * 1024) { setError(t('tooBig')); return; }
    setError(null);
    setFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function startIngestion(selectedMode: 'replace' | 'version') {
    if (!file) return;
    setShowModeDialog(false);
    setError(null);
    setSteps(INITIAL_STEPS);
    setJobStatus('pending');

    const fd = new FormData();
    fd.append('file', file);
    fd.append('clientId', clientId);
    fd.append('mode', selectedMode);

    try {
      const res = await fetch('/api/ingest', { method: 'POST', body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? t('serverError'));
      }
      const { jobId: newJobId } = await res.json();
      setJobId(newJobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unknownError'));
      setJobStatus('error');
    }
  }

  function handleImportClick() {
    if (!file) return;
    if (existing) { setShowModeDialog(true); return; }
    startIngestion('replace');
  }

  const doneCount = steps.filter(s => s.state === 'done').length;
  const progressPct = (doneCount / steps.length) * 100;

  return (
    <div>
      {showModeDialog && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: C.bone, padding: '36px 40px', maxWidth: 460, width: '100%' }}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 10 }}>
              {t('existingStructureTitle')}
            </div>
            <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.55, marginBottom: 28 }}>
              {t('existingStructureBody', { version: existing?.version ?? 0 })}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="ghost" size="sm" onClick={() => setShowModeDialog(false)}>{tCommon('cancel')}</Btn>
              <Btn variant="secondary" size="sm" onClick={() => startIngestion('version')}>{t('newVersion')}</Btn>
              <Btn variant="primary" size="sm" onClick={() => startIngestion('replace')}>{t('replace')}</Btn>
            </div>
          </div>
        </div>
      )}

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `1.5px dashed ${dragging ? C.red : 'rgba(0,0,0,0.3)'}`,
          background: dragging ? 'rgba(240,45,20,0.03)' : C.white,
          padding: '28px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 24, marginBottom: 32, transition: 'border-color 0.15s',
        }}
      >
        {file ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, flex: 1 }}>
            <div style={{
              width: 58, height: 74, background: C.bone, border: `1.5px solid ${C.black}`,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '8px 6px',
              fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', flexShrink: 0,
            }}>
              <span style={{ color: C.red }}>{t('pdfTag')}</span>
              <span style={{ color: C.muted }}>{(file.size / 1024 / 1024).toFixed(1)} Mo</span>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: C.muted, textTransform: 'uppercase', marginBottom: 6 }}>
                {t('fileSelected')}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>{file.name}</div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 6 }}>
              {t('dropHere')}
            </div>
            <div style={{ fontSize: 13, color: C.muted }}>{t('fileHelp')}</div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <input ref={inputRef} type="file" accept="application/pdf" style={{ display: 'none' }}
            onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          <Btn variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>
            {file ? t('change') : t('choose')}
          </Btn>
          {file && !running && (
            <Btn variant="primary" size="sm" onClick={handleImportClick}>
              {t('launch')}
            </Btn>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(240,45,20,0.08)', color: C.red, fontSize: 13, marginBottom: 24 }}>
          {error}
          {jobStatus === 'error' && (
            <button onClick={() => { setError(null); setJobStatus('idle'); setJobId(null); setSteps(INITIAL_STEPS); }}
              style={{ marginLeft: 12, background: 'none', border: 'none', color: C.red, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.12em' }}>
              {t('retry')}
            </button>
          )}
        </div>
      )}

      {(running || done || steps.some(s => s.state !== 'pending')) && (
        <div style={{ background: C.white, border: `1px solid ${C.border1}`, padding: '28px 32px', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <Eyebrow color={C.muted}>{t('pipelineHeader')}</Eyebrow>
            {running && <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: C.red, textTransform: 'uppercase' }}>{t('inProgress')}</div>}
            {done && <Pill kind="validated">{t('done')}</Pill>}
          </div>

          <div style={{ height: 2, background: 'rgba(0,0,0,0.1)', marginBottom: 28, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: 2, width: `${progressPct}%`, background: C.red, transition: 'width 0.4s' }} />
          </div>

          <div className="grid-pipeline" style={{ gap: 0 }}>
            {steps.map(s => {
              const isDone = s.state === 'done';
              const isRunning = s.state === 'running';
              const isError = s.state === 'error';
              return (
                <div key={s.key} style={{ paddingRight: 20 }}>
                  <div style={{
                    width: 30, height: 30,
                    background: isDone ? C.red : isRunning ? C.black : isError ? C.red : C.bone,
                    border: `1.5px solid ${isDone || isRunning ? C.black : isError ? C.red : 'rgba(0,0,0,0.24)'}`,
                    color: isDone || isRunning || isError ? C.white : C.muted,
                    fontWeight: 700, fontSize: 11,
                    display: 'grid', placeItems: 'center', marginBottom: 14,
                  }}>
                    {isDone ? '✓' : isError ? '✕' : isRunning ? '…' : '—'}
                  </div>
                  <Eyebrow color={isRunning ? C.red : isDone ? C.black : C.muted} style={{ fontSize: 10, marginBottom: 6 }}>
                    {tStep(STEP_I18N[s.key])}
                  </Eyebrow>
                  {s.meta && (
                    <div style={{ fontSize: 13, fontWeight: 500, color: isDone ? C.black : C.muted }}>
                      {s.meta}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {done && (
        <div style={{ display: 'flex', gap: 12 }}>
          <Btn variant="primary" size="sm" onClick={() => router.push(`/clients/${clientId}/editor`)}>
            {t('openEditor')}
          </Btn>
        </div>
      )}
    </div>
  );
}
