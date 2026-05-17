import { createClient } from '@/lib/supabase/server';

export async function hasPublishedStructure(clientId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('brand_structures')
    .select('id')
    .eq('client_id', clientId)
    .eq('status', 'published')
    .limit(1)
    .maybeSingle();
  return !!data;
}
