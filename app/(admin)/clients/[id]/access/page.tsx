import { C, STATUS_LABEL } from '@/lib/disto';
import type { PillKind } from '@/lib/disto';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import UserMenu from '@/components/layout/UserMenu';
import SectionHead from '@/components/ui/SectionHead';
import Btn from '@/components/ui/Btn';
import Pill from '@/components/ui/Pill';
import Eyebrow from '@/components/ui/Eyebrow';
import InviteForm from './InviteForm';
import DisableUserBtn from './DisableUserBtn';

const users = [
  { id: 'u1', name: 'Jean-Simon Auclair',  email: 'js@sartiga.co',        role: 'Admin',   status: 'active',   last: 'il y a 2 h' },
  { id: 'u2', name: 'Mireille Bouchard',   email: 'mireille@sartiga.co',  role: 'Admin',   status: 'active',   last: 'Hier' },
  { id: 'u3', name: 'Amélie Côté',         email: 'amelie@sartiga.co',    role: 'Lecteur', status: 'active',   last: 'il y a 3 j' },
  { id: 'u4', name: 'Philippe Ouellet',    email: 'p.ouellet@sartiga.co', role: 'Lecteur', status: 'invited',  last: 'Invité 2 mai' },
  { id: 'u5', name: 'Claude Trudel',       email: 'claude@agence-x.ca',   role: 'Lecteur', status: 'invited',  last: 'Invité 30 avr' },
  { id: 'u6', name: 'Florence Lavigne',    email: 'f.lavigne@sartiga.co', role: 'Admin',   status: 'disabled', last: 'il y a 1 mois' },
] satisfies { id: string; name: string; email: string; role: string; status: PillKind; last: string }[];

const stats = [
  { n: '06', l: 'Utilisateurs totaux', accent: C.black },
  { n: '03', l: 'Admins',              accent: C.red },
  { n: '02', l: 'Invités en attente',  accent: C.cyan },
  { n: '01', l: 'Désactivés',          accent: C.muted },
];

export default async function AccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="portal-layout" style={{ background: C.bone, color: C.black }}>
      <Sidebar variant="agency" clientId={id} />
      <div className="portal-main">
        <TopBar
          theme="light"
          crumbs={['betula', 'SARTIGA', 'Accès']}
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Btn variant="ghost" size="sm">Exporter la liste</Btn>
              <UserMenu theme="light" />
            </div>
          }
        />

        <div className="portal-scroll" style={{ padding: '36px 40px 40px' }}>
          <SectionHead
            num="04"
            eyebrow="SARTIGA · Accès & permissions"
            title="Qui peut lire, qui peut écrire."
            subtitle="Un Admin modifie la structure et publie. Un Lecteur consulte le portail et interroge l'IA — jamais plus."
          />

          {/* Invite form */}
          <InviteForm brandSlug={id} />

          {/* Stats */}
          <div className="grid-4" style={{ gap: 0, border: `1px solid ${C.border1}`, background: '#FFFFFF', marginBottom: 32 }}>
            {stats.map((k, i) => (
              <div key={i} style={{ padding: '20px 24px', borderRight: i < stats.length - 1 ? `1px solid rgba(0,0,0,0.08)` : 'none' }}>
                <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.02em', color: k.accent, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{k.n}</div>
                <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted }}>{k.l}</div>
              </div>
            ))}
          </div>

          {/* Table header */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em' }}>Utilisateurs SARTIGA</div>
            <div style={{ display: 'flex', gap: 18, fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted }}>
              <span style={{ color: C.black, borderBottom: `2px solid ${C.red}`, paddingBottom: 4 }}>Tous</span>
              <span>Admins</span>
              <span>Lecteurs</span>
              <span>Invités</span>
            </div>
          </div>

          <div className="table-scroll">
            <div style={{ background: '#FFFFFF', border: `1px solid ${C.border1}`, minWidth: 600 }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 80px',
                padding: '14px 24px', borderBottom: `1px solid ${C.border1}`,
                fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted,
              }}>
                <span>Utilisateur</span><span>Courriel</span><span>Rôle</span><span>Statut</span><span>Activité</span>
                <span style={{ textAlign: 'right' }}>—</span>
              </div>
              {users.map((u, i) => (
                <div key={u.email} style={{
                  display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 80px',
                  padding: '16px 24px', alignItems: 'center',
                  borderBottom: i < users.length - 1 ? `1px solid rgba(0,0,0,0.08)` : 'none',
                  fontSize: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 32, height: 32, background: i % 2 ? C.stone : C.clay, color: C.black,
                      display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700,
                    }}>
                      {u.name.split(' ').map(p => p[0]).slice(0, 2).join('')}
                    </div>
                    <span style={{ fontWeight: 700 }}>{u.name}</span>
                  </div>
                  <span style={{ color: C.muted, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{u.email}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: u.role === 'Admin' ? C.red : C.black }}>{u.role}</span>
                  <Pill kind={u.status}>{STATUS_LABEL[u.status]}</Pill>
                  <span style={{ color: C.muted, fontSize: 12 }}>{u.last}</span>
                  <span style={{ textAlign: 'right' }}>
                    {u.status !== 'disabled' && (
                      <DisableUserBtn userId={u.id} userName={u.name} />
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
