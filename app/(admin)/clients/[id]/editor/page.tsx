import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { C } from '@/lib/disto';
import Sidebar from '@/components/layout/Sidebar';
import UserMenu from '@/components/layout/UserMenu';
import I18nTopBar from '@/components/i18n/I18nTopBar';
import { hasPublishedStructure } from '@/lib/has-published';
import EditorPanel from './EditorPanel';

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const t = await getTranslations('admin.editor');

  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .select('id, brand_name, slug')
    .eq('id', id)
    .single();

  if (clientErr || !client) notFound();

  const { data: structure } = await supabase
    .from('brand_structures')
    .select('id, sections, status')
    .eq('client_id', id)
    .eq('is_current', true)
    .maybeSingle();

  const hasPublished = await hasPublishedStructure(id);

  if (!structure) {
    return (
      <div className="portal-layout" style={{ background: C.bone, color: C.black }}>
        <Sidebar variant="agency" clientId={id} hasPublishedVersion={hasPublished} />
        <div className="portal-main">
          <I18nTopBar
            theme="light"
            crumbKeys={['crumbs.betula', 'crumbs.brand', 'crumbs.editor']}
            crumbValues={{ 'crumbs.brand': { name: client.brand_name } }}
            right={<UserMenu theme="light" />}
          />
          <div className="portal-scroll" style={{ padding: '48px 40px', textAlign: 'center', color: C.muted, fontSize: 15 }}>
            {t('empty')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-layout" style={{ background: C.bone, color: C.black }}>
      <Sidebar variant="agency" clientId={id} hasPublishedVersion={hasPublished} />
      <div className="portal-main">
        <I18nTopBar
          theme="light"
          crumbKeys={['crumbs.betula', 'crumbs.brand', 'crumbs.editor']}
          crumbValues={{ 'crumbs.brand': { name: client.brand_name } }}
          right={<UserMenu theme="light" />}
        />
        <div className="portal-scroll" style={{ padding: '28px 40px 40px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <EditorPanel
            clientId={id}
            structureId={structure.id}
            brandName={client.brand_name}
            initialSections={structure.sections as Record<string, string>}
            initialStatus={structure.status as 'draft' | 'published' | 'modified'}
          />
        </div>
      </div>
    </div>
  );
}
