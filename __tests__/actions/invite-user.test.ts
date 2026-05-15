import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inviteUser } from '@/app/actions/invite-user';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
}));

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

function makeAdminMock({
  inviteError = null as null | { message: string },
  inviteUserId = 'user-123',
  clientNotFound = false,
  profileError = null as null | { message: string },
  clientUserError = null as null | { message: string },
} = {}) {
  const upsertResults: Array<unknown> = [];
  const deleteUserMock = vi.fn().mockResolvedValue({ error: null });
  let upsertCallIdx = 0;

  const fromMock = vi.fn((table: string) => {
    if (table === 'clients') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: clientNotFound ? null : { id: 'client-uuid', slug: 'sartiga' },
        }),
      };
    }
    const upsertMock = vi.fn().mockImplementation(() => {
      const idx = upsertCallIdx++;
      const err = idx === 0 ? profileError : clientUserError;
      const result = { error: err };
      upsertResults.push({ table, idx, err });
      return Promise.resolve(result);
    });
    return { upsert: upsertMock, _upsert: upsertMock };
  });

  return {
    auth: {
      admin: {
        inviteUserByEmail: vi.fn().mockResolvedValue({
          data: inviteError ? null : { user: { id: inviteUserId } },
          error: inviteError,
        }),
        deleteUser: deleteUserMock,
      },
    },
    from: fromMock,
    _deleteUser: deleteUserMock,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
});

describe('inviteUser', () => {
  it('retourne une erreur si un champ est manquant', async () => {
    const result = await inviteUser('', 'client_admin', 'client-uuid');
    expect(result).toEqual({ success: false, error: 'Tous les champs sont requis.' });
  });

  it('retourne une erreur si clientId est manquant', async () => {
    const result = await inviteUser('test@test.com', 'client_admin', '');
    expect(result).toEqual({ success: false, error: 'Tous les champs sont requis.' });
  });

  it('retourne une erreur si l\'appelant n\'est pas authentifié', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock({ noUser: true }) as never);
    const result = await inviteUser('jean@sartiga.co', 'client_admin', 'client-uuid');
    expect(result).toEqual({ success: false, error: 'Non authentifié.' });
  });

  it('retourne une erreur si le rôle n\'est pas agency_admin', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock({ role: 'client_admin' }) as never);
    const result = await inviteUser('jean@sartiga.co', 'client_admin', 'client-uuid');
    expect(result).toEqual({ success: false, error: 'Accès refusé.' });
  });

  it('retourne une erreur si le client est introuvable', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const adminMock = makeAdminMock({ clientNotFound: true });
    vi.mocked(createAdminClient).mockResolvedValue(adminMock as never);

    const result = await inviteUser('jean@sartiga.co', 'client_admin', 'client-uuid');
    expect(result).toEqual({ success: false, error: 'Client introuvable.' });
  });

  it('retourne success true après invitation réussie', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const adminMock = makeAdminMock();
    vi.mocked(createAdminClient).mockResolvedValue(adminMock as never);

    const result = await inviteUser('jean@sartiga.co', 'client_admin', 'client-uuid');

    expect(result).toEqual({ success: true });
    expect(adminMock.auth.admin.inviteUserByEmail).toHaveBeenCalledWith('jean@sartiga.co', {
      redirectTo: 'http://localhost:3000/set-password',
    });
  });

  it('retourne une erreur si le compte existe déjà', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const adminMock = makeAdminMock({ inviteError: { message: 'User already registered' } });
    vi.mocked(createAdminClient).mockResolvedValue(adminMock as never);

    const result = await inviteUser('existe@sartiga.co', 'client_reader', 'client-uuid');
    expect(result).toEqual({ success: false, error: 'Un compte existe déjà pour cette adresse.' });
  });

  it('retourne une erreur générique sur échec Supabase Auth', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const adminMock = makeAdminMock({ inviteError: { message: 'Internal server error' } });
    vi.mocked(createAdminClient).mockResolvedValue(adminMock as never);

    const result = await inviteUser('new@sartiga.co', 'client_reader', 'client-uuid');
    expect(result).toEqual({ success: false, error: "Impossible d'envoyer l'invitation. Veuillez réessayer." });
  });

  it('rollback si la création du profil échoue', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const adminMock = makeAdminMock({ profileError: { message: 'duplicate key' } });
    vi.mocked(createAdminClient).mockResolvedValue(adminMock as never);

    const result = await inviteUser('new@sartiga.co', 'client_admin', 'client-uuid');
    expect(result).toEqual({
      success: false,
      error: 'Erreur lors de la création du profil. Veuillez réessayer.',
    });
    expect(adminMock._deleteUser).toHaveBeenCalledWith('user-123');
  });
});
