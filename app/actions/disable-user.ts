'use server';

import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

export type DisableUserResult =
  | { success: true }
  | { success: false; error: string };

export async function disableUser(clientUserId: string, userId: string): Promise<DisableUserResult> {
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

  const { data: cuRow, error: cuError } = await admin
    .from('client_users')
    .update({ status: 'disabled' })
    .eq('id', clientUserId)
    .select('client_id')
    .single();

  if (cuError) {
    return { success: false, error: t('disableAccess') };
  }

  // Existing sessions remain valid until the JWT expires (per PRD decision).
  const { error: banError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: '876000h',
  });

  if (banError) {
    await admin.from('client_users').update({ status: 'active' }).eq('id', clientUserId);
    return { success: false, error: t('disableAccount') };
  }

  if (cuRow?.client_id) revalidatePath(`/clients/${cuRow.client_id}/access`);
  return { success: true };
}
