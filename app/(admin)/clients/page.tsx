import { createClient } from '@/lib/supabase/server';
import { C } from '@/lib/disto';
import Sidebar from '@/components/layout/Sidebar';
import UserMenu from '@/components/layout/UserMenu';
import I18nTopBar from '@/components/i18n/I18nTopBar';
import I18nSectionHead from '@/components/i18n/I18nSectionHead';
import { getTranslations } from 'next-intl/server';
import ClientsTable from './ClientsTable';

export default async function ClientsPage() {
  const supabase = await createClient();
  const t = await getTranslations('admin.clients');

  const { data: clients, error } = await supabase
    .from('clients')
    .select('id, org_name, brand_name, slug, status, updated_at')
    .order('updated_at', { ascending: false });

  return (
    <div className="portal-layout" style={{ background: C.bone, color: C.black }}>
      <Sidebar variant="agency" />
      <div className="portal-main">
        <I18nTopBar
          theme="light"
          crumbKeys={['crumbs.betula', 'crumbs.console', 'crumbs.clients']}
          right={<UserMenu theme="light" />}
        />
        <div className="portal-scroll" style={{ padding: '36px 40px 28px' }}>
          <I18nSectionHead
            num="01"
            eyebrowKey="admin.clients.eyebrow"
            titleKey="admin.clients.title"
            subtitleKey="admin.clients.subtitle"
          />
          {error ? (
            <div style={{ padding: '20px', color: C.red, fontSize: 14 }}>
              {t('loadError')}{error.message}
            </div>
          ) : (
            <ClientsTable clients={clients ?? []} />
          )}
        </div>
      </div>
    </div>
  );
}
