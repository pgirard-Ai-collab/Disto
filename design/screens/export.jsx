/* global React, DISTO_C, Sidebar, TopBar, Eyebrow, Btn, Pill */
/* 3d — Export System Prompt. Full prompt preview + 4 export targets
   (ChatGPT / Claude / Gemini / Universel .txt) + per-platform instructions.  */
const C8 = DISTO_C;

function ExportScreen() {
  return (
    <div style={{
      width: 1440, height: 900, display: 'flex',
      background: C8.black, color: C8.bone, fontFamily: 'Archivo, sans-serif',
    }}>
      <Sidebar variant="client" active="export" brand="SARTIGA" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar
          theme="dark"
          crumbs={['SARTIGA', 'System Prompt']}
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Pill kind="active" dot>Synchronisé · v 1.3</Pill>
            </div>
          }
        />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* LEFT — prompt preview */}
          <div style={{ flex: 1.4, padding: '40px 48px', overflow: 'auto', borderRight: `1px solid ${C8.line}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <span style={{ color: C8.red, fontSize: 14, fontWeight: 700, letterSpacing: '0.16em', fontVariantNumeric: 'tabular-nums' }}>04 /</span>
              <Eyebrow color={C8.fg3}>Portail marque · Export</Eyebrow>
            </div>

            <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.96, marginBottom: 10 }}>
              System Prompt.
            </div>
            <div style={{ fontSize: 15, color: C8.boneDim, maxWidth: 560, lineHeight: 1.55, marginBottom: 28 }}>
              Un prompt unique, compilé à partir de vos 13 sections. Collez-le au début d’une nouvelle conversation — chaque modèle parlera comme votre marque.
            </div>

            {/* meta strip */}
            <div style={{
              display: 'flex', gap: 28, padding: '14px 18px',
              background: C8.panel, border: `1px solid ${C8.line}`,
              marginBottom: 20,
            }}>
              {[
                { k: 'Sections',  v: '13 / 13' },
                { k: 'Tokens',    v: '≈ 2 840' },
                { k: 'Version',   v: 'v 1.3' },
                { k: 'Compilé',   v: 'Aujourd’hui · 14:22' },
              ].map(m => (
                <div key={m.k}>
                  <Eyebrow color={C8.muted} style={{ fontSize: 10, marginBottom: 4 }}>{m.k}</Eyebrow>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C8.bone, letterSpacing: '-0.005em' }}>{m.v}</div>
                </div>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <Btn variant="ghost" size="sm" onDark>Copier tout</Btn>
                <Btn variant="secondary" size="sm" onDark>Recompiler</Btn>
              </div>
            </div>

            {/* Prompt body */}
            <div style={{
              background: C8.ink, border: `1px solid ${C8.line}`,
              padding: '28px 32px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12.5, lineHeight: 1.75, color: C8.boneDim,
              maxHeight: 560, overflow: 'auto',
            }}>
              <div style={{ color: C8.red, fontWeight: 700, marginBottom: 14 }}># SYSTEM PROMPT · SARTIGA · v 1.3</div>
              <div style={{ color: C8.muted, marginBottom: 18 }}>
                # Compilé depuis le portail betula — ne pas modifier hors-portail.<br/>
                # © betula / SARTIGA · 2026
              </div>

              <div style={{ color: C8.bone, fontWeight: 700 }}>## 01 · MISSION</div>
              <div style={{ marginBottom: 16 }}>
                Tu représentes SARTIGA, un centre de thermothérapie en forêt.
                La marque offre une expérience de chaleur, de silence et de ralentissement — quatre heures hors du monde.
              </div>

              <div style={{ color: C8.bone, fontWeight: 700 }}>## 02 · ARCHÉTYPE</div>
              <div style={{ marginBottom: 16 }}>
                Le Sage. Calme, patient, enraciné. Parle peu. Tient longtemps.
                La chaleur est professeure, jamais vendeuse.
              </div>

              <div style={{ color: C8.bone, fontWeight: 700 }}>## 03 · TON</div>
              <div style={{ marginBottom: 8 }}>
                Posé, sensoriel, économe en mots. Phrases courtes. Le verbe mène.
                Métaphores d’éléments naturels uniquement : pierre, eau, bois, vapeur, forêt.
                Ponctuation : le point fait le travail. Éviter virgules en cascade.
              </div>
              <div style={{ marginBottom: 16, color: C8.fg3 }}>
                → Exemple : « Quatre heures. Une alternance. Vous ne partez pas reposé — vous partez habité. »
              </div>

              <div style={{ color: C8.bone, fontWeight: 700 }}>## 04 · VOCABULAIRE</div>
              <div style={{ marginBottom: 6 }}>
                <span style={{ color: C8.cyan }}>OK  :</span> rituel · silence · chaleur · pierre · forêt · respirer · ralentir · revenir · tenir
              </div>
              <div style={{ marginBottom: 16 }}>
                <span style={{ color: C8.red }}>NON :</span> wellness · relax · escape · luxury · exclusive · bien-être · unique experience
              </div>

              <div style={{ color: C8.bone, fontWeight: 700 }}>## 05 · INTERDITS</div>
              <div style={{ marginBottom: 16 }}>
                Pas d’emoji. Pas d’appel à l’action performé.
                Jamais « nous croyons ». Ne jamais traduire mot-à-mot — adapter.
              </div>

              <div style={{ color: C8.muted }}>
                [ …9 sections supplémentaires · Value Prop, Positionnement, Personas, Messages clés,<br/>
                {'   '}Manifeste, Valeurs, Do/Don’t, Identité, Contexte concurrentiel… ]
              </div>
            </div>
          </div>

          {/* RIGHT — export targets */}
          <div style={{ width: 460, padding: '40px 40px', overflow: 'auto', background: C8.ink }}>
            <Eyebrow color={C8.fg3} style={{ marginBottom: 12 }}>Destinations · 04</Eyebrow>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 28 }}>
              Où l’installer ?
            </div>

            {[
              {
                tag: 'ChatGPT',   mark: 'OA', color: C8.bone,
                note: 'Coller dans « Custom Instructions » → second champ, ou en tête d’un Custom GPT.',
              },
              {
                tag: 'Claude',    mark: 'AN', color: C8.red,
                note: 'Coller dans le champ « System prompt » d’un Project, ou en début de conversation.',
              },
              {
                tag: 'Gemini',    mark: 'GO', color: C8.cyan,
                note: 'Coller comme premier message d’un nouveau Gem. Activer la mémoire longue.',
              },
              {
                tag: 'Universel · .txt', mark: 'TX', color: C8.boneDim,
                note: 'Format texte brut, sans balises. Pour tout autre outil IA interne.',
              },
            ].map((e, i) => (
              <div key={e.tag} style={{
                background: C8.panel, border: `1px solid ${C8.line}`,
                padding: '20px 22px', marginBottom: 14,
                display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 40, height: 40,
                    background: C8.ink, border: `1.5px solid ${e.color}`, color: e.color,
                    display: 'grid', placeItems: 'center',
                    fontSize: 12, fontWeight: 900, letterSpacing: '0.08em',
                  }}>{e.mark}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C8.bone, letterSpacing: '-0.005em' }}>{e.tag}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C8.muted, marginTop: 2 }}>
                      Format {i === 3 ? '.txt' : 'optimisé'}
                    </div>
                  </div>
                  <div style={{
                    padding: '8px 14px', background: i === 0 ? C8.red : 'transparent',
                    color: i === 0 ? '#fff' : C8.bone,
                    border: i === 0 ? 'none' : `1.5px solid ${C8.lineStrong}`,
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}>
                    {i === 3 ? 'Télécharger' : 'Exporter'}
                  </div>
                </div>
                <div style={{
                  fontSize: 12, color: C8.boneDim, lineHeight: 1.55,
                  paddingTop: 10, borderTop: `1px solid ${C8.line}`,
                }}>
                  {e.note}
                </div>
              </div>
            ))}

            <div style={{
              marginTop: 10, padding: '16px 18px',
              background: 'transparent', border: `1px dashed ${C8.line2}`,
              fontSize: 12, color: C8.fg3, lineHeight: 1.55,
            }}>
              <Eyebrow color={C8.red} style={{ fontSize: 10, marginBottom: 8 }}>Conseil d’agence</Eyebrow>
              Recompilez le prompt après chaque publication majeure. Les modèles gardent en mémoire la dernière version collée — pas celle du portail.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.ExportScreen = ExportScreen;
