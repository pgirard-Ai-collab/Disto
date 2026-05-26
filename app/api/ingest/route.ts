import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import 'pdf-parse/worker';
import { PDFParse } from 'pdf-parse';
import { CanvasFactory } from 'pdf-parse/worker';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { parseLlmJson } from '@/lib/parse-llm-json';

export const runtime = 'nodejs';
export const maxDuration = 300;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es un expert en stratégie de marque. À partir du document fourni, extrais et structure les informations en JSON strict.
Réponds UNIQUEMENT avec un objet JSON valide sans markdown ni commentaires (pas de \`\`\`json), avec exactement ces 14 clés :
brand_identity, mission, brand_intention, archetype, value_proposition, positioning,
tone_of_voice, personas, key_messages, manifesto, competitive_context, brand_values,
always_say, dont_say.
Chaque valeur est une chaîne de texte en français.
Pour always_say et dont_say, fournis une liste à puces (un terme/phrase par ligne préfixée de "- ").
Si une section est absente du document, retourne une chaîne vide "".`;

type StepKey = 'upload' | 'extract' | 'llm' | 'save';
type StepState = 'pending' | 'running' | 'done' | 'error';
type Step = { key: StepKey; state: StepState; meta?: string };

type Admin = Awaited<ReturnType<typeof createAdminClient>>;

async function patchJob(
  admin: Admin,
  jobId: string,
  patch: { steps?: Step[]; status?: string; error?: string | null },
) {
  await admin.from('ingestion_jobs').update(patch).eq('id', jobId);
}


async function runPipeline(
  admin: Admin,
  jobId: string,
  clientId: string,
  clientSlug: string,
  fileBuffer: Buffer,
  fileName: string,
  fileSize: number,
  mode: 'replace' | 'version',
) {
  const steps: Step[] = [
    { key: 'upload',  state: 'pending' },
    { key: 'extract', state: 'pending' },
    { key: 'llm',     state: 'pending' },
    { key: 'save',    state: 'pending' },
  ];

  try {
    // Step 1 — Upload to Storage
    steps[0].state = 'running';
    await patchJob(admin, jobId, { steps, status: 'running' });

    const pdfPath = `${clientSlug}/${Date.now()}_${fileName.replace(/[^a-z0-9._-]/gi, '_')}`;
    const { error: uploadError } = await admin.storage
      .from('disto-deliverables')
      .upload(pdfPath, fileBuffer, { contentType: 'application/pdf', upsert: false });
    if (uploadError) throw new Error('Upload échoué : ' + uploadError.message);

    await admin.from('ingestion_jobs').update({ pdf_path: pdfPath }).eq('id', jobId);
    steps[0] = { key: 'upload', state: 'done', meta: `${fileName} · ${(fileSize / 1024 / 1024).toFixed(1)} Mo` };
    await patchJob(admin, jobId, { steps });

    // Step 2 — Extract text
    steps[1].state = 'running';
    await patchJob(admin, jobId, { steps });

    let pdfText = '';
    let useVision = false;
    try {
      const parser = new PDFParse({ data: new Uint8Array(fileBuffer), CanvasFactory });
      const result = await parser.getText();
      pdfText = result.text ?? '';
      await parser.destroy();
    } catch {
      pdfText = '';
    }
    if (pdfText.trim().length < 500) useVision = true;

    if (useVision) {
      steps[1] = { key: 'extract', state: 'done', meta: 'PDF image — traitement vision' };
    } else {
      const wordCount = pdfText.trim().split(/\s+/).length;
      steps[1] = { key: 'extract', state: 'done', meta: `${wordCount.toLocaleString('fr-CA')} mots extraits` };
    }
    await patchJob(admin, jobId, { steps });

    // Step 3 — LLM structuring (with prompt caching)
    steps[2].state = 'running';
    await patchJob(admin, jobId, { steps });

    let sections: Record<string, string>;

    if (useVision) {
      const b64 = fileBuffer.toString('base64');
      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: b64 },
            } as never,
            { type: 'text', text: 'Structure ce document de marque selon les 14 clés demandées.' },
          ],
        }],
      });
      const raw = msg.content.find(b => b.type === 'text' && 'text' in b)?.text ?? '{}';
      sections = parseLlmJson(raw);
    } else {
      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: pdfText.slice(0, 100000) }],
      });
      const raw = msg.content.find(b => b.type === 'text' && 'text' in b)?.text ?? '{}';
      sections = parseLlmJson(raw);
    }

    steps[2] = { key: 'llm', state: 'done', meta: '14 sections structurées' };
    await patchJob(admin, jobId, { steps });

    // Step 4 — Save brand structure
    steps[3].state = 'running';
    await patchJob(admin, jobId, { steps });

    if (mode === 'replace') {
      const { data: existing } = await admin
        .from('brand_structures')
        .select('id, version, is_current')
        .eq('client_id', clientId)
        .eq('is_current', true)
        .maybeSingle();

      if (existing) {
        // True replace: overwrite the current row in place (preserves is_current)
        await admin.from('brand_structures')
          .update({ sections, status: 'draft', published_at: null })
          .eq('id', existing.id);
      } else {
        await admin.from('brand_structures').insert({
          client_id: clientId, sections, status: 'draft', version: 1, is_current: true,
        });
      }
    } else {
      // version mode: insert a new version and make it current
      const { data: latest } = await admin
        .from('brand_structures')
        .select('version')
        .eq('client_id', clientId)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();
      const version = (latest?.version ?? 0) + 1;
      await admin.from('brand_structures')
        .update({ is_current: false })
        .eq('client_id', clientId)
        .eq('is_current', true);
      await admin.from('brand_structures').insert({
        client_id: clientId, sections, status: 'draft', version, is_current: true,
      });
    }

    steps[3] = { key: 'save', state: 'done', meta: 'Structure prête pour révision' };
    await patchJob(admin, jobId, { steps, status: 'done' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    const failedIdx = steps.findIndex(s => s.state === 'running');
    if (failedIdx >= 0) steps[failedIdx].state = 'error';
    await patchJob(admin, jobId, { steps, status: 'error', error: msg });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'agency_admin') return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });

  const form = await req.formData();
  const file = form.get('file') as File | null;
  const clientId = form.get('clientId') as string | null;
  const mode = ((form.get('mode') as string | null) ?? 'replace') as 'replace' | 'version';

  if (!file || !clientId) return NextResponse.json({ error: 'Fichier et clientId requis.' }, { status: 400 });
  if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: 'Le fichier dépasse 50 MB.' }, { status: 400 });
  if (file.type !== 'application/pdf') return NextResponse.json({ error: 'Format PDF uniquement.' }, { status: 400 });

  const admin = await createAdminClient();
  const { data: client, error: clientErr } = await admin.from('clients').select('id, slug').eq('id', clientId).single();
  if (clientErr || !client) return NextResponse.json({ error: 'Client introuvable.' }, { status: 404 });

  const initialSteps: Step[] = [
    { key: 'upload',  state: 'pending' },
    { key: 'extract', state: 'pending' },
    { key: 'llm',     state: 'pending' },
    { key: 'save',    state: 'pending' },
  ];

  const { data: job, error: jobErr } = await admin.from('ingestion_jobs')
    .insert({ client_id: clientId, pdf_path: '', status: 'pending', steps: initialSteps })
    .select('id').single();
  if (jobErr || !job) return NextResponse.json({ error: 'Impossible de créer le job.' }, { status: 500 });

  // Read file into buffer before returning — the request body won't be available after response
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name;
  const fileSize = file.size;

  // Fire-and-forget — pipeline updates ingestion_jobs which the client watches via Realtime
  runPipeline(admin, job.id, clientId, client.slug, buffer, fileName, fileSize, mode)
    .catch(err => {
      // Already handled inside runPipeline, this is a final safety net
      console.error('Ingestion pipeline crashed:', err);
    });

  return NextResponse.json({ jobId: job.id });
}
