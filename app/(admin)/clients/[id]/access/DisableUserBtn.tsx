'use client';

import { C } from '@/lib/disto';
import { useState } from 'react';
import { disableUser } from '@/app/actions/disable-user';

export default function DisableUserBtn({ userId, userName }: { userId: string; userName: string }) {
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleConfirm() {
    setShowModal(false);
    setLoading(true);
    const result = await disableUser(userId);
    if (result.success) {
      setDisabled(true);
    } else {
      setErrorMsg(result.error);
      setLoading(false);
    }
  }

  if (disabled) {
    return (
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
        textTransform: 'uppercase', color: C.muted,
      }}>
        Désactivé
      </span>
    );
  }

  return (
    <>
      {errorMsg && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div style={{
            background: C.ink, border: `1px solid ${C.line}`,
            padding: '32px 40px', maxWidth: 400, width: '100%',
          }}>
            <div style={{ fontSize: 14, color: C.red, fontWeight: 700, marginBottom: 20 }}>
              {errorMsg}
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              style={{
                background: 'none', border: `1px solid ${C.line}`,
                color: C.bone, padding: '8px 20px',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', cursor: 'pointer',
                fontFamily: 'Archivo, sans-serif',
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div style={{
            background: C.ink, border: `1px solid ${C.line}`,
            padding: '32px 40px', maxWidth: 400, width: '100%',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: C.red, marginBottom: 12,
            }}>
              Désactiver le compte
            </div>
            <div style={{ fontSize: 14, color: C.bone, lineHeight: 1.55, marginBottom: 28 }}>
              Désactiver le compte de <strong>{userName}</strong> ? Cette action est irréversible.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleConfirm}
                style={{
                  background: C.red, border: 'none',
                  color: C.bone, padding: '10px 24px',
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', cursor: 'pointer',
                  fontFamily: 'Archivo, sans-serif',
                }}
              >
                Confirmer
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none', border: `1px solid ${C.line}`,
                  color: C.bone, padding: '10px 24px',
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', cursor: 'pointer',
                  fontFamily: 'Archivo, sans-serif',
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        style={{
          background: 'none', border: 'none',
          color: loading ? C.muted : C.red,
          fontSize: 10, fontWeight: 700,
          letterSpacing: '0.16em', textTransform: 'uppercase',
          cursor: loading ? 'default' : 'pointer',
          padding: 0,
        }}
      >
        {loading ? '…' : 'Désactiver'}
      </button>
    </>
  );
}
