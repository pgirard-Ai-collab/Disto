'use client';

import { C } from '@/lib/disto';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/browser';
import { logout } from '@/app/actions/logout';
import LanguageToggleMenu from '@/components/i18n/LanguageToggleMenu';

interface UserMenuProps {
  theme?: 'dark' | 'light';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('');
}

export default function UserMenu({ theme = 'light' }: UserMenuProps) {
  const t = useTranslations('userMenu');
  const [name, setName] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fg   = theme === 'light' ? C.black : C.bone;
  const avatarBg = theme === 'light' ? C.black : C.bone;
  const avatarFg = theme === 'light' ? C.bone  : C.black;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        t('fallbackName');
      setName(fullName);

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profile?.role) {
        setRole(profile.role);
      }
    });
  }, [t]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = name ? getInitials(name) : '…';
  const displayName = name || '…';
  const roleLabel = (() => {
    switch (role) {
      case 'agency_admin': return t('role.agency_admin');
      case 'client_admin': return t('role.client_admin');
      case 'client_reader': return t('role.client_reader');
      default: return role ?? '';
    }
  })();

  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* Name + role */}
      <span style={{
        fontSize: 11, fontWeight: 700,
        letterSpacing: '0.16em', textTransform: 'uppercase',
        color: C.muted,
      }}>
        {displayName} — {roleLabel}
      </span>

      {/* Avatar button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 34, height: 34,
          background: avatarBg, color: avatarFg,
          display: 'grid', placeItems: 'center',
          fontSize: 12, fontWeight: 700,
          border: 'none', cursor: 'pointer',
          flexShrink: 0,
          outline: open ? `2px solid ${C.red}` : 'none',
        }}
        aria-label={t('menuLabel')}
        aria-expanded={open}
      >
        {initials}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          minWidth: 220,
          background: theme === 'light' ? '#fff' : C.ink,
          border: `1px solid ${theme === 'light' ? C.border1 : C.line}`,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          zIndex: 100,
        }}>
          {/* User info */}
          <div style={{
            padding: '12px 16px',
            borderBottom: `1px solid ${theme === 'light' ? C.border1 : C.line}`,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: fg }}>{displayName}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{roleLabel}</div>
          </div>

          {/* Language toggle */}
          <LanguageToggleMenu theme={theme} />

          {/* Logout */}
          <form action={logout}>
            <button
              type="submit"
              style={{
                display: 'block', width: '100%',
                padding: '12px 16px', textAlign: 'left',
                background: 'none', border: 'none',
                fontSize: 11, fontWeight: 700,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: C.red, cursor: 'pointer',
                fontFamily: 'Archivo, sans-serif',
              }}
            >
              {t('logout')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
