import { createAdminClient, createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { C, STATUS_LABEL } from '@/lib/disto';
import type { PillKind } from '@/lib/disto';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import UserMenu from '@/components/layout/UserMenu';
import SectionHead from '@/components/ui/SectionHead';
import Pill from '@/components/ui/Pill';
import InviteForm from './InviteForm';
import DisableUserBtn from './DisableUserBtn';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_TO_PILL: Record<'invited' | 'active' | 'disabled', PillKind> = {
  invited: 'invited',
  active: 'active',
  disabled: 'disabled',
};

export default async function AccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

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

  // Batch fetch all user emails in one shot (avoids N+1)
  type UserRow = {
    id: string;
    user_id: string;
    email: string;
    role: string;
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
        role: cu.role === 'admin' ? 'Admin' : 'Lecteur',
        status: cu.status as 'invited' | 'active' | 'disabled',
        invited_at: cu.invited_at,
      });
    }
  }

  const stats = [
    { n: String(users.length).padStart(2, '0'),                                       l: 'Utilisateurs totaux',  accent: C.black },
    { n: String(users.filter(u => u.role === 'Admin').length).padStart(2, '0'),       l: 'Admins',               accent: C.red },
    { n: String(users.filter(u => u.status === 'invited').length).padStart(2, '0'),   l: 'Invités en attente',   accent: C.cyan },
    { n: String(users.filter(u => u.status === 'disabled').length).padStart(2, '0'),  l: 'Désactivés',           accent: C.muted },
  ];

  return (
    <div className="portal-layout" style={{ background: C.bone, color: C.black }}>
      <Sidebar variant="agency" clientId={id} />
      <div className="portal-main">
        <TopBar
          theme="light"
          crumbs={['betula', client.brand_name, 'Accès']}
          right={<UserMenu theme="light" />}
        />
        <div className="portal-scroll" style={{ padding: '36px 40px 40px' }}>
          <SectionHead
            num="04"
            eyebrow={`${client.brand_name} · Accès & permissions`}
            title="Qui peut lire, qui peut écrire."
            subtitle="Un Admin modifie la structure et publie. Un Lecteur consulte le portail et interroge l'IA — jamais plus."
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
            Utilisateurs {client.brand_name}
          </div>

          {users.length === 0 ? (
            <div style={{ padding: '32px 20px', background: C.white, border: `1px solid ${C.border1}`, textAlign: 'center', color: C.muted, fontSize: 14 }}>
              Aucun utilisateur invité pour l&apos;instant.
            </div>
          ) : (
            <div className="table-scroll">
              <div style={{ background: C.white, border: `1px solid ${C.border1}`, minWidth: 560 }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1.2fr 80px',
                  padding: '14px 24px', borderBottom: `1px solid ${C.border1}`,
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted,
                }}>
                  <span>Courriel</span><span>Rôle</span><span>Statut</span><span>Invité le</span><span style={{ textAlign: 'right' }}>—</span>
                </div>
                {users.map((u, i) => {
                  const pillKind = STATUS_TO_PILL[u.status];
                  return (
                    <div key={u.id} style={{
                      display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1.2fr 80px',
                      padding: '16px 24px', alignItems: 'center',
                      borderBottom: i < users.length - 1 ? `1px solid rgba(0,0,0,0.08)` : 'none',
                      fontSize: 14,
                      opacity: u.status === 'disabled' ? 0.5 : 1,
                    }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: C.muted }}>{u.email}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: u.role === 'Admin' ? C.red : C.black }}>{u.role}</span>
                      <Pill kind={pillKind}>{STATUS_LABEL[u.status] ?? u.status}</Pill>
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
