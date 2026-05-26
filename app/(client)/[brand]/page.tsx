import { C } from '@/lib/disto';
import Sidebar from '@/components/layout/Sidebar';
import I18nTopBar from '@/components/i18n/I18nTopBar';
import Pill from '@/components/ui/Pill';
import Eyebrow from '@/components/ui/Eyebrow';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { requireBrandAccess } from '@/lib/client-access';

type SectionKey = 'brand_identity' | 'mission' | 'archetype' | 'tone_of_voice';
type SectionI18nKey = 'identity' | 'mission' | 'archetype' | 'tone';

const CARD_SECTIONS: { key: SectionKey; i18n: SectionI18nKey; n: string }[] = [
  { key: 'brand_identity', i18n: 'identity',  n: '01' },
  { key: 'mission',        i18n: 'mission',   n: '02' },
  { key: 'archetype',      i18n: 'archetype', n: '04' },
  { key: 'tone_of_voice',  i18n: 'tone',      n: '07' },
];

function truncate(text: string, max = 150): string {
  if (!text || text.length <= max) return text ?? '';
  return text.slice(0, max).trimEnd() + '…';
}

export default async function DashboardPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: brandSlug } = await params;

  const access = await requireBrandAccess(brandSlug);
  if (!access) notFound();

  const supabase = await createClient();
  const t = await getTranslations('client.dashboard');
  const tSection = await getTranslations('admin.editor.section');
  const tCommon = await getTranslations('common');
  const locale = await getLocale();
  const dateLocale = locale === 'fr' ? 'fr-CA' : 'en-CA';

  const { data: structure } = await supabase
    .from('brand_structures')
    .select('sections, version, updated_at')
    .eq('client_id', access.clientId)
    .eq('status', 'published')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  const sections = (structure?.sections ?? {}) as Record<string, string>;
  const version = structure?.version ?? null;
  const updatedAt = structure?.updated_at
    ? new Date(structure.updated_at).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const brand = access.brandName;

  return (
    <div className="portal-layout" style={{ background: C.black, color: C.bone }}>
      <Sidebar variant="client" brand={brandSlug} />
      <div className="portal-main">
        <I18nTopBar
          theme="dark"
          crumbKeys={['crumbs.brand', 'crumbs.dashboard']}
          crumbValues={{ 'crumbs.brand': { name: brand } }}
          right={
            access.isAdmin ? (
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.fg3 }}>
                {t('brandAdmin')}
              </span>
            ) : null
          }
        />

        <div className="portal-scroll" style={{ padding: '48px 48px 40px' }}>
          {!structure && (
            <div style={{
              padding: '16px 20px', marginBottom: 32,
              background: 'rgba(245,230,25,0.10)', border: `1px solid ${C.yellowDark}`,
              color: C.bone, fontSize: 13, lineHeight: 1.6,
            }}>
              <Eyebrow color={C.yellowDark} style={{ marginBottom: 6 }}>{t('notPublishedTitle')}</Eyebrow>
              {t('notPublishedBody')}
            </div>
          )}

          {/* Brand header */}
          <div className="section-head-row" style={{
            paddingBottom: 36, borderBottom: `1px solid ${C.line2}`, marginBottom: 40,
          }}>
            <div>
              <Eyebrow color={C.red} style={{ marginBottom: 20 }}>{t('eyebrow')}</Eyebrow>
              <div style={{ fontSize: 'clamp(48px, 6.5vw, 96px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.92, marginBottom: 16 }}>
                {brand}.
              </div>
              {sections.manifesto && (
                <div style={{ fontSize: 18, color: C.boneDim, maxWidth: 520, lineHeight: 1.5 }}>
                  {truncate(sections.manifesto, 120)}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Eyebrow color={C.fg3}>{t('lastUpdate')}</Eyebrow>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>{updatedAt ?? '—'}</div>
              {version !== null && (
                <div style={{ fontSize: 12, color: C.fg3, letterSpacing: '0.04em' }}>betula — v {version}</div>
              )}
              <div style={{ marginTop: 6 }}>
                <Pill kind={structure ? 'active' : 'draft'}>{structure ? t('publishedTag') : t('draftTag')}</Pill>
              </div>
            </div>
          </div>

          {/* Primary CTAs */}
          <div className="grid-2" style={{ gap: 0, marginBottom: 44, border: `1px solid ${C.line2}` }}>
            <Link href={`/${brandSlug}/chat`} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '32px 36px', background: C.red, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, cursor: 'pointer',
              }}>
                <div>
                  <Eyebrow color="rgba(255,255,255,0.7)" style={{ marginBottom: 8 }}>{t('actionEyebrow1')}</Eyebrow>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.05 }}>{t('actionTitle1')}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>{t('actionSubtitle1')}</div>
                </div>
                <div style={{ fontSize: 32 }}>→</div>
              </div>
            </Link>
            <Link href={`/${brandSlug}/export`} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '32px 36px', background: C.panel,
                borderLeft: `1px solid ${C.line2}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, cursor: 'pointer',
              }}>
                <div>
                  <Eyebrow color={C.fg3} style={{ marginBottom: 8 }}>{t('actionEyebrow2')}</Eyebrow>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.05, color: C.bone }}>{t('actionTitle2')}</div>
                  <div style={{ fontSize: 13, color: C.fg3, marginTop: 6 }}>{t('actionSubtitle2')}</div>
                </div>
                <div style={{ fontSize: 32, color: C.bone }}>↓</div>
              </div>
            </Link>
          </div>

          <Eyebrow color={C.fg3} style={{ marginBottom: 18 }}>{t('coreEyebrow')}</Eyebrow>

          <div className="grid-4" style={{ gap: 0, border: `1px solid ${C.line2}` }}>
            {CARD_SECTIONS.map((c, i) => {
              const content = sections[c.key] ?? '';
              return (
                <Link key={c.key} href={`/${brandSlug}/strategie`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '28px 26px', background: C.panel,
                    borderRight: i < CARD_SECTIONS.length - 1 ? `1px solid ${C.line2}` : 'none',
                    display: 'flex', flexDirection: 'column', gap: 14, minHeight: 240,
                    cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: C.red, fontWeight: 700, fontSize: 12, letterSpacing: '0.16em', fontVariantNumeric: 'tabular-nums' }}>{c.n} /</span>
                    </div>
                    <Eyebrow color={C.fg3}>{tSection(c.i18n)}</Eyebrow>
                    <div style={{ fontSize: 13, color: C.boneDim, lineHeight: 1.6, flex: 1 }}>
                      {content ? truncate(content) : <span style={{ color: C.muted, fontStyle: 'italic' }}>{tCommon('notDefined')}</span>}
                    </div>
                    <div style={{ paddingTop: 14, borderTop: `1px solid ${C.line}`, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.fg3, display: 'flex', justifyContent: 'space-between' }}>
                      <span>{tCommon('open')}</span><span>→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
