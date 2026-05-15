import { createClient } from '@/lib/supabase/server';
import { C } from '@/lib/disto';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import UserMenu from '@/components/layout/UserMenu';
import SectionHead from '@/components/ui/SectionHead';
import ClientsTable from './ClientsTable';

export default async function ClientsPage() {
  const supabase = await createClient();

  const { data: clients, error } = await supabase
    .from('clients')
    .select('id, org_name, brand_name, slug, status, updated_at')
    .order('updated_at', { ascending: false });

  return (
    <div className="portal-layout" style={{ background: C.bone, color: C.black }}>
      <Sidebar variant="agency" />
      <div className="portal-main">
        <TopBar
          theme="light"
          crumbs={['betula', 'Console', 'Clients']}
          right={<UserMenu theme="light" />}
        />
        <div className="portal-scroll" style={{ padding: '36px 40px 28px' }}>
          <SectionHead
            num="01"
            eyebrow="Console · Agence betula"
            title="Clients"
            subtitle="Chaque marque que nous accompagnons possède un portail. Draft, actif ou archivé — toujours un seul signal."
          />
          {error ? (
            <div style={{ padding: '20px', color: C.red, fontSize: 14 }}>
              Erreur lors du chargement des clients : {error.message}
            </div>
          ) : (
            <ClientsTable clients={clients ?? []} />
          )}
        </div>
      </div>
    </div>
  );
}
