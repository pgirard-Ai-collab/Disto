import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type ClientAccess = {
  userId: string;
  clientId: string;
  brandSlug: string;
  brandName: string;
  role: 'admin' | 'reader' | 'agency_admin';
  isAdmin: boolean;
};

/**
 * Verifies the current user has access to the requested brand.
 * - Unauthenticated → redirect to /login
 * - Agency admins → allowed, role='agency_admin'
 * - Client users → must have an active client_users row for this brand AND profiles.brand_slug must match
 * - Otherwise → return null (caller can call notFound())
 */
export async function requireBrandAccess(brandSlug: string): Promise<ClientAccess | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [profileRes, clientRes] = await Promise.all([
    supabase.from('profiles').select('role, brand_slug').eq('id', user.id).single(),
    supabase.from('clients').select('id, brand_name').eq('slug', brandSlug).maybeSingle(),
  ]);
  const { data: profile, error: profileErr } = profileRes;
  const { data: client, error: clientErr } = clientRes;

  if (!client) {
    console.warn('[client-access] client not found', { brandSlug, clientErr: clientErr?.message });
    return null;
  }
  if (!profile) {
    console.warn('[client-access] profile not found', { userId: user.id, profileErr: profileErr?.message });
    return null;
  }

  // Agency admin → full access
  if (profile.role === 'agency_admin') {
    return {
      userId: user.id,
      clientId: client.id,
      brandSlug,
      brandName: client.brand_name,
      role: 'agency_admin',
      isAdmin: true,
    };
  }

  // Client user → must be linked to THIS brand AND profile slug must match
  if (profile.brand_slug !== brandSlug) {
    console.warn('[client-access] brand_slug mismatch', {
      userId: user.id, profileSlug: profile.brand_slug, requestedSlug: brandSlug, role: profile.role,
    });
    return null;
  }

  const { data: clientUser, error: cuErr } = await supabase
    .from('client_users')
    .select('role, status')
    .eq('user_id', user.id)
    .eq('client_id', client.id)
    .maybeSingle();

  if (!clientUser) {
    console.warn('[client-access] no client_users row', { userId: user.id, clientId: client.id, cuErr: cuErr?.message });
    return null;
  }
  if (clientUser.status !== 'active') {
    console.warn('[client-access] client_users not active', { userId: user.id, status: clientUser.status });
    return null;
  }

  return {
    userId: user.id,
    clientId: client.id,
    brandSlug,
    brandName: client.brand_name,
    role: clientUser.role as 'admin' | 'reader',
    isAdmin: clientUser.role === 'admin',
  };
}
