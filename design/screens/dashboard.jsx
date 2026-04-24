/* global React, DISTO_C, Sidebar, TopBar, Eyebrow, Btn, Pill */
/* 3a — Dashboard marque (client portal). Header + 4 summary cards + 2 CTAs.
   Dark — DISTO native stance. Content is SARTIGA placeholder.                */
const C5 = DISTO_C;

function DashboardScreen() {
  const cards = [
    {
      n: '01', label: 'Mission', tag: 'Validée',
      title: 'Ralentir, le temps d’un rituel.',
      body: 'Offrir une expérience de thermothérapie fondée sur le silence, la chaleur et la forêt — à quatre heures du monde.',
    },
    {
      n: '02', label: 'Archétype', tag: 'Validée',
      title: 'Le Sage.',
      body: 'Calme, patient, enraciné. Parle peu, tient longtemps. La chaleur comme professeure.',
    },
    {
      n: '03', label: 'Ton', tag: 'Modifié',
      title: 'Posé, sensoriel, économe.',
      body: 'Phrases courtes. Métaphores d’éléments — pierre, eau, bois. Jamais de marketing, jamais de wellness.',
    },
    {
      n: '04', label: 'Manifeste', tag: 'Validée',
      title: 'Chauffer. Refroidir. Respirer.',
      body: 'Un lieu-culte hors des logiques touristiques. Une alternance. Un retour à soi.',
    },
  ];

  return (
    <div style={{
      width: 1440, height: 900, display: 'flex',
      background: C5.black, color: C5.bone, fontFamily: 'Archivo, sans-serif',
    }}>
      <Sidebar variant="client" active="dashboard" brand="SARTIGA" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar
          theme="dark"
          crumbs={['SARTIGA', 'Dashboard']}
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C5.fg3 }}>
                J-S. Auclair — Admin marque
              </span>
              <div style={{
                width: 34, height: 34, background: C5.bone, color: C5.black,
                display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700,
              }}>JA</div>
            </div>
          }
        />

        <div style={{ padding: '48px 48px 40px', overflow: 'auto' }}>
          {/* Brand header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            paddingBottom: 36, borderBottom: `1px solid ${C5.line2}`, marginBottom: 40,
          }}>
            <div>
              <Eyebrow color={C5.red} style={{ marginBottom: 20 }}>№ 01 · Portail marque</Eyebrow>
              <div style={{
                fontSize: 96, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.92,
                marginBottom: 16,
              }}>
                SARTIGA.
              </div>
              <div style={{ fontSize: 18, color: C5.boneDim, maxWidth: 520, lineHeight: 1.5 }}>
                Ralentir, le temps d’un rituel.
              </div>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Eyebrow color={C5.fg3}>Dernière mise à jour</Eyebrow>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>
                Aujourd’hui · 14:22
              </div>
              <div style={{ fontSize: 12, color: C5.fg3, letterSpacing: '0.04em' }}>
                par betula — v 1.3
              </div>
              <div style={{ marginTop: 6 }}><Pill kind="active">Publié</Pill></div>
            </div>
          </div>

          {/* Primary CTAs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, marginBottom: 44, border: `1px solid ${C5.line2}` }}>
            <div style={{
              padding: '32px 36px', background: C5.red, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
            }}>
              <div>
                <Eyebrow color="rgba(255,255,255,0.7)" style={{ marginBottom: 8 }}>Action · 01</Eyebrow>
                <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.05 }}>
                  Interroger la marque.
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>
                  Une IA qui connaît votre ton, votre archétype, vos règles.
                </div>
              </div>
              <div style={{ fontSize: 32 }}>→</div>
            </div>
            <div style={{
              padding: '32px 36px', background: C5.panel,
              borderLeft: `1px solid ${C5.line2}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
            }}>
              <div>
                <Eyebrow color={C5.fg3} style={{ marginBottom: 8 }}>Action · 02</Eyebrow>
                <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.05, color: C5.bone }}>
                  Exporter le prompt.
                </div>
                <div style={{ fontSize: 13, color: C5.fg3, marginTop: 6 }}>
                  ChatGPT · Claude · Gemini · .txt universel.
                </div>
              </div>
              <div style={{ fontSize: 32, color: C5.bone }}>↓</div>
            </div>
          </div>

          {/* Section */}
          <Eyebrow color={C5.fg3} style={{ marginBottom: 18 }}>02 / Noyau de marque</Eyebrow>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: `1px solid ${C5.line2}` }}>
            {cards.map((c, i) => (
              <div key={c.n} style={{
                padding: '28px 26px',
                background: C5.panel,
                borderRight: i < cards.length - 1 ? `1px solid ${C5.line2}` : 'none',
                display: 'flex', flexDirection: 'column', gap: 14,
                minHeight: 280,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    color: C5.red, fontWeight: 700, fontSize: 12, letterSpacing: '0.16em',
                    fontVariantNumeric: 'tabular-nums',
                  }}>{c.n} /</span>
                  <Pill kind={c.tag === 'Modifié' ? 'modified' : 'validated'} dot={false}>{c.tag}</Pill>
                </div>
                <Eyebrow color={C5.fg3}>{c.label}</Eyebrow>
                <div style={{
                  fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.15,
                  color: C5.bone,
                }}>{c.title}</div>
                <div style={{ fontSize: 13, color: C5.boneDim, lineHeight: 1.6, flex: 1 }}>
                  {c.body}
                </div>
                <div style={{
                  paddingTop: 14, borderTop: `1px solid ${C5.line}`,
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                  color: C5.fg3, display: 'flex', justifyContent: 'space-between',
                }}>
                  <span>Ouvrir</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.DashboardScreen = DashboardScreen;
