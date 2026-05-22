'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient, createClient } from '@/lib/supabase/server';

export type ClientEmailInvite = { email: string; role: 'admin' | 'reader' };

async function requireAgencyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Non authentifié.', admin: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'agency_admin') return { error: 'Accès refusé.', admin: null };

  return { error: null, admin: await createAdminClient() };
}

export type ClientActionResult =
  | { success: true; clientId?: string }
  | { success: false; error: string };

export async function createClientRecord(formData: FormData): Promise<ClientActionResult> {
  const { error, admin } = await requireAgencyAdmin();
  if (error || !admin) return { success: false, error: error ?? 'Erreur.' };

  const org_name   = (formData.get('org_name')   as string)?.trim();
  const brand_name = (formData.get('brand_name') as string)?.trim();
  const slug       = (formData.get('slug')       as string)?.trim().toLowerCase();
  const logoFile   = formData.get('logo') as File | null;
  const invitesRaw = formData.get('invites') as string | null;

  if (!org_name || !brand_name || !slug) {
    return { success: false, error: 'Nom organisation, marque et slug sont requis.' };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { success: false, error: 'Slug invalide — lettres minuscules, chiffres et tirets seulement.' };
  }

  let invites: ClientEmailInvite[] = [];
  try {
    invites = invitesRaw ? JSON.parse(invitesRaw) : [];
  } catch {
    return { success: false, error: 'Liste d\'emails invalide.' };
  }

  // Validate logo upload constraints if provided
  let logoUrl: string | null = null;

  // Insert client first
  const { data: insertedClient, error: dbError } = await admin
    .from('clients')
    .insert({ org_name, brand_name, slug, status: 'draft' })
    .select('id')
    .single();

  if (dbError || !insertedClient) {
    if (dbError?.code === '23505') return { success: false, error: 'Ce slug est déjà utilisé.' };
    return { success: false, error: 'Erreur lors de la création. Veuillez réessayer.' };
  }

  // Upload logo if present
  if (logoFile && logoFile.size > 0) {
    if (logoFile.size > 2 * 1024 * 1024) {
      return { success: false, error: 'Le logo dépasse 2 MB.' };
    }
    if (!['image/png', 'image/svg+xml'].includes(logoFile.type)) {
      return { success: false, error: 'Logo : PNG ou SVG uniquement.' };
    }
    const ext = logoFile.type === 'image/svg+xml' ? 'svg' : 'png';
    const path = `${slug}/logo.${ext}`;
    const { error: upError } = await admin.storage
      .from('disto-deliverables')
      .upload(path, logoFile, { contentType: logoFile.type, upsert: true });
    if (!upError) {
      const { data: signed } = await admin.storage.from('disto-deliverables').createSignedUrl(path, 60 * 60 * 24 * 365);
      logoUrl = signed?.signedUrl ?? null;
      if (logoUrl) await admin.from('clients').update({ logo_url: logoUrl }).eq('id', insertedClient.id);
    }
  }

  // Send invites
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/set-password`;
  for (const inv of invites) {
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(inv.email, { redirectTo });
    if (inviteError || !invited?.user) continue;

    const profileRole = inv.role === 'admin' ? 'client_admin' : 'client_reader';
    await admin.from('profiles').upsert({ id: invited.user.id, role: profileRole, brand_slug: slug });
    await admin.from('client_users').upsert({
      client_id: insertedClient.id,
      user_id: invited.user.id,
      role: inv.role,
      status: 'invited',
    });
  }

  revalidatePath('/clients');
  return { success: true, clientId: insertedClient.id };
}

export async function archiveClient(clientId: string): Promise<ClientActionResult> {
  const { error, admin } = await requireAgencyAdmin();
  if (error || !admin) return { success: false, error: error ?? 'Erreur.' };

  const { error: dbError } = await admin
    .from('clients')
    .update({ status: 'archived' })
    .eq('id', clientId);

  if (dbError) return { success: false, error: 'Impossible d\'archiver ce client.' };

  revalidatePath('/clients');
  revalidatePath(`/clients/${clientId}`);
  return { success: true };
}

export async function activateClient(clientId: string): Promise<ClientActionResult> {
  const { error, admin } = await requireAgencyAdmin();
  if (error || !admin) return { success: false, error: error ?? 'Erreur.' };

  const { error: dbError } = await admin
    .from('clients')
    .update({ status: 'active' })
    .eq('id', clientId);

  if (dbError) return { success: false, error: 'Impossible de réactiver ce client.' };

  revalidatePath('/clients');
  revalidatePath(`/clients/${clientId}`);
  return { success: true };
}

export async function checkSlugAvailable(slug: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('clients')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  return data === null;
}
