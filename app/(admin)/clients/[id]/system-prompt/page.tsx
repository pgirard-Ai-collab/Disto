import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { C } from '@/lib/disto';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import UserMenu from '@/components/layout/UserMenu';
import Pill from '@/components/ui/Pill';
import { buildPromptBody, estimateTokens, type BrandSections } from '@/lib/build-prompt';
import ExportPanel from '@/app/(client)/[brand]/export/ExportPanel';

export default async function AgencySystemPromptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .select('id, brand_name, slug')
    .eq('id', id)
    .single();

  if (clientErr || !client) notFound();

  const { data: structure } = await supabase
    .from('brand_structures')
    .select('sections, version, updated_at')
    .eq('client_id', id)
    .eq('status', 'published')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!structure) notFound();

  const sections = (structure.sections ?? {}) as BrandSections;
  const version = structure.version;
  const generatedAt = structure.updated_at
    ? new Date(structure.updated_at).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });

  const promptPreview = buildPromptBody(client.brand_name, sections);
  const tokenEstimate = estimateTokens(promptPreview);

  return (
    <div className="portal-layout" style={{ background: C.black, color: C.bone }}>
      <Sidebar variant="agency" clientId={id} hasPublishedVersion />
      <div className="portal-main">
        <TopBar
          theme="dark"
          crumbs={['betula', client.brand_name, 'System Prompt']}
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Pill kind="active" dot>Synchronisé · v {version}</Pill>
              <UserMenu theme="dark" />
            </div>
          }
        />
        <ExportPanel
          brand={client.brand_name}
          brandSlug={client.slug}
          promptPreview={promptPreview}
          generatedAt={generatedAt}
          tokenEstimate={tokenEstimate}
          hasStructure
        />
      </div>
    </div>
  );
}
