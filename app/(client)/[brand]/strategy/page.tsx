import { C } from '@/lib/disto';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import Eyebrow from '@/components/ui/Eyebrow';

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
  { n: '10', name: 'Do / Don\'t' },
  { n: '11', name: 'Identité' },
  { n: '12', name: 'Intention' },
  { n: '13', name: 'Contexte concurrentiel' },
];

const pillars = [
  { n: '01', t: 'Silence', d: 'Aucun contenu parlé. La matière, la chaleur, la respiration suffisent.' },
  { n: '02', t: 'Durée',   d: 'Quatre heures minimum. Le temps est le produit, pas l\'obstacle.' },
  { n: '03', t: 'Lieu',    d: 'En forêt — une architecture basse, de pierre et de bois. Jamais urbain.' },
];

const meta = [
  { k: 'Statut',       v: 'Validée' },
  { k: 'Dernière MAJ', v: 'il y a 2 j' },
  { k: 'Auteur',       v: 'betula / C. Bellefleur' },
  { k: 'Liens',        v: 'Positionnement · Mission' },
];

export default async function StrategyPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: brandSlug } = await params;
  const brand = brandSlug.toUpperCase();

  return (
    <div className="portal-layout" style={{ background: C.black, color: C.bone }}>
      <Sidebar variant="client" brand={brand} />
      <div className="portal-main">
        <TopBar
          theme="dark"
          crumbs={[brand, 'Stratégie', 'Value Proposition']}
          right={
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              borderBottom: `1.5px solid ${C.lineStrong}`, paddingBottom: 4, width: 320,
            }}>
              <span style={{ color: C.fg3, fontSize: 14 }}>⌕</span>
              <span style={{ color: C.fg3, fontSize: 13 }}>Rechercher dans la marque…</span>
              <span style={{ marginLeft: 'auto', color: C.muted, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.1em' }}>⌘ K</span>
            </div>
          }
        />

        <div className="panel-split" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Inner nav */}
          <div className="inner-nav" style={{
            width: 280, background: C.ink,
            borderRight: `1px solid ${C.line}`,
            overflowY: 'auto', padding: '24px 0',
          }}>
            <div style={{ padding: '0 24px', marginBottom: 18 }}>
              <Eyebrow color={C.fg3} style={{ marginBottom: 6 }}>Structure</Eyebrow>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', color: C.muted, textTransform: 'uppercase' }}>
                Lecture seule · v 1.3
              </div>
            </div>
            {sections.map(s => {
              const on = 'active' in s && s.active;
              return (
                <div key={s.n} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 24px',
                  borderLeft: `2px solid ${on ? C.red : 'transparent'}`,
                  background: on ? C.panel : 'transparent',
                  color: on ? C.bone : C.boneDim,
                  cursor: 'pointer',
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', fontVariantNumeric: 'tabular-nums', color: on ? C.red : C.muted, minWidth: 22 }}>{s.n}</span>
                  <span style={{ fontSize: 13.5, fontWeight: on ? 700 : 500 }}>{s.name}</span>
                </div>
              );
            })}
          </div>

          {/* Detail */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '40px 56px 56px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <span style={{ color: C.red, fontSize: 14, fontWeight: 700, letterSpacing: '0.16em', fontVariantNumeric: 'tabular-nums' }}>04 /</span>
              <Eyebrow color={C.fg3}>Stratégie · {brand}</Eyebrow>
            </div>

            <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.96, marginBottom: 10 }}>
              Value Proposition.
            </div>
            <div style={{ fontSize: 16, color: C.boneDim, maxWidth: 640, lineHeight: 1.55, marginBottom: 36 }}>
              Ce que la marque offre, promet, et ne compromet pas — le noyau qui reste vrai sur tous les canaux.
            </div>

            <div style={{ padding: '28px 32px', background: C.panel, borderLeft: `2px solid ${C.red}`, marginBottom: 36 }}>
              <Eyebrow color={C.red} style={{ marginBottom: 14 }}>Proposition de valeur</Eyebrow>
              <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, color: C.bone, maxWidth: 720 }}>
                « Le rituel thermal comme retour à soi — quatre heures hors du monde, dans la forêt, sans bruit. »
              </div>
            </div>

            <Eyebrow color={C.fg3} style={{ marginBottom: 18 }}>Piliers</Eyebrow>
            <div className="grid-3" style={{ gap: 0, marginBottom: 36, border: `1px solid ${C.line2}` }}>
              {pillars.map((p, i) => (
                <div key={p.n} style={{
                  padding: '24px 26px', background: C.panel,
                  borderRight: i < pillars.length - 1 ? `1px solid ${C.line2}` : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ color: C.red, fontSize: 36, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{p.n}</span>
                    <Eyebrow color={C.muted} style={{ fontSize: 10 }}>Pilier</Eyebrow>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 10 }}>{p.t}.</div>
                  <div style={{ fontSize: 13, color: C.boneDim, lineHeight: 1.6 }}>{p.d}</div>
                </div>
              ))}
            </div>

            <div className="grid-4" style={{ gap: 24, paddingTop: 20, borderTop: `1px solid ${C.line}` }}>
              {meta.map(m => (
                <div key={m.k}>
                  <Eyebrow color={C.muted} style={{ fontSize: 10, marginBottom: 6 }}>{m.k}</Eyebrow>
                  <div style={{ fontSize: 14, color: C.bone, fontWeight: 500 }}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
