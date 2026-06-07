'use server';

import { getTranslations } from 'next-intl/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/send';
import { inviteEmailHtml, inviteSubject } from '@/lib/email/templates/invite';

export type InviteUserResult =
  | { success: true }
  | { success: false; error: string };

export async function inviteUser(
  email: string,
  role: 'client_admin' | 'client_reader',
  clientId: string,
): Promise<InviteUserResult> {
  const t = await getTranslations('serverActions.errors');

  if (!email || !role || !clientId) {
    return { success: false, error: t('missingFields') };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: t('unauthenticated') };

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (callerProfile?.role !== 'agency_admin') return { success: false, error: t('accessDenied') };

  const admin = await createAdminClient();
  const { data: client } = await admin.from('clients').select('id, slug').eq('id', clientId).single();
  if (!client) return { success: false, error: t('clientNotFound') };

  const brandRole = role === 'client_admin' ? 'client_admin' : 'client_reader';
  const clientRole = role === 'client_admin' ? 'admin' : 'reader';

  // Check if a user with this email already exists
  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const existingUser = existingUsers?.users.find(u => u.email === email);

  if (existingUser) {
    // User already has credentials — just add the client_users row
    const { error: cuError } = await admin
      .from('client_users')
      .upsert(
        { client_id: clientId, user_id: existingUser.id, role: clientRole, status: 'active' },
        { onConflict: 'client_id,user_id' },
      );

    if (cuError) return { success: false, error: t('accessCreate') };
    return { success: true };
  }

  // New user — send invite email and create profile + client_users row
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/set-password`;

  const { data, error: inviteError } = await admin.auth.admin.generateLink({
    type: 'invite',
    email,
    options: { redirectTo },
  });

  if (inviteError) {
    return { success: false, error: t('inviteFailed') };
  }

  const actionLink = data.properties.action_link;
  await sendEmail({
    to: email,
    subject: inviteSubject,
    html: inviteEmailHtml({ actionLink, email }),
    actionLink,
  });

  const { error: profileError } = await admin
    .from('profiles')
    .upsert({ id: data.user.id, role: brandRole, brand_slug: client.slug });

  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    return { success: false, error: t('profileCreate') };
  }

  const { error: cuError } = await admin
    .from('client_users')
    .upsert({ client_id: clientId, user_id: data.user.id, role: clientRole, status: 'invited' });

  if (cuError) {
    await admin.auth.admin.deleteUser(data.user.id);
    return { success: false, error: t('accessCreate') };
  }

  return { success: true };
}
