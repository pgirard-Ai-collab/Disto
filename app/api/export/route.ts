import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { createClient } from '@/lib/supabase/server';
import { buildPromptBody, type BrandSections } from '@/lib/build-prompt';

export const runtime = 'nodejs';

type ExportFormat = 'chatgpt_custom_gpt' | 'claude_project' | 'claude_skill' | 'gemini_gem' | 'universal_txt';

const VALID_FORMATS: ExportFormat[] = [
  'chatgpt_custom_gpt', 'claude_project', 'claude_skill', 'gemini_gem', 'universal_txt',
];

const FORMAT_EXT: Record<ExportFormat, string> = {
  chatgpt_custom_gpt: 'txt',
  claude_project:     'md',
  claude_skill:       'zip',
  gemini_gem:         'txt',
  universal_txt:      'txt',
};

function buildClaudeSkillMarkdown(brandName: string, brandSlug: string, body: string, generatedAt: string): string {
  const description = `Réponds et communique comme la marque ${brandName}. À utiliser pour toute interaction de marque, copywriting, réponses client, et création de contenu nécessitant la voix de ${brandName}.`;
  return [
    '---',
    `name: ${brandSlug}`,
    `description: ${description}`,
    '---',
    '',
    `# System Prompt — ${brandName}`,
    `> Généré le ${generatedAt} depuis le portail betula`,
    '',
    body,
  ].join('\n');
}

function formatForPlatform(format: ExportFormat, brandName: string, brandSlug: string, body: string, generatedAt: string): string {
  switch (format) {
    case 'chatgpt_custom_gpt':
      return [
        `[Instructions pour Custom GPT — ${brandName}]`,
        `Généré le ${generatedAt} depuis le portail betula`,
        '',
        body,
        '',
        '---',
        'NOTE: Coller ce texte dans le champ "Instructions" de votre Custom GPT sur platform.openai.com',
      ].join('\n');
    case 'claude_project':
      return [
        `# System Prompt — ${brandName}`,
        `> Généré le ${generatedAt} depuis le portail betula`,
        '',
        body,
        '',
        '---',
        '> NOTE: Coller ce contenu dans le champ "System prompt" de votre Project sur claude.ai',
      ].join('\n');
    case 'claude_skill':
      return buildClaudeSkillMarkdown(brandName, brandSlug, body, generatedAt);
    case 'gemini_gem':
      return [
        `[Instructions pour Gem Gemini — ${brandName}]`,
        `Généré le ${generatedAt} depuis le portail betula`,
        '',
        body,
        '',
        '---',
        'NOTE: Coller ce texte comme premier message dans un nouveau Gem sur gemini.google.com. Activer la mémoire longue.',
      ].join('\n');
    case 'universal_txt':
    default:
      return [
        `SYSTEM PROMPT — ${brandName}`,
        `Généré le ${generatedAt} depuis le portail betula`,
        '',
        body,
      ].join('\n');
  }
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const brand = searchParams.get('brand');
  const format = (searchParams.get('format') ?? 'universal_txt') as ExportFormat;

  if (!brand || !VALID_FORMATS.includes(format)) {
    return NextResponse.json({ error: 'Paramètres invalides.' }, { status: 400 });
  }

  // Authorization
  const [{ data: profile }, { data: client }] = await Promise.all([
    supabase.from('profiles').select('role, brand_slug').eq('id', user.id).single(),
    supabase.from('clients').select('id, brand_name').eq('slug', brand).maybeSingle(),
  ]);

  if (!client) return NextResponse.json({ error: 'Marque introuvable.' }, { status: 404 });

  let authorized = profile?.role === 'agency_admin';
  if (!authorized && profile?.brand_slug === brand) {
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
    .select('sections, updated_at')
    .eq('client_id', client.id)
    .eq('status', 'published')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  const sections = (structure?.sections ?? {}) as BrandSections;
  const generatedAt = structure?.updated_at
    ? new Date(structure.updated_at).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });

  const body = buildPromptBody(client.brand_name, sections);
  const content = formatForPlatform(format, client.brand_name, brand, body, generatedAt);
  const ext = FORMAT_EXT[format];
  const filename = `${brand}-${format.replace(/_/g, '-')}.${ext}`;

  if (format === 'claude_skill') {
    const zip = new JSZip();
    zip.folder(brand)?.file('SKILL.md', content);
    const blob = await zip.generateAsync({ type: 'blob' });
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  }

  return new NextResponse(content, {
    headers: {
      'Content-Type': ext === 'md' ? 'text/markdown; charset=utf-8' : 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
