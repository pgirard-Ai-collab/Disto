import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClientRecord } from '@/app/actions/clients';

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

type AdminOpts = {
  insertError?: null | { message: string; code?: string };
  insertedClientId?: string;
  uploadError?: null | { message: string };
  inviteError?: null | { message: string };
  inviteUserId?: string;
  upsertError?: null | { message: string };
};

function makeAdminMock({
  insertError = null,
  insertedClientId = 'new-client-uuid',
  uploadError = null,
  inviteError = null,
  inviteUserId = 'invited-user-id',
  upsertError = null,
}: AdminOpts = {}) {
  const upsertMock = vi.fn().mockResolvedValue({ error: upsertError });

  const fromMock = vi.fn((table: string) => {
    if (table === 'clients') {
      return {
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: insertError ? null : { id: insertedClientId },
          error: insertError,
        }),
      };
    }
    return { upsert: upsertMock };
  });

  const signedUrlMock = vi.fn().mockResolvedValue({ data: { signedUrl: 'https://cdn.example.com/logo.png' } });

  return {
    from: fromMock,
    auth: {
      admin: {
        inviteUserByEmail: vi.fn().mockResolvedValue({
          data: inviteError ? null : { user: { id: inviteUserId } },
          error: inviteError,
        }),
      },
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: uploadError }),
        createSignedUrl: signedUrlMock,
      })),
    },
    _upsert: upsertMock,
  };
}

function makeFormData(overrides: Record<string, string | File | null> = {}): FormData {
  const fd = new FormData();
  const defaults: Record<string, string> = {
    org_name: 'Sartiga Inc.',
    brand_name: 'Sartiga',
    slug: 'sartiga',
    invites: JSON.stringify([{ email: 'admin@sartiga.co', role: 'admin' }]),
  };
  for (const [k, v] of Object.entries({ ...defaults, ...overrides })) {
    if (v !== null) fd.append(k, v as string | File);
  }
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
});

describe('createClientRecord', () => {
  it('retourne une erreur si non authentifié', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock({ noUser: true }) as never);
    const result = await createClientRecord(makeFormData());
    expect(result).toEqual({ success: false, error: 'Non authentifié.' });
  });

  it('retourne une erreur si le rôle n\'est pas agency_admin', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock({ role: 'client_admin' }) as never);
    const result = await createClientRecord(makeFormData());
    expect(result).toEqual({ success: false, error: 'Accès refusé.' });
  });

  it('retourne une erreur si org_name est manquant', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    vi.mocked(createAdminClient).mockResolvedValue(makeAdminMock() as never);
    const result = await createClientRecord(makeFormData({ org_name: '' }));
    expect(result).toEqual({ success: false, error: 'Nom organisation, marque et slug sont requis.' });
  });

  it('retourne une erreur si le slug est invalide', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    vi.mocked(createAdminClient).mockResolvedValue(makeAdminMock() as never);
    const result = await createClientRecord(makeFormData({ slug: 'Slug Invalide!' }));
    expect(result).toEqual({ success: false, error: 'Slug invalide — lettres minuscules, chiffres et tirets seulement.' });
  });

  it('crée le client sans invitation quand la liste d\'emails est vide', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    vi.mocked(createAdminClient).mockResolvedValue(makeAdminMock() as never);
    const result = await createClientRecord(makeFormData({ invites: JSON.stringify([]) }));
    expect(result).toEqual({ success: true, clientId: 'new-client-uuid' });
  });

  it('retourne une erreur si la liste d\'invitations est du JSON invalide', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    vi.mocked(createAdminClient).mockResolvedValue(makeAdminMock() as never);
    const result = await createClientRecord(makeFormData({ invites: '{invalid' }));
    expect(result).toEqual({ success: false, error: 'Liste d\'emails invalide.' });
  });

  it('retourne une erreur si le slug est déjà utilisé (code 23505)', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    vi.mocked(createAdminClient).mockResolvedValue(
      makeAdminMock({ insertError: { message: 'duplicate key', code: '23505' } }) as never,
    );
    const result = await createClientRecord(makeFormData());
    expect(result).toEqual({ success: false, error: 'Ce slug est déjà utilisé.' });
  });

  it('retourne une erreur générique si l\'insertion DB échoue', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    vi.mocked(createAdminClient).mockResolvedValue(
      makeAdminMock({ insertError: { message: 'connection error' } }) as never,
    );
    const result = await createClientRecord(makeFormData());
    expect(result).toEqual({ success: false, error: 'Erreur lors de la création. Veuillez réessayer.' });
  });

  it('crée le client avec succès sans logo', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeAdminMock();
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await createClientRecord(makeFormData());
    expect(result).toEqual({ success: true, clientId: 'new-client-uuid' });
    expect(admin.auth.admin.inviteUserByEmail).toHaveBeenCalledWith(
      'admin@sartiga.co',
      { redirectTo: 'http://localhost:3000/set-password' },
    );
  });

  it('crée le client avec succès avec un logo PNG valide', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeAdminMock();
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const logoFile = new File([new Uint8Array(100)], 'logo.png', { type: 'image/png' });
    const fd = makeFormData();
    fd.append('logo', logoFile);

    const result = await createClientRecord(fd);
    expect(result).toEqual({ success: true, clientId: 'new-client-uuid' });
    expect(admin.storage.from).toHaveBeenCalledWith('disto-deliverables');
  });

  it('retourne une erreur si le logo dépasse 2 MB', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    vi.mocked(createAdminClient).mockResolvedValue(makeAdminMock() as never);

    const bigFile = new File([new Uint8Array(3 * 1024 * 1024)], 'big.png', { type: 'image/png' });
    const fd = makeFormData();
    fd.append('logo', bigFile);

    const result = await createClientRecord(fd);
    expect(result).toEqual({ success: false, error: 'Le logo dépasse 2 MB.' });
  });

  it('retourne une erreur si le logo n\'est pas PNG ou SVG', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    vi.mocked(createAdminClient).mockResolvedValue(makeAdminMock() as never);

    const jpgFile = new File([new Uint8Array(100)], 'logo.jpg', { type: 'image/jpeg' });
    const fd = makeFormData();
    fd.append('logo', jpgFile);

    const result = await createClientRecord(fd);
    expect(result).toEqual({ success: false, error: 'Logo : PNG ou SVG uniquement.' });
  });

  it('continue si l\'invitation d\'un utilisateur échoue (pas de blocage)', async () => {
    vi.mocked(createClient).mockResolvedValue(makeCallerMock() as never);
    const admin = makeAdminMock({ inviteError: { message: 'User already registered' } });
    vi.mocked(createAdminClient).mockResolvedValue(admin as never);

    const result = await createClientRecord(makeFormData());
    // Should still succeed even if invite fails — the client record was created
    expect(result).toEqual({ success: true, clientId: 'new-client-uuid' });
    // But upsert should NOT have been called since invite returned no user
    expect(admin._upsert).not.toHaveBeenCalled();
  });
});
