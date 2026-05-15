'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient, createClient } from '@/lib/supabase/server';

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

export type SaveResult = { success: true } | { success: false; error: string };

export async function saveBrandStructure(
  structureId: string,
  sections: Record<string, string>,
  currentStatus: 'draft' | 'published' | 'modified',
): Promise<SaveResult> {
  const { error, admin } = await requireAgencyAdmin();
  if (error || !admin) return { success: false, error: error ?? 'Erreur.' };

  const nextStatus = currentStatus === 'published' ? 'modified' : currentStatus;
  const { error: dbError } = await admin
    .from('brand_structures')
    .update({ sections, status: nextStatus })
    .eq('id', structureId);

  if (dbError) return { success: false, error: 'Erreur lors de la sauvegarde.' };
  return { success: true };
}

export type PublishResult = { success: true } | { success: false; error: string };

export async function publishBrandStructure(
  structureId: string,
  sections: Record<string, string>,
): Promise<PublishResult> {
  const { error, admin } = await requireAgencyAdmin();
  if (error || !admin) return { success: false, error: error ?? 'Erreur.' };

  // Load the structure with its client to enforce business rules
  const { data: structure } = await admin
    .from('brand_structures')
    .select('id, client_id')
    .eq('id', structureId)
    .single();

  if (!structure) return { success: false, error: 'Structure introuvable.' };

  const { data: client } = await admin
    .from('clients')
    .select('id, status')
    .eq('id', structure.client_id)
    .single();

  if (!client) return { success: false, error: 'Client introuvable.' };

  if (client.status === 'archived') {
    return { success: false, error: 'Ce client est archivé. Réactivez-le avant de publier.' };
  }

  const { error: pubError } = await admin
    .from('brand_structures')
    .update({ sections, status: 'published', published_at: new Date().toISOString() })
    .eq('id', structureId);

  if (pubError) return { success: false, error: 'Erreur lors de la publication.' };

  // Auto-activate only when transitioning from draft
  if (client.status === 'draft') {
    await admin.from('clients').update({ status: 'active' }).eq('id', client.id);
  }

  revalidatePath(`/clients/${client.id}`);
  return { success: true };
}
