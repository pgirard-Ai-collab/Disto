'use client';

import { C } from '@/lib/disto';
import Eyebrow from '@/components/ui/Eyebrow';
import Btn from '@/components/ui/Btn';
import AuthBrandPanel from '@/components/layout/AuthBrandPanel';
import LanguageToggleAuth from '@/components/i18n/LanguageToggleAuth';
import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      const msg = authError.message.toLowerCase();
      if (msg.includes('invalid') || msg.includes('credentials')) {
        setError(t('errors.invalidCredentials'));
      } else if (msg.includes('banned') || msg.includes('disabled')) {
        setError(t('errors.disabled'));
      } else {
        setError(t('errors.generic'));
      }
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError(t('errors.generic'));
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'agency_admin') {
      router.push('/clients');
      return;
    }

    // No profile row at all → account not provisioned (distinct from a client
    // with zero active brands, which falls through to the noPortal case below).
    if (!profile) {
      setError(t('errors.noProfile'));
      setLoading(false);
      return;
    }

    const { data: brandRows } = await supabase
      .from('client_users')
      .select('clients(slug)')
      .eq('user_id', user.id)
      .eq('status', 'active');

    const slugs = (brandRows ?? [])
      .map(r => (r.clients as unknown as { slug: string } | null)?.slug)
      .filter((s): s is string => !!s);

    if (slugs.length === 1) {
      router.push(`/${slugs[0]}`);
    } else if (slugs.length > 1) {
      router.push('/select-brand');
    } else {
      setError(t('errors.noPortal'));
      setLoading(false);
    }
  }

  return (
    <div
      className="login-layout"
      style={{ background: C.black, color: C.bone, fontFamily: 'Archivo, sans-serif', position: 'relative' }}
    >
      <LanguageToggleAuth theme="dark" />
      <AuthBrandPanel
        eyebrow={t('eyebrow1')}
        heroLine1={t('heroLine1')}
        heroLine2={t('heroLine2')}
        tagline={t('tagline')}
      />

      {/* RIGHT — form panel */}
      <div
        className="login-form-panel"
        style={{
          flex: 1,
          background: C.ink,
          padding: '40px 72px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <form onSubmit={handleSubmit} style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
          <Eyebrow color={C.fg3} style={{ marginBottom: 18 }}>{t('eyebrow2')}</Eyebrow>
          <div style={{
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.02,
            marginBottom: 10,
          }}>
            {t('title')}
          </div>
          <div style={{ color: C.fg3, fontSize: 14, marginBottom: 40, lineHeight: 1.55 }}>
            {t('subtitle')}
          </div>

          {/* Email */}
          <div style={{ marginBottom: 28 }}>
            <Eyebrow color={C.fg3} style={{ fontSize: 10, marginBottom: 10 }}>{t('emailLabel')}</Eyebrow>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              autoComplete="email"
              style={{
                display: 'block',
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: `1.5px solid ${C.lineStrong}`,
                padding: '0 0 10px',
                fontSize: 16,
                color: C.bone,
                fontFamily: 'Archivo, sans-serif',
                outline: 'none',
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 40 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 10,
            }}>
              <Eyebrow color={C.fg3} style={{ fontSize: 10 }}>{t('passwordLabel')}</Eyebrow>
              <Link
                href="/forgot-password"
                style={{
                  color: C.cyan,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
              >
                {t('forgot')}
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••"
              autoComplete="current-password"
              style={{
                display: 'block',
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: `1.5px solid ${C.lineStrong}`,
                padding: '0 0 10px',
                fontSize: 22,
                color: C.bone,
                fontFamily: 'Archivo, sans-serif',
                letterSpacing: '0.3em',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: 16,
              padding: '10px 14px',
              background: 'rgba(240,45,20,0.12)',
              border: `1px solid ${C.red}`,
              color: C.red,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}>
              {error}
            </div>
          )}

          <Btn
            type="submit"
            variant="primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '16px 22px', fontSize: 13 }}
          >
            {loading ? t('submitting') : t('submit')}
          </Btn>

          <div style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: `1px solid ${C.line}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            color: C.fg3,
          }}>
            <span>{t('noAccount')}</span>
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: C.bone,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontSize: 11,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {t('requestAccess')}
            </button>
          </div>

          <div style={{
            marginTop: 36,
            display: 'flex',
            gap: 18,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: C.muted,
          }}>
            <span>SSO · Google</span>
            <span>·</span>
            <span>SSO · Microsoft</span>
          </div>
        </form>
      </div>
    </div>
  );
}
