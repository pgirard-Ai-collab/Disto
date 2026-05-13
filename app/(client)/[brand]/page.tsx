import { C } from '@/lib/disto';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import Pill from '@/components/ui/Pill';
import Eyebrow from '@/components/ui/Eyebrow';
import Link from 'next/link';

const cards = [
  {
    n: '01', label: 'Mission', tag: 'Validée' as const,
    title: 'Ralentir, le temps d\'un rituel.',
    body: 'Offrir une expérience de thermothérapie fondée sur le silence, la chaleur et la forêt — à quatre heures du monde.',
  },
  {
    n: '02', label: 'Archétype', tag: 'Validée' as const,
    title: 'Le Sage.',
    body: 'Calme, patient, enraciné. Parle peu, tient longtemps. La chaleur comme professeure.',
  },
  {
    n: '03', label: 'Ton', tag: 'Modifié' as const,
    title: 'Posé, sensoriel, économe.',
    body: 'Phrases courtes. Métaphores d\'éléments — pierre, eau, bois. Jamais de marketing, jamais de wellness.',
  },
  {
    n: '04', label: 'Manifeste', tag: 'Validée' as const,
    title: 'Chauffer. Refroidir. Respirer.',
    body: 'Un lieu-culte hors des logiques touristiques. Une alternance. Un retour à soi.',
  },
];

export default async function DashboardPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: brandSlug } = await params;
  const brand = brandSlug.toUpperCase();

  return (
    <div className="portal-layout" style={{ background: C.black, color: C.bone }}>
      <Sidebar variant="client" brand={brand} />
      <div className="portal-main">
        <TopBar
          theme="dark"
          crumbs={[brand, 'Dashboard']}
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.fg3 }}>
                J-S. Auclair — Admin marque
              </span>
              <div style={{
                width: 34, height: 34, background: C.bone, color: C.black,
                display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700,
              }}>JA</div>
            </div>
          }
        />

        <div className="portal-scroll" style={{ padding: '48px 48px 40px' }}>
          {/* Brand header */}
          <div className="section-head-row" style={{
            paddingBottom: 36, borderBottom: `1px solid ${C.line2}`, marginBottom: 40,
          }}>
            <div>
              <Eyebrow color={C.red} style={{ marginBottom: 20 }}>№ 01 · Portail marque</Eyebrow>
              <div style={{ fontSize: 'clamp(48px, 6.5vw, 96px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.92, marginBottom: 16 }}>
                {brand}.
              </div>
              <div style={{ fontSize: 18, color: C.boneDim, maxWidth: 520, lineHeight: 1.5 }}>
                Ralentir, le temps d&apos;un rituel.
              </div>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Eyebrow color={C.fg3}>Dernière mise à jour</Eyebrow>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>Aujourd&apos;hui · 14:22</div>
              <div style={{ fontSize: 12, color: C.fg3, letterSpacing: '0.04em' }}>par betula — v 1.3</div>
              <div style={{ marginTop: 6 }}><Pill kind="active">Publié</Pill></div>
            </div>
          </div>

          {/* Primary CTAs */}
          <div className="grid-2" style={{ gap: 0, marginBottom: 44, border: `1px solid ${C.line2}` }}>
            <Link href={`/${brandSlug}/chat`} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '32px 36px', background: C.red, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, cursor: 'pointer',
              }}>
                <div>
                  <Eyebrow color="rgba(255,255,255,0.7)" style={{ marginBottom: 8 }}>Action · 01</Eyebrow>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.05 }}>Interroger la marque.</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>Une IA qui connaît votre ton, votre archétype, vos règles.</div>
                </div>
                <div style={{ fontSize: 32 }}>→</div>
              </div>
            </Link>
            <Link href={`/${brandSlug}/export`} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '32px 36px', background: C.panel,
                borderLeft: `1px solid ${C.line2}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, cursor: 'pointer',
              }}>
                <div>
                  <Eyebrow color={C.fg3} style={{ marginBottom: 8 }}>Action · 02</Eyebrow>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.05, color: C.bone }}>Exporter le prompt.</div>
                  <div style={{ fontSize: 13, color: C.fg3, marginTop: 6 }}>ChatGPT · Claude · Gemini · .txt universel.</div>
                </div>
                <div style={{ fontSize: 32, color: C.bone }}>↓</div>
              </div>
            </Link>
          </div>

          <Eyebrow color={C.fg3} style={{ marginBottom: 18 }}>02 / Noyau de marque</Eyebrow>

          <div className="grid-4" style={{ gap: 0, border: `1px solid ${C.line2}` }}>
            {cards.map((c, i) => (
              <div key={c.n} style={{
                padding: '28px 26px', background: C.panel,
                borderRight: i < cards.length - 1 ? `1px solid ${C.line2}` : 'none',
                display: 'flex', flexDirection: 'column', gap: 14, minHeight: 280,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: C.red, fontWeight: 700, fontSize: 12, letterSpacing: '0.16em', fontVariantNumeric: 'tabular-nums' }}>{c.n} /</span>
                  <Pill kind={c.tag === 'Modifié' ? 'modified' : 'validated'} dot={false}>{c.tag}</Pill>
                </div>
                <Eyebrow color={C.fg3}>{c.label}</Eyebrow>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.15, color: C.bone }}>{c.title}</div>
                <div style={{ fontSize: 13, color: C.boneDim, lineHeight: 1.6, flex: 1 }}>{c.body}</div>
                <div style={{ paddingTop: 14, borderTop: `1px solid ${C.line}`, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.fg3, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ouvrir</span><span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
