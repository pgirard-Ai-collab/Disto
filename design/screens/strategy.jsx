/* global React, DISTO_C, Sidebar, TopBar, Eyebrow, Btn, Pill */
/* 3b — Explorateur de stratégie. Read-only strategy browser, side nav,
   detail pane for the chosen section, global search.                        */
const C6 = DISTO_C;

function StrategyScreen() {
  const sections = [
    { n: '01', name: 'Mission' },
    { n: '02', name: 'Archétype' },
    { n: '03', name: 'Ton' },
    { n: '04', name: 'Value Proposition', active: true },
    { n: '05', name: 'Positionnement' },
    { n: '06', name: 'Personas' },
    { n: '07', name: 'Messages clés' },
    { n: '08', name: 'Manifeste' },
    { n: '09', name: 'Valeurs' },
    { n: '10', name: 'Do / Don’t' },
    { n: '11', name: 'Identité' },
    { n: '12', name: 'Intention' },
    { n: '13', name: 'Contexte concurrentiel' },
  ];

  return (
    <div style={{
      width: 1440, height: 900, display: 'flex',
      background: C6.black, color: C6.bone, fontFamily: 'Archivo, sans-serif',
    }}>
      <Sidebar variant="client" active="strategy" brand="SARTIGA" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar
          theme="dark"
          crumbs={['SARTIGA', 'Stratégie', 'Value Proposition']}
          right={
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              borderBottom: `1.5px solid ${C6.lineStrong}`, paddingBottom: 4, width: 320,
            }}>
              <span style={{ color: C6.fg3, fontSize: 14 }}>⌕</span>
              <span style={{ color: C6.fg3, fontSize: 13 }}>Rechercher dans la marque — ex. « ton Instagram »</span>
              <span style={{ marginLeft: 'auto', color: C6.muted, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.1em' }}>⌘ K</span>
            </div>
          }
        />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Inner nav */}
          <div style={{
            width: 280, background: C6.ink,
            borderRight: `1px solid ${C6.line}`,
            overflow: 'auto', padding: '24px 0',
          }}>
            <div style={{ padding: '0 24px', marginBottom: 18 }}>
              <Eyebrow color={C6.fg3} style={{ marginBottom: 6 }}>Structure</Eyebrow>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
                color: C6.muted, textTransform: 'uppercase',
              }}>
                Lecture seule · v 1.3
              </div>
            </div>
            {sections.map(s => {
              const on = s.active;
              return (
                <div key={s.n} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 24px',
                  borderLeft: `2px solid ${on ? C6.red : 'transparent'}`,
                  background: on ? C6.panel : 'transparent',
                  color: on ? C6.bone : C6.boneDim,
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                    fontVariantNumeric: 'tabular-nums',
                    color: on ? C6.red : C6.muted, minWidth: 22,
                  }}>{s.n}</span>
                  <span style={{ fontSize: 13.5, fontWeight: on ? 700 : 500 }}>{s.name}</span>
                </div>
              );
            })}
          </div>

          {/* Detail */}
          <div style={{ flex: 1, overflow: 'auto', padding: '40px 56px 56px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <span style={{ color: C6.red, fontSize: 14, fontWeight: 700, letterSpacing: '0.16em', fontVariantNumeric: 'tabular-nums' }}>04 /</span>
              <Eyebrow color={C6.fg3}>Stratégie · SARTIGA</Eyebrow>
            </div>

            <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.96, marginBottom: 10 }}>
              Value Proposition.
            </div>
            <div style={{ fontSize: 16, color: C6.boneDim, maxWidth: 640, lineHeight: 1.55, marginBottom: 36 }}>
              Ce que la marque offre, promet, et ne compromet pas — le noyau qui reste vrai sur tous les canaux.
            </div>

            {/* Key statement */}
            <div style={{
              padding: '28px 32px', background: C6.panel,
              borderLeft: `2px solid ${C6.red}`,
              marginBottom: 36,
            }}>
              <Eyebrow color={C6.red} style={{ marginBottom: 14 }}>Proposition de valeur</Eyebrow>
              <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, color: C6.bone, maxWidth: 720 }}>
                « Le rituel thermal comme retour à soi — quatre heures hors du monde, dans la forêt, sans bruit. »
              </div>
            </div>

            {/* Three pillars */}
            <Eyebrow color={C6.fg3} style={{ marginBottom: 18 }}>Piliers</Eyebrow>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, marginBottom: 36, border: `1px solid ${C6.line2}` }}>
              {[
                { n: '01', t: 'Silence', d: 'Aucun contenu parlé. La matière, la chaleur, la respiration suffisent.' },
                { n: '02', t: 'Durée',   d: 'Quatre heures minimum. Le temps est le produit, pas l’obstacle.' },
                { n: '03', t: 'Lieu',    d: 'En forêt — une architecture basse, de pierre et de bois. Jamais urbain.' },
              ].map((p, i, a) => (
                <div key={p.n} style={{
                  padding: '24px 26px', background: C6.panel,
                  borderRight: i < a.length - 1 ? `1px solid ${C6.line2}` : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ color: C6.red, fontSize: 36, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                      {p.n}
                    </span>
                    <Eyebrow color={C6.muted} style={{ fontSize: 10 }}>Pilier</Eyebrow>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 10 }}>
                    {p.t}.
                  </div>
                  <div style={{ fontSize: 13, color: C6.boneDim, lineHeight: 1.6 }}>
                    {p.d}
                  </div>
                </div>
              ))}
            </div>

            {/* Meta row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, paddingTop: 20, borderTop: `1px solid ${C6.line}` }}>
              {[
                { k: 'Statut',        v: 'Validée' },
                { k: 'Dernière MAJ',  v: 'il y a 2 j' },
                { k: 'Auteur',        v: 'betula / C. Bellefleur' },
                { k: 'Liens',         v: 'Positionnement · Mission' },
              ].map(m => (
                <div key={m.k}>
                  <Eyebrow color={C6.muted} style={{ fontSize: 10, marginBottom: 6 }}>{m.k}</Eyebrow>
                  <div style={{ fontSize: 14, color: C6.bone, fontWeight: 500 }}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.StrategyScreen = StrategyScreen;
