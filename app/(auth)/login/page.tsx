'use client';

import { C } from '@/lib/disto';
import Eyebrow from '@/components/ui/Eyebrow';
import Btn from '@/components/ui/Btn';
import { useState, FormEvent } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/clients');
  }

  return (
    <div
      className="login-layout"
      style={{ background: C.black, color: C.bone, fontFamily: 'Archivo, sans-serif' }}
    >
      {/* LEFT — brand panel */}
      <div
        className="login-brand-panel"
        style={{
        flex: '1.1',
        borderRight: `1px solid ${C.line}`,
        padding: '40px 56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Red signal line */}
        <div style={{
          position: 'absolute',
          top: 40,
          right: -80,
          width: 260,
          height: 1,
          background: C.red,
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ color: C.red, fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em' }}>
            DISTO.
          </span>
          <Eyebrow color={C.fg3} style={{ fontSize: 11 }}>Brand OS</Eyebrow>
        </div>

        {/* Hero */}
        <div>
          <Eyebrow color={C.red} style={{ marginBottom: 28 }}>01 / Signal clair</Eyebrow>
          <div className="login-brand-hero" style={{
            fontSize: 'clamp(40px, 6vw, 88px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 0.92,
            marginBottom: 28,
          }}>
            Une seule vérité<br />
            <span style={{ color: C.fg3 }}>de marque.</span>
          </div>
          <div style={{ fontSize: 16, lineHeight: 1.55, maxWidth: 460, color: C.boneDim }}>
            Le portail betula centralise la stratégie, le ton et le prompt système de chaque marque — pour que chaque production reste fidèle au signal.
          </div>
        </div>

        {/* Footer meta */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: C.muted,
        }}>
          <span>betula × disto</span>
          <span>— Édition 2026 —</span>
          <span>Québec / MTL</span>
        </div>
      </div>

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
          <Eyebrow color={C.fg3} style={{ marginBottom: 18 }}>02 / Connexion</Eyebrow>
          <div style={{
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.02,
            marginBottom: 10,
          }}>
            Entrer au portail.
          </div>
          <div style={{ color: C.fg3, fontSize: 14, marginBottom: 40, lineHeight: 1.55 }}>
            Nous identifions votre rôle après connexion — agence ou gardien de marque.
          </div>

          {/* Email */}
          <div style={{ marginBottom: 28 }}>
            <Eyebrow color={C.fg3} style={{ fontSize: 10, marginBottom: 10 }}>Courriel</Eyebrow>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="prenom.nom@agence.co"
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
              <Eyebrow color={C.fg3} style={{ fontSize: 10 }}>Mot de passe</Eyebrow>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: C.cyan,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Oublié ?
              </button>
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
            {loading ? 'Connexion…' : 'Se connecter  →'}
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
            <span>Pas encore de compte ?</span>
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
              Demander un accès →
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
