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
  profileError = null as null | { message: string },
} = {}) {
  const insertMock = vi.fn().mockResolvedValue({ error: profileError });
  const fromMock = vi.fn(() => ({ insert: insertMock }));
  const deleteUserMock = vi.fn().mockResolvedValue({ error: null });

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
    _insert: insertMock,
    _deleteUser: deleteUserMock,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
});

describe('inviteUser', () => {
  it('retourne une erreur si un champ est manquant', async () => {
    const result = await inviteUser('', 'client_admin', 'sartiga');
    expect(result).toEqual({ success: false, error: 'Tous les champs sont requis.' });
  });

  it('retourne une erreur si brandSlug est manquant', async () => {
    const result = await inviteUser('test@test.com', 'client_admin', '');
    expect(result).toEqual({ success: false, error: 'Tous les champs sont requis.' });
  });

  it('retourne une erreur si l\'appelant n\'est pas authentifié', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock({ noUser: true }) as never);
    const result = await inviteUser('jean@sartiga.co', 'client_admin', 'sartiga');
    expect(result).toEqual({ success: false, error: 'Non authentifié.' });
  });

  it('retourne une erreur si le rôle n\'est pas agency_admin', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock({ role: 'client_admin' }) as never);
    const result = await inviteUser('jean@sartiga.co', 'client_admin', 'sartiga');
    expect(result).toEqual({ success: false, error: 'Accès refusé.' });
  });

  it('retourne success true et crée le profil après invitation réussie', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const adminMock = makeAdminMock();
    vi.mocked(createAdminClient).mockResolvedValue(adminMock as never);

    const result = await inviteUser('jean@sartiga.co', 'client_admin', 'sartiga');

    expect(result).toEqual({ success: true });
    expect(adminMock.auth.admin.inviteUserByEmail).toHaveBeenCalledWith('jean@sartiga.co', {
      redirectTo: 'http://localhost:3000/set-password',
    });
    expect(adminMock.from).toHaveBeenCalledWith('profiles');
    expect(adminMock._insert).toHaveBeenCalledWith({
      id: 'user-123',
      role: 'client_admin',
      brand_slug: 'sartiga',
    });
  });

  it('retourne une erreur si le compte existe déjà', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const adminMock = makeAdminMock({ inviteError: { message: 'User already registered' } });
    vi.mocked(createAdminClient).mockResolvedValue(adminMock as never);

    const result = await inviteUser('existe@sartiga.co', 'client_reader', 'sartiga');
    expect(result).toEqual({ success: false, error: 'Un compte existe déjà pour cette adresse.' });
  });

  it('retourne une erreur générique sur échec Supabase Auth', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const adminMock = makeAdminMock({ inviteError: { message: 'Internal server error' } });
    vi.mocked(createAdminClient).mockResolvedValue(adminMock as never);

    const result = await inviteUser('new@sartiga.co', 'client_reader', 'sartiga');
    expect(result).toEqual({ success: false, error: "Impossible d'envoyer l'invitation. Veuillez réessayer." });
  });

  it('retourne une erreur et rollback si la création du profil échoue', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const adminMock = makeAdminMock({ profileError: { message: 'duplicate key' } });
    vi.mocked(createAdminClient).mockResolvedValue(adminMock as never);

    const result = await inviteUser('new@sartiga.co', 'client_admin', 'sartiga');
    expect(result).toEqual({
      success: false,
      error: 'Erreur lors de la création du profil. Veuillez réessayer.',
    });
    expect(adminMock._deleteUser).toHaveBeenCalledWith('user-123');
  });

  it('invite avec rôle client_reader et vérifie le profil créé', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const adminMock = makeAdminMock({ inviteUserId: 'user-456' });
    vi.mocked(createAdminClient).mockResolvedValue(adminMock as never);

    const result = await inviteUser('lecteur@sartiga.co', 'client_reader', 'sartiga');

    expect(result).toEqual({ success: true });
    expect(adminMock._insert).toHaveBeenCalledWith({
      id: 'user-456',
      role: 'client_reader',
      brand_slug: 'sartiga',
    });
  });
});
