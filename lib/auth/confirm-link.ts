import type { GenerateLinkType } from '@supabase/supabase-js';

/**
 * Construit un lien email passant par notre route handler serveur /auth/confirm
 * (qui appelle verifyOtp), plutôt que le lien Supabase brut /auth/v1/verify.
 *
 * Le lien brut s'appuie sur un flux PKCE inopérant ici : ces liens sont générés
 * côté serveur via `admin.auth.admin.generateLink`, donc aucun code verifier
 * n'existe dans le navigateur de l'utilisateur. /auth/confirm contourne ce
 * problème en vérifiant le `token_hash` côté serveur et en posant la session.
 *
 * @param hashedToken  `data.properties.hashed_token` renvoyé par generateLink
 * @param type         type de vérification OTP (recovery, invite, …)
 * @param next         chemin relatif same-origin où rediriger après succès
 */
export function buildConfirmLink(
  hashedToken: string,
  type: GenerateLinkType,
  next: string,
): string {
  const params = new URLSearchParams({
    token_hash: hashedToken,
    type,
    next,
  });
  return `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?${params.toString()}`;
}
