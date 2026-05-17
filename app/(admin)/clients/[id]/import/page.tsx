import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { C } from '@/lib/disto';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import UserMenu from '@/components/layout/UserMenu';
import SectionHead from '@/components/ui/SectionHead';
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

  // Resume any in-flight or recently-completed job so progress survives reloads
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
        <TopBar
          theme="light"
          crumbs={['betula', 'Clients', client.brand_name, 'Import Disto']}
          right={<UserMenu theme="light" />}
        />
        <div className="portal-scroll" style={{ padding: '32px 40px 40px' }}>
          <SectionHead
            num="02"
            eyebrow={`${client.brand_name} · Import Disto`}
            title="Import Disto."
            subtitle="Déposez le document brand du client. Nous extrayons, nous structurons, vous validez."
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
