import { resend, FROM } from './resend';

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  actionLink?: string;
};

export async function sendEmail(payload: EmailPayload): Promise<{ error: string | null }> {
  if (payload.actionLink) console.log(`[email] action_link: ${payload.actionLink}`);

  const { error } = await resend.emails.send({
    from: FROM,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  });

  if (error) return { error: error.message };
  return { error: null };
}
