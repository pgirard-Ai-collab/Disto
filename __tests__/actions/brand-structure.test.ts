import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  saveBrandStructure,
  publishBrandStructure,
  restoreBrandStructureVersion,
} from '@/app/actions/brand-structure';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { createClient, createAdminClient } from '@/lib/supabase/server';

const SECTIONS = { brand_identity: 'test', mission: '' };

function makeCallerMock({ role = 'agency_admin', noUser = false } = {}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: noUser ? null : { id: 'caller-id' } },
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { role } }),
    })),
  };
}

type RpcResult = { data: unknown; error: { code?: string; message?: string } | null };

function makeAdminMock({
  rpcResult,
  clientLookup = { client_id: 'client-1' },
  slugLookup = 'betula',
}: {
  rpcResult: RpcResult;
  clientLookup?: { client_id: string } | null;
  slugLookup?: string | null;
}) {
  return {
    rpc: vi.fn().mockResolvedValue(rpcResult),
    from: vi.fn((table: string) => {
      if (table === 'brand_structures') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: clientLookup }),
        };
      }
      if (table === 'clients') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: slugLookup ? { slug: slugLookup } : null }),
        };
      }
      return {};
    }),
  };
}

beforeEach(() => vi.clearAllMocks());

// ─── saveBrandStructure ──────────────────────────────────────────────────────

describe('saveBrandStructure', () => {
  it('retourne une erreur si non authentifié', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock({ noUser: true }) as never);
    const result = await saveBrandStructure('s-1', SECTIONS);
    expect(result).toEqual({ success: false, error: 'Non authentifié.' });
  });

  it("retourne une erreur si le rôle n'est pas agency_admin", async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock({ role: 'client_admin' }) as never);
    const result = await saveBrandStructure('s-1', SECTIONS);
    expect(result).toEqual({ success: false, error: 'Accès refusé.' });
  });

  it('appelle la fonction RPC save_brand_structure avec les bons paramètres', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeAdminMock({
      rpcResult: { data: [{ out_id: 'new-id', out_version: 2, out_status: 'draft' }], error: null },
    });
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await saveBrandStructure('s-1', SECTIONS);
    expect(admin.rpc).toHaveBeenCalledWith('save_brand_structure', {
      source_structure_id: 's-1',
      new_sections: SECTIONS,
    });
    expect(result).toEqual({
      success: true,
      structureId: 'new-id',
      version: 2,
      status: 'draft',
    });
  });

  it('retourne le nouveau status modified quand la précédente était published', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeAdminMock({
      rpcResult: { data: [{ out_id: 'new-id', out_version: 3, out_status: 'modified' }], error: null },
    });
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await saveBrandStructure('s-1', SECTIONS);
    expect(result).toMatchObject({ success: true, status: 'modified' });
  });

  it('retourne une erreur si la structure est introuvable', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeAdminMock({
      rpcResult: { data: null, error: { code: 'P0002', message: 'structure_not_found' } },
    });
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await saveBrandStructure('s-1', SECTIONS);
    expect(result).toEqual({ success: false, error: 'Structure introuvable.' });
  });

  it('retourne une erreur générique si la RPC échoue', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeAdminMock({
      rpcResult: { data: null, error: { code: '23505', message: 'unique violation' } },
    });
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await saveBrandStructure('s-1', SECTIONS);
    expect(result).toEqual({ success: false, error: 'Erreur lors de la sauvegarde.' });
  });
});

// ─── publishBrandStructure ───────────────────────────────────────────────────

describe('publishBrandStructure', () => {
  it('retourne une erreur si non authentifié', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock({ noUser: true }) as never);
    const result = await publishBrandStructure('s-1', SECTIONS);
    expect(result).toEqual({ success: false, error: 'Non authentifié.' });
  });

  it("retourne une erreur si le rôle n'est pas agency_admin", async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock({ role: 'client_reader' }) as never);
    const result = await publishBrandStructure('s-1', SECTIONS);
    expect(result).toEqual({ success: false, error: 'Accès refusé.' });
  });

  it('publie avec succès et appelle la RPC', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeAdminMock({
      rpcResult: {
        data: [{ out_id: 's-1', out_version: 5, out_published_at: '2026-05-22T10:00:00Z' }],
        error: null,
      },
    });
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await publishBrandStructure('s-1', SECTIONS);
    expect(admin.rpc).toHaveBeenCalledWith('publish_brand_structure', {
      source_structure_id: 's-1',
      new_sections: SECTIONS,
    });
    expect(result).toEqual({
      success: true,
      structureId: 's-1',
      version: 5,
      publishedAt: '2026-05-22T10:00:00Z',
    });
  });

  it('refuse si le client est archivé', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeAdminMock({
      rpcResult: { data: null, error: { code: 'P0001', message: 'client_archived' } },
    });
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await publishBrandStructure('s-1', SECTIONS);
    expect(result).toEqual({
      success: false,
      error: 'Ce client est archivé. Réactivez-le avant de publier.',
    });
  });

  it('retourne une erreur si la structure est introuvable', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeAdminMock({
      rpcResult: { data: null, error: { code: 'P0002', message: 'structure_not_found' } },
    });
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await publishBrandStructure('s-1', SECTIONS);
    expect(result).toEqual({ success: false, error: 'Structure introuvable.' });
  });
});

// ─── restoreBrandStructureVersion ────────────────────────────────────────────

describe('restoreBrandStructureVersion', () => {
  it('retourne une erreur si non authentifié', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock({ noUser: true }) as never);
    const result = await restoreBrandStructureVersion('s-1');
    expect(result).toEqual({ success: false, error: 'Non authentifié.' });
  });

  it("retourne une erreur si le rôle n'est pas agency_admin", async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock({ role: 'client_admin' }) as never);
    const result = await restoreBrandStructureVersion('s-1');
    expect(result).toEqual({ success: false, error: 'Accès refusé.' });
  });

  it('restaure une version avec succès', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeAdminMock({
      rpcResult: {
        data: [{ out_id: 'restored-id', out_version: 7, out_published_at: '2026-05-22T11:00:00Z' }],
        error: null,
      },
    });
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await restoreBrandStructureVersion('source-id');
    expect(admin.rpc).toHaveBeenCalledWith('restore_brand_structure_version', {
      source_structure_id: 'source-id',
    });
    expect(result).toEqual({
      success: true,
      structureId: 'restored-id',
      version: 7,
      publishedAt: '2026-05-22T11:00:00Z',
    });
  });

  it('refuse si la version est déjà courante', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeAdminMock({
      rpcResult: { data: null, error: { code: 'P0001', message: 'already_current' } },
    });
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await restoreBrandStructureVersion('s-1');
    expect(result).toEqual({
      success: false,
      error: 'Cette version est déjà la version courante.',
    });
  });

  it('refuse si le client est archivé', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeAdminMock({
      rpcResult: { data: null, error: { code: 'P0001', message: 'client_archived' } },
    });
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await restoreBrandStructureVersion('s-1');
    expect(result).toEqual({
      success: false,
      error: 'Ce client est archivé. Réactivez-le avant de restaurer.',
    });
  });

  it('retourne une erreur si la version est introuvable', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeAdminMock({
      rpcResult: { data: null, error: { code: 'P0002', message: 'structure_not_found' } },
    });
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await restoreBrandStructureVersion('s-1');
    expect(result).toEqual({ success: false, error: 'Version introuvable.' });
  });
});
