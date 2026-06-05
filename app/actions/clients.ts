'use server';

import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/send';
import { inviteEmailHtml, inviteSubject } from '@/lib/email/templates/invite';

export type ClientEmailInvite = { email: string; role: 'admin' | 'reader' };

type ErrorKey =
  | 'unauthenticated' | 'accessDenied' | 'generic' | 'genericCreate'
  | 'orgRequired' | 'slugInvalid' | 'slugTaken' | 'invitesInvalid'
  | 'logoTooBig' | 'logoBadFormat' | 'archiveFailed' | 'unarchiveFailed' | 'deleteFailed';

async function tErrors() {
  return getTranslations('serverActions.errors');
}

async function requireAgencyAdmin() {
  const t = await tErrors();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: t('unauthenticated'), admin: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'agency_admin') return { error: t('accessDenied'), admin: null };

  return { error: null, admin: await createAdminClient() };
}

export type ClientActionResult =
  | { success: true; clientId?: string }
  | { success: false; error: string };

function fail(t: (key: ErrorKey) => string, key: ErrorKey): ClientActionResult {
  return { success: false, error: t(key) };
}

export async function createClientRecord(formData: FormData): Promise<ClientActionResult> {
  const t = await tErrors();
  const { error, admin } = await requireAgencyAdmin();
  if (error || !admin) return { success: false, error: error ?? t('generic') };

  const org_name   = (formData.get('org_name')   as string)?.trim();
  const brand_name = (formData.get('brand_name') as string)?.trim();
  const slug       = (formData.get('slug')       as string)?.trim().toLowerCase();
  const logoFile   = formData.get('logo') as File | null;
  const invitesRaw = formData.get('invites') as string | null;

  if (!org_name || !brand_name || !slug) return fail(t, 'orgRequired');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return fail(t, 'slugInvalid');

  let invites: ClientEmailInvite[] = [];
  try {
    invites = invitesRaw ? JSON.parse(invitesRaw) : [];
  } catch {
    return fail(t, 'invitesInvalid');
  }

  let logoUrl: string | null = null;

  const { data: insertedClient, error: dbError } = await admin
    .from('clients')
    .insert({ org_name, brand_name, slug, status: 'draft' })
    .select('id')
    .single();

  if (dbError || !insertedClient) {
    if (dbError?.code === '23505') return fail(t, 'slugTaken');
    return fail(t, 'genericCreate');
  }

  if (logoFile && logoFile.size > 0) {
    if (logoFile.size > 2 * 1024 * 1024) return fail(t, 'logoTooBig');
    if (!['image/png', 'image/svg+xml'].includes(logoFile.type)) return fail(t, 'logoBadFormat');
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

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/set-password`;
  for (const inv of invites) {
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'invite',
      email: inv.email,
      options: { redirectTo },
    });
    if (linkError || !linkData?.user) continue;

    const actionLink = linkData.properties.action_link;
    await sendEmail({
      to: inv.email,
      subject: inviteSubject,
      html: inviteEmailHtml({ actionLink, email: inv.email }),
      actionLink,
    });

    const profileRole = inv.role === 'admin' ? 'client_admin' : 'client_reader';
    await admin.from('profiles').upsert({ id: linkData.user.id, role: profileRole, brand_slug: slug });
    await admin.from('client_users').upsert({
      client_id: insertedClient.id,
      user_id: linkData.user.id,
      role: inv.role,
      status: 'invited',
    });
  }

  revalidatePath('/clients');
  return { success: true, clientId: insertedClient.id };
}

export async function archiveClient(clientId: string): Promise<ClientActionResult> {
  const t = await tErrors();
  const { error, admin } = await requireAgencyAdmin();
  if (error || !admin) return { success: false, error: error ?? t('generic') };

  const { error: dbError } = await admin
    .from('clients')
    .update({ status: 'archived' })
    .eq('id', clientId);

  if (dbError) return fail(t, 'archiveFailed');

  revalidatePath('/clients');
  revalidatePath(`/clients/${clientId}`);
  return { success: true };
}

export async function activateClient(clientId: string): Promise<ClientActionResult> {
  const t = await tErrors();
  const { error, admin } = await requireAgencyAdmin();
  if (error || !admin) return { success: false, error: error ?? t('generic') };

  const { error: dbError } = await admin
    .from('clients')
    .update({ status: 'active' })
    .eq('id', clientId);

  if (dbError) return fail(t, 'unarchiveFailed');

  revalidatePath('/clients');
  revalidatePath(`/clients/${clientId}`);
  return { success: true };
}

export async function deleteClient(clientId: string): Promise<ClientActionResult> {
  const t = await tErrors();
  const { error, admin } = await requireAgencyAdmin();
  if (error || !admin) return { success: false, error: error ?? t('generic') };

  const { error: dbError } = await admin
    .from('clients')
    .delete()
    .eq('id', clientId);

  if (dbError) return fail(t, 'deleteFailed');

  revalidatePath('/clients');
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

