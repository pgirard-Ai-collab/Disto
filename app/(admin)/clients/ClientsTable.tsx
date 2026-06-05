'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { C } from '@/lib/disto';
import type { PillKind } from '@/lib/disto';
import Btn from '@/components/ui/Btn';
import Pill from '@/components/ui/Pill';
import NewClientModal from './NewClientModal';
import { archiveClient, activateClient, deleteClient } from '@/app/actions/clients';

type Client = {
  id: string;
  org_name: string;
  brand_name: string;
  slug: string;
  status: PillKind;
  updated_at: string;
};

const FILTERS = ['all', 'active', 'draft', 'archived'] as const;
type Filter = typeof FILTERS[number];

const STATUS_FOR_FILTER: Record<Filter, string | null> = {
  all: null,
  active: 'active',
  draft: 'draft',
  archived: 'archived',
};

type ConfirmDialog =
  | { mode: 'archive'; id: string; name: string }
  | { mode: 'activate'; id: string; name: string }
  | { mode: 'delete'; id: string; name: string }
  | null;

export default function ClientsTable({ clients }: { clients: Client[] }) {
  const t = useTranslations('admin.clients');
  const tStatus = useTranslations('status');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const dateLocale = locale === 'fr' ? 'fr-CA' : 'en-CA';

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' });

  const [filter, setFilter] = useState<Filter>('all');
  const [showModal, setShowModal] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmDialog>(null);
  const [deleteInput, setDeleteInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localClients, setLocalClients] = useState(clients);

  const filtered = localClients.filter(c => {
    const f = STATUS_FOR_FILTER[filter];
    return f === null || c.status === f;
  });

  const counts: Record<Filter, number> = {
    all: localClients.length,
    active: localClients.filter(c => c.status === 'active').length,
    draft: localClients.filter(c => c.status === 'draft').length,
    archived: localClients.filter(c => c.status === 'archived').length,
  };

  function closeConfirm() {
    setConfirm(null);
    setDeleteInput('');
    setActionError(null);
  }

  function runAction() {
    if (!confirm) return;
    if (confirm.mode === 'delete') {
      const { id, name } = confirm;
      closeConfirm();
      startTransition(async () => {
        const result = await deleteClient(id);
        if (!result.success) {
          setActionError(result.error);
        } else {
          setLocalClients(prev => prev.filter(c => c.id !== id));
          setSuccessMessage(t('deleteSuccess', { name }));
          setTimeout(() => setSuccessMessage(null), 4000);
        }
      });
      return;
    }
    const action = confirm.mode === 'archive' ? archiveClient : activateClient;
    const id = confirm.id;
    closeConfirm();
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
              {confirm.mode === 'delete'
                ? t('deleteConfirmTitle', { name: confirm.name })
                : confirm.mode === 'archive' ? t('archiveConfirmTitle') : t('unarchiveConfirmTitle')}
            </div>
            <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.55, marginBottom: 28 }}>
              {confirm.mode === 'delete'
                ? t('deleteConfirmBody')
                : t.rich(
                    confirm.mode === 'archive' ? 'archiveConfirmBody' : 'unarchiveConfirmBody',
                    {
                      name: confirm.name,
                      strong: (chunks) => <strong style={{ color: C.black }}>{chunks}</strong>,
                    },
                  )}
            </div>
            {confirm.mode === 'delete' && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>
                  {t('deleteConfirmInputLabel')}
                </label>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%', padding: '10px 12px', fontSize: 14,
                    border: `1px solid ${C.border2}`, background: C.white,
                    color: C.black, outline: 'none', boxSizing: 'border-box',
                  }}
                />
                {actionError && (
                  <div style={{ color: C.red, fontSize: 12, marginTop: 8 }}>{actionError}</div>
                )}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="ghost" size="sm" onClick={closeConfirm}>{tCommon('cancel')}</Btn>
              {confirm.mode === 'delete' ? (
                <Btn
                  variant="primary"
                  size="sm"
                  onClick={runAction}
                  disabled={isPending || deleteInput !== confirm.name}
                  style={{ background: C.red, borderColor: C.red }}
                >
                  {t('delete')}
                </Btn>
              ) : (
                <Btn variant="primary" size="sm" onClick={runAction} disabled={isPending}>
                  {confirm.mode === 'archive' ? t('archive') : t('unarchive')}
                </Btn>
              )}
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
              {t(`filter.${f}`)}
              <span style={{ color: filter === f ? C.bone : C.muted, fontSize: 11 }}>{counts[f]}</span>
            </button>
          ))}
        </div>
        <Btn variant="primary" size="sm" onClick={() => setShowModal(true)}>{t('newClient')}</Btn>
      </div>

      {successMessage && (
        <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.04)', color: C.black, fontSize: 13, marginBottom: 16 }}>
          {successMessage}
        </div>
      )}

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
            <span>{t('table.num')}</span>
            <span>{t('table.brand')}</span>
            <span>{t('table.organization')}</span>
            <span>{t('table.status')}</span>
            <span>{t('table.lastUpdate')}</span>
            <span style={{ textAlign: 'right' }}>—</span>
          </div>

          {filtered.length === 0 && (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: C.muted, fontSize: 14 }}>
              {filter === 'all'
                ? t('table.emptyAll')
                : t('table.emptyFiltered', { filter: t(`filter.${filter}`) })}
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
              <span>
                <Pill kind={c.status}>{tStatus(c.status)}</Pill>
              </span>
              <span style={{ color: C.muted, fontSize: 13 }}>{formatDate(c.updated_at)}</span>
              <span style={{ textAlign: 'right', display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center' }}>
                {c.status === 'archived' ? (
                  <button
                    onClick={() => setConfirm({ mode: 'activate', id: c.id, name: c.brand_name })}
                    disabled={isPending}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.red, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}
                  >
                    {t('unarchive')}
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirm({ mode: 'archive', id: c.id, name: c.brand_name })}
                    disabled={isPending}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}
                  >
                    {t('archive')}
                  </button>
                )}
                <button
                  onClick={() => { setDeleteInput(''); setConfirm({ mode: 'delete', id: c.id, name: c.brand_name }); }}
                  disabled={isPending}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.red, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}
                >
                  {t('delete')}
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', padding: '14px 4px',
        fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted,
      }}>
        <span>
          {t(clients.length > 1 ? 'countPlural' : 'countSingular', { count: filtered.length, total: clients.length })}
        </span>
        <span>{t('sort')}</span>
      </div>
    </>
  );
}

