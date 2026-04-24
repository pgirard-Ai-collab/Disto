/* global React, DISTO_C, Sidebar, TopBar, Eyebrow, Btn, Pill, SectionHead */
/* 2c — Éditeur de structure de marque. 13 sections, side nav, markdown editor,
   status per section (auto/validated/modified). Agency admin, dark=no (light). */
const C3 = DISTO_C;
const { useState: useState3 } = React;

function EditorScreen() {
  const sections = [
    { n: '01', name: 'Mission',              status: 'validated' },
    { n: '02', name: 'Archétype',            status: 'validated' },
    { n: '03', name: 'Ton',                  status: 'modified', active: true },
    { n: '04', name: 'Value Proposition',    status: 'validated' },
    { n: '05', name: 'Positionnement',       status: 'auto' },
    { n: '06', name: 'Personas',             status: 'auto' },
    { n: '07', name: 'Messages clés',        status: 'modified' },
    { n: '08', name: 'Manifeste',            status: 'validated' },
    { n: '09', name: 'Valeurs',              status: 'auto' },
    { n: '10', name: 'Do / Don’t',      status: 'auto' },
    { n: '11', name: 'Identité',             status: 'modified' },
    { n: '12', name: 'Intention',            status: 'auto' },
    { n: '13', name: 'Contexte concurrentiel', status: 'auto' },
  ];

  return (
    <div style={{
      width: 1440, height: 900, display: 'flex',
      background: C3.bone, color: C3.black, fontFamily: 'Archivo, sans-serif',
    }}>
      <Sidebar variant="agency" active="editor" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar
          theme="light"
          crumbs={['betula', 'SARTIGA', 'Éditeur', 'Ton']}
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C3.muted }}>
                ● Modifications non sauvegardées
              </span>
              <Btn variant="ghost" size="sm">Sauvegarder</Btn>
              <Btn variant="primary" size="sm">Publier  →</Btn>
            </div>
          }
        />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Section list (inner nav) */}
          <div style={{
            width: 300, background: '#FFFFFF',
            borderRight: `1px solid rgba(0,0,0,0.12)`,
            overflow: 'auto', padding: '22px 0',
          }}>
            <Eyebrow color={C3.muted} style={{ padding: '0 24px', marginBottom: 14 }}>
              Structure · 13 sections
            </Eyebrow>
            {sections.map(s => {
              const on = s.active;
              return (
                <div key={s.n} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 24px',
                  borderLeft: `2px solid ${on ? C3.red : 'transparent'}`,
                  background: on ? 'rgba(240,45,20,0.05)' : 'transparent',
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                    fontVariantNumeric: 'tabular-nums',
                    color: on ? C3.red : C3.muted,
                    minWidth: 22,
                  }}>{s.n}</span>
                  <span style={{
                    fontSize: 13.5, flex: 1,
                    fontWeight: on ? 700 : 500,
                    letterSpacing: '-0.005em',
                  }}>{s.name}</span>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: s.status === 'validated' ? C3.red
                             : s.status === 'modified'  ? '#B8A800'
                             : C3.cyan,
                  }} />
                </div>
              );
            })}
          </div>

          {/* Editor area */}
          <div style={{ flex: 1, overflow: 'auto', padding: '36px 48px 48px', background: C3.bone }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
              <span style={{ color: C3.red, fontSize: 14, fontWeight: 700, letterSpacing: '0.16em', fontVariantNumeric: 'tabular-nums' }}>03 /</span>
              <Pill kind="modified">Modifié · 12 min</Pill>
              <Pill kind="auto" dot={false}>Auto-généré · GPT-4</Pill>
            </div>

            <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.02, marginBottom: 10 }}>
              Ton.
            </div>
            <div style={{ color: C3.muted, fontSize: 14, marginBottom: 28, maxWidth: 620, lineHeight: 1.55 }}>
              La voix de la marque — cadence, vocabulaire, tournures. Ce que nous disons et surtout ce que nous ne disons jamais.
            </div>

            {/* Editor toolbar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 0,
              border: `1px solid rgba(0,0,0,0.12)`, background: '#FFFFFF',
              marginBottom: 0, padding: '0 4px', height: 42,
            }}>
              {['H1', 'H2', 'B', 'I', '•', '1.', '❝', '↔ Lien', '{ } Code'].map((t, i) => (
                <div key={i} style={{
                  padding: '0 14px', height: 42,
                  display: 'flex', alignItems: 'center',
                  fontSize: 12, fontWeight: t === 'B' ? 900 : 700,
                  fontStyle: t === 'I' ? 'italic' : 'normal',
                  letterSpacing: '0.04em',
                  color: C3.black, cursor: 'pointer',
                  borderRight: i < 8 ? `1px solid rgba(0,0,0,0.08)` : 'none',
                }}>{t}</div>
              ))}
              <div style={{ marginLeft: 'auto', padding: '0 16px', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C3.muted }}>
                Markdown · aperçu
              </div>
            </div>

            {/* Markdown content */}
            <div style={{
              background: '#FFFFFF', border: `1px solid rgba(0,0,0,0.12)`, borderTop: 'none',
              padding: '36px 48px',
            }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em', margin: '0 0 14px' }}>
                Principes
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: '#2A2824', margin: '0 0 18px', maxWidth: 680 }}>
                Le ton de SARTIGA est <strong>posé, sensoriel, économe en mots.</strong> Nous écrivons comme on entre dans un sauna : lentement, avec intention, sans bruit inutile. Les métaphores viennent des éléments — pierre, eau, bois, vapeur — et jamais du marketing.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: '#2A2824', margin: '0 0 28px', maxWidth: 680 }}>
                La phrase est courte. Le <span style={{ background: 'rgba(245,230,25,0.35)' }}>verbe</span> mène. Les adverbes sont rares. La ponctuation respire — nous préférons le point à la virgule.
              </p>

              <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em', margin: '0 0 14px' }}>
                Vocabulaire
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div style={{ borderLeft: `2px solid ${C3.red}`, paddingLeft: 16 }}>
                  <Eyebrow color={C3.red} style={{ marginBottom: 10 }}>Mots qui portent</Eyebrow>
                  <div style={{ fontSize: 14, lineHeight: 1.9, color: '#2A2824' }}>
                    rituel · silence · chaleur · pierre · forêt<br/>
                    respirer · ralentir · revenir · tenir
                  </div>
                </div>
                <div style={{ borderLeft: `2px solid rgba(0,0,0,0.24)`, paddingLeft: 16 }}>
                  <Eyebrow color={C3.muted} style={{ marginBottom: 10 }}>Mots à éviter</Eyebrow>
                  <div style={{ fontSize: 14, lineHeight: 1.9, color: C3.muted, textDecoration: 'line-through' }}>
                    wellness · relax · bien-être · escape<br/>
                    luxury · exclusive · unique experience
                  </div>
                </div>
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em', margin: '0 0 14px' }}>
                Exemple
              </h2>
              <div style={{
                background: C3.bone, padding: '18px 22px',
                borderLeft: `2px solid ${C3.black}`, fontStyle: 'italic',
                fontSize: 16, lineHeight: 1.6, color: '#2A2824', maxWidth: 620,
              }}>
                « Quatre heures. Une alternance — chaud, froid, silence. Vous ne partez pas reposé. Vous partez habité. »
              </div>
            </div>

            {/* Meta footer */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '16px 4px', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase', color: C3.muted,
            }}>
              <span>Auto-save · il y a 12 s</span>
              <span>284 mots · 03 / 13 validé</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.EditorScreen = EditorScreen;
