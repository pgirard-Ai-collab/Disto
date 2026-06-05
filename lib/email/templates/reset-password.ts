import { baseEmailHtml } from './base';

export const resetPasswordSubject = "Réinitialiser votre mot de passe Disto";

export function resetPasswordEmailHtml(params: { actionLink: string; email: string }): string {
  return baseEmailHtml({
    eyebrow: 'Sécurité du compte',
    heading: 'Réinitialisation du mot de passe',
    body: `Nous avons reçu une demande de réinitialisation du mot de passe pour votre compte <strong style="color:#EBE8E6;">${params.email}</strong>. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.<br/><br/>Ce lien est valide pendant 1 heure.`,
    ctaLabel: 'Réinitialiser le mot de passe',
    actionLink: params.actionLink,
    footnote: `Si vous n'avez pas fait cette demande, ignorez cet email. Votre mot de passe restera inchangé.`,
  });
}
