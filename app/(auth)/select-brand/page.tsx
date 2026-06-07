'use client';

import { C } from '@/lib/disto';
import Eyebrow from '@/components/ui/Eyebrow';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';

type Brand = { slug: string; brandName: string; orgName: string };

export default function SelectBrandPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }

      supabase
        .from('client_users')
        .select('clients(slug, brand_name, org_name)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .then(({ data }) => {
          const list = (data ?? [])
            .map(r => {
              const c = r.clients as unknown as { slug: string; brand_name: string; org_name: string } | null;
              if (!c) return null;
              return { slug: c.slug, brandName: c.brand_name, orgName: c.org_name };
            })
            .filter((b): b is Brand => b !== null);

          if (list.length === 0) { router.push('/login'); return; }
          if (list.length === 1) { router.push(`/${list[0].slug}`); return; }
          setBrands(list);
          setLoading(false);
        });
    });
  }, [router]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: C.black,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ color: C.fg3, fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Archivo, sans-serif' }}>
          Chargement…
        </span>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: C.black,
      color: C.bone,
      fontFamily: 'Archivo, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Wordmark */}
        <div style={{ marginBottom: 48, display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ color: C.red, fontWeight: 700, fontSize: 24, letterSpacing: '-0.03em' }}>DISTO.</span>
          <Eyebrow color={C.fg3} style={{ fontSize: 10 }}>Brand OS</Eyebrow>
        </div>

        <Eyebrow color={C.muted} style={{ fontSize: 10, marginBottom: 14 }}>Accès portail</Eyebrow>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 8 }}>
          Choisir une marque
        </div>
        <div style={{ color: C.fg3, fontSize: 14, marginBottom: 36, lineHeight: 1.55 }}>
          Vous avez accès à plusieurs portails. Sélectionnez la marque pour laquelle vous souhaitez vous connecter.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {brands.map(brand => (
            <button
              key={brand.slug}
              onClick={() => router.push(`/${brand.slug}`)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 4,
                width: '100%',
                background: C.ink,
                border: `1px solid ${C.line}`,
                borderRadius: 4,
                padding: '18px 22px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 140ms ease',
                fontFamily: 'Archivo, sans-serif',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = C.lineStrong)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = C.line)}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: C.bone, letterSpacing: '-0.01em' }}>
                {brand.brandName}
              </span>
              <span style={{ fontSize: 11, color: C.fg3, letterSpacing: '0.04em' }}>
                {brand.orgName}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
