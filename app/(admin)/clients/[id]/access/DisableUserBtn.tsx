'use client';

import { C } from '@/lib/disto';
import { useState } from 'react';
import { disableUser } from '@/app/actions/disable-user';
import { resendInvite } from '@/app/actions/resend-invite';

type Props = {
  clientUserId: string;
  userId: string;
  userName: string;
  status: 'invited' | 'active' | 'disabled';
  clientId: string;
};

export default function DisableUserBtn({ clientUserId, userId, userName, status, clientId }: Props) {
  const [localStatus, setLocalStatus] = useState(status);
  const [loadingDisable, setLoadingDisable] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleDisableConfirm() {
    setShowDisableModal(false);
    setLoadingDisable(true);
    const result = await disableUser(clientUserId, userId);
    if (result.success) {
      setLocalStatus('disabled');
    } else {
      setErrorMsg(result.error);
      setLoadingDisable(false);
    }
  }

  async function handleResendConfirm() {
    setShowResendModal(false);
    setErrorMsg(null);
    setLoadingResend(true);
    const result = await resendInvite(clientUserId, userId, clientId);
    if (result.success) {
      setResendDone(true);
    } else {
      setErrorMsg(result.error);
    }
    setLoadingResend(false);
  }

  const btnStyle = (color: string, loading: boolean) => ({
    background: 'none', border: 'none',
    color: loading ? C.muted : color,
    fontSize: 10, fontWeight: 700,
    letterSpacing: '0.16em', textTransform: 'uppercase' as const,
    cursor: loading ? 'default' : 'pointer',
    padding: 0,
  });

  return (
    <>
      {/* Error modal */}
      {errorMsg && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div style={{ background: C.ink, border: `1px solid ${C.line}`, padding: '32px 40px', maxWidth: 400, width: '100%' }}>
            <div style={{ fontSize: 14, color: C.red, fontWeight: 700, marginBottom: 20 }}>{errorMsg}</div>
            <button onClick={() => setErrorMsg(null)} style={{ background: 'none', border: `1px solid ${C.line}`, color: C.bone, padding: '8px 20px', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Archivo, sans-serif' }}>
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Disable confirm modal */}
      {showDisableModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div style={{ background: C.ink, border: `1px solid ${C.line}`, padding: '32px 40px', maxWidth: 400, width: '100%' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.red, marginBottom: 12 }}>
              Désactiver le compte
            </div>
            <div style={{ fontSize: 14, color: C.bone, lineHeight: 1.55, marginBottom: 28 }}>
              Désactiver le compte de <strong>{userName}</strong> ? Cette action est irréversible.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleDisableConfirm} style={{ background: C.red, border: 'none', color: C.bone, padding: '10px 24px', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Archivo, sans-serif' }}>
                Confirmer
              </button>
              <button onClick={() => setShowDisableModal(false)} style={{ background: 'none', border: `1px solid ${C.line}`, color: C.bone, padding: '10px 24px', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Archivo, sans-serif' }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resend confirm modal */}
      {showResendModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div style={{ background: C.ink, border: `1px solid ${C.line}`, padding: '32px 40px', maxWidth: 400, width: '100%' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.cyan, marginBottom: 12 }}>
              Renvoyer l&apos;invitation
            </div>
            <div style={{ fontSize: 14, color: C.bone, lineHeight: 1.55, marginBottom: 28 }}>
              Renvoyer un lien d&apos;invitation à <strong>{userName}</strong> ?
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleResendConfirm} style={{ background: C.black, border: 'none', color: C.bone, padding: '10px 24px', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Archivo, sans-serif' }}>
                Renvoyer
              </button>
              <button onClick={() => setShowResendModal(false)} style={{ background: 'none', border: `1px solid ${C.line}`, color: C.bone, padding: '10px 24px', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Archivo, sans-serif' }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {localStatus === 'disabled' ? (
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted }}>
          Désactivé
        </span>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          {localStatus === 'invited' && (
            resendDone ? (
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.cyan }}>
                Envoyé ✓
              </span>
            ) : (
              <button
                onClick={() => setShowResendModal(true)}
                disabled={loadingResend}
                style={btnStyle(C.cyan, loadingResend)}
              >
                {loadingResend ? '…' : 'Renvoyer'}
              </button>
            )
          )}
          <button
            onClick={() => setShowDisableModal(true)}
            disabled={loadingDisable}
            style={btnStyle(C.red, loadingDisable)}
          >
            {loadingDisable ? '…' : 'Désactiver'}
          </button>
        </div>
      )}
    </>
  );
}
