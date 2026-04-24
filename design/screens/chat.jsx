/* global React, DISTO_C, Sidebar, TopBar, Eyebrow, Btn, Pill */
/* 3c — Chat IA intégré. Classic bubbles, source citations per reply,
   copy button on each reply, suggested questions footer.                    */
const C7 = DISTO_C;

function ChatScreen() {
  return (
    <div style={{
      width: 1440, height: 900, display: 'flex',
      background: C7.black, color: C7.bone, fontFamily: 'Archivo, sans-serif',
    }}>
      <Sidebar variant="client" active="chat" brand="SARTIGA" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar
          theme="dark"
          crumbs={['SARTIGA', 'Interroger la marque']}
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Pill kind="active" dot>En ligne · GPT-4 · v 1.3</Pill>
              <Btn variant="ghost" size="sm" onDark>Nouveau fil</Btn>
            </div>
          }
        />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Conversation list */}
          <div style={{
            width: 280, background: C7.ink, borderRight: `1px solid ${C7.line}`,
            padding: '24px 0', overflow: 'auto',
          }}>
            <Eyebrow color={C7.fg3} style={{ padding: '0 24px', marginBottom: 14 }}>Fils récents</Eyebrow>
            {[
              { t: 'Ton pour Instagram', d: 'Aujourd’hui', on: true },
              { t: 'Bio LinkedIn courte', d: 'Hier' },
              { t: 'Vocabulaire à éviter', d: '3 mai' },
              { t: 'Concept campagne hiver', d: '28 avril' },
              { t: 'Réécrire page d’accueil', d: '22 avril' },
              { t: 'Brief pour photographe', d: '18 avril' },
            ].map((x, i) => (
              <div key={i} style={{
                padding: '12px 24px',
                borderLeft: `2px solid ${x.on ? C7.red : 'transparent'}`,
                background: x.on ? C7.panel : 'transparent',
              }}>
                <div style={{ fontSize: 13, fontWeight: x.on ? 700 : 500, color: x.on ? C7.bone : C7.boneDim, letterSpacing: '-0.005em' }}>
                  {x.t}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', color: C7.muted, textTransform: 'uppercase', marginTop: 4 }}>
                  {x.d}
                </div>
              </div>
            ))}
          </div>

          {/* Conversation */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C7.black }}>
            <div style={{ flex: 1, overflow: 'auto', padding: '36px 56px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
                <span style={{ color: C7.red, fontSize: 14, fontWeight: 700, letterSpacing: '0.16em', fontVariantNumeric: 'tabular-nums' }}>03 /</span>
                <Eyebrow color={C7.fg3}>Fil · Ton pour Instagram</Eyebrow>
              </div>

              {/* User bubble */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
                <div style={{
                  maxWidth: 540, padding: '16px 20px', background: C7.panel,
                  border: `1px solid ${C7.line}`, fontSize: 15, lineHeight: 1.55, color: C7.bone,
                }}>
                  Quel ton adopter sur Instagram pour une campagne d’automne ?
                </div>
              </div>

              {/* AI reply */}
              <div style={{ marginBottom: 28, maxWidth: 720 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 22, height: 22, background: C7.red, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 900 }}>SA</div>
                  <Eyebrow color={C7.fg3}>SARTIGA · IA de marque</Eyebrow>
                  <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C7.muted }}>il y a 12 s</span>
                </div>

                <div style={{
                  background: C7.panel, border: `1px solid ${C7.line}`,
                  padding: '22px 26px',
                }}>
                  <div style={{ fontSize: 15.5, lineHeight: 1.7, color: C7.bone, marginBottom: 18 }}>
                    Sur Instagram, restez <strong>posés et sensoriels</strong>. Évitez l’enthousiasme performé et les appels à l’action directs.
                    Écrivez comme on sort d’un sauna — lentement, avec des phrases courtes, en laissant la matière parler.
                    Nommez un élément (pierre, vapeur, bois), nommez une durée, nommez un geste. Rien de plus.
                  </div>
                  <div style={{ fontSize: 15.5, lineHeight: 1.7, color: C7.bone, marginBottom: 18 }}>
                    Pour l’automne précisément : la saison est déjà un argument. Laissez-la faire.
                    Un mot pour la lumière, un mot pour le froid qui arrive, un mot pour le feu intérieur.
                  </div>
                  <div style={{
                    background: C7.ink, padding: '14px 18px',
                    borderLeft: `2px solid ${C7.red}`, fontStyle: 'italic',
                    fontSize: 14, color: C7.boneDim, marginBottom: 20,
                  }}>
                    « La lumière tombe plus tôt. La pierre tient plus longtemps. Venez tenir avec elle. »
                  </div>

                  {/* Sources */}
                  <div style={{
                    paddingTop: 16, borderTop: `1px solid ${C7.line}`,
                    display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                  }}>
                    <Eyebrow color={C7.muted} style={{ fontSize: 10 }}>Basé sur</Eyebrow>
                    {[
                      { n: '03', name: 'Ton' },
                      { n: '02', name: 'Archétype' },
                      { n: '10', name: 'Do / Don’t' },
                      { n: '07', name: 'Messages clés' },
                    ].map(s => (
                      <span key={s.n} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 10px', border: `1px solid ${C7.line2}`,
                        color: C7.bone, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                      }}>
                        <span style={{ color: C7.red, fontVariantNumeric: 'tabular-nums' }}>{s.n}</span>
                        {s.name}
                      </span>
                    ))}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                      <Btn variant="ghost" size="sm" onDark>Copier</Btn>
                      <Btn variant="ghost" size="sm" onDark>Régénérer</Btn>
                    </div>
                  </div>
                </div>
              </div>

              {/* User bubble 2 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
                <div style={{
                  maxWidth: 540, padding: '16px 20px', background: C7.panel,
                  border: `1px solid ${C7.line}`, fontSize: 15, lineHeight: 1.55, color: C7.bone,
                }}>
                  Donne-moi trois légendes, une par semaine.
                </div>
              </div>

              {/* AI reply 2 */}
              <div style={{ maxWidth: 720 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 22, height: 22, background: C7.red, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 900 }}>SA</div>
                  <Eyebrow color={C7.fg3}>SARTIGA · IA de marque</Eyebrow>
                  <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C7.red }}>● En train d’écrire</span>
                </div>
                <div style={{
                  background: C7.panel, border: `1px solid ${C7.line}`,
                  padding: '22px 26px',
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, border: `1px solid ${C7.line}` }}>
                    {[
                      { w: 'Semaine 01', t: 'La pierre garde. On revient chercher.' },
                      { w: 'Semaine 02', t: 'Quatre heures. Pas de téléphone. De l’eau froide, du bois chaud.' },
                      { w: 'Semaine 03', t: 'La lumière tombe plus tôt. Le rituel, lui, dure.' },
                    ].map((l, i, a) => (
                      <div key={i} style={{
                        padding: '18px 20px',
                        borderRight: i < a.length - 1 ? `1px solid ${C7.line}` : 'none',
                      }}>
                        <Eyebrow color={C7.red} style={{ marginBottom: 10 }}>{l.w}</Eyebrow>
                        <div style={{ fontSize: 14, color: C7.bone, lineHeight: 1.55 }}>{l.t}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C7.line}`,
                    display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                  }}>
                    <Eyebrow color={C7.muted} style={{ fontSize: 10 }}>Basé sur</Eyebrow>
                    <span style={{ padding: '4px 10px', border: `1px solid ${C7.line2}`, color: C7.bone, fontSize: 11, fontWeight: 700 }}>
                      <span style={{ color: C7.red, fontVariantNumeric: 'tabular-nums' }}>07</span> Messages clés
                    </span>
                    <span style={{ padding: '4px 10px', border: `1px solid ${C7.line2}`, color: C7.bone, fontSize: 11, fontWeight: 700 }}>
                      <span style={{ color: C7.red, fontVariantNumeric: 'tabular-nums' }}>03</span> Ton
                    </span>
                    <div style={{ marginLeft: 'auto' }}>
                      <Btn variant="ghost" size="sm" onDark>Copier</Btn>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Composer */}
            <div style={{
              padding: '16px 56px 28px', borderTop: `1px solid ${C7.line}`, background: C7.black,
            }}>
              {/* Suggestions */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                <Eyebrow color={C7.muted} style={{ fontSize: 10, display: 'flex', alignItems: 'center' }}>Suggestions ·</Eyebrow>
                {[
                  'Quel ton pour Instagram ?',
                  'Rédigez une bio de marque',
                  'Trois accroches pour l’infolettre',
                  'Un mot à éviter absolument ?',
                ].map(q => (
                  <span key={q} style={{
                    padding: '7px 12px', border: `1px solid ${C7.line2}`,
                    fontSize: 12, fontWeight: 500, color: C7.boneDim,
                  }}>{q}</span>
                ))}
              </div>

              <div style={{
                border: `1.5px solid ${C7.lineStrong}`,
                padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <span style={{ color: C7.fg3, fontSize: 15, flex: 1 }}>
                  Demander à la marque…
                </span>
                <span style={{ color: C7.muted, fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                  ⌥ ↵
                </span>
                <Btn variant="primary" size="sm">Envoyer  →</Btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.ChatScreen = ChatScreen;
