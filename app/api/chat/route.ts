import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { buildSystemPrompt, type BrandSections } from '@/lib/build-prompt';

export const runtime = 'nodejs';
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MAX_MESSAGES = 50;
const MAX_CONTENT_LENGTH = 4000;

type Message = { role: 'user' | 'assistant'; content: string };

function validateMessages(input: unknown): Message[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_MESSAGES) return null;
  const out: Message[] = [];
  for (const m of input) {
    if (!m || typeof m !== 'object') return null;
    const msg = m as Record<string, unknown>;
    if (msg.role !== 'user' && msg.role !== 'assistant') return null;
    if (typeof msg.content !== 'string') return null;
    if (msg.content.length === 0 || msg.content.length > MAX_CONTENT_LENGTH) return null;
    out.push({ role: msg.role, content: msg.content });
  }
  return out;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });

  const body = await req.json().catch(() => null) as { brand?: string; messages?: unknown } | null;
  if (!body || typeof body.brand !== 'string') {
    return NextResponse.json({ error: 'Paramètres manquants.' }, { status: 400 });
  }
  const messages = validateMessages(body.messages);
  if (!messages) {
    return NextResponse.json({ error: 'Messages invalides.' }, { status: 400 });
  }

  // Authorization: user must be linked to this brand (agency_admin OR active client_users)
  const [{ data: profile }, { data: client }] = await Promise.all([
    supabase.from('profiles').select('role, brand_slug').eq('id', user.id).single(),
    supabase.from('clients').select('id, brand_name').eq('slug', body.brand).maybeSingle(),
  ]);

  if (!client) return NextResponse.json({ error: 'Marque introuvable.' }, { status: 404 });

  let authorized = profile?.role === 'agency_admin';
  if (!authorized && profile?.brand_slug === body.brand) {
    const { data: cu } = await supabase
      .from('client_users')
      .select('id')
      .eq('user_id', user.id)
      .eq('client_id', client.id)
      .eq('status', 'active')
      .maybeSingle();
    authorized = !!cu;
  }
  if (!authorized) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });

  const { data: structure } = await supabase
    .from('brand_structures')
    .select('sections')
    .eq('client_id', client.id)
    .eq('status', 'published')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!structure) {
    return NextResponse.json({ error: 'Aucune structure publiée pour cette marque.' }, { status: 409 });
  }

  const sections = (structure.sections ?? {}) as BrandSections;
  const systemPrompt = buildSystemPrompt(client.brand_name, sections);

  let raw: string;
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages,
    });
    raw = response.content.find(b => b.type === 'text' && 'text' in b)?.text ?? '';
  } catch (err) {
    console.error('Anthropic API error:', err);
    return NextResponse.json(
      { error: 'L\'assistant est temporairement indisponible. Veuillez réessayer dans un instant.' },
      { status: 502 },
    );
  }

  // Split sources from reply text (last SOURCES: line)
  const sourcesIdx = raw.lastIndexOf('\nSOURCES:');
  const text = sourcesIdx >= 0 ? raw.slice(0, sourcesIdx).trim() : raw.trim();
  const sourcesLine = sourcesIdx >= 0 ? raw.slice(sourcesIdx + '\nSOURCES:'.length).trim() : '';
  const sources = sourcesLine ? sourcesLine.split(',').map(s => s.trim()).filter(Boolean) : [];

  return NextResponse.json({ text, sources });
}
