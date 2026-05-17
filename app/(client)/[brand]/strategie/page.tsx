import { C } from '@/lib/disto';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { requireBrandAccess } from '@/lib/client-access';
import StrategieExplorer from './StrategieExplorer';

export default async function StrategiePage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: brandSlug } = await params;

  const access = await requireBrandAccess(brandSlug);
  if (!access) notFound();

  const supabase = await createClient();
  const { data: structure } = await supabase
    .from('brand_structures')
    .select('sections, updated_at')
    .eq('client_id', access.clientId)
    .eq('status', 'published')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  const sections = (structure?.sections ?? {}) as Record<string, string>;
  const updatedAt = structure?.updated_at
    ? new Date(structure.updated_at).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="portal-layout" style={{ background: C.black, color: C.bone }}>
      <Sidebar variant="client" brand={brandSlug} />
      <div className="portal-main">
        <TopBar
          theme="dark"
          crumbs={[access.brandName, 'Stratégie']}
          right={null}
        />
        <StrategieExplorer
          sections={sections}
          updatedAt={updatedAt}
          brand={access.brandName}
          isAdmin={false}
          brandSlug={brandSlug}
        />
      </div>
    </div>
  );
}
