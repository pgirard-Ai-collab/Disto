import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const MAX_CONTENT_LENGTH = 20_000;

const VALID_SECTION_KEYS = new Set([
  'brand_identity', 'mission', 'brand_intention', 'archetype',
  'value_proposition', 'positioning', 'tone_of_voice', 'personas',
  'key_messages', 'manifesto', 'brand_values', 'competitive_context',
  'always_say', 'dont_say',
]);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });

  const body = await req.json().catch(() => null) as {
    brand?: string;
    sectionKey?: string;
    contentBefore?: string;
    contentProposed?: string;
  } | null;

  if (!body || typeof body.brand !== 'string' || typeof body.sectionKey !== 'string'
      || typeof body.contentProposed !== 'string') {
    return NextResponse.json({ error: 'Paramètres manquants.' }, { status: 400 });
  }
  if (!VALID_SECTION_KEYS.has(body.sectionKey)) {
    return NextResponse.json({ error: 'Section invalide.' }, { status: 400 });
  }
  if (!body.contentProposed.trim() || body.contentProposed.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json({ error: 'Contenu invalide.' }, { status: 400 });
  }

  // Authorization: user must be active client_admin for this brand
  const [{ data: profile }, { data: client }] = await Promise.all([
    supabase.from('profiles').select('brand_slug').eq('id', user.id).single(),
    supabase.from('clients').select('id').eq('slug', body.brand).maybeSingle(),
  ]);

  if (!client) return NextResponse.json({ error: 'Marque introuvable.' }, { status: 404 });
  if (profile?.brand_slug !== body.brand) {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  }

  const { data: clientUser } = await supabase
    .from('client_users')
    .select('role')
    .eq('user_id', user.id)
    .eq('client_id', client.id)
    .eq('status', 'active')
    .maybeSingle();

  if (clientUser?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Seul un administrateur client peut soumettre des propositions.' },
      { status: 403 },
    );
  }

  const { error } = await supabase.from('brand_structure_proposals').insert({
    brand_id: client.id,
    section_key: body.sectionKey,
    content_before: body.contentBefore ?? '',
    content_proposed: body.contentProposed,
    proposed_by: user.id,
    status: 'pending',
  });

  if (error) {
    console.error('Failed to insert proposal:', error);
    return NextResponse.json({ error: 'Impossible d\'enregistrer la proposition.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
