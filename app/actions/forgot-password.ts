'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/send';
import { resetPasswordEmailHtml, resetPasswordSubject } from '@/lib/email/templates/reset-password';

export async function forgotPassword(email: string): Promise<{ success: true }> {
  const admin = await createAdminClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/update-password`;

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo },
  });

  if (!error && data?.properties?.action_link) {
    const actionLink = data.properties.action_link;
    await sendEmail({
      to: email,
      subject: resetPasswordSubject,
      html: resetPasswordEmailHtml({ actionLink, email }),
      actionLink,
    });
  }

  // Always return success to prevent email enumeration
  return { success: true };
}
