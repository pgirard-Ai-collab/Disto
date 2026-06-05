import { baseEmailHtml } from './base';

export const magicLinkSubject = "Votre lien de connexion Disto";

export function magicLinkEmailHtml(params: { actionLink: string; email: string }): string {
  return baseEmailHtml({
    eyebrow: 'Connexion',
    heading: 'Votre lien de connexion',
    body: `Cliquez sur le bouton ci-dessous pour vous connecter à votre espace Disto. Ce lien est à usage unique et expirera dans 1 heure.`,
    ctaLabel: 'Se connecter',
    actionLink: params.actionLink,
    footnote: `Si vous n'avez pas demandé ce lien, ignorez cet email.`,
  });
}
