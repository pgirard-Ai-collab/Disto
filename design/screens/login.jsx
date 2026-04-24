/* global React, DISTO_C, Eyebrow, Btn, Ico */
/* 00 — Login. Common entry. Sentence-case input labels, ALL-CAPS eyebrow,
   red submit. Dark. Left = marketing voice, right = form.                  */
const C0 = DISTO_C;

function LoginScreen() {
  return (
    <div style={{
      width: 1440, height: 900, display: 'flex',
      background: C0.black, color: C0.bone,
      fontFamily: 'Archivo, sans-serif',
    }}>
      {/* LEFT — brand panel */}
      <div style={{
        flex: '1.1', borderRight: `1px solid ${C0.line}`,
        padding: '40px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* corner red signal */}
        <div style={{
          position: 'absolute', top: 40, right: -80, width: 260, height: 1,
          background: C0.red,
        }} />

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ color: C0.red, fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em' }}>
            DISTO.
          </span>
          <Eyebrow color={C0.fg3} style={{ fontSize: 11 }}>Brand OS</Eyebrow>
        </div>

        <div>
          <Eyebrow color={C0.red} style={{ marginBottom: 28 }}>01 / Signal clair</Eyebrow>
          <div style={{
            fontSize: 88, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.92,
            marginBottom: 28,
          }}>
            Une seule vérité<br/>
            <span style={{ color: C0.fg3 }}>de marque.</span>
          </div>
          <div style={{ fontSize: 16, lineHeight: 1.55, maxWidth: 460, color: C0.boneDim }}>
            Le portail betula centralise la stratégie, le ton et le prompt système de chaque marque — pour que chaque production reste fidèle au signal.
          </div>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: C0.muted,
        }}>
          <span>betula × disto</span>
          <span>— Édition 2026 —</span>
          <span>Québec / MTL</span>
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div style={{
        flex: '1', background: C0.ink, padding: '40px 72px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <div style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
          <Eyebrow color={C0.fg3} style={{ marginBottom: 18 }}>02 / Connexion</Eyebrow>
          <div style={{
            fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.02,
            marginBottom: 10,
          }}>Entrer au portail.</div>
          <div style={{ color: C0.fg3, fontSize: 14, marginBottom: 40, lineHeight: 1.55 }}>
            Nous identifions votre rôle après connexion — agence ou gardien de marque.
          </div>

          {/* Email */}
          <div style={{ marginBottom: 28 }}>
            <Eyebrow color={C0.fg3} style={{ fontSize: 10, marginBottom: 10 }}>Courriel</Eyebrow>
            <div style={{
              borderBottom: `1.5px solid ${C0.lineStrong}`,
              paddingBottom: 10,
              fontSize: 16, color: C0.bone,
            }}>
              claire.bellefleur@betula.co
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 40 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              marginBottom: 10,
            }}>
              <Eyebrow color={C0.fg3} style={{ fontSize: 10 }}>Mot de passe</Eyebrow>
              <a style={{ color: C0.cyan, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Oublié ?
              </a>
            </div>
            <div style={{
              borderBottom: `1.5px solid ${C0.lineStrong}`,
              paddingBottom: 10,
              fontSize: 22, color: C0.bone, letterSpacing: '0.3em',
            }}>
              ••••••••••
            </div>
          </div>

          <Btn variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '16px 22px', fontSize: 13 }}>
            Se connecter  →
          </Btn>

          <div style={{
            marginTop: 28, paddingTop: 20, borderTop: `1px solid ${C0.line}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: 12, color: C0.fg3,
          }}>
            <span>Pas encore de compte ?</span>
            <a style={{ color: C0.bone, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 11 }}>
              Demander un accès →
            </a>
          </div>

          <div style={{
            marginTop: 36, display: 'flex', gap: 18,
            fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: C0.muted,
          }}>
            <span>SSO · Google</span>
            <span>·</span>
            <span>SSO · Microsoft</span>
          </div>
        </div>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
