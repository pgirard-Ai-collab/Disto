import { C } from '@/lib/disto';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import SectionHead from '@/components/ui/SectionHead';
import Btn from '@/components/ui/Btn';
import Pill from '@/components/ui/Pill';
import Link from 'next/link';
import type { PillKind } from '@/lib/disto';

const clients = [
  { id: 'sartiga',        name: 'SARTIGA',        brand: 'Centre de thermothérapie',   status: 'active'   as PillKind, sections: 13, total: 13, updated: '2 h',    owner: 'C. Bellefleur' },
  { id: 'maison-herve',   name: 'Maison Hervé',   brand: 'Boulangerie artisanale',     status: 'active'   as PillKind, sections: 11, total: 13, updated: 'Hier',   owner: 'M. Lacroix' },
  { id: 'aurore-lab',     name: 'Aurore Lab',     brand: 'Cosmétique minéral',         status: 'draft'    as PillKind, sections: 4,  total: 13, updated: '3 j',    owner: 'F. Trépanier' },
  { id: 'boree-outdoor',  name: 'Borée Outdoor',  brand: 'Équipement plein-air',       status: 'active'   as PillKind, sections: 13, total: 13, updated: '5 j',    owner: 'C. Bellefleur' },
  { id: 'studio-vertige', name: 'Studio Vertige', brand: 'Architecture d\'intérieur',  status: 'draft'    as PillKind, sections: 7,  total: 13, updated: '1 sem',  owner: 'F. Trépanier' },
  { id: 'cable-co',       name: 'Câble & Co',     brand: 'Électroménager design',      status: 'archived' as PillKind, sections: 13, total: 13, updated: '1 mois', owner: 'M. Lacroix' },
  { id: 'orme-fils',      name: 'Orme & Fils',    brand: 'Brasserie artisanale',       status: 'active'   as PillKind, sections: 13, total: 13, updated: '6 h',    owner: 'C. Bellefleur' },
  { id: 'kiosque-bleu',   name: 'Kiosque Bleu',   brand: 'Café · torréfacteur',        status: 'archived' as PillKind, sections: 13, total: 13, updated: '2 mois', owner: 'M. Lacroix' },
];

const statusLabel: Record<string, string> = {
  active: 'Actif', draft: 'Draft', archived: 'Archivé',
};

export default function ClientsPage() {
  return (
    <div className="portal-layout" style={{ background: C.bone, color: C.black }}>
      <Sidebar variant="agency" />
      <div className="portal-main">
        <TopBar
          theme="light"
          crumbs={['betula', 'Console', 'Clients']}
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted }}>
                Claire Bellefleur — Admin
              </span>
              <div style={{
                width: 34, height: 34, background: C.black, color: C.bone,
                display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700,
              }}>CB</div>
            </div>
          }
        />

        <div className="portal-scroll" style={{ padding: '36px 40px 28px' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 20 }}>
            <div style={{ display: 'flex', gap: 0, border: `1px solid ${C.border2}` }}>
              {[
                { k: 'Tous', n: 12, on: true },
                { k: 'Actif', n: 6 },
                { k: 'Draft', n: 3 },
                { k: 'Archivé', n: 3 },
              ].map(f => (
                <div key={f.k} style={{
                  padding: '10px 18px',
                  background: f.on ? C.black : 'transparent',
                  color: f.on ? C.bone : C.black,
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                  borderRight: `1px solid ${C.border2}`,
                  display: 'flex', gap: 10, alignItems: 'center',
                  cursor: 'pointer',
                }}>
                  {f.k}
                  <span style={{ color: f.on ? C.bone : C.muted, fontSize: 11 }}>{f.n}</span>
                </div>
              ))}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              borderBottom: `1.5px solid ${C.black}`, paddingBottom: 6, width: 280,
            }}>
              <span style={{ color: C.muted, fontSize: 14 }}>⌕</span>
              <span style={{ color: C.muted, fontSize: 14 }}>Rechercher une marque…</span>
            </div>
          </div>

          {/* Table — scrolls horizontally on small screens */}
          <div className="table-scroll">
            <div style={{ background: '#FFFFFF', border: `1px solid ${C.border1}`, minWidth: 640 }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '44px 1.4fr 1.6fr 0.9fr 1fr 1fr 60px',
                padding: '14px 20px',
                borderBottom: `1px solid ${C.border1}`,
                fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                color: C.muted,
              }}>
                <span>№</span>
                <span>Marque</span>
                <span>Activité</span>
                <span>Statut</span>
                <span>Structure</span>
                <span>Dernière MAJ</span>
                <span style={{ textAlign: 'right' }}>—</span>
              </div>
              {clients.map((c, i) => (
                <Link key={c.id} href={`/clients/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '44px 1.4fr 1.6fr 0.9fr 1fr 1fr 60px',
                    padding: '16px 20px',
                    alignItems: 'center',
                    borderBottom: i < clients.length - 1 ? `1px solid rgba(0,0,0,0.08)` : 'none',
                    background: i === 0 ? 'rgba(240,45,20,0.04)' : 'transparent',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}>
                    <span style={{
                      fontVariantNumeric: 'tabular-nums', fontWeight: 700,
                      color: i === 0 ? C.red : C.muted, fontSize: 12, letterSpacing: '0.08em',
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{ fontWeight: 700, letterSpacing: '-0.005em' }}>{c.name}</span>
                    <span style={{ color: C.muted }}>{c.brand}</span>
                    <span><Pill kind={c.status}>{statusLabel[c.status]}</Pill></span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                      <span style={{ fontWeight: 700 }}>{c.sections}</span>
                      <span style={{ color: C.muted }}> / 13 sections</span>
                    </span>
                    <span>
                      <div style={{ color: C.black, fontWeight: 500 }}>il y a {c.updated}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>par {c.owner}</div>
                    </span>
                    <span style={{ textAlign: 'right', color: C.muted, fontSize: 18 }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '14px 4px', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted,
          }}>
            <span>8 sur 12 marques</span>
            <span>Tri · Dernière MAJ ↓</span>
          </div>
        </div>
      </div>
    </div>
  );
}
