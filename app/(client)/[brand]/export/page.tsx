import { C } from '@/lib/disto';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import Btn from '@/components/ui/Btn';
import Pill from '@/components/ui/Pill';
import Eyebrow from '@/components/ui/Eyebrow';

const exportTargets = [
  {
    tag: 'ChatGPT',         mark: 'OA', color: '#EBE8E6',
    note: 'Coller dans « Custom Instructions » → second champ, ou en tête d\'un Custom GPT.',
    primary: true,
  },
  {
    tag: 'Claude',          mark: 'AN', color: '#F02D14',
    note: 'Coller dans le champ « System prompt » d\'un Project, ou en début de conversation.',
    primary: false,
  },
  {
    tag: 'Gemini',          mark: 'GO', color: '#199BB9',
    note: 'Coller comme premier message d\'un nouveau Gem. Activer la mémoire longue.',
    primary: false,
  },
  {
    tag: 'Universel · .txt', mark: 'TX', color: '#D4D1CC',
    note: 'Format texte brut, sans balises. Pour tout autre outil IA interne.',
    primary: false,
    download: true,
  },
];

const metaStrip = [
  { k: 'Sections', v: '13 / 13' },
  { k: 'Tokens',   v: '≈ 2 840' },
  { k: 'Version',  v: 'v 1.3' },
  { k: 'Compilé',  v: "Aujourd'hui · 14:22" },
];

export default function ExportPage({ params }: { params: { brand: string } }) {
  const brand = params.brand.toUpperCase();

  return (
    <div className="portal-layout" style={{ background: C.black, color: C.bone }}>
      <Sidebar variant="client" brand={brand} />
      <div className="portal-main">
        <TopBar
          theme="dark"
          crumbs={[brand, 'System Prompt']}
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Pill kind="active" dot>Synchronisé · v 1.3</Pill>
            </div>
          }
        />

        <div className="panel-split" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* LEFT — prompt preview */}
          <div style={{ flex: 1.4, padding: 'clamp(20px, 3vw, 48px)', overflowY: 'auto', borderRight: `1px solid ${C.line}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <span style={{ color: C.red, fontSize: 14, fontWeight: 700, letterSpacing: '0.16em', fontVariantNumeric: 'tabular-nums' }}>04 /</span>
              <Eyebrow color={C.fg3}>Portail marque · Export</Eyebrow>
            </div>

            <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.96, marginBottom: 10 }}>
              System Prompt.
            </div>
            <div style={{ fontSize: 15, color: C.boneDim, maxWidth: 560, lineHeight: 1.55, marginBottom: 28 }}>
              Un prompt unique, compilé à partir de vos 13 sections. Collez-le au début d&apos;une nouvelle conversation — chaque modèle parlera comme votre marque.
            </div>

            {/* Meta strip */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, padding: '14px 18px', background: C.panel, border: `1px solid ${C.line}`, marginBottom: 20 }}>
              {metaStrip.map(m => (
                <div key={m.k}>
                  <Eyebrow color={C.muted} style={{ fontSize: 10, marginBottom: 4 }}>{m.k}</Eyebrow>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.bone }}>{m.v}</div>
                </div>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <Btn variant="ghost" size="sm" onDark>Copier tout</Btn>
                <Btn variant="secondary" size="sm" onDark>Recompiler</Btn>
              </div>
            </div>

            {/* Prompt body */}
            <div style={{
              background: C.ink, border: `1px solid ${C.line}`,
              padding: '28px 32px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12.5, lineHeight: 1.75, color: C.boneDim,
              maxHeight: 460, overflowY: 'auto',
            }}>
              <div style={{ color: C.red, fontWeight: 700, marginBottom: 14 }}># SYSTEM PROMPT · {brand} · v 1.3</div>
              <div style={{ color: C.muted, marginBottom: 18 }}>
                # Compilé depuis le portail betula — ne pas modifier hors-portail.<br />
                # © betula / {brand} · 2026
              </div>

              <div style={{ color: C.bone, fontWeight: 700 }}>## 01 · MISSION</div>
              <div style={{ marginBottom: 16 }}>
                Tu représentes {brand}, un centre de thermothérapie en forêt.<br />
                La marque offre une expérience de chaleur, de silence et de ralentissement — quatre heures hors du monde.
              </div>

              <div style={{ color: C.bone, fontWeight: 700 }}>## 02 · ARCHÉTYPE</div>
              <div style={{ marginBottom: 16 }}>
                Le Sage. Calme, patient, enraciné. Parle peu. Tient longtemps.<br />
                La chaleur est professeure, jamais vendeuse.
              </div>

              <div style={{ color: C.bone, fontWeight: 700 }}>## 03 · TON</div>
              <div style={{ marginBottom: 8 }}>
                Posé, sensoriel, économe en mots. Phrases courtes. Le verbe mène.<br />
                Métaphores d&apos;éléments naturels uniquement : pierre, eau, bois, vapeur, forêt.<br />
                Ponctuation : le point fait le travail. Éviter virgules en cascade.
              </div>
              <div style={{ marginBottom: 16, color: C.fg3 }}>
                → Exemple : « Quatre heures. Une alternance. Vous ne partez pas reposé — vous partez habité. »
              </div>

              <div style={{ color: C.bone, fontWeight: 700 }}>## 04 · VOCABULAIRE</div>
              <div style={{ marginBottom: 6 }}>
                <span style={{ color: C.cyan }}>OK  :</span> rituel · silence · chaleur · pierre · forêt · respirer · ralentir · revenir · tenir
              </div>
              <div style={{ marginBottom: 16 }}>
                <span style={{ color: C.red }}>NON :</span> wellness · relax · escape · luxury · exclusive · bien-être · unique experience
              </div>

              <div style={{ color: C.bone, fontWeight: 700 }}>## 05 · INTERDITS</div>
              <div style={{ marginBottom: 16 }}>
                Pas d&apos;emoji. Pas d&apos;appel à l&apos;action performé.<br />
                Jamais « nous croyons ». Ne jamais traduire mot-à-mot — adapter.
              </div>

              <div style={{ color: C.muted }}>
                [ …9 sections supplémentaires · Value Prop, Positionnement, Personas, Messages clés,<br />
                {'   '}Manifeste, Valeurs, Do/Don&apos;t, Identité, Contexte concurrentiel… ]
              </div>
            </div>
          </div>

          {/* RIGHT — export targets */}
          <div className="panel-right-fixed" style={{ width: 460, padding: 'clamp(20px, 3vw, 40px)', overflowY: 'auto', background: C.ink }}>
            <Eyebrow color={C.fg3} style={{ marginBottom: 12 }}>Destinations · 04</Eyebrow>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 28 }}>
              Où l&apos;installer ?
            </div>

            {exportTargets.map((e) => (
              <div key={e.tag} style={{
                background: C.panel, border: `1px solid ${C.line}`,
                padding: '20px 22px', marginBottom: 14,
                display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 40, height: 40,
                    background: C.ink, border: `1.5px solid ${e.color}`, color: e.color,
                    display: 'grid', placeItems: 'center',
                    fontSize: 12, fontWeight: 900, letterSpacing: '0.08em',
                  }}>{e.mark}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.bone }}>{e.tag}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted, marginTop: 2 }}>
                      Format {e.download ? '.txt' : 'optimisé'}
                    </div>
                  </div>
                  <div style={{
                    padding: '8px 14px',
                    background: e.primary ? C.red : 'transparent',
                    color: e.primary ? '#fff' : C.bone,
                    border: e.primary ? 'none' : `1.5px solid ${C.lineStrong}`,
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}>
                    {e.download ? 'Télécharger' : 'Exporter'}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: C.boneDim, lineHeight: 1.55, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>
                  {e.note}
                </div>
              </div>
            ))}

            <div style={{ marginTop: 10, padding: '16px 18px', background: 'transparent', border: `1px dashed ${C.line2}`, fontSize: 12, color: C.fg3, lineHeight: 1.55 }}>
              <Eyebrow color={C.red} style={{ fontSize: 10, marginBottom: 8 }}>Conseil d&apos;agence</Eyebrow>
              Recompilez le prompt après chaque publication majeure. Les modèles gardent en mémoire la dernière version collée — pas celle du portail.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
