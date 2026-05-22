import { createClient } from '@/lib/supabase/server';
import { requireBrandAccess } from '@/lib/client-access';
import UpdateBanner from './UpdateBanner';

export default async function BrandLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ brand: string }>;
}) {
  const { brand: brandSlug } = await params;
  const access = await requireBrandAccess(brandSlug);

  let publishedAt: string | null = null;
  if (access) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('brand_structures')
      .select('published_at')
      .eq('client_id', access.clientId)
      .eq('status', 'published')
      .maybeSingle();
    publishedAt = data?.published_at ?? null;
  }

  return (
    <>
      <UpdateBanner brandSlug={brandSlug} publishedAt={publishedAt} />
      {children}
    </>
  );
}
