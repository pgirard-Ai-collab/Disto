'use client';

import { C } from '@/lib/disto';
import Eyebrow from '@/components/ui/Eyebrow';
import Btn from '@/components/ui/Btn';
import { useState, FormEvent } from 'react';
import { inviteUser } from '@/app/actions/invite-user';

type Role = 'client_admin' | 'client_reader';

export default function InviteForm({ brandSlug }: { brandSlug: string }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('client_admin');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMessage(null);

    const result = await inviteUser(email, role, brandSlug);

    if (result.success) {
      setStatus('success');
      setMessage(`Invitation envoyée à ${email}.`);
      setEmail('');
    } else {
      setStatus('error');
      setMessage(result.error);
    }
  }

  return (
    <div style={{
      background: C.black, color: C.bone, padding: '28px 32px',
      marginBottom: 32,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
    }}>
      <div>
        <Eyebrow color={C.red} style={{ marginBottom: 8 }}>Nouvelle invitation</Eyebrow>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em' }}>
          Ajouter un gardien de marque.
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flex: 1, maxWidth: 720, marginLeft: 40, flexWrap: 'wrap' }}
      >
        <div style={{ flex: 2, minWidth: 180 }}>
          <Eyebrow color={C.fg3} style={{ fontSize: 10, marginBottom: 6 }}>Courriel</Eyebrow>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="prenom.nom@marque.co"
            style={{
              display: 'block', width: '100%',
              background: 'transparent', border: 'none',
              borderBottom: `1.5px solid ${C.lineStrong}`,
              paddingBottom: 8, fontSize: 16,
              color: C.bone, fontFamily: 'Archivo, sans-serif',
              outline: 'none',
            }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <Eyebrow color={C.fg3} style={{ fontSize: 10, marginBottom: 6 }}>Rôle</Eyebrow>
          <div style={{ display: 'flex', gap: 0, border: `1px solid ${C.line2}` }}>
            <button
              type="button"
              onClick={() => setRole('client_admin')}
              style={{
                flex: 1, padding: '10px 0', textAlign: 'center',
                background: role === 'client_admin' ? C.red : 'transparent',
                color: role === 'client_admin' ? '#fff' : C.boneDim,
                fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                border: 'none', cursor: 'pointer',
              }}
            >Admin</button>
            <button
              type="button"
              onClick={() => setRole('client_reader')}
              style={{
                flex: 1, padding: '10px 0', textAlign: 'center',
                background: role === 'client_reader' ? C.red : 'transparent',
                color: role === 'client_reader' ? '#fff' : C.boneDim,
                fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                borderLeft: `1px solid ${C.line2}`, border: 'none',
                borderLeftWidth: 1, borderLeftStyle: 'solid', borderLeftColor: C.line2,
                cursor: 'pointer',
              }}
            >Lecteur</button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
          <Btn
            type="submit"
            variant="primary"
            size="md"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Envoi…' : 'Envoyer  →'}
          </Btn>
          {message && (
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
              color: status === 'success' ? C.cyan : C.red,
              whiteSpace: 'nowrap',
            }}>
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
