import { C } from '@/lib/disto';
import Sidebar from '@/components/layout/Sidebar';
import I18nTopBar from '@/components/i18n/I18nTopBar';
import Pill from '@/components/ui/Pill';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { requireBrandAccess } from '@/lib/client-access';
import ChatInterface from './ChatInterface';

export default async function ChatPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: brandSlug } = await params;

  const access = await requireBrandAccess(brandSlug);
  if (!access) notFound();

  const supabase = await createClient();
  const t = await getTranslations('client.chat');

  const { data: structure } = await supabase
    .from('brand_structures')
    .select('version')
    .eq('client_id', access.clientId)
    .eq('status', 'published')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  const hasStructure = !!structure;

  return (
    <div className="portal-layout" style={{ background: C.black, color: C.bone }}>
      <Sidebar variant="client" brand={brandSlug} />
      <div className="portal-main">
        <I18nTopBar
          theme="dark"
          crumbKeys={['crumbs.brand', 'crumbs.chat']}
          crumbValues={{ 'crumbs.brand': { name: access.brandName } }}
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {hasStructure ? (
                <Pill kind="active" dot>{t('aiVersion', { version: structure!.version })}</Pill>
              ) : (
                <Pill kind="draft">{t('notPublished')}</Pill>
              )}
            </div>
          }
        />

        {!hasStructure ? (
          <div style={{ display: 'grid', placeItems: 'center', flex: 1, padding: 40 }}>
            <div style={{ textAlign: 'center', maxWidth: 400 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚠</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{t('noStructureTitle')}</div>
              <div style={{ fontSize: 14, color: C.fg3, lineHeight: 1.65 }}>
                {t('noStructureBody')}
              </div>
            </div>
          </div>
        ) : (
          <ChatInterface brand={access.brandName} brandSlug={brandSlug} />
        )}
      </div>
    </div>
  );
}
