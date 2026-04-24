/* global React, DISTO_C, Sidebar, TopBar, Eyebrow, Btn, Pill, SectionHead */
/* 2b — Fiche client · Import Disto.
   PDF drag-drop zone + 4-step progress (Upload → Extraction → Structuration IA → Prêt)
   + structure preview.                                                       */
const C2 = DISTO_C;

function ImportScreen() {
  const steps = [
    { n: '01', key: 'upload',   label: 'Upload',            state: 'done', meta: 'SARTIGA_brand_v3.pdf · 4.2 Mo' },
    { n: '02', key: 'extract',  label: 'Extraction',        state: 'done', meta: '42 pages · 18 348 mots' },
    { n: '03', key: 'ai',       label: 'Structuration IA',  state: 'done', meta: '13 sections détectées' },
    { n: '04', key: 'ready',    label: 'Prêt',              state: 'active', meta: 'En attente de validation' },
  ];
  const sections = [
    { n: '01', name: 'Mission',             preview: 'Offrir une expérience de thermothérapie fondée sur le silence, la chaleur et la forêt.' },
    { n: '02', name: 'Archétype',           preview: 'Le Sage — calme, patient, fondé dans la nature.' },
    { n: '03', name: 'Ton',                 preview: 'Posé. Sensoriel. Économe en mots. Métaphores d’éléments naturels.' },
    { n: '04', name: 'Value Proposition',   preview: 'Le rituel thermal comme retour à soi — quatre heures hors du monde.' },
    { n: '05', name: 'Positionnement',      preview: 'Premium, intime, enraciné — à l’opposé du spa hôtelier.' },
    { n: '06', name: 'Personas',            preview: '3 profils — Le professionnel saturé, La couple-rituel, L’athlète en récupération.' },
    { n: '07', name: 'Messages clés',       preview: '5 messages pivots pour les canaux print, social, infolettre.' },
    { n: '08', name: 'Manifeste',           preview: 'Ralentir. Chauffer. Refroidir. Respirer. Recommencer.' },
    { n: '09', name: 'Valeurs',             preview: 'Silence, matière, soin, enracinement, transmission.' },
    { n: '10', name: 'Do / Don’t',     preview: '12 règles — mots à éviter, rituels à nommer, images à bannir.' },
    { n: '11', name: 'Identité',            preview: 'Palette nuit, papiers pierre, serif humaniste, photographie vaporeuse.' },
    { n: '12', name: 'Intention',           preview: 'Construire un lieu-culte en dehors des logiques touristiques.' },
    { n: '13', name: 'Contexte concurrentiel', preview: '4 acteurs cartographiés — positionnement différenciant sur le silence et la durée.' },
  ];

  return (
    <div style={{
      width: 1440, height: 900, display: 'flex',
      background: C2.bone, color: C2.black, fontFamily: 'Archivo, sans-serif',
    }}>
      <Sidebar variant="agency" active="import" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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

        <div style={{ padding: '32px 40px 40px', overflow: 'auto' }}>
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
            gap: 24,
            marginBottom: 32,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
              <div style={{
                width: 58, height: 74, background: C2.bone, border: `1.5px solid ${C2.black}`,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '8px 6px',
                fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
              }}>
                <span style={{ color: C2.red }}>PDF</span>
                <span style={{ color: C2.muted }}>4.2 Mo</span>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: C2.muted, textTransform: 'uppercase', marginBottom: 6 }}>
                  Document actuel · 03:42
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>
                  SARTIGA_brand_v3.pdf
                </div>
                <div style={{ fontSize: 13, color: C2.muted, marginTop: 4 }}>
                  Déposé par F. Trépanier · 42 pages · Extraction terminée
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="ghost" size="sm">Remplacer</Btn>
              <Btn variant="secondary" size="sm">Voir le PDF</Btn>
            </div>
          </div>

          {/* 4-step progress */}
          <div style={{
            background: '#FFFFFF', border: `1px solid rgba(0,0,0,0.12)`,
            padding: '28px 32px', marginBottom: 40,
          }}>
            <Eyebrow color={C2.muted} style={{ marginBottom: 22 }}>Pipeline · 4 étapes</Eyebrow>
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
              {/* progress line */}
              <div style={{
                position: 'absolute', left: 20, right: 20, top: 14, height: 2,
                background: 'rgba(0,0,0,0.14)',
              }} />
              <div style={{
                position: 'absolute', left: 20, top: 14, height: 2,
                width: 'calc(75% - 10px)',
                background: C2.red,
              }} />
              {steps.map((s, i) => {
                const done = s.state === 'done';
                const active = s.state === 'active';
                return (
                  <div key={s.key} style={{ paddingRight: 20, position: 'relative' }}>
                    <div style={{
                      width: 30, height: 30,
                      background: done ? C2.red : (active ? C2.black : C2.bone),
                      border: `1.5px solid ${done || active ? C2.black : 'rgba(0,0,0,0.24)'}`,
                      color: done || active ? '#fff' : C2.muted,
                      fontFamily: 'Archivo, sans-serif', fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums', fontSize: 11,
                      display: 'grid', placeItems: 'center', marginBottom: 14,
                      position: 'relative', zIndex: 1,
                    }}>
                      {done ? '✓' : s.n}
                    </div>
                    <Eyebrow color={active ? C2.red : (done ? C2.black : C2.muted)} style={{ fontSize: 10, marginBottom: 6 }}>
                      {s.label}
                    </Eyebrow>
                    <div style={{ fontSize: 13, fontWeight: 500, color: done ? C2.black : (active ? C2.black : C2.muted), letterSpacing: '-0.005em' }}>
                      {s.meta}
                    </div>
                    {active && (
                      <div style={{
                        display: 'inline-block', marginTop: 8,
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
                        color: C2.red, textTransform: 'uppercase',
                      }}>
                        ● En cours
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Structure preview */}
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <div>
              <Eyebrow color={C2.muted} style={{ marginBottom: 6 }}>03 / Aperçu de la structure générée</Eyebrow>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em' }}>
                13 sections détectées — <span style={{ color: C2.muted }}>prêtes pour validation.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="ghost" size="sm">Tout rejeter</Btn>
              <Btn variant="secondary" size="sm">Ouvrir l’éditeur  →</Btn>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, background: '#FFFFFF', border: `1px solid rgba(0,0,0,0.12)` }}>
            {sections.map((s, i) => (
              <div key={s.n} style={{
                padding: '16px 20px',
                borderRight: (i + 1) % 3 !== 0 ? `1px solid rgba(0,0,0,0.08)` : 'none',
                borderBottom: i < sections.length - 3 ? `1px solid rgba(0,0,0,0.08)` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                  <span style={{ color: C2.red, fontWeight: 700, fontSize: 11, letterSpacing: '0.08em', fontVariantNumeric: 'tabular-nums' }}>{s.n}</span>
                  <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.005em' }}>{s.name}</span>
                  <span style={{ marginLeft: 'auto' }}><Pill kind="auto" dot={false}>Auto</Pill></span>
                </div>
                <div style={{ fontSize: 12, color: C2.muted, lineHeight: 1.5 }}>
                  {s.preview}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.ImportScreen = ImportScreen;
