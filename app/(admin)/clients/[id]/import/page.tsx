import { C } from '@/lib/disto';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import SectionHead from '@/components/ui/SectionHead';
import Btn from '@/components/ui/Btn';
import Pill from '@/components/ui/Pill';
import Eyebrow from '@/components/ui/Eyebrow';

const steps = [
  { n: '01', key: 'upload',  label: 'Upload',           state: 'done',   meta: 'SARTIGA_brand_v3.pdf · 4.2 Mo' },
  { n: '02', key: 'extract', label: 'Extraction',        state: 'done',   meta: '42 pages · 18 348 mots' },
  { n: '03', key: 'ai',      label: 'Structuration IA',  state: 'done',   meta: '13 sections détectées' },
  { n: '04', key: 'ready',   label: 'Prêt',              state: 'active', meta: 'En attente de validation' },
];

const sections = [
  { n: '01', name: 'Mission',                  preview: 'Offrir une expérience de thermothérapie fondée sur le silence, la chaleur et la forêt.' },
  { n: '02', name: 'Archétype',                preview: 'Le Sage — calme, patient, fondé dans la nature.' },
  { n: '03', name: 'Ton',                      preview: 'Posé. Sensoriel. Économe en mots. Métaphores d\'éléments naturels.' },
  { n: '04', name: 'Value Proposition',        preview: 'Le rituel thermal comme retour à soi — quatre heures hors du monde.' },
  { n: '05', name: 'Positionnement',           preview: 'Premium, intime, enraciné — à l\'opposé du spa hôtelier.' },
  { n: '06', name: 'Personas',                 preview: '3 profils — Le professionnel saturé, La couple-rituel, L\'athlète en récupération.' },
  { n: '07', name: 'Messages clés',            preview: '5 messages pivots pour les canaux print, social, infolettre.' },
  { n: '08', name: 'Manifeste',                preview: 'Ralentir. Chauffer. Refroidir. Respirer. Recommencer.' },
  { n: '09', name: 'Valeurs',                  preview: 'Silence, matière, soin, enracinement, transmission.' },
  { n: '10', name: 'Do / Don\'t',              preview: '12 règles — mots à éviter, rituels à nommer, images à bannir.' },
  { n: '11', name: 'Identité',                 preview: 'Palette nuit, papiers pierre, serif humaniste, photographie vaporeuse.' },
  { n: '12', name: 'Intention',                preview: 'Construire un lieu-culte en dehors des logiques touristiques.' },
  { n: '13', name: 'Contexte concurrentiel',   preview: '4 acteurs cartographiés — positionnement différenciant sur le silence et la durée.' },
];

export default async function ImportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="portal-layout" style={{ background: C.bone, color: C.black }}>
      <Sidebar variant="agency" clientId={id} />
      <div className="portal-main">
        <TopBar
          theme="light"
          crumbs={['betula', 'Clients', 'SARTIGA', 'Import Disto']}
          right={
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="ghost" size="sm">Annuler</Btn>
              <Btn variant="primary" size="sm">Valider la structure  →</Btn>
            </div>
          }
        />

        <div className="portal-scroll" style={{ padding: '32px 40px 40px' }}>
          <SectionHead
            num="02"
            eyebrow="SARTIGA · Nouveau Disto"
            title="Import Disto."
            subtitle="Déposez le document brand du client. Nous extrayons, nous structurons, vous validez."
          />

          {/* Drop zone */}
          <div style={{
            border: `1.5px dashed rgba(0,0,0,0.3)`,
            background: '#FFFFFF',
            padding: '28px 32px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 24, marginBottom: 32,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
              <div style={{
                width: 58, height: 74, background: C.bone, border: `1.5px solid ${C.black}`,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '8px 6px',
                fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
              }}>
                <span style={{ color: C.red }}>PDF</span>
                <span style={{ color: C.muted }}>4.2 Mo</span>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: C.muted, textTransform: 'uppercase', marginBottom: 6 }}>
                  Document actuel · 03:42
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>SARTIGA_brand_v3.pdf</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Déposé par F. Trépanier · 42 pages · Extraction terminée</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="ghost" size="sm">Remplacer</Btn>
              <Btn variant="secondary" size="sm">Voir le PDF</Btn>
            </div>
          </div>

          {/* 4-step progress */}
          <div style={{ background: '#FFFFFF', border: `1px solid ${C.border1}`, padding: '28px 32px', marginBottom: 40 }}>
            <Eyebrow color={C.muted} style={{ marginBottom: 22 }}>Pipeline · 4 étapes</Eyebrow>
            <div className="grid-pipeline" style={{ position: 'relative', gap: 0 }}>
              <div style={{ position: 'absolute', left: 20, right: 20, top: 14, height: 2, background: 'rgba(0,0,0,0.14)' }} />
              <div style={{ position: 'absolute', left: 20, top: 14, height: 2, width: 'calc(75% - 10px)', background: C.red }} />
              {steps.map(s => {
                const done = s.state === 'done';
                const active = s.state === 'active';
                return (
                  <div key={s.key} style={{ paddingRight: 20, position: 'relative' }}>
                    <div style={{
                      width: 30, height: 30,
                      background: done ? C.red : (active ? C.black : C.bone),
                      border: `1.5px solid ${done || active ? C.black : 'rgba(0,0,0,0.24)'}`,
                      color: done || active ? '#fff' : C.muted,
                      fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: 11,
                      display: 'grid', placeItems: 'center', marginBottom: 14,
                      position: 'relative', zIndex: 1,
                    }}>
                      {done ? '✓' : s.n}
                    </div>
                    <Eyebrow color={active ? C.red : (done ? C.black : C.muted)} style={{ fontSize: 10, marginBottom: 6 }}>
                      {s.label}
                    </Eyebrow>
                    <div style={{ fontSize: 13, fontWeight: 500, color: done ? C.black : (active ? C.black : C.muted) }}>
                      {s.meta}
                    </div>
                    {active && (
                      <div style={{ display: 'inline-block', marginTop: 8, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', color: C.red, textTransform: 'uppercase' }}>
                        ● En cours
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Structure preview */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <Eyebrow color={C.muted} style={{ marginBottom: 6 }}>03 / Aperçu de la structure générée</Eyebrow>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em' }}>
                13 sections détectées — <span style={{ color: C.muted }}>prêtes pour validation.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="ghost" size="sm">Tout rejeter</Btn>
              <Btn variant="secondary" size="sm">Ouvrir l&apos;éditeur  →</Btn>
            </div>
          </div>

          <div className="grid-3" style={{ gap: 0, background: '#FFFFFF', border: `1px solid ${C.border1}` }}>
            {sections.map((s, i) => (
              <div key={s.n} style={{
                padding: '16px 20px',
                borderRight: (i + 1) % 3 !== 0 ? `1px solid rgba(0,0,0,0.08)` : 'none',
                borderBottom: i < sections.length - 3 ? `1px solid rgba(0,0,0,0.08)` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                  <span style={{ color: C.red, fontWeight: 700, fontSize: 11, letterSpacing: '0.08em', fontVariantNumeric: 'tabular-nums' }}>{s.n}</span>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</span>
                  <span style={{ marginLeft: 'auto' }}><Pill kind="auto" dot={false}>Auto</Pill></span>
                </div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{s.preview}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
