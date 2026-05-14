'use server';

import { createAdminClient, createClient } from '@/lib/supabase/server';

export type DisableUserResult =
  | { success: true }
  | { success: false; error: string };

export async function disableUser(userId: string): Promise<DisableUserResult> {
  if (!userId) return { success: false, error: 'Identifiant utilisateur manquant.' };

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
  // ban_duration of '876000h' (~100 years) is effectively permanent
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: '876000h',
  });

  if (error) {
    return { success: false, error: 'Impossible de désactiver ce compte. Veuillez réessayer.' };
  }

  return { success: true };
}
