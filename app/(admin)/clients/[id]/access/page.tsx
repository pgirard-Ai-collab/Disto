import { createAdminClient, createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { C } from '@/lib/disto';
import type { PillKind } from '@/lib/disto';
import Sidebar from '@/components/layout/Sidebar';
import UserMenu from '@/components/layout/UserMenu';
import I18nTopBar from '@/components/i18n/I18nTopBar';
import I18nSectionHead from '@/components/i18n/I18nSectionHead';
import Pill from '@/components/ui/Pill';
import { hasPublishedStructure } from '@/lib/has-published';
import InviteForm from './InviteForm';
import DisableUserBtn from './DisableUserBtn';

const STATUS_TO_PILL: Record<'invited' | 'active' | 'disabled', PillKind> = {
  invited: 'invited',
  active: 'active',
  disabled: 'disabled',
};

export default async function AccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const t = await getTranslations('admin.access');
  const tStatus = await getTranslations('status');
  const tInvite = await getTranslations('admin.inviteForm');
  const locale = await getLocale();
  const dateLocale = locale === 'fr' ? 'fr-CA' : 'en-CA';
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' });

  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .select('id, brand_name')
    .eq('id', id)
    .single();

  if (clientErr || !client) notFound();

  const { data: clientUsers } = await supabase
    .from('client_users')
    .select('id, user_id, role, status, invited_at')
    .eq('client_id', id)
    .order('invited_at', { ascending: false });

  type UserRow = {
    id: string;
    user_id: string;
    email: string;
    role: 'admin' | 'reader';
    status: 'invited' | 'active' | 'disabled';
    invited_at: string;
  };

  const users: UserRow[] = [];
  if (clientUsers && clientUsers.length > 0) {
    const admin = await createAdminClient();
    const { data: { users: authUsers } } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const emailById = new Map(authUsers.map(u => [u.id, u.email ?? '']));
    for (const cu of clientUsers) {
      users.push({
        id: cu.id,
        user_id: cu.user_id,
        email: emailById.get(cu.user_id) ?? cu.user_id,
        role: (cu.role === 'admin' ? 'admin' : 'reader'),
        status: cu.status as 'invited' | 'active' | 'disabled',
        invited_at: cu.invited_at,
      });
    }
  }

  const hasPublished = await hasPublishedStructure(id);

  const stats = [
    { n: String(users.length).padStart(2, '0'),                                       l: t('stats.totalUsers'),    accent: C.black },
    { n: String(users.filter(u => u.role === 'admin').length).padStart(2, '0'),       l: t('stats.admins'),        accent: C.red },
    { n: String(users.filter(u => u.status === 'invited').length).padStart(2, '0'),   l: t('stats.pendingInvites'),accent: C.cyan },
    { n: String(users.filter(u => u.status === 'disabled').length).padStart(2, '0'),  l: t('stats.disabled'),      accent: C.muted },
  ];

  return (
    <div className="portal-layout" style={{ background: C.bone, color: C.black }}>
      <Sidebar variant="agency" clientId={id} hasPublishedVersion={hasPublished} />
      <div className="portal-main">
        <I18nTopBar
          theme="light"
          crumbKeys={['crumbs.betula', 'crumbs.brand', 'crumbs.access']}
          crumbValues={{ 'crumbs.brand': { name: client.brand_name } }}
          right={<UserMenu theme="light" />}
        />
        <div className="portal-scroll" style={{ padding: '36px 40px 40px' }}>
          <I18nSectionHead
            num="04"
            eyebrowKey="admin.access.title"
            titleKey="admin.access.heading"
            subtitleKey="admin.access.subtitle"
          />

          <InviteForm clientId={id} />

          <div className="grid-4" style={{ gap: 0, border: `1px solid ${C.border1}`, background: C.white, marginBottom: 32 }}>
            {stats.map((k, i) => (
              <div key={i} style={{ padding: '20px 24px', borderRight: i < stats.length - 1 ? `1px solid rgba(0,0,0,0.08)` : 'none' }}>
                <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.02em', color: k.accent, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{k.n}</div>
                <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted }}>{k.l}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 14 }}>
            {t('usersHeading', { brand: client.brand_name })}
          </div>

          {users.length === 0 ? (
            <div style={{ padding: '32px 20px', background: C.white, border: `1px solid ${C.border1}`, textAlign: 'center', color: C.muted, fontSize: 14 }}>
              {t('empty')}
            </div>
          ) : (
            <div className="table-scroll">
              <div style={{ background: C.white, border: `1px solid ${C.border1}`, minWidth: 560 }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1.2fr 80px',
                  padding: '14px 24px', borderBottom: `1px solid ${C.border1}`,
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted,
                }}>
                  <span>{t('table.email')}</span>
                  <span>{t('table.role')}</span>
                  <span>{t('table.status')}</span>
                  <span>{t('table.invitedAt')}</span>
                  <span style={{ textAlign: 'right' }}>—</span>
                </div>
                {users.map((u, i) => {
                  const pillKind = STATUS_TO_PILL[u.status];
                  const roleLabel = u.role === 'admin' ? tInvite('roleAdmin') : tInvite('roleReader');
                  return (
                    <div key={u.id} style={{
                      display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1.2fr 80px',
                      padding: '16px 24px', alignItems: 'center',
                      borderBottom: i < users.length - 1 ? `1px solid rgba(0,0,0,0.08)` : 'none',
                      fontSize: 14,
                      opacity: u.status === 'disabled' ? 0.5 : 1,
                    }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: C.muted }}>{u.email}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: u.role === 'admin' ? C.red : C.black }}>{roleLabel}</span>
                      <Pill kind={pillKind}>{tStatus(u.status)}</Pill>
                      <span style={{ color: C.muted, fontSize: 12 }}>{formatDate(u.invited_at)}</span>
                      <span style={{ textAlign: 'right' }}>
                        <DisableUserBtn
                          clientUserId={u.id}
                          userId={u.user_id}
                          userName={u.email}
                          status={u.status}
                          clientId={id}
                        />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
