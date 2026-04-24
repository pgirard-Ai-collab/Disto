'use client';

import { C } from '@/lib/disto';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Eyebrow from '@/components/ui/Eyebrow';

type SidebarVariant = 'agency' | 'client';

interface SidebarProps {
  variant?: SidebarVariant;
  brand?: string;
  clientId?: string;
}

const agencyItems = (clientId?: string) => [
  { id: 'clients', n: '01', label: 'Clients',              href: '/clients' },
  { id: 'import',  n: '02', label: 'Import Disto',         href: clientId ? `/clients/${clientId}/import` : '/clients' },
  { id: 'editor',  n: '03', label: 'Éditeur de structure', href: clientId ? `/clients/${clientId}/editor` : '/clients' },
  { id: 'access',  n: '04', label: 'Accès',                href: clientId ? `/clients/${clientId}/access` : '/clients' },
];

const clientItems = (brand: string) => [
  { id: 'dashboard', n: '01', label: 'Dashboard',            href: `/${brand}` },
  { id: 'strategy',  n: '02', label: 'Stratégie',            href: `/${brand}/strategy` },
  { id: 'chat',      n: '03', label: 'Interroger la marque', href: `/${brand}/chat` },
  { id: 'export',    n: '04', label: 'System Prompt',        href: `/${brand}/export` },
];

export default function Sidebar({ variant = 'agency', brand, clientId }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = variant === 'agency'
    ? agencyItems(clientId)
    : clientItems(brand ?? 'brand');

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  // Close sidebar when route changes
  useEffect(() => { setOpen(false); }, [pathname]);
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const sidebarContent = (
    <aside className="sidebar" style={{
      width: 256,
      background: C.black,
      color: C.bone,
      borderRight: `1px solid ${C.line}`,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Archivo, sans-serif',
      flexShrink: 0,
      height: '100%',
    }}>
      {/* Wordmark */}
      <div style={{
        padding: '22px 24px 24px',
        borderBottom: `1px solid ${C.line}`,
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
      }}>
        <span style={{ color: C.red, fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em' }}>
          DISTO.
        </span>
        <Eyebrow color={C.muted} style={{ fontSize: 10 }}>Brand OS</Eyebrow>
      </div>

      {/* Tenant block */}
      <div style={{ padding: '20px 24px 18px', borderBottom: `1px solid ${C.line}` }}>
        <Eyebrow color={C.muted} style={{ fontSize: 10, marginBottom: 8 }}>
          {variant === 'agency' ? 'Agence' : 'Marque'}
        </Eyebrow>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>
            {variant === 'agency' ? 'betula' : (brand ?? 'SARTIGA')}
          </div>
          <span style={{ color: C.fg3, fontSize: 12 }}>⌄</span>
        </div>
        {variant === 'client' && (
          <div style={{ color: C.fg3, fontSize: 11, marginTop: 4, letterSpacing: '0.04em' }}>
            Centre de thermothérapie
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ padding: '20px 0', flex: 1, overflowY: 'auto' }}>
        <Eyebrow color={C.muted} style={{ padding: '0 24px', marginBottom: 10, fontSize: 10 }}>
          {variant === 'agency' ? 'Console agence' : 'Portail marque'}
        </Eyebrow>
        {items.map(it => {
          const on = isActive(it.href);
          return (
            <Link key={it.id} href={it.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 24px',
                background: on ? C.panel : 'transparent',
                borderLeft: `2px solid ${on ? C.red : 'transparent'}`,
                color: on ? C.bone : C.boneDim,
                transition: 'all 140ms ease',
              }}>
                <span style={{
                  fontFamily: 'Archivo, sans-serif',
                  fontSize: 11,
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  color: on ? C.red : C.muted,
                  letterSpacing: '0.08em',
                  minWidth: 20,
                }}>
                  {it.n}
                </span>
                <span style={{ fontSize: 14, fontWeight: on ? 700 : 500, letterSpacing: '-0.005em' }}>
                  {it.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px 24px',
        borderTop: `1px solid ${C.line}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: C.fg3,
        fontSize: 10,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        fontWeight: 700,
      }}>
        <span>v 1.4.0</span>
        <span>·</span>
        <span>Signal clair</span>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile top nav bar */}
      <div className="mobile-nav" style={{ background: C.black, color: C.bone }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            background: 'none',
            border: 'none',
            color: C.bone,
            fontSize: 20,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: 4,
            lineHeight: 1,
          }}
          aria-label="Menu"
        >
          ☰
        </button>
        <span style={{ color: C.red, fontWeight: 700, fontSize: 18, letterSpacing: '-0.03em' }}>
          DISTO.
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: C.fg3, fontWeight: 700 }}>
          {variant === 'agency' ? 'betula' : (brand ?? 'SARTIGA')}
        </span>
      </div>

      {/* Sidebar — fixed on mobile when open, static on desktop */}
      <div style={{ position: 'relative' }}>
        <div
          className={`sidebar${open ? ' open' : ''}`}
          style={{
            width: 256,
            height: '100%',
            position: 'sticky',
            top: 0,
          }}
        >
          {sidebarContent}
        </div>
      </div>

      {/* Overlay on mobile */}
      {open && (
        <div
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
