'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient, createClient } from '@/lib/supabase/server';

export type ResendInviteResult =
  | { success: true }
  | { success: false; error: string };

export async function resendInvite(
  clientUserId: string,
  userId: string,
  clientId: string,
): Promise<ResendInviteResult> {
  if (!clientUserId || !userId || !clientId) {
    return { success: false, error: 'Identifiants manquants.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non authentifié.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'agency_admin') return { success: false, error: 'Accès refusé.' };

  const admin = await createAdminClient();

  const { data: { user: targetUser }, error: getUserError } = await admin.auth.admin.getUserById(userId);
  if (getUserError || !targetUser?.email) {
    return { success: false, error: 'Utilisateur introuvable.' };
  }

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/set-password`;

  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    targetUser.email,
    { redirectTo },
  );

  if (inviteError) {
    if (!inviteError.message.toLowerCase().includes('already')) {
      return { success: false, error: "Impossible de renvoyer l'invitation. Veuillez réessayer." };
    }

    // User already has an auth account — send a password reset email pointing to /set-password.
    // resetPasswordForEmail actually sends the email, unlike generateLink which only returns the link.
    const { error: resetError } = await admin.auth.resetPasswordForEmail(
      targetUser.email,
      { redirectTo },
    );

    if (resetError) {
      if (resetError.message.toLowerCase().includes('rate limit') || resetError.message.includes('seconds')) {
        return { success: false, error: 'Trop de tentatives. Patientez une minute avant de réessayer.' };
      }
      return { success: false, error: "Impossible de renvoyer l'invitation. Veuillez réessayer." };
    }
  }

  await admin
    .from('client_users')
    .update({ status: 'invited' })
    .eq('id', clientUserId);

  revalidatePath(`/clients/${clientId}/access`);
  return { success: true };
}
