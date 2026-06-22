'use client';

import { C } from '@/lib/disto';
import Eyebrow from '@/components/ui/Eyebrow';
import Btn from '@/components/ui/Btn';
import AuthBrandPanel from '@/components/layout/AuthBrandPanel';
import LanguageToggleAuth from '@/components/i18n/LanguageToggleAuth';
import { useState, useEffect, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/browser';
import { useSearchParams } from 'next/navigation';
import { validatePassword } from '@/lib/auth/validate-password';
import { logout } from '@/app/actions/logout';

export default function UpdatePasswordPage() {
  const t = useTranslations('auth.updatePassword');
  const tPw = useTranslations('auth.password.errors');
  const searchParams = useSearchParams();
  // /auth/confirm redirige ici avec ?error=invalid|expired si verifyOtp a échoué.
  const linkError = searchParams.get('error');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(() =>
    linkError === 'expired' ? t('errors.expired') : linkError ? t('errors.invalid') : null,
  );
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    if (linkError) return;

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setSessionReady(true);
      } else {
        setError(t('errors.invalid'));
      }
    });
  }, [t, linkError]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationError = validatePassword(password, confirm);
    if (validationError) {
      setError(tPw(validationError));
      return;
    }
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(t('errors.generic'));
      setLoading(false);
      return;
    }

    // verifyOtp a ouvert une session : on la ferme pour forcer une reconnexion
    // avec le nouveau mot de passe. Déconnexion server-side (action atomique
    // signOut + redirect) pour éviter la course avec le proxy.
    await logout();
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
          flex: 1, background: C.ink, padding: '40px 72px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}
      >
        <form onSubmit={handleSubmit} style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
          <Eyebrow color={C.fg3} style={{ marginBottom: 18 }}>{t('eyebrow2')}</Eyebrow>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.02, marginBottom: 10, whiteSpace: 'pre-line' }}>
            {t('title')}
          </div>
          <div style={{ color: C.fg3, fontSize: 14, marginBottom: 40, lineHeight: 1.55 }}>
            {t('subtitle')}
          </div>

          <div style={{ marginBottom: 28 }}>
            <Eyebrow color={C.fg3} style={{ fontSize: 10, marginBottom: 10 }}>{t('newPasswordLabel')}</Eyebrow>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••"
              autoComplete="new-password"
              disabled={!sessionReady}
              style={{
                display: 'block', width: '100%',
                background: 'transparent', border: 'none',
                borderBottom: `1.5px solid ${C.lineStrong}`,
                padding: '0 0 10px', fontSize: 22,
                color: C.bone, fontFamily: 'Archivo, sans-serif',
                letterSpacing: '0.3em', outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: 40 }}>
            <Eyebrow color={C.fg3} style={{ fontSize: 10, marginBottom: 10 }}>{t('confirmPasswordLabel')}</Eyebrow>
            <input
              type="password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••••"
              autoComplete="new-password"
              disabled={!sessionReady}
              style={{
                display: 'block', width: '100%',
                background: 'transparent', border: 'none',
                borderBottom: `1.5px solid ${C.lineStrong}`,
                padding: '0 0 10px', fontSize: 22,
                color: C.bone, fontFamily: 'Archivo, sans-serif',
                letterSpacing: '0.3em', outline: 'none',
              }}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: 16, padding: '10px 14px',
              background: 'rgba(240,45,20,0.12)',
              border: `1px solid ${C.red}`,
              color: C.red, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
            }}>
              {error}
            </div>
          )}

          <Btn
            type="submit"
            variant="primary"
            disabled={loading || !sessionReady}
            style={{ width: '100%', justifyContent: 'center', padding: '16px 22px', fontSize: 13 }}
          >
            {loading ? t('submitting') : t('submit')}
          </Btn>
        </form>
      </div>
    </div>
  );
}
