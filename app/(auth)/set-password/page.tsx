'use client';

import { C } from '@/lib/disto';
import Eyebrow from '@/components/ui/Eyebrow';
import Btn from '@/components/ui/Btn';
import AuthBrandPanel from '@/components/layout/AuthBrandPanel';
import { useState, useEffect, FormEvent } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';
import { validatePassword, PASSWORD_ERRORS } from '@/lib/auth/validate-password';

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // getUser() validates the token server-side (unlike getSession which reads from local cache)
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setSessionReady(true);
      } else {
        setError('Lien invalide ou expiré. Demandez une nouvelle invitation.');
      }
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationError = validatePassword(password, confirm);
    if (validationError) {
      setError(PASSWORD_ERRORS[validationError]);
      return;
    }
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError('Impossible de définir le mot de passe. Veuillez réessayer.');
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, brand_slug')
      .single();

    if (profile?.role === 'agency_admin') {
      router.push('/clients');
    } else if (profile?.brand_slug) {
      router.push(`/${profile.brand_slug}`);
    } else {
      router.push('/login');
    }
  }

  return (
    <div
      className="login-layout"
      style={{ background: C.black, color: C.bone, fontFamily: 'Archivo, sans-serif' }}
    >
      <AuthBrandPanel
        eyebrow="01 / Bienvenue"
        heroLine1="Votre portail"
        heroLine2="vous attend."
        tagline="Définissez votre mot de passe pour accéder à l'espace de votre marque."
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
          <Eyebrow color={C.fg3} style={{ marginBottom: 18 }}>02 / Activation</Eyebrow>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.02, marginBottom: 10 }}>
            Choisir un mot<br />de passe.
          </div>
          <div style={{ color: C.fg3, fontSize: 14, marginBottom: 40, lineHeight: 1.55 }}>
            Ce mot de passe sera associé à votre compte. Minimum 8 caractères.
          </div>

          <div style={{ marginBottom: 28 }}>
            <Eyebrow color={C.fg3} style={{ fontSize: 10, marginBottom: 10 }}>Nouveau mot de passe</Eyebrow>
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
            <Eyebrow color={C.fg3} style={{ fontSize: 10, marginBottom: 10 }}>Confirmer le mot de passe</Eyebrow>
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
            {loading ? 'Activation…' : 'Activer mon compte  →'}
          </Btn>
        </form>
      </div>
    </div>
  );
}
