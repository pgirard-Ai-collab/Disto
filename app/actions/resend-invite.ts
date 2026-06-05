'use server';

import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/send';
import { inviteEmailHtml, inviteSubject } from '@/lib/email/templates/invite';
import { resetPasswordEmailHtml, resetPasswordSubject } from '@/lib/email/templates/reset-password';

export type ResendInviteResult =
  | { success: true }
  | { success: false; error: string };

export async function resendInvite(
  clientUserId: string,
  userId: string,
  clientId: string,
): Promise<ResendInviteResult> {
  const t = await getTranslations('serverActions.errors');

  if (!clientUserId || !userId || !clientId) {
    return { success: false, error: t('missingIds') };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: t('unauthenticated') };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'agency_admin') return { success: false, error: t('accessDenied') };

  const admin = await createAdminClient();

  const { data: { user: targetUser }, error: getUserError } = await admin.auth.admin.getUserById(userId);
  if (getUserError || !targetUser?.email) {
    return { success: false, error: t('userNotFound') };
  }

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/set-password`;

  const { data: inviteData, error: inviteError } = await admin.auth.admin.generateLink({
    type: 'invite',
    email: targetUser.email,
    options: { redirectTo },
  });

  if (!inviteError && inviteData) {
    const actionLink = inviteData.properties.action_link;
    await sendEmail({
      to: targetUser.email,
      subject: inviteSubject,
      html: inviteEmailHtml({ actionLink, email: targetUser.email }),
      actionLink,
    });
  } else if (inviteError) {
    if (!inviteError.message.toLowerCase().includes('already')) {
      return { success: false, error: t('resendFailed') };
    }

    // User already confirmed — send a password reset link instead.
    const { data: resetData, error: resetError } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: targetUser.email,
      options: { redirectTo },
    });

    if (resetError || !resetData) {
      return { success: false, error: t('resendFailed') };
    }

    const actionLink = resetData.properties.action_link;
    await sendEmail({
      to: targetUser.email,
      subject: resetPasswordSubject,
      html: resetPasswordEmailHtml({ actionLink, email: targetUser.email }),
      actionLink,
    });
  }

  await admin
    .from('client_users')
    .update({ status: 'invited' })
    .eq('id', clientUserId);

  revalidatePath(`/clients/${clientId}/access`);
  return { success: true };
}
