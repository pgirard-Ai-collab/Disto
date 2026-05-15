import { describe, it, expect, vi, beforeEach } from 'vitest';
import { disableUser } from '@/app/actions/disable-user';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { createClient, createAdminClient } from '@/lib/supabase/server';

function makeCallerMock({ role = 'agency_admin' } = {}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'caller-id' } } }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { role } }),
    })),
  };
}

function makeAdminMock({
  banError = null as null | { message: string },
  cuError = null as null | { message: string },
} = {}) {
  return {
    auth: {
      admin: {
        updateUserById: vi.fn().mockResolvedValue({ error: banError }),
      },
    },
    from: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { client_id: 'client-123' }, error: cuError }),
    })),
  };
}

beforeEach(() => vi.clearAllMocks());

describe('disableUser', () => {
  it('retourne une erreur si les identifiants sont vides', async () => {
    const result = await disableUser('', '');
    expect(result).toEqual({ success: false, error: 'Identifiants manquants.' });
  });

  it('retourne une erreur si le rôle n\'est pas agency_admin', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock({ role: 'client_admin' }) as never);
    const result = await disableUser('cu-1', 'user-abc');
    expect(result).toEqual({ success: false, error: 'Accès refusé.' });
  });

  it('marque le client_users comme disabled et bannit l\'utilisateur', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const adminMock = makeAdminMock();
    vi.mocked(createAdminClient).mockResolvedValue(adminMock as never);

    const result = await disableUser('cu-1', 'user-abc');

    expect(result).toEqual({ success: true });
    expect(adminMock.auth.admin.updateUserById).toHaveBeenCalledWith('user-abc', {
      ban_duration: '876000h',
    });
  });

  it('retourne une erreur si Supabase échoue à bannir', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const adminMock = makeAdminMock({ banError: { message: 'Not found' } });
    vi.mocked(createAdminClient).mockResolvedValue(adminMock as never);

    const result = await disableUser('cu-1', 'user-xyz');
    expect(result).toEqual({
      success: false,
      error: 'Impossible de désactiver ce compte. Veuillez réessayer.',
    });
  });
});
