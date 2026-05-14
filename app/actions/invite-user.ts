'use server';

import { createAdminClient, createClient } from '@/lib/supabase/server';

export type InviteUserResult =
  | { success: true }
  | { success: false; error: string };

export async function inviteUser(
  email: string,
  role: 'client_admin' | 'client_reader',
  brandSlug: string,
): Promise<InviteUserResult> {
  if (!email || !role || !brandSlug) {
    return { success: false, error: 'Tous les champs sont requis.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non authentifié.' };

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (callerProfile?.role !== 'agency_admin') return { success: false, error: 'Accès refusé.' };

  const admin = await createAdminClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/set-password`;
  const { data, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
  });

  if (inviteError) {
    if (inviteError.message.includes('already registered')) {
      return { success: false, error: 'Un compte existe déjà pour cette adresse.' };
    }
    return { success: false, error: "Impossible d'envoyer l'invitation. Veuillez réessayer." };
  }

  const { error: profileError } = await admin
    .from('profiles')
    .insert({ id: data.user.id, role, brand_slug: brandSlug });

  if (profileError) {
    // Rollback: remove the auth user to avoid orphaned accounts
    await admin.auth.admin.deleteUser(data.user.id);
    return { success: false, error: 'Erreur lors de la création du profil. Veuillez réessayer.' };
  }

  return { success: true };
}
