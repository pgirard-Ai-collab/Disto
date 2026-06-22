'use server';

import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

export type DeleteUserResult =
  | { success: true }
  | { success: false; error: string };

// Permanently removes a user.
//
// If the user is linked to more than one brand, only the client_users row
// identified by clientUserId is deleted (the auth account is kept so the user
// retains access to their other brands).
//
// If this is the user's last brand link, the auth.users account itself is
// deleted. Foreign-key rules then cascade: profiles (on delete cascade) and the
// remaining client_users row (on delete cascade) are removed automatically,
// while authored content references — brand_structure_proposals.proposed_by and
// brand_structure_versions.created_by (on delete set null) — are simply nulled.
// No manual per-table cleanup or migration is required.
export async function deleteUser(clientUserId: string, userId: string): Promise<DeleteUserResult> {
  const t = await getTranslations('serverActions.errors');

  if (!clientUserId || !userId) return { success: false, error: t('missingIds') };

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

  // Resolve the client_id for revalidation and count the user's brand links.
  // Use the admin client so RLS doesn't hide rows from other brands.
  const { data: links, error: linksError } = await admin
    .from('client_users')
    .select('id, client_id')
    .eq('user_id', userId);

  if (linksError || !links) {
    return { success: false, error: t('deleteUserFailed') };
  }

  const targetLink = links.find(l => l.id === clientUserId);
  if (!targetLink) {
    return { success: false, error: t('deleteUserFailed') };
  }
  const clientId = targetLink.client_id;

  if (links.length > 1) {
    // Multi-brand user: remove only this brand link, keep the account.
    const { error: deleteLinkError } = await admin
      .from('client_users')
      .delete()
      .eq('id', clientUserId);

    if (deleteLinkError) {
      return { success: false, error: t('deleteUserFailed') };
    }
  } else {
    // Last brand: delete the auth account. FK cascade clears profiles and
    // the remaining client_users row.
    const { error: deleteAccountError } = await admin.auth.admin.deleteUser(userId);

    if (deleteAccountError) {
      return { success: false, error: t('deleteUserFailed') };
    }
  }

  revalidatePath(`/clients/${clientId}/access`);
  return { success: true };
}
