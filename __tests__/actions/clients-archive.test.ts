import { describe, it, expect, vi, beforeEach } from 'vitest';
import { archiveClient, activateClient } from '@/app/actions/clients';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { createClient, createAdminClient } from '@/lib/supabase/server';

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

function makeAdminMock({ updateError = null as null | { message: string } } = {}) {
  const eqMock = vi.fn().mockResolvedValue({ error: updateError });
  const updateMock = vi.fn(() => ({ eq: eqMock }));
  return {
    from: vi.fn(() => ({ update: updateMock })),
    _updateEq: eqMock,
  };
}

beforeEach(() => vi.clearAllMocks());

// ─── archiveClient ───────────────────────────────────────────────────────────

describe('archiveClient', () => {
  it('retourne une erreur si non authentifié', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock({ noUser: true }) as never);
    const result = await archiveClient('client-1');
    expect(result).toEqual({ success: false, error: 'Non authentifié.' });
  });

  it('retourne une erreur si le rôle n\'est pas agency_admin', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock({ role: 'client_admin' }) as never);
    const result = await archiveClient('client-1');
    expect(result).toEqual({ success: false, error: 'Accès refusé.' });
  });

  it('archive le client avec succès', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeAdminMock();
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await archiveClient('client-1');
    expect(result).toEqual({ success: true });
    expect(admin._updateEq).toHaveBeenCalledWith('id', 'client-1');
  });

  it('retourne une erreur si Supabase échoue', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeAdminMock({ updateError: { message: 'DB error' } });
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await archiveClient('client-1');
    expect(result).toEqual({ success: false, error: 'Impossible d\'archiver ce client.' });
  });
});

// ─── activateClient ──────────────────────────────────────────────────────────

describe('activateClient', () => {
  it('retourne une erreur si non authentifié', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock({ noUser: true }) as never);
    const result = await activateClient('client-1');
    expect(result).toEqual({ success: false, error: 'Non authentifié.' });
  });

  it('retourne une erreur si le rôle n\'est pas agency_admin', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock({ role: 'client_reader' }) as never);
    const result = await activateClient('client-1');
    expect(result).toEqual({ success: false, error: 'Accès refusé.' });
  });

  it('réactive le client avec succès', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeAdminMock();
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await activateClient('client-1');
    expect(result).toEqual({ success: true });
    expect(admin._updateEq).toHaveBeenCalledWith('id', 'client-1');
  });

  it('retourne une erreur si Supabase échoue', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeAdminMock({ updateError: { message: 'not found' } });
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await activateClient('client-1');
    expect(result).toEqual({ success: false, error: 'Impossible de réactiver ce client.' });
  });
});
