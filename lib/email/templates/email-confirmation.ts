import { baseEmailHtml } from './base';

export const emailConfirmationSubject = "Confirmez votre adresse email Disto";

export function emailConfirmationHtml(params: { actionLink: string; email: string }): string {
  return baseEmailHtml({
    eyebrow: 'Vérification',
    heading: 'Confirmez votre email',
    body: `Merci de confirmer votre adresse email <strong style="color:#EBE8E6;">${params.email}</strong> pour activer votre compte Disto.`,
    ctaLabel: 'Confirmer mon email',
    actionLink: params.actionLink,
    footnote: `Si vous n'avez pas créé de compte sur Disto, ignorez cet email.`,
  });
}
