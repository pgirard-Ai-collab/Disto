/* global React, DISTO_C, Sidebar, TopBar, Eyebrow, Btn, Pill, SectionHead */
/* 2d — Gestion des accès. Invite list, roles, status. Dark sidebar, light body. */
const C4 = DISTO_C;

function AccessScreen() {
  const users = [
    { name: 'Jean-Simon Auclair',   email: 'js@sartiga.co',        role: 'Admin',    status: 'active',   last: 'il y a 2 h',    brand: 'SARTIGA' },
    { name: 'Mireille Bouchard',    email: 'mireille@sartiga.co',  role: 'Admin',    status: 'active',   last: 'Hier',           brand: 'SARTIGA' },
    { name: 'Amélie Côté',          email: 'amelie@sartiga.co',    role: 'Lecteur',  status: 'active',   last: 'il y a 3 j',     brand: 'SARTIGA' },
    { name: 'Philippe Ouellet',     email: 'p.ouellet@sartiga.co', role: 'Lecteur',  status: 'invited',  last: 'Invité 2 mai',   brand: 'SARTIGA' },
    { name: 'Claude Trudel',        email: 'claude@agence-x.ca',   role: 'Lecteur',  status: 'invited',  last: 'Invité 30 avr',  brand: 'SARTIGA' },
    { name: 'Florence Lavigne',     email: 'f.lavigne@sartiga.co', role: 'Admin',    status: 'disabled', last: 'il y a 1 mois',  brand: 'SARTIGA' },
  ];

  return (
    <div style={{
      width: 1440, height: 900, display: 'flex',
      background: C4.bone, color: C4.black, fontFamily: 'Archivo, sans-serif',
    }}>
      <Sidebar variant="agency" active="access" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar
          theme="light"
          crumbs={['betula', 'SARTIGA', 'Accès']}
          right={
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="ghost" size="sm">Exporter la liste</Btn>
              <Btn variant="primary" size="sm">+  Inviter</Btn>
            </div>
          }
        />

        <div style={{ padding: '36px 40px 40px', overflow: 'auto' }}>
          <SectionHead
            num="04"
            eyebrow="SARTIGA · Accès & permissions"
            title="Qui peut lire, qui peut écrire."
            subtitle="Un Admin modifie la structure et publie. Un Lecteur consulte le portail et interroge l’IA — jamais plus."
          />

          {/* Invite card */}
          <div style={{
            background: C4.black, color: C4.bone, padding: '28px 32px',
            marginBottom: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
          }}>
            <div>
              <Eyebrow color={C4.red} style={{ marginBottom: 8 }}>Nouvelle invitation</Eyebrow>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em' }}>
                Ajouter un gardien de marque.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flex: 1, maxWidth: 720, marginLeft: 40 }}>
              <div style={{ flex: 2 }}>
                <Eyebrow color={C4.fg3} style={{ fontSize: 10, marginBottom: 6 }}>Courriel</Eyebrow>
                <div style={{
                  borderBottom: `1.5px solid ${C4.lineStrong}`, paddingBottom: 8, fontSize: 16, color: C4.bone,
                }}>
                  prenom.nom@marque.co
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <Eyebrow color={C4.fg3} style={{ fontSize: 10, marginBottom: 6 }}>Rôle</Eyebrow>
                <div style={{ display: 'flex', gap: 0, border: `1px solid ${C4.line2}` }}>
                  <div style={{
                    flex: 1, padding: '10px 0', textAlign: 'center',
                    background: C4.red, color: '#fff',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                  }}>Admin</div>
                  <div style={{
                    flex: 1, padding: '10px 0', textAlign: 'center',
                    color: C4.boneDim,
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                    borderLeft: `1px solid ${C4.line2}`,
                  }}>Lecteur</div>
                </div>
              </div>

              <Btn variant="primary" size="md">Envoyer  →</Btn>
            </div>
          </div>

          {/* Counts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: `1px solid rgba(0,0,0,0.12)`, background: '#FFFFFF', marginBottom: 32 }}>
            {[
              { n: '06', l: 'Utilisateurs totaux', accent: C4.black },
              { n: '03', l: 'Admins',              accent: C4.red },
              { n: '02', l: 'Invités en attente',  accent: C4.cyan },
              { n: '01', l: 'Désactivés',          accent: C4.muted },
            ].map((k, i, a) => (
              <div key={i} style={{
                padding: '20px 24px',
                borderRight: i < a.length - 1 ? `1px solid rgba(0,0,0,0.08)` : 'none',
              }}>
                <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.02em', color: k.accent, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {k.n}
                </div>
                <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C4.muted }}>
                  {k.l}
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em' }}>
              Utilisateurs SARTIGA
            </div>
            <div style={{ display: 'flex', gap: 18, fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C4.muted }}>
              <span style={{ color: C4.black, borderBottom: `2px solid ${C4.red}`, paddingBottom: 4 }}>Tous</span>
              <span>Admins</span>
              <span>Lecteurs</span>
              <span>Invités</span>
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: `1px solid rgba(0,0,0,0.12)` }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 80px',
              padding: '14px 24px', borderBottom: `1px solid rgba(0,0,0,0.12)`,
              fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C4.muted,
            }}>
              <span>Utilisateur</span>
              <span>Courriel</span>
              <span>Rôle</span>
              <span>Statut</span>
              <span>Activité</span>
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
                    width: 32, height: 32, background: i % 2 ? C4.stone : C4.clay, color: C4.black,
                    display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700,
                  }}>
                    {u.name.split(' ').map(p => p[0]).slice(0, 2).join('')}
                  </div>
                  <span style={{ fontWeight: 700, letterSpacing: '-0.005em' }}>{u.name}</span>
                </div>
                <span style={{ color: C4.muted, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{u.email}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                  color: u.role === 'Admin' ? C4.red : C4.black,
                }}>{u.role}</span>
                <span><Pill kind={u.status}>{u.status === 'active' ? 'Actif' : u.status === 'invited' ? 'Invité' : 'Désactivé'}</Pill></span>
                <span style={{ color: C4.muted, fontSize: 12 }}>{u.last}</span>
                <span style={{ textAlign: 'right', color: C4.muted, fontSize: 18 }}>⋯</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.AccessScreen = AccessScreen;
