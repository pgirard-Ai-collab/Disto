import { baseEmailHtml } from './base';

export const inviteSubject = "Vous avez été invité sur Disto";

export function inviteEmailHtml(params: { actionLink: string; email: string }): string {
  return baseEmailHtml({
    eyebrow: 'Invitation',
    heading: 'Bienvenue sur Disto',
    body: `Vous avez été invité à rejoindre la plateforme Disto. Cliquez sur le bouton ci-dessous pour créer votre mot de passe et accéder à votre espace.<br/><br/>Ce lien est valide pendant 24 heures.`,
    ctaLabel: 'Créer mon mot de passe',
    actionLink: params.actionLink,
    footnote: `Si vous n'attendiez pas cette invitation, ignorez simplement cet email. Aucune action n'est requise.`,
  });
}
