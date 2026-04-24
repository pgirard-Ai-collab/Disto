'use client';

import { C } from '@/lib/disto';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import Btn from '@/components/ui/Btn';
import Pill from '@/components/ui/Pill';
import Eyebrow from '@/components/ui/Eyebrow';
import { useParams } from 'next/navigation';

const threads = [
  { t: 'Ton pour Instagram',         d: 'Aujourd\'hui', on: true },
  { t: 'Bio LinkedIn courte',         d: 'Hier' },
  { t: 'Vocabulaire à éviter',        d: '3 mai' },
  { t: 'Concept campagne hiver',      d: '28 avril' },
  { t: 'Réécrire page d\'accueil',   d: '22 avril' },
  { t: 'Brief pour photographe',      d: '18 avril' },
];

const sources = [
  { n: '03', name: 'Ton' },
  { n: '02', name: 'Archétype' },
  { n: '10', name: 'Do / Don\'t' },
  { n: '07', name: 'Messages clés' },
];

const suggestions = [
  'Quel ton pour Instagram ?',
  'Rédigez une bio de marque',
  'Trois accroches pour l\'infolettre',
  'Un mot à éviter absolument ?',
];

export default function ChatPage() {
  const params = useParams();
  const brand = (params.brand as string).toUpperCase();

  return (
    <div className="portal-layout" style={{ background: C.black, color: C.bone }}>
      <Sidebar variant="client" brand={brand} />
      <div className="portal-main">
        <TopBar
          theme="dark"
          crumbs={[brand, 'Interroger la marque']}
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Pill kind="active" dot>En ligne · GPT-4 · v 1.3</Pill>
              <Btn variant="ghost" size="sm" onDark>Nouveau fil</Btn>
            </div>
          }
        />

        <div className="panel-split" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Thread list */}
          <div className="inner-nav" style={{ width: 280, background: C.ink, borderRight: `1px solid ${C.line}`, padding: '24px 0', overflowY: 'auto' }}>
            <Eyebrow color={C.fg3} style={{ padding: '0 24px', marginBottom: 14 }}>Fils récents</Eyebrow>
            {threads.map((x, i) => (
              <div key={i} style={{
                padding: '12px 24px',
                borderLeft: `2px solid ${x.on ? C.red : 'transparent'}`,
                background: x.on ? C.panel : 'transparent',
                cursor: 'pointer',
              }}>
                <div style={{ fontSize: 13, fontWeight: x.on ? 700 : 500, color: x.on ? C.bone : C.boneDim, letterSpacing: '-0.005em' }}>{x.t}</div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', color: C.muted, textTransform: 'uppercase', marginTop: 4 }}>{x.d}</div>
              </div>
            ))}
          </div>

          {/* Conversation area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.black }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '36px 56px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
                <span style={{ color: C.red, fontSize: 14, fontWeight: 700, letterSpacing: '0.16em', fontVariantNumeric: 'tabular-nums' }}>03 /</span>
                <Eyebrow color={C.fg3}>Fil · Ton pour Instagram</Eyebrow>
              </div>

              {/* User bubble */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
                <div style={{
                  maxWidth: 540, padding: '16px 20px', background: C.panel,
                  border: `1px solid ${C.line}`, fontSize: 15, lineHeight: 1.55, color: C.bone,
                }}>
                  Quel ton adopter sur Instagram pour une campagne d&apos;automne ?
                </div>
              </div>

              {/* AI reply */}
              <div style={{ marginBottom: 28, maxWidth: 720 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 22, height: 22, background: C.red, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 900 }}>SA</div>
                  <Eyebrow color={C.fg3}>{brand} · IA de marque</Eyebrow>
                  <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted }}>il y a 12 s</span>
                </div>
                <div style={{ background: C.panel, border: `1px solid ${C.line}`, padding: '22px 26px' }}>
                  <div style={{ fontSize: 15.5, lineHeight: 1.7, color: C.bone, marginBottom: 18 }}>
                    Sur Instagram, restez <strong>posés et sensoriels</strong>. Évitez l&apos;enthousiasme performé et les appels à l&apos;action directs.
                    Écrivez comme on sort d&apos;un sauna — lentement, avec des phrases courtes, en laissant la matière parler.
                    Nommez un élément (pierre, vapeur, bois), nommez une durée, nommez un geste. Rien de plus.
                  </div>
                  <div style={{ fontSize: 15.5, lineHeight: 1.7, color: C.bone, marginBottom: 18 }}>
                    Pour l&apos;automne précisément : la saison est déjà un argument. Laissez-la faire.
                    Un mot pour la lumière, un mot pour le froid qui arrive, un mot pour le feu intérieur.
                  </div>
                  <div style={{ background: C.ink, padding: '14px 18px', borderLeft: `2px solid ${C.red}`, fontStyle: 'italic', fontSize: 14, color: C.boneDim, marginBottom: 20 }}>
                    « La lumière tombe plus tôt. La pierre tient plus longtemps. Venez tenir avec elle. »
                  </div>
                  <div style={{ paddingTop: 16, borderTop: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    <Eyebrow color={C.muted} style={{ fontSize: 10 }}>Basé sur</Eyebrow>
                    {sources.map(s => (
                      <span key={s.n} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', border: `1px solid ${C.line2}`, color: C.bone, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em' }}>
                        <span style={{ color: C.red, fontVariantNumeric: 'tabular-nums' }}>{s.n}</span>
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
                <div style={{ maxWidth: 540, padding: '16px 20px', background: C.panel, border: `1px solid ${C.line}`, fontSize: 15, lineHeight: 1.55, color: C.bone }}>
                  Donne-moi trois légendes, une par semaine.
                </div>
              </div>

              {/* AI reply 2 */}
              <div style={{ maxWidth: 720 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 22, height: 22, background: C.red, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 900 }}>SA</div>
                  <Eyebrow color={C.fg3}>{brand} · IA de marque</Eyebrow>
                  <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.red }}>● En train d&apos;écrire</span>
                </div>
                <div style={{ background: C.panel, border: `1px solid ${C.line}`, padding: '22px 26px' }}>
                  <div className="grid-3" style={{ gap: 0, border: `1px solid ${C.line}` }}>
                    {[
                      { w: 'Semaine 01', t: 'La pierre garde. On revient chercher.' },
                      { w: 'Semaine 02', t: 'Quatre heures. Pas de téléphone. De l\'eau froide, du bois chaud.' },
                      { w: 'Semaine 03', t: 'La lumière tombe plus tôt. Le rituel, lui, dure.' },
                    ].map((l, i, a) => (
                      <div key={i} style={{ padding: '18px 20px', borderRight: i < a.length - 1 ? `1px solid ${C.line}` : 'none' }}>
                        <Eyebrow color={C.red} style={{ marginBottom: 10 }}>{l.w}</Eyebrow>
                        <div style={{ fontSize: 14, color: C.bone, lineHeight: 1.55 }}>{l.t}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Eyebrow color={C.muted} style={{ fontSize: 10 }}>Basé sur</Eyebrow>
                    <span style={{ padding: '4px 10px', border: `1px solid ${C.line2}`, color: C.bone, fontSize: 11, fontWeight: 700 }}>
                      <span style={{ color: C.red, fontVariantNumeric: 'tabular-nums' }}>07</span> Messages clés
                    </span>
                    <div style={{ marginLeft: 'auto' }}>
                      <Btn variant="ghost" size="sm" onDark>Copier</Btn>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Composer */}
            <div style={{ padding: '16px 56px 28px', borderTop: `1px solid ${C.line}`, background: C.black }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                <Eyebrow color={C.muted} style={{ fontSize: 10, display: 'flex', alignItems: 'center' }}>Suggestions ·</Eyebrow>
                {suggestions.map(q => (
                  <span key={q} style={{ padding: '7px 12px', border: `1px solid ${C.line2}`, fontSize: 12, fontWeight: 500, color: C.boneDim, cursor: 'pointer' }}>{q}</span>
                ))}
              </div>
              <div style={{ border: `1.5px solid ${C.lineStrong}`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ color: C.fg3, fontSize: 15, flex: 1 }}>Demander à la marque…</span>
                <span style={{ color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>⌥ ↵</span>
                <Btn variant="primary" size="sm">Envoyer  →</Btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
