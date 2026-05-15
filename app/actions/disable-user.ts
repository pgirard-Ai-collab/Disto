'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient, createClient } from '@/lib/supabase/server';

export type DisableUserResult =
  | { success: true }
  | { success: false; error: string };

export async function disableUser(clientUserId: string, userId: string): Promise<DisableUserResult> {
  if (!clientUserId || !userId) return { success: false, error: 'Identifiants manquants.' };

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

  // Mark the client_users row as disabled — visible immediately in the UI
  const { data: cuRow, error: cuError } = await admin
    .from('client_users')
    .update({ status: 'disabled' })
    .eq('id', clientUserId)
    .select('client_id')
    .single();

  if (cuError) {
    return { success: false, error: 'Impossible de désactiver l\'accès. Veuillez réessayer.' };
  }

  // Ban the auth user so they can no longer obtain a fresh token after JWT expiry.
  // Existing sessions remain valid until the JWT expires (per PRD decision).
  const { error: banError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: '876000h',
  });

  if (banError) {
    // Roll back the row update so the UI stays consistent with auth state
    await admin.from('client_users').update({ status: 'active' }).eq('id', clientUserId);
    return { success: false, error: 'Impossible de désactiver ce compte. Veuillez réessayer.' };
  }

  if (cuRow?.client_id) revalidatePath(`/clients/${cuRow.client_id}/access`);
  return { success: true };
}
