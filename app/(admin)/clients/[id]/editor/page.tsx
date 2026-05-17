import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { C } from '@/lib/disto';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import UserMenu from '@/components/layout/UserMenu';
import { hasPublishedStructure } from '@/lib/has-published';
import EditorPanel from './EditorPanel';

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
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
    .select('id, sections, status')
    .eq('client_id', id)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  const hasPublished = await hasPublishedStructure(id);

  if (!structure) {
    return (
      <div className="portal-layout" style={{ background: C.bone, color: C.black }}>
        <Sidebar variant="agency" clientId={id} hasPublishedVersion={hasPublished} />
        <div className="portal-main">
          <TopBar theme="light" crumbs={['betula', client.brand_name, 'Éditeur']} right={<UserMenu theme="light" />} />
          <div className="portal-scroll" style={{ padding: '48px 40px', textAlign: 'center', color: C.muted, fontSize: 15 }}>
            Aucune structure de marque. Commencez par <a href={`/clients/${id}/import`} style={{ color: C.red }}>importer un Disto</a>.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-layout" style={{ background: C.bone, color: C.black }}>
      <Sidebar variant="agency" clientId={id} hasPublishedVersion={hasPublished} />
      <div className="portal-main">
        <TopBar
          theme="light"
          crumbs={['betula', client.brand_name, 'Éditeur']}
          right={<UserMenu theme="light" />}
        />
        <div className="portal-scroll" style={{ padding: '28px 40px 40px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <EditorPanel
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
