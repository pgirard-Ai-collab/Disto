import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { C } from '@/lib/disto';
import Sidebar from '@/components/layout/Sidebar';
import UserMenu from '@/components/layout/UserMenu';
import I18nTopBar from '@/components/i18n/I18nTopBar';
import I18nSectionHead from '@/components/i18n/I18nSectionHead';
import { hasPublishedStructure } from '@/lib/has-published';
import ImportPanel from './ImportPanel';

export default async function ImportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client, error } = await supabase
    .from('clients')
    .select('id, brand_name, slug, status')
    .eq('id', id)
    .single();

  if (error || !client) notFound();

  const { data: existing } = await supabase
    .from('brand_structures')
    .select('id, version, status')
    .eq('client_id', id)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: activeJob } = await supabase
    .from('ingestion_jobs')
    .select('id, status, steps, error')
    .eq('client_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const hasPublished = await hasPublishedStructure(id);

  return (
    <div className="portal-layout" style={{ background: C.bone, color: C.black }}>
      <Sidebar variant="agency" clientId={id} hasPublishedVersion={hasPublished} />
      <div className="portal-main">
        <I18nTopBar
          theme="light"
          crumbKeys={['crumbs.betula', 'crumbs.clients', 'crumbs.brand', 'crumbs.import']}
          crumbValues={{ 'crumbs.brand': { name: client.brand_name } }}
          right={<UserMenu theme="light" />}
        />
        <div className="portal-scroll" style={{ padding: '32px 40px 40px' }}>
          <I18nSectionHead
            num="02"
            eyebrowKey="admin.import.title"
            titleKey="admin.import.heading"
            subtitleKey="admin.import.subtitle"
          />
          <ImportPanel
            clientId={client.id}
            existing={existing ?? null}
            activeJob={activeJob ?? null}
          />
        </div>
      </div>
    </div>
  );
}
