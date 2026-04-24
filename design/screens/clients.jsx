/* global React, DISTO_C, Sidebar, TopBar, Eyebrow, Btn, Pill, SectionHead, Ico */
/* 2a — Liste des clients. Agency admin sees every brand.
   Table, filters, row hover, the "+ Nouveau client" primary action.        */
const C1 = DISTO_C;

function ClientsScreen() {
  const clients = [
    { name: 'SARTIGA',        brand: 'Centre de thermothérapie',     status: 'active',  sections: '13/13', updated: '2 h',   owner: 'C. Bellefleur' },
    { name: 'Maison Hervé',   brand: 'Boulangerie artisanale',       status: 'active',  sections: '11/13', updated: 'Hier',  owner: 'M. Lacroix' },
    { name: 'Aurore Lab',     brand: 'Cosmétique minéral',           status: 'draft',   sections: '4/13',  updated: '3 j',   owner: 'F. Trépanier' },
    { name: 'Borée Outdoor',  brand: 'Équipement plein-air',         status: 'active',  sections: '13/13', updated: '5 j',   owner: 'C. Bellefleur' },
    { name: 'Studio Vertige', brand: 'Architecture d’intérieur',status: 'draft',   sections: '7/13',  updated: '1 sem', owner: 'F. Trépanier' },
    { name: 'Câble & Co',     brand: 'Électroménager design',        status: 'archived',sections: '13/13', updated: '1 mois',owner: 'M. Lacroix' },
    { name: 'Orme & Fils',    brand: 'Brasserie artisanale',         status: 'active',  sections: '13/13', updated: '6 h',   owner: 'C. Bellefleur' },
    { name: 'Kiosque Bleu',   brand: 'Café · torréfacteur',          status: 'archived',sections: '13/13', updated: '2 mois',owner: 'M. Lacroix' },
  ];

  return (
    <div style={{
      width: 1440, height: 900, display: 'flex',
      background: C1.bone, color: C1.black,
      fontFamily: 'Archivo, sans-serif',
    }}>
      <Sidebar variant="agency" active="clients" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar
          theme="light"
          crumbs={['betula', 'Console', 'Clients']}
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C1.muted }}>
                Claire Bellefleur — Admin
              </span>
              <div style={{
                width: 34, height: 34, borderRadius: 2, background: C1.black, color: C1.bone,
                display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700,
              }}>CB</div>
            </div>
          }
        />

        <div style={{ padding: '36px 40px 28px', overflow: 'auto' }}>
          <SectionHead
            num="01"
            eyebrow="Console · Agence betula"
            title="Clients"
            subtitle="Chaque marque que nous accompagnons possède un portail. Draft, actif ou archivé — toujours un seul signal."
            right={
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn variant="ghost" size="sm">Exporter CSV</Btn>
                <Btn variant="primary" size="sm">+  Nouveau client</Btn>
              </div>
            }
          />

          {/* Filter bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 24, gap: 20, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', gap: 0, border: `1px solid rgba(0,0,0,0.24)` }}>
              {[
                { k: 'Tous',     n: 12, on: true },
                { k: 'Actif',    n: 6 },
                { k: 'Draft',    n: 3 },
                { k: 'Archivé',  n: 3 },
              ].map(f => (
                <div key={f.k} style={{
                  padding: '10px 18px',
                  background: f.on ? C1.black : 'transparent',
                  color: f.on ? C1.bone : C1.black,
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                  borderRight: `1px solid rgba(0,0,0,0.24)`,
                  display: 'flex', gap: 10, alignItems: 'center',
                }}>
                  {f.k}
                  <span style={{
                    color: f.on ? C1.bone : C1.muted, fontVariantNumeric: 'tabular-nums',
                    fontSize: 11,
                  }}>{f.n}</span>
                </div>
              ))}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              borderBottom: `1.5px solid ${C1.black}`, paddingBottom: 6, width: 280,
            }}>
              <span style={{ color: C1.muted, fontSize: 14 }}>⌕</span>
              <span style={{ color: C1.muted, fontSize: 14 }}>Rechercher une marque…</span>
            </div>
          </div>

          {/* Table */}
          <div style={{ background: '#FFFFFF', border: `1px solid rgba(0,0,0,0.12)` }}>
            {/* Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '44px 1.4fr 1.6fr 0.9fr 1fr 1fr 60px',
              padding: '14px 20px', borderBottom: `1px solid rgba(0,0,0,0.12)`,
              fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: C1.muted,
            }}>
              <span>№</span>
              <span>Marque</span>
              <span>Activité</span>
              <span>Statut</span>
              <span>Structure</span>
              <span>Dernière MAJ</span>
              <span style={{ textAlign: 'right' }}>—</span>
            </div>
            {/* Rows */}
            {clients.map((c, i) => (
              <div key={c.name} style={{
                display: 'grid',
                gridTemplateColumns: '44px 1.4fr 1.6fr 0.9fr 1fr 1fr 60px',
                padding: '16px 20px', alignItems: 'center',
                borderBottom: i < clients.length - 1 ? `1px solid rgba(0,0,0,0.08)` : 'none',
                background: i === 0 ? 'rgba(240,45,20,0.04)' : 'transparent',
                fontSize: 14,
              }}>
                <span style={{
                  fontVariantNumeric: 'tabular-nums', fontWeight: 700,
                  color: i === 0 ? C1.red : C1.muted, fontSize: 12, letterSpacing: '0.08em',
                }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontWeight: 700, letterSpacing: '-0.005em' }}>{c.name}</span>
                <span style={{ color: C1.muted }}>{c.brand}</span>
                <span><Pill kind={c.status}>{c.status === 'active' ? 'Actif' : c.status === 'draft' ? 'Draft' : 'Archivé'}</Pill></span>
                <span style={{ fontVariantNumeric: 'tabular-nums', color: C1.black }}>
                  <span style={{ fontWeight: 700 }}>{c.sections.split('/')[0]}</span>
                  <span style={{ color: C1.muted }}> / 13 sections</span>
                </span>
                <span style={{ color: C1.muted }}>
                  <div style={{ color: C1.black, fontWeight: 500 }}>il y a {c.updated}</div>
                  <div style={{ fontSize: 11, color: C1.muted, marginTop: 2 }}>par {c.owner}</div>
                </span>
                <span style={{ textAlign: 'right', color: C1.muted, fontSize: 18 }}>→</span>
              </div>
            ))}
          </div>

          {/* Meta footer */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '14px 4px', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: C1.muted,
          }}>
            <span>8 sur 12 marques</span>
            <span>Tri · Dernière MAJ ↓</span>
          </div>
        </div>
      </div>
    </div>
  );
}

window.ClientsScreen = ClientsScreen;
