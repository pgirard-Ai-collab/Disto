import { C } from '@/lib/disto';
import Sidebar from '@/components/layout/Sidebar';
import I18nTopBar from '@/components/i18n/I18nTopBar';
import Pill from '@/components/ui/Pill';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { requireBrandAccess } from '@/lib/client-access';
import { buildPromptBody, estimateTokens, type BrandSections } from '@/lib/build-prompt';
import ExportPanel from './ExportPanel';

export default async function ExportPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: brandSlug } = await params;

  const access = await requireBrandAccess(brandSlug);
  if (!access) notFound();

  const supabase = await createClient();
  const tSys = await getTranslations('admin.systemPrompt');
  const tChat = await getTranslations('client.chat');
  const locale = await getLocale();
  const dateLocale = locale === 'fr' ? 'fr-CA' : 'en-CA';

  const { data: structure } = await supabase
    .from('brand_structures')
    .select('sections, version, updated_at')
    .eq('client_id', access.clientId)
    .eq('status', 'published')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  const sections = (structure?.sections ?? {}) as BrandSections;
  const version = structure?.version ?? null;
  const generatedAt = structure?.updated_at
    ? new Date(structure.updated_at).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' });

  const promptPreview = buildPromptBody(access.brandName, sections);
  const tokenEstimate = estimateTokens(promptPreview);

  return (
    <div className="portal-layout" style={{ background: C.black, color: C.bone }}>
      <Sidebar variant="client" brand={brandSlug} />
      <div className="portal-main">
        <I18nTopBar
          theme="dark"
          crumbKeys={['crumbs.brand', 'crumbs.systemPrompt']}
          crumbValues={{ 'crumbs.brand': { name: access.brandName } }}
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {version !== null ? (
                <Pill kind="active" dot>{tSys('syncedVersion', { version })}</Pill>
              ) : (
                <Pill kind="draft">{tChat('noStructureTitle')}</Pill>
              )}
            </div>
          }
        />
        <ExportPanel
          brand={access.brandName}
          brandSlug={brandSlug}
          promptPreview={promptPreview}
          generatedAt={generatedAt}
          tokenEstimate={tokenEstimate}
          hasStructure={!!structure}
        />
      </div>
    </div>
  );
}
