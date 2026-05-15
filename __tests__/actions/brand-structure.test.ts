import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveBrandStructure, publishBrandStructure } from '@/app/actions/brand-structure';

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

type AdminOpts = {
  updateError?: null | { message: string };
  structureData?: null | { id: string; client_id: string };
  clientData?: null | { id: string; status: string };
  clientUpdateError?: null | { message: string };
};

function makeAdminMock({
  updateError = null,
  structureData = { id: 'struct-1', client_id: 'client-1' },
  clientData = { id: 'client-1', status: 'active' },
  clientUpdateError = null,
}: AdminOpts = {}) {
  return {
    from: vi.fn((table: string) => {
      if (table === 'brand_structures') {
        return {
          update: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: structureData }),
          then: undefined,
          // make the update chain return { error }
          mockResolvedValue: undefined,
          _updateResult: { error: updateError },
        };
      }
      if (table === 'clients') {
        return {
          select: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: clientUpdateError }),
          single: vi.fn().mockResolvedValue({ data: clientData }),
        };
      }
      return {};
    }),
  };
}

// Simpler approach: build per-test mocks inline
function makeFullAdminMock({
  updateError = null as null | { message: string },
  structureData = { id: 'struct-1', client_id: 'client-1' } as null | { id: string; client_id: string },
  clientData = { id: 'client-1', status: 'active' } as null | { id: string; status: string },
  clientUpdateError = null as null | { message: string },
} = {}) {
  const clientsUpdateEqMock = vi.fn().mockResolvedValue({ error: clientUpdateError });
  const clientsUpdateMock = vi.fn(() => ({ eq: clientsUpdateEqMock }));

  const structureUpdateEqMock = vi.fn().mockResolvedValue({ error: updateError });
  const structureUpdateMock = vi.fn(() => ({ eq: structureUpdateEqMock }));

  return {
    from: vi.fn((table: string) => {
      if (table === 'brand_structures') {
        return {
          update: structureUpdateMock,
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: structureData }),
        };
      }
      if (table === 'clients') {
        return {
          select: vi.fn().mockReturnThis(),
          update: clientsUpdateMock,
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: clientData }),
        };
      }
      return {};
    }),
    _clientsUpdateEq: clientsUpdateEqMock,
  };
}

beforeEach(() => vi.clearAllMocks());

// ─── saveBrandStructure ──────────────────────────────────────────────────────

describe('saveBrandStructure', () => {
  it('retourne une erreur si non authentifié', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock({ noUser: true }) as never);
    const result = await saveBrandStructure('s-1', SECTIONS, 'draft');
    expect(result).toEqual({ success: false, error: 'Non authentifié.' });
  });

  it('retourne une erreur si le rôle n\'est pas agency_admin', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock({ role: 'client_admin' }) as never);
    const result = await saveBrandStructure('s-1', SECTIONS, 'draft');
    expect(result).toEqual({ success: false, error: 'Accès refusé.' });
  });

  it('garde le statut draft inchangé', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeFullAdminMock();
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await saveBrandStructure('s-1', SECTIONS, 'draft');
    expect(result).toEqual({ success: true });

    const fromCalls = (admin.from as ReturnType<typeof vi.fn>).mock.calls as unknown[][];
    const updateCall = fromCalls.find((args) => args[0] === 'brand_structures');
    expect(updateCall).toBeTruthy();
    const updateArg = (admin.from('brand_structures').update as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(updateArg?.status).toBe('draft');
  });

  it('passe le statut à modified quand la structure est publiée', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeFullAdminMock();
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await saveBrandStructure('s-1', SECTIONS, 'published');
    expect(result).toEqual({ success: true });
  });

  it('retourne une erreur si Supabase échoue', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeFullAdminMock({ updateError: { message: 'DB error' } });
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await saveBrandStructure('s-1', SECTIONS, 'draft');
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

  it('retourne une erreur si le rôle n\'est pas agency_admin', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock({ role: 'client_reader' }) as never);
    const result = await publishBrandStructure('s-1', SECTIONS);
    expect(result).toEqual({ success: false, error: 'Accès refusé.' });
  });

  it('retourne une erreur si la structure est introuvable', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeFullAdminMock({ structureData: null });
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await publishBrandStructure('s-1', SECTIONS);
    expect(result).toEqual({ success: false, error: 'Structure introuvable.' });
  });

  it('retourne une erreur si le client est introuvable', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeFullAdminMock({ clientData: null });
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await publishBrandStructure('s-1', SECTIONS);
    expect(result).toEqual({ success: false, error: 'Client introuvable.' });
  });

  it('refuse si le client est archivé', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeFullAdminMock({ clientData: { id: 'client-1', status: 'archived' } });
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await publishBrandStructure('s-1', SECTIONS);
    expect(result).toEqual({
      success: false,
      error: 'Ce client est archivé. Réactivez-le avant de publier.',
    });
  });

  it('publie avec succès quand le client est actif (pas de promotion)', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeFullAdminMock({ clientData: { id: 'client-1', status: 'active' } });
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await publishBrandStructure('s-1', SECTIONS);
    expect(result).toEqual({ success: true });
    // client update should NOT have been called
    expect(admin._clientsUpdateEq).not.toHaveBeenCalled();
  });

  it('promeut le client de draft à active lors de la première publication', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeFullAdminMock({ clientData: { id: 'client-1', status: 'draft' } });
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await publishBrandStructure('s-1', SECTIONS);
    expect(result).toEqual({ success: true });
    expect(admin._clientsUpdateEq).toHaveBeenCalledWith('id', 'client-1');
  });

  it('retourne une erreur si Supabase échoue lors du update', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeFullAdminMock({ updateError: { message: 'constraint violation' } });
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await publishBrandStructure('s-1', SECTIONS);
    expect(result).toEqual({ success: false, error: 'Erreur lors de la publication.' });
  });
});
