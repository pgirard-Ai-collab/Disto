'use client';

import { C } from '@/lib/disto';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Eyebrow from '@/components/ui/Eyebrow';
import { createClient } from '@/lib/supabase/browser';

type BrandOption = { slug: string; brandName: string; orgName: string };

type SidebarVariant = 'agency' | 'client';

interface SidebarProps {
  variant?: SidebarVariant;
  brand?: string;
  clientId?: string;
  hasPublishedVersion?: boolean;
}

interface SidebarContentProps {
  variant: SidebarVariant;
  brand: string;
  brandName: string;
  otherBrands: BrandOption[];
  items: { id: string; n: string; label: string; href: string }[];
  isActive: (href: string) => boolean;
}

function SidebarContent({ variant, brand, brandName, otherBrands, items, isActive }: SidebarContentProps) {
  const tCommon = useTranslations('common');
  const tSidebar = useTranslations('sidebar');
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const hasMultipleBrands = otherBrands.length > 0;
  const displayName = variant === 'agency' ? tCommon('brandActor') : (brandName || brand);

  return (
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
        <Eyebrow color={C.muted} style={{ fontSize: 10 }}>{tCommon('brandOs')}</Eyebrow>
      </div>

      {/* Tenant block */}
      <div ref={dropdownRef} style={{ padding: '20px 24px 18px', borderBottom: `1px solid ${C.line}`, position: 'relative' }}>
        <Eyebrow color={C.muted} style={{ fontSize: 10, marginBottom: 8 }}>
          {variant === 'agency' ? tSidebar('agency') : tSidebar('brand')}
        </Eyebrow>
        <div
          onClick={() => { if (hasMultipleBrands) setDropdownOpen(o => !o); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            cursor: hasMultipleBrands ? 'pointer' : 'default',
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>
            {displayName}
          </div>
          {hasMultipleBrands && (
            <span style={{
              color: C.fg3,
              fontSize: 12,
              transform: dropdownOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 140ms ease',
              display: 'inline-block',
            }}>⌄</span>
          )}
          {!hasMultipleBrands && (
            <span style={{ color: C.fg3, fontSize: 12 }}>⌄</span>
          )}
        </div>
        {variant === 'client' && !dropdownOpen && (
          <div style={{ color: C.fg3, fontSize: 11, marginTop: 4, letterSpacing: '0.04em' }}>
            {tCommon('brandActorTagline')}
          </div>
        )}

        {/* Brand switcher dropdown */}
        {dropdownOpen && hasMultipleBrands && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: C.panel,
            border: `1px solid ${C.lineStrong}`,
            zIndex: 50,
            padding: '6px 0',
          }}>
            {/* current brand (active) */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              padding: '10px 18px',
              borderLeft: `2px solid ${C.red}`,
              background: C.ink,
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.bone }}>{displayName}</span>
              <span style={{ fontSize: 10, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Actuel</span>
            </div>

            {otherBrands.map(b => (
              <button
                key={b.slug}
                onClick={() => { setDropdownOpen(false); router.push(`/${b.slug}`); }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  width: '100%',
                  padding: '10px 18px',
                  background: 'transparent',
                  border: 'none',
                  borderLeft: '2px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'Archivo, sans-serif',
                  transition: 'background 120ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.ink; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: C.bone }}>{b.brandName}</span>
                <span style={{ fontSize: 10, color: C.fg3, letterSpacing: '0.04em' }}>{b.orgName}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ padding: '20px 0', flex: 1, overflowY: 'auto' }}>
        <Eyebrow color={C.muted} style={{ padding: '0 24px', marginBottom: 10, fontSize: 10 }}>
          {variant === 'agency' ? tSidebar('agencyConsole') : tSidebar('brandPortal')}
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
        <span>{tCommon('brandFooter')}</span>
      </div>
    </aside>
  );
}

export default function Sidebar({ variant = 'agency', brand, clientId, hasPublishedVersion }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [allBrands, setAllBrands] = useState<BrandOption[]>([]);
  const tSidebar = useTranslations('sidebar');
  const tCommon = useTranslations('common');

  const resolvedBrand = brand ?? 'SARTIGA';

  // Fetch all active brands for the logged-in user (client variant only)
  useEffect(() => {
    if (variant !== 'client') return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from('client_users')
        .select('clients(slug, brand_name, org_name)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .then(({ data }) => {
          const list = (data ?? [])
            .map(r => {
              const c = r.clients as unknown as { slug: string; brand_name: string; org_name: string } | null;
              if (!c) return null;
              return { slug: c.slug, brandName: c.brand_name, orgName: c.org_name };
            })
            .filter((b): b is BrandOption => b !== null);
          setAllBrands(list);
        });
    });
  }, [variant]);

  const agencyItems = (() => {
    const items = [
      { id: 'clients', n: '01', label: tSidebar('agency_clients'), href: '/clients' },
    ];
    if (clientId) {
      items.push(
        { id: 'import', n: '02', label: tSidebar('agency_import'), href: `/clients/${clientId}/import` },
        { id: 'editor', n: '03', label: tSidebar('agency_editor'), href: `/clients/${clientId}/editor` },
        { id: 'access', n: '04', label: tSidebar('agency_access'), href: `/clients/${clientId}/access` },
      );
      if (hasPublishedVersion) {
        items.push(
          { id: 'system-prompt', n: '05', label: tSidebar('agency_systemPrompt'), href: `/clients/${clientId}/system-prompt` },
          { id: 'chat', n: '06', label: tSidebar('agency_chat'), href: `/clients/${clientId}/chat` },
        );
      }
    }
    return items;
  })();

  const clientItems = [
    { id: 'dashboard', n: '01', label: tSidebar('client_dashboard'), href: `/${resolvedBrand}` },
    { id: 'strategie', n: '02', label: tSidebar('client_strategie'), href: `/${resolvedBrand}/strategie` },
    { id: 'chat',      n: '03', label: tSidebar('client_chat'),      href: `/${resolvedBrand}/chat` },
    { id: 'export',    n: '04', label: tSidebar('client_systemPrompt'), href: `/${resolvedBrand}/export` },
  ];

  const items = variant === 'agency' ? agencyItems : clientItems;
  const exactRoots = new Set<string>(['/', `/${resolvedBrand}`, '/clients']);
  const isActive = (href: string) => {
    if (exactRoots.has(href)) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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
          aria-label={tSidebar('menuLabel')}
        >
          ☰
        </button>
        <span style={{ color: C.red, fontWeight: 700, fontSize: 18, letterSpacing: '-0.03em' }}>
          DISTO.
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: C.fg3, fontWeight: 700 }}>
          {variant === 'agency' ? tCommon('brandActor') : resolvedBrand}
        </span>
      </div>

      {/* Sidebar — fixed on mobile when open, static on desktop */}
      <div style={{ position: 'relative' }}>
        <div
          className={`sidebar${open ? ' open' : ''}`}
          style={{ width: 256, height: '100%', position: 'sticky', top: 0 }}
        >
          <SidebarContent
            variant={variant}
            brand={resolvedBrand}
            brandName={allBrands.find(b => b.slug === resolvedBrand)?.brandName ?? resolvedBrand}
            otherBrands={allBrands.filter(b => b.slug !== resolvedBrand)}
            items={items}
            isActive={isActive}
          />
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
