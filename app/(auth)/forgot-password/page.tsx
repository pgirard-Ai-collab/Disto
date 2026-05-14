'use client';

import { C } from '@/lib/disto';
import Eyebrow from '@/components/ui/Eyebrow';
import Btn from '@/components/ui/Btn';
import AuthBrandPanel from '@/components/layout/AuthBrandPanel';
import { useState, FormEvent } from 'react';
import { createClient } from '@/lib/supabase/browser';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');

    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    // Always show success to prevent email enumeration
    setStatus('sent');
  }

  return (
    <div
      className="login-layout"
      style={{ background: C.black, color: C.bone, fontFamily: 'Archivo, sans-serif' }}
    >
      <AuthBrandPanel
        eyebrow="01 / Récupération"
        heroLine1="Retrouver"
        heroLine2="l'accès."
        tagline="Entrez votre adresse courriel et nous vous enverrons un lien pour réinitialiser votre mot de passe."
      />

      {/* RIGHT — form panel */}
      <div
        className="login-form-panel"
        style={{
          flex: 1, background: C.ink, padding: '40px 72px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}
      >
        <div style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
          <Eyebrow color={C.fg3} style={{ marginBottom: 18 }}>02 / Mot de passe oublié</Eyebrow>

          {status === 'sent' ? (
            <>
              <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.02, marginBottom: 20 }}>
                Courriel envoyé.
              </div>
              <div style={{ color: C.fg3, fontSize: 14, lineHeight: 1.55, marginBottom: 40 }}>
                Si un compte existe pour <strong style={{ color: C.bone }}>{email}</strong>, vous recevrez un lien de réinitialisation dans les prochaines minutes.
              </div>
              <Link href="/login" style={{
                fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: C.cyan, textDecoration: 'none',
              }}>
                ← Retour à la connexion
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.02, marginBottom: 10 }}>
                Réinitialiser le<br />mot de passe.
              </div>
              <div style={{ color: C.fg3, fontSize: 14, marginBottom: 40, lineHeight: 1.55 }}>
                Entrez votre adresse courriel associée à votre compte.
              </div>

              <div style={{ marginBottom: 40 }}>
                <Eyebrow color={C.fg3} style={{ fontSize: 10, marginBottom: 10 }}>Courriel</Eyebrow>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="prenom.nom@marque.co"
                  autoComplete="email"
                  style={{
                    display: 'block', width: '100%',
                    background: 'transparent', border: 'none',
                    borderBottom: `1.5px solid ${C.lineStrong}`,
                    padding: '0 0 10px', fontSize: 16,
                    color: C.bone, fontFamily: 'Archivo, sans-serif', outline: 'none',
                  }}
                />
              </div>

              <Btn
                type="submit"
                variant="primary"
                disabled={status === 'loading'}
                style={{ width: '100%', justifyContent: 'center', padding: '16px 22px', fontSize: 13, marginBottom: 24 }}
              >
                {status === 'loading' ? 'Envoi…' : 'Envoyer le lien  →'}
              </Btn>

              <Link href="/login" style={{
                fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: C.fg3, textDecoration: 'none',
              }}>
                ← Retour à la connexion
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
