import { describe, it, expect, vi, beforeEach } from 'vitest';
import JSZip from 'jszip';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { GET } from '@/app/api/export/route';
import { createClient } from '@/lib/supabase/server';

function makeSupabaseMock({
  user = { id: 'user-1' } as { id: string } | null,
  profile = { role: 'agency_admin', brand_slug: null } as
    | { role: string; brand_slug: string | null }
    | null,
  client = { id: 'client-1', brand_name: 'Sartiga' } as
    | { id: string; brand_name: string }
    | null,
  clientUserExists = true,
  structure = {
    sections: { mission: 'M', archetype: 'A', tone_of_voice: 'T' } as Record<string, string>,
    updated_at: '2026-05-10T12:00:00Z',
  } as { sections: Record<string, string>; updated_at: string } | null,
} = {}) {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: vi.fn((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: profile }),
        };
      }
      if (table === 'clients') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: client }),
        };
      }
      if (table === 'client_users') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: clientUserExists ? { id: 'cu-1' } : null,
          }),
        };
      }
      if (table === 'brand_structures') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: structure }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
  };
}

function makeReq(query: string): Request {
  return new Request(`http://localhost/api/export?${query}`);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/export', () => {
  it('renvoie 401 si non authentifié', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({ user: null }) as never);
    const res = await GET(makeReq('brand=sartiga&format=universal_txt') as never);
    expect(res.status).toBe(401);
  });

  it('renvoie 400 si brand manque', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as never);
    const res = await GET(makeReq('format=universal_txt') as never);
    expect(res.status).toBe(400);
  });

  it('renvoie 400 si format est inconnu', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as never);
    const res = await GET(makeReq('brand=sartiga&format=evil_format') as never);
    expect(res.status).toBe(400);
  });

  it('renvoie 404 si la marque n\'existe pas', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({ client: null }) as never);
    const res = await GET(makeReq('brand=fake&format=universal_txt') as never);
    expect(res.status).toBe(404);
  });

  it('renvoie 403 si l\'utilisateur n\'a pas accès à la marque', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({
      profile: { role: 'client_admin', brand_slug: 'autre' },
      clientUserExists: false,
    }) as never);
    const res = await GET(makeReq('brand=sartiga&format=universal_txt') as never);
    expect(res.status).toBe(403);
  });

  it('renvoie 200 avec le fichier .txt pour universal_txt', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as never);
    const res = await GET(makeReq('brand=sartiga&format=universal_txt') as never);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/plain');
    expect(res.headers.get('Content-Disposition')).toContain('filename="sartiga-universal-txt.txt"');

    const text = await res.text();
    expect(text).toContain('SYSTEM PROMPT — Sartiga');
    expect(text).toContain('# Mission\nM');
  });

  it('renvoie un .md pour le format claude_project', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as never);
    const res = await GET(makeReq('brand=sartiga&format=claude_project') as never);

    expect(res.headers.get('Content-Type')).toContain('text/markdown');
    expect(res.headers.get('Content-Disposition')).toContain('filename="sartiga-claude-project.md"');

    const text = await res.text();
    expect(text).toContain('# System Prompt — Sartiga');
    expect(text).toContain('claude.ai');
  });

  it('inclut les instructions OpenAI pour chatgpt_custom_gpt', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as never);
    const res = await GET(makeReq('brand=sartiga&format=chatgpt_custom_gpt') as never);

    const text = await res.text();
    expect(text).toContain('Custom GPT');
    expect(text).toContain('platform.openai.com');
    expect(res.headers.get('Content-Disposition')).toContain('filename="sartiga-chatgpt-custom-gpt.txt"');
  });

  it('renvoie un .zip contenant SKILL.md pour claude_skill', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as never);
    const res = await GET(makeReq('brand=sartiga&format=claude_skill') as never);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/zip');
    expect(res.headers.get('Content-Disposition')).toContain('filename="sartiga-claude-skill.zip"');

    const buffer = Buffer.from(await res.arrayBuffer());
    const zip = await JSZip.loadAsync(buffer);
    const skillFile = zip.file('sartiga/SKILL.md');
    expect(skillFile).not.toBeNull();

    const skillContent = await skillFile!.async('string');
    expect(skillContent).toMatch(/^---\nname: sartiga\ndescription: Réponds et communique comme la marque Sartiga\./);
    expect(skillContent).toContain('---\n\n# System Prompt — Sartiga');
    expect(skillContent).toContain('# Mission\nM');
  });

  it('inclut les instructions Gemini pour gemini_gem', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as never);
    const res = await GET(makeReq('brand=sartiga&format=gemini_gem') as never);

    const text = await res.text();
    expect(text).toContain('Gem Gemini');
    expect(text).toContain('gemini.google.com');
  });

  it('utilise la date courante si aucune structure publiée', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({ structure: null }) as never);
    const res = await GET(makeReq('brand=sartiga&format=universal_txt') as never);

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('Généré le');
  });

  it('autorise un agency_admin même si brand_slug est null', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({
      profile: { role: 'agency_admin', brand_slug: null },
    }) as never);
    const res = await GET(makeReq('brand=sartiga&format=universal_txt') as never);
    expect(res.status).toBe(200);
  });
});
