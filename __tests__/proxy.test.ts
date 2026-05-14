import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { proxy } from '@/proxy';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

import { createServerClient } from '@supabase/ssr';

function makeRequest(pathname: string): NextRequest {
  return new NextRequest(new URL(`http://localhost:3000${pathname}`));
}

function makeSupabaseMock({
  user = null as { id: string } | null,
  role = null as string | null,
  brandSlug = null as string | null,
} = {}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: user ? { role, brand_slug: brandSlug } : null,
      }),
    })),
  };
}

beforeEach(() => vi.clearAllMocks());

describe('proxy — utilisateur non authentifié', () => {
  it('laisse passer vers /login', async () => {
    vi.mocked(createServerClient).mockReturnValue(makeSupabaseMock() as never);
    const res = await proxy(makeRequest('/login'));
    expect(res.status).not.toBe(307);
    expect(res.headers.get('location')).toBeNull();
  });

  it('laisse passer vers /forgot-password', async () => {
    vi.mocked(createServerClient).mockReturnValue(makeSupabaseMock() as never);
    const res = await proxy(makeRequest('/forgot-password'));
    expect(res.headers.get('location')).toBeNull();
  });

  it('laisse passer vers /set-password', async () => {
    vi.mocked(createServerClient).mockReturnValue(makeSupabaseMock() as never);
    const res = await proxy(makeRequest('/set-password'));
    expect(res.headers.get('location')).toBeNull();
  });

  it('laisse passer vers /update-password', async () => {
    vi.mocked(createServerClient).mockReturnValue(makeSupabaseMock() as never);
    const res = await proxy(makeRequest('/update-password'));
    expect(res.headers.get('location')).toBeNull();
  });

  it('redirige vers /login si accès à /clients', async () => {
    vi.mocked(createServerClient).mockReturnValue(makeSupabaseMock() as never);
    const res = await proxy(makeRequest('/clients'));
    expect(res.headers.get('location')).toBe('http://localhost:3000/login');
  });

  it('redirige vers /login si accès à une route client', async () => {
    vi.mocked(createServerClient).mockReturnValue(makeSupabaseMock() as never);
    const res = await proxy(makeRequest('/sartiga/settings'));
    expect(res.headers.get('location')).toBe('http://localhost:3000/login');
  });
});

describe('proxy — agency_admin authentifié', () => {
  it('redirige vers /clients depuis /login', async () => {
    vi.mocked(createServerClient).mockReturnValue(
      makeSupabaseMock({ user: { id: 'u1' }, role: 'agency_admin' }) as never,
    );
    const res = await proxy(makeRequest('/login'));
    expect(res.headers.get('location')).toBe('http://localhost:3000/clients');
  });

  it('laisse passer vers /clients', async () => {
    vi.mocked(createServerClient).mockReturnValue(
      makeSupabaseMock({ user: { id: 'u1' }, role: 'agency_admin' }) as never,
    );
    const res = await proxy(makeRequest('/clients'));
    expect(res.headers.get('location')).toBeNull();
  });
});

describe('proxy — client_admin authentifié', () => {
  it('redirige vers /{brand_slug} depuis /login', async () => {
    vi.mocked(createServerClient).mockReturnValue(
      makeSupabaseMock({ user: { id: 'u2' }, role: 'client_admin', brandSlug: 'sartiga' }) as never,
    );
    const res = await proxy(makeRequest('/login'));
    expect(res.headers.get('location')).toBe('http://localhost:3000/sartiga');
  });

  it('redirige vers /login si accès à /clients', async () => {
    vi.mocked(createServerClient).mockReturnValue(
      makeSupabaseMock({ user: { id: 'u2' }, role: 'client_admin', brandSlug: 'sartiga' }) as never,
    );
    const res = await proxy(makeRequest('/clients'));
    expect(res.headers.get('location')).toBe('http://localhost:3000/login');
  });

  it('laisse passer vers /set-password même authentifié', async () => {
    vi.mocked(createServerClient).mockReturnValue(
      makeSupabaseMock({ user: { id: 'u2' }, role: 'client_admin', brandSlug: 'sartiga' }) as never,
    );
    const res = await proxy(makeRequest('/set-password'));
    expect(res.headers.get('location')).toBeNull();
  });
});
