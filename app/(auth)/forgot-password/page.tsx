'use client';

import { C } from '@/lib/disto';
import Eyebrow from '@/components/ui/Eyebrow';
import Btn from '@/components/ui/Btn';
import AuthBrandPanel from '@/components/layout/AuthBrandPanel';
import LanguageToggleAuth from '@/components/i18n/LanguageToggleAuth';
import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { forgotPassword } from '@/app/actions/forgot-password';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgot');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');
    await forgotPassword(email);
    setStatus('sent');
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
        <div style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
          <Eyebrow color={C.fg3} style={{ marginBottom: 18 }}>{t('eyebrow2')}</Eyebrow>

          {status === 'sent' ? (
            <>
              <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.02, marginBottom: 20 }}>
                {t('successTitle')}
              </div>
              <div style={{ color: C.fg3, fontSize: 14, lineHeight: 1.55, marginBottom: 40 }}>
                {t.rich('successBody', {
                  email,
                  strong: (chunks) => <strong style={{ color: C.bone }}>{chunks}</strong>,
                })}
              </div>
              <Link href="/login" style={{
                fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: C.cyan, textDecoration: 'none',
              }}>
                {t('back')}
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.02, marginBottom: 10, whiteSpace: 'pre-line' }}>
                {t('title')}
              </div>
              <div style={{ color: C.fg3, fontSize: 14, marginBottom: 40, lineHeight: 1.55 }}>
                {t('subtitle')}
              </div>

              <div style={{ marginBottom: 40 }}>
                <Eyebrow color={C.fg3} style={{ fontSize: 10, marginBottom: 10 }}>{t('emailLabel')}</Eyebrow>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
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
                {status === 'loading' ? t('submitting') : t('submit')}
              </Btn>

              <Link href="/login" style={{
                fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: C.fg3, textDecoration: 'none',
              }}>
                {t('back')}
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
