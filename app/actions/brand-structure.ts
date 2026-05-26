'use server';

import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

async function tErrors() {
  return getTranslations('serverActions.errors');
}

async function requireAgencyAdmin() {
  const t = await tErrors();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: t('unauthenticated'), admin: null, userId: null };
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'agency_admin') return { error: t('accessDenied'), admin: null, userId: null };
  return { error: null, admin: await createAdminClient(), userId: user.id };
}

async function findBrandSlug(adminClient: Awaited<ReturnType<typeof createAdminClient>>, clientId: string) {
  const { data } = await adminClient.from('clients').select('slug').eq('id', clientId).maybeSingle();
  return data?.slug ?? null;
}

export type SaveResult =
  | { success: true; structureId: string; version: number; status: 'draft' | 'modified' }
  | { success: false; error: string };

export async function saveBrandStructure(
  structureId: string,
  sections: Record<string, string>,
): Promise<SaveResult> {
  const t = await tErrors();
  const { error, admin } = await requireAgencyAdmin();
  if (error || !admin) return { success: false, error: error ?? t('generic') };

  const { data, error: rpcError } = await admin.rpc('save_brand_structure', {
    source_structure_id: structureId,
    new_sections: sections,
  });

  if (rpcError) {
    console.error('[saveBrandStructure] RPC error', {
      code: rpcError.code,
      message: rpcError.message,
      details: rpcError.details,
      hint: rpcError.hint,
    });
    if (rpcError.code === '42501') return { success: false, error: t('accessDenied') };
    if (rpcError.code === 'P0002') return { success: false, error: t('structureNotFound') };
    return { success: false, error: t('saveError') };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { success: false, error: t('saveError') };

  return {
    success: true,
    structureId: row.out_id as string,
    version: row.out_version as number,
    status: row.out_status as 'draft' | 'modified',
  };
}

export type PublishResult =
  | { success: true; structureId: string; version: number; publishedAt: string }
  | { success: false; error: string };

export async function publishBrandStructure(
  structureId: string,
  sections: Record<string, string>,
): Promise<PublishResult> {
  const t = await tErrors();
  const { error, admin } = await requireAgencyAdmin();
  if (error || !admin) return { success: false, error: error ?? t('generic') };

  const { data: src } = await admin
    .from('brand_structures')
    .select('client_id')
    .eq('id', structureId)
    .maybeSingle();

  const { data, error: rpcError } = await admin.rpc('publish_brand_structure', {
    source_structure_id: structureId,
    new_sections: sections,
  });

  if (rpcError) {
    console.error('[publishBrandStructure] RPC error', {
      code: rpcError.code,
      message: rpcError.message,
      details: rpcError.details,
      hint: rpcError.hint,
    });
    if (rpcError.code === '42501') return { success: false, error: t('accessDenied') };
    if (rpcError.code === 'P0002') {
      return { success: false, error: rpcError.message?.includes('client') ? t('clientNotFound') : t('structureNotFound') };
    }
    if (rpcError.code === 'P0001') {
      return { success: false, error: t('archivedBeforePublish') };
    }
    return { success: false, error: t('publishError') };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    console.error('[publishBrandStructure] RPC returned no row', { data, structureId });
    return { success: false, error: t('publishError') };
  }

  if (src?.client_id) {
    revalidatePath(`/clients/${src.client_id}`);
    revalidatePath(`/clients/${src.client_id}/editor`);
    const slug = await findBrandSlug(admin, src.client_id);
    if (slug) revalidatePath(`/${slug}`, 'layout');
  }

  return {
    success: true,
    structureId: row.out_id as string,
    version: row.out_version as number,
    publishedAt: row.out_published_at as string,
  };
}

export type RestoreResult =
  | { success: true; structureId: string; version: number; publishedAt: string }
  | { success: false; error: string };

export async function restoreBrandStructureVersion(
  sourceStructureId: string,
): Promise<RestoreResult> {
  const t = await tErrors();
  const { error, admin } = await requireAgencyAdmin();
  if (error || !admin) return { success: false, error: error ?? t('generic') };

  const { data: src } = await admin
    .from('brand_structures')
    .select('client_id')
    .eq('id', sourceStructureId)
    .maybeSingle();

  const { data, error: rpcError } = await admin.rpc('restore_brand_structure_version', {
    source_structure_id: sourceStructureId,
  });

  if (rpcError) {
    console.error('[restoreBrandStructureVersion] RPC error', {
      code: rpcError.code,
      message: rpcError.message,
      details: rpcError.details,
      hint: rpcError.hint,
    });
    if (rpcError.code === '42501') return { success: false, error: t('accessDenied') };
    if (rpcError.code === 'P0002') {
      return { success: false, error: rpcError.message?.includes('client') ? t('clientNotFound') : t('versionNotFound') };
    }
    if (rpcError.code === 'P0001') {
      if (rpcError.message?.includes('already_current')) {
        return { success: false, error: t('alreadyCurrent') };
      }
      if (rpcError.message?.includes('client_archived')) {
        return { success: false, error: t('archivedBeforeRestore') };
      }
    }
    return { success: false, error: t('restoreError') };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { success: false, error: t('restoreError') };

  if (src?.client_id) {
    revalidatePath(`/clients/${src.client_id}`);
    revalidatePath(`/clients/${src.client_id}/editor`);
    const slug = await findBrandSlug(admin, src.client_id);
    if (slug) revalidatePath(`/${slug}`, 'layout');
  }

  return {
    success: true,
    structureId: row.out_id as string,
    version: row.out_version as number,
    publishedAt: row.out_published_at as string,
  };
}

export type VersionListEntry = {
  id: string;
  version: number;
  status: 'draft' | 'published' | 'modified' | 'archived';
  is_current: boolean;
  created_at: string;
  created_by: string | null;
  created_by_email: string | null;
  restored_from_version: number | null;
  sections: Record<string, string>;
};

export type ListVersionsResult =
  | { success: true; versions: VersionListEntry[] }
  | { success: false; error: string };

export async function listBrandStructureVersions(clientId: string): Promise<ListVersionsResult> {
  const t = await tErrors();
  const { error, admin } = await requireAgencyAdmin();
  if (error || !admin) return { success: false, error: error ?? t('generic') };

  const { data: rows, error: dbError } = await admin
    .from('brand_structures')
    .select('id, version, status, is_current, created_at, created_by, restored_from_version, sections')
    .eq('client_id', clientId)
    .order('version', { ascending: false });

  if (dbError) return { success: false, error: t('loadError') };

  const userIds = Array.from(
    new Set((rows ?? []).map((r) => r.created_by).filter((v): v is string => !!v)),
  );

  const emailsById = new Map<string, string>();
  if (userIds.length) {
    const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    for (const u of users?.users ?? []) {
      if (u.id && userIds.includes(u.id) && u.email) emailsById.set(u.id, u.email);
    }
  }

  const versions: VersionListEntry[] = (rows ?? []).map((r) => ({
    id: r.id as string,
    version: r.version as number,
    status: r.status as VersionListEntry['status'],
    is_current: r.is_current as boolean,
    created_at: r.created_at as string,
    created_by: r.created_by as string | null,
    created_by_email: r.created_by ? emailsById.get(r.created_by) ?? null : null,
    restored_from_version: r.restored_from_version as number | null,
    sections: (r.sections ?? {}) as Record<string, string>,
  }));

  return { success: true, versions };
}
