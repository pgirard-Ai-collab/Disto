import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Next.js redirect — real one throws; we throw a sentinel so callers can detect it
const REDIRECT_THROWN = new Error('NEXT_REDIRECT');
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => { throw REDIRECT_THROWN; }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { requireBrandAccess } from '@/lib/client-access';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

type Profile = { role: 'agency_admin' | 'client_admin' | 'client_reader'; brand_slug: string | null } | null;
type Client = { id: string; brand_name: string } | null;
type ClientUser = { role: 'admin' | 'reader'; status: 'invited' | 'active' | 'disabled' } | null;

function makeSupabaseMock({
  user = { id: 'user-1' } as { id: string } | null,
  profile = { role: 'agency_admin', brand_slug: null } as Profile,
  client = { id: 'client-1', brand_name: 'Sartiga' } as Client,
  clientUser = { role: 'admin', status: 'active' } as ClientUser,
  profileError = null as null | Error,
  clientError = null as null | Error,
  clientUserError = null as null | Error,
} = {}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
    from: vi.fn((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: profile, error: profileError }),
        };
      }
      if (table === 'clients') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: client, error: clientError }),
        };
      }
      if (table === 'client_users') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: clientUser, error: clientUserError }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  // Silence the diagnostic console.warn we added to client-access
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

describe('requireBrandAccess', () => {
  it('redirige vers /login si l\'utilisateur n\'est pas authentifié', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({ user: null }) as never);

    await expect(requireBrandAccess('sartiga')).rejects.toBe(REDIRECT_THROWN);
    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('retourne null si le client (marque) n\'existe pas', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({ client: null }) as never);

    const result = await requireBrandAccess('inexistant');
    expect(result).toBeNull();
  });

  it('retourne null si le profil n\'existe pas', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({ profile: null }) as never);

    const result = await requireBrandAccess('sartiga');
    expect(result).toBeNull();
  });

  it('donne un accès complet à un agency_admin sur n\'importe quelle marque', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({
      profile: { role: 'agency_admin', brand_slug: null },
    }) as never);

    const result = await requireBrandAccess('sartiga');
    expect(result).toEqual({
      userId: 'user-1',
      clientId: 'client-1',
      brandSlug: 'sartiga',
      brandName: 'Sartiga',
      role: 'agency_admin',
      isAdmin: true,
    });
  });

  it('refuse un client connecté dont le profile.brand_slug ne correspond pas à la marque demandée', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({
      profile: { role: 'client_admin', brand_slug: 'autre-marque' },
    }) as never);

    const result = await requireBrandAccess('sartiga');
    expect(result).toBeNull();
  });

  it('refuse un client sans row client_users pour cette marque', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({
      profile: { role: 'client_admin', brand_slug: 'sartiga' },
      clientUser: null,
    }) as never);

    const result = await requireBrandAccess('sartiga');
    expect(result).toBeNull();
  });

  it('refuse un client_users avec status=invited (pas encore activé)', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({
      profile: { role: 'client_admin', brand_slug: 'sartiga' },
      clientUser: { role: 'admin', status: 'invited' },
    }) as never);

    const result = await requireBrandAccess('sartiga');
    expect(result).toBeNull();
  });

  it('refuse un client_users avec status=disabled', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({
      profile: { role: 'client_admin', brand_slug: 'sartiga' },
      clientUser: { role: 'admin', status: 'disabled' },
    }) as never);

    const result = await requireBrandAccess('sartiga');
    expect(result).toBeNull();
  });

  it('autorise un client_admin actif et marque isAdmin=true', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({
      profile: { role: 'client_admin', brand_slug: 'sartiga' },
      clientUser: { role: 'admin', status: 'active' },
    }) as never);

    const result = await requireBrandAccess('sartiga');
    expect(result).toEqual({
      userId: 'user-1',
      clientId: 'client-1',
      brandSlug: 'sartiga',
      brandName: 'Sartiga',
      role: 'admin',
      isAdmin: true,
    });
  });

  it('autorise un client_reader actif mais marque isAdmin=false', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({
      profile: { role: 'client_reader', brand_slug: 'sartiga' },
      clientUser: { role: 'reader', status: 'active' },
    }) as never);

    const result = await requireBrandAccess('sartiga');
    expect(result).toMatchObject({ role: 'reader', isAdmin: false });
  });
});
