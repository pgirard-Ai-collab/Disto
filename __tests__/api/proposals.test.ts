import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { POST } from '@/app/api/proposals/route';
import { createClient } from '@/lib/supabase/server';

function makeSupabaseMock({
  user = { id: 'user-1' } as { id: string } | null,
  profileBrandSlug = 'sartiga' as string | null,
  client = { id: 'client-1' } as { id: string } | null,
  clientUserRole = 'admin' as 'admin' | 'reader' | null,
  insertError = null as null | { message: string },
} = {}) {
  const insertMock = vi.fn().mockResolvedValue({ error: insertError });
  return {
    _insertMock: insertMock,
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: vi.fn((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { brand_slug: profileBrandSlug } }),
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
            data: clientUserRole ? { role: clientUserRole } : null,
          }),
        };
      }
      if (table === 'brand_structure_proposals') {
        return { insert: insertMock };
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
  };
}

function makeReq(body: unknown): Request {
  return new Request('http://localhost/api/proposals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  brand: 'sartiga',
  sectionKey: 'mission',
  contentBefore: 'Ancien contenu',
  contentProposed: 'Nouveau contenu',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('POST /api/proposals', () => {
  it('renvoie 401 si non authentifié', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({ user: null }) as never);
    const res = await POST(makeReq(VALID_BODY) as never);
    expect(res.status).toBe(401);
  });

  it('renvoie 400 si le body n\'est pas du JSON valide', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as never);
    const req = new Request('http://localhost/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'pas du json',
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it('renvoie 400 si brand manque', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as never);
    const res = await POST(makeReq({ ...VALID_BODY, brand: undefined }) as never);
    expect(res.status).toBe(400);
  });

  it('renvoie 400 si sectionKey est invalide', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as never);
    const res = await POST(makeReq({ ...VALID_BODY, sectionKey: 'evil_section' }) as never);
    expect(res.status).toBe(400);
  });

  it('renvoie 400 si contentProposed est vide', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as never);
    const res = await POST(makeReq({ ...VALID_BODY, contentProposed: '   ' }) as never);
    expect(res.status).toBe(400);
  });

  it('renvoie 400 si contentProposed dépasse 20 000 caractères', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as never);
    const res = await POST(makeReq({
      ...VALID_BODY,
      contentProposed: 'x'.repeat(20_001),
    }) as never);
    expect(res.status).toBe(400);
  });

  it('renvoie 404 si la marque n\'existe pas', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({ client: null }) as never);
    const res = await POST(makeReq(VALID_BODY) as never);
    expect(res.status).toBe(404);
  });

  it('renvoie 403 si profile.brand_slug ne correspond pas à la marque', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({
      profileBrandSlug: 'autre-marque',
    }) as never);
    const res = await POST(makeReq(VALID_BODY) as never);
    expect(res.status).toBe(403);
  });

  it('renvoie 403 si client_users n\'est pas admin (reader)', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({
      clientUserRole: 'reader',
    }) as never);
    const res = await POST(makeReq(VALID_BODY) as never);
    expect(res.status).toBe(403);
  });

  it('renvoie 403 si client_users absent', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({
      clientUserRole: null,
    }) as never);
    const res = await POST(makeReq(VALID_BODY) as never);
    expect(res.status).toBe(403);
  });

  it('renvoie 500 si l\'insert échoue', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({
      insertError: { message: 'duplicate key' },
    }) as never);
    const res = await POST(makeReq(VALID_BODY) as never);
    expect(res.status).toBe(500);
  });

  it('renvoie 200 avec ok=true et insère une row avec status=pending', async () => {
    const supabaseMock = makeSupabaseMock();
    vi.mocked(createClient).mockResolvedValue(supabaseMock as never);

    const res = await POST(makeReq(VALID_BODY) as never);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(supabaseMock._insertMock).toHaveBeenCalledWith({
      brand_id: 'client-1',
      section_key: 'mission',
      content_before: 'Ancien contenu',
      content_proposed: 'Nouveau contenu',
      proposed_by: 'user-1',
      status: 'pending',
    });
  });

  it('accepte un contentBefore manquant et utilise une chaîne vide', async () => {
    const supabaseMock = makeSupabaseMock();
    vi.mocked(createClient).mockResolvedValue(supabaseMock as never);

    const res = await POST(makeReq({
      brand: 'sartiga',
      sectionKey: 'mission',
      contentProposed: 'Nouveau',
    }) as never);
    expect(res.status).toBe(200);

    expect(supabaseMock._insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ content_before: '' }),
    );
  });
});
