import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { C } from '@/lib/disto';
import Sidebar from '@/components/layout/Sidebar';
import I18nTopBar from '@/components/i18n/I18nTopBar';
import Pill from '@/components/ui/Pill';
import UserMenu from '@/components/layout/UserMenu';
import ChatInterface from '@/app/(client)/[brand]/chat/ChatInterface';

export default async function AgencyChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const t = await getTranslations('client.chat');

  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .select('id, brand_name, slug')
    .eq('id', id)
    .single();

  if (clientErr || !client) notFound();

  const { data: structure } = await supabase
    .from('brand_structures')
    .select('version')
    .eq('client_id', id)
    .eq('status', 'published')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  const hasStructure = !!structure;

  return (
    <div className="portal-layout" style={{ background: C.black, color: C.bone }}>
      <Sidebar variant="agency" clientId={id} hasPublishedVersion={hasStructure} />
      <div className="portal-main">
        <I18nTopBar
          theme="dark"
          crumbKeys={['crumbs.betula', 'crumbs.brand', 'crumbs.chat']}
          crumbValues={{ 'crumbs.brand': { name: client.brand_name } }}
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {hasStructure ? (
                <Pill kind="active" dot>{t('aiVersion', { version: structure!.version })}</Pill>
              ) : (
                <Pill kind="draft">{t('notPublished')}</Pill>
              )}
              <UserMenu theme="dark" />
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
          <ChatInterface brand={client.brand_name} brandSlug={client.slug} />
        )}
      </div>
    </div>
  );
}
