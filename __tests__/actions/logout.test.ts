import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

import { logout } from '@/app/actions/logout';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

function makeSupabaseMock({ signOutError = null as { message: string } | null } = {}) {
  return {
    auth: {
      signOut: vi.fn().mockResolvedValue({ error: signOutError }),
    },
  };
}

beforeEach(() => vi.clearAllMocks());

describe('logout', () => {
  it('appelle signOut puis redirige vers /login', async () => {
    const mock = makeSupabaseMock();
    vi.mocked(createClient).mockResolvedValue(mock as never);

    await logout().catch(() => {
      // redirect() lance une exception en environnement test — c'est normal
    });

    expect(mock.auth.signOut).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('redirige vers /login même si signOut échoue', async () => {
    const mock = makeSupabaseMock({ signOutError: { message: 'Network error' } });
    vi.mocked(createClient).mockResolvedValue(mock as never);

    await logout().catch(() => {});

    expect(mock.auth.signOut).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith('/login');
  });
});
