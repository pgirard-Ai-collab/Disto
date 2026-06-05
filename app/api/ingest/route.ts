import { NextRequest, NextResponse, after } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import 'pdf-parse/worker';
import { PDFParse } from 'pdf-parse';
import { CanvasFactory } from 'pdf-parse/worker';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { parseLlmJson } from '@/lib/parse-llm-json';

export const runtime = 'nodejs';
export const maxDuration = 300;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildSystemPrompt(lang: string): string {
  return `You are a brand strategy expert. From the provided document, extract and structure information into strict JSON.
Reply ONLY with a valid JSON object with no markdown or comments (no \`\`\`json), with exactly these 14 keys:
brand_identity, mission, brand_intention, archetype, value_proposition, positioning,
tone_of_voice, personas, key_messages, manifesto, competitive_context, brand_values,
always_say, dont_say.
Each value must be a text string written in ${lang} — the same language as the source document.
For always_say and dont_say, provide a bullet list (one term/phrase per line prefixed with "- ").
If a section is absent from the document, return an empty string "".`;
}

function detectLanguage(text: string): string {
  // Sample the first 2000 chars for speed; count common function words per language.
  const sample = text.slice(0, 2000).toLowerCase();
  const scores: Record<string, number> = {
    French:  (sample.match(/\b(le|la|les|de|du|des|et|en|un|une|est|que|qui|pour|dans|avec|sur|par|pas|nous|vous|ils|elles|au|aux)\b/g) ?? []).length,
    English: (sample.match(/\b(the|is|are|was|were|and|of|to|in|it|for|on|with|as|at|by|from|or|an|be|this|that|have|has|not)\b/g) ?? []).length,
    Spanish: (sample.match(/\b(el|la|los|las|de|del|en|un|una|es|que|se|por|con|para|como|su|sus|al|lo|y|o)\b/g) ?? []).length,
    Portuguese: (sample.match(/\b(o|a|os|as|de|do|da|dos|das|em|um|uma|é|que|se|por|com|para|como|seu|sua)\b/g) ?? []).length,
    German: (sample.match(/\b(der|die|das|ein|eine|ist|sind|war|und|oder|in|mit|auf|für|von|zu|an|im|dem|den|des)\b/g) ?? []).length,
  };
  const detected = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  // Fall back to French if scores are all zero (vision mode, no extracted text)
  return detected[1] > 0 ? detected[0] : 'French';
}

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

type FileEntry = { buffer: Buffer; name: string; size: number };

async function extractText(buffer: Buffer): Promise<string> {
  try {
    const parser = new PDFParse({ data: new Uint8Array(buffer), CanvasFactory });
    const result = await parser.getText();
    await parser.destroy();
    return result.text ?? '';
  } catch {
    return '';
  }
}

function pruneToContextLimit(text: string, maxChars = 200000): string {
  if (text.length <= maxChars) return text;
  // Remove repeated blank lines first, then truncate if still over limit
  const cleaned = text.replace(/\n{3,}/g, '\n\n');
  if (cleaned.length <= maxChars) return cleaned;
  return cleaned.slice(0, maxChars);
}

async function runPipeline(
  admin: Admin,
  jobId: string,
  clientId: string,
  clientSlug: string,
  fileEntries: FileEntry[],
  mode: 'replace' | 'version',
) {
  const steps: Step[] = [
    { key: 'upload',  state: 'pending' },
    { key: 'extract', state: 'pending' },
    { key: 'llm',     state: 'pending' },
    { key: 'save',    state: 'pending' },
  ];

  try {
    // Step 1 — Upload all files to Storage
    steps[0].state = 'running';
    await patchJob(admin, jobId, { steps, status: 'running' });

    const pdfPaths: string[] = [];
    const totalSize = fileEntries.reduce((sum, f) => sum + f.size, 0);

    for (const entry of fileEntries) {
      const pdfPath = `${clientSlug}/${Date.now()}_${entry.name.replace(/[^a-z0-9._-]/gi, '_')}`;
      const { error: uploadError } = await admin.storage
        .from('disto-deliverables')
        .upload(pdfPath, entry.buffer, { contentType: 'application/pdf', upsert: false });
      if (uploadError) throw new Error(`Upload échoué (${entry.name}) : ${uploadError.message}`);
      pdfPaths.push(pdfPath);
    }

    await admin.from('ingestion_jobs').update({ pdf_paths: pdfPaths }).eq('id', jobId);

    const fileCount = fileEntries.length;
    const sizeMo = (totalSize / 1024 / 1024).toFixed(1);
    steps[0] = {
      key: 'upload',
      state: 'done',
      meta: fileCount === 1
        ? `${fileEntries[0].name} · ${sizeMo} Mo`
        : `${fileCount} fichiers · ${sizeMo} Mo`,
    };
    await patchJob(admin, jobId, { steps });

    // Step 2 — Extract text from all files
    steps[1].state = 'running';
    await patchJob(admin, jobId, { steps });

    let useVision = false;
    const extractedParts: string[] = [];

    for (const entry of fileEntries) {
      const text = await extractText(entry.buffer);
      const wordCount = text.trim().split(/\s+/).length;
      if (text.trim().length < 500 || wordCount < 100) useVision = true;
      extractedParts.push(`\n\n--- ${entry.name} ---\n\n${text}`);
    }

    const combinedText = extractedParts.join('');
    const docLanguage = detectLanguage(combinedText);

    if (useVision) {
      steps[1] = { key: 'extract', state: 'done', meta: fileCount === 1 ? 'PDF image — traitement vision' : `${fileCount} fichiers — traitement vision` };
    } else {
      const totalWords = combinedText.trim().split(/\s+/).length;
      steps[1] = {
        key: 'extract',
        state: 'done',
        meta: fileCount === 1
          ? `${totalWords.toLocaleString('fr-CA')} mots extraits`
          : `${fileCount} fichiers · ${totalWords.toLocaleString('fr-CA')} mots extraits`,
      };
    }
    await patchJob(admin, jobId, { steps });

    // Step 3 — LLM structuring
    steps[2].state = 'running';
    await patchJob(admin, jobId, { steps });

    let sections: Record<string, string>;

    const systemPrompt = buildSystemPrompt(docLanguage);

    if (useVision) {
      const docBlocks = fileEntries.map(entry => ({
        type: 'document' as const,
        source: {
          type: 'base64' as const,
          media_type: 'application/pdf' as const,
          data: entry.buffer.toString('base64'),
        },
      }));
      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
        messages: [{
          role: 'user',
          content: [
            ...docBlocks as never[],
            { type: 'text', text: 'Structure this brand document according to the 14 requested keys.' },
          ],
        }],
      });
      const raw = msg.content.find(b => b.type === 'text' && 'text' in b)?.text ?? '{}';
      sections = parseLlmJson(raw);
    } else {
      const pruned = pruneToContextLimit(combinedText);
      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: pruned }],
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
      const { data: existingStruct } = await admin
        .from('brand_structures')
        .select('id, version, is_current')
        .eq('client_id', clientId)
        .eq('is_current', true)
        .maybeSingle();

      if (existingStruct) {
        await admin.from('brand_structures')
          .update({ sections, status: 'draft', published_at: null })
          .eq('id', existingStruct.id);
      } else {
        await admin.from('brand_structures').insert({
          client_id: clientId, sections, status: 'draft', version: 1, is_current: true,
        });
      }
    } else {
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
  const rawFiles = form.getAll('files') as File[];
  const clientId = form.get('clientId') as string | null;
  const mode = ((form.get('mode') as string | null) ?? 'replace') as 'replace' | 'version';

  if (!rawFiles.length || !clientId) return NextResponse.json({ error: 'Fichiers et clientId requis.' }, { status: 400 });
  if (rawFiles.length > 10) return NextResponse.json({ error: 'Maximum 10 fichiers.' }, { status: 400 });

  for (const f of rawFiles) {
    if (f.type !== 'application/pdf') return NextResponse.json({ error: `Format PDF uniquement (${f.name}).` }, { status: 400 });
    if (f.size > 50 * 1024 * 1024) return NextResponse.json({ error: `Le fichier ${f.name} dépasse 50 MB.` }, { status: 400 });
  }

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
    .insert({ client_id: clientId, pdf_path: '', pdf_paths: [], status: 'pending', steps: initialSteps })
    .select('id').single();
  if (jobErr || !job) return NextResponse.json({ error: 'Impossible de créer le job.' }, { status: 500 });

  // Read all file buffers before the response is sent
  const fileEntries: FileEntry[] = await Promise.all(
    rawFiles.map(async f => ({
      buffer: Buffer.from(await f.arrayBuffer()),
      name: f.name,
      size: f.size,
    }))
  );

  after(
    runPipeline(admin, job.id, clientId, client.slug, fileEntries, mode)
      .catch(err => {
        console.error('Ingestion pipeline crashed:', err);
      }),
  );

  return NextResponse.json({ jobId: job.id });
}
