'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { C, STATUS_LABEL } from '@/lib/disto';
import type { PillKind } from '@/lib/disto';
import Btn from '@/components/ui/Btn';
import Pill from '@/components/ui/Pill';
import NewClientModal from './NewClientModal';
import { archiveClient, activateClient } from '@/app/actions/clients';

type Client = {
  id: string;
  org_name: string;
  brand_name: string;
  slug: string;
  status: PillKind;
  updated_at: string;
};

const FILTERS = ['Tous', 'Actif', 'Brouillon', 'Archivé'] as const;
type Filter = typeof FILTERS[number];

const STATUS_FILTER: Record<Filter, string | null> = {
  'Tous': null,
  'Actif': 'active',
  'Brouillon': 'draft',
  'Archivé': 'archived',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' });
}

type ConfirmDialog =
  | { mode: 'archive'; id: string; name: string }
  | { mode: 'activate'; id: string; name: string }
  | null;

export default function ClientsTable({ clients }: { clients: Client[] }) {
  const [filter, setFilter] = useState<Filter>('Tous');
  const [showModal, setShowModal] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmDialog>(null);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = clients.filter(c => {
    const f = STATUS_FILTER[filter];
    return f === null || c.status === f;
  });

  const counts: Record<Filter, number> = {
    'Tous': clients.length,
    'Actif': clients.filter(c => c.status === 'active').length,
    'Brouillon': clients.filter(c => c.status === 'draft').length,
    'Archivé': clients.filter(c => c.status === 'archived').length,
  };

  function runAction() {
    if (!confirm) return;
    const action = confirm.mode === 'archive' ? archiveClient : activateClient;
    const id = confirm.id;
    setConfirm(null);
    setActionError(null);
    startTransition(async () => {
      const result = await action(id);
      if (!result.success) setActionError(result.error);
    });
  }

  return (
    <>
      {showModal && <NewClientModal onClose={() => setShowModal(false)} />}

      {confirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: C.bone, padding: '36px 40px', maxWidth: 420, width: '100%' }}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 10 }}>
              {confirm.mode === 'archive' ? 'Archiver ce client ?' : 'Réactiver ce client ?'}
            </div>
            <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.55, marginBottom: 28 }}>
              {confirm.mode === 'archive'
                ? <>Le client <strong>{confirm.name}</strong> sera marqué comme archivé. Ses données sont conservées.</>
                : <>Le client <strong>{confirm.name}</strong> redeviendra actif.</>}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="ghost" size="sm" onClick={() => setConfirm(null)}>Annuler</Btn>
              <Btn variant="primary" size="sm" onClick={runAction} disabled={isPending}>
                {confirm.mode === 'archive' ? 'Archiver' : 'Réactiver'}
              </Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 0, border: `1px solid ${C.border2}` }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '10px 18px',
                background: filter === f ? C.black : 'transparent',
                color: filter === f ? C.bone : C.black,
                fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                display: 'flex', gap: 10, alignItems: 'center',
                cursor: 'pointer',
                border: 'none', borderRight: `1px solid ${C.border2}`,
              }}
            >
              {f}
              <span style={{ color: filter === f ? C.bone : C.muted, fontSize: 11 }}>{counts[f]}</span>
            </button>
          ))}
        </div>
        <Btn variant="primary" size="sm" onClick={() => setShowModal(true)}>+ Nouveau client</Btn>
      </div>

      {actionError && (
        <div style={{ padding: '10px 14px', background: 'rgba(240,45,20,0.08)', color: C.red, fontSize: 13, marginBottom: 16 }}>
          {actionError}
        </div>
      )}

      <div className="table-scroll">
        <div style={{ background: C.white, border: `1px solid ${C.border1}`, minWidth: 580 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '44px 1.4fr 1.6fr 0.9fr 1.2fr 120px',
            padding: '14px 20px', borderBottom: `1px solid ${C.border1}`,
            fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted,
          }}>
            <span>№</span><span>Marque</span><span>Organisation</span><span>Statut</span><span>Dernière MAJ</span><span style={{ textAlign: 'right' }}>—</span>
          </div>

          {filtered.length === 0 && (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: C.muted, fontSize: 14 }}>
              Aucun client {filter !== 'Tous' ? `avec le statut « ${filter} »` : ''}.
            </div>
          )}

          {filtered.map((c, i) => (
            <div key={c.id} style={{
              display: 'grid', gridTemplateColumns: '44px 1.4fr 1.6fr 0.9fr 1.2fr 120px',
              padding: '16px 20px', alignItems: 'center',
              borderBottom: i < filtered.length - 1 ? `1px solid rgba(0,0,0,0.08)` : 'none',
              fontSize: 14,
              opacity: c.status === 'archived' ? 0.6 : 1,
            }}>
              <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: C.muted, fontSize: 12, letterSpacing: '0.08em' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <Link href={`/clients/${c.id}/import`} style={{ fontWeight: 700, letterSpacing: '-0.005em', color: C.black, textDecoration: 'none' }}>
                {c.brand_name}
              </Link>
              <span style={{ color: C.muted }}>{c.org_name}</span>
              <span><Pill kind={c.status}>{STATUS_LABEL[c.status] ?? c.status}</Pill></span>
              <span style={{ color: C.muted, fontSize: 13 }}>{formatDate(c.updated_at)}</span>
              <span style={{ textAlign: 'right' }}>
                {c.status === 'archived' ? (
                  <button
                    onClick={() => setConfirm({ mode: 'activate', id: c.id, name: c.brand_name })}
                    disabled={isPending}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.red, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}
                  >
                    Réactiver
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirm({ mode: 'archive', id: c.id, name: c.brand_name })}
                    disabled={isPending}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}
                  >
                    Archiver
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', padding: '14px 4px',
        fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted,
      }}>
        <span>{filtered.length} sur {clients.length} marque{clients.length > 1 ? 's' : ''}</span>
        <span>Tri · Dernière MAJ ↓</span>
      </div>
    </>
  );
}
