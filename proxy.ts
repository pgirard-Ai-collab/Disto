import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  let response = NextResponse.next({ request: req });

  // Refresh the Supabase session on every request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          response = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() refreshes the session. A stale/rotated/missing refresh token makes
  // it throw AuthApiError (refresh_token_not_found) — that just means "no valid
  // session", so treat it as logged-out rather than letting it bubble up.
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  const publicPaths = ['/login', '/forgot-password', '/set-password', '/update-password'];
  const isAuthRoute = pathname.startsWith('/login');
  const isPublicRoute = publicPaths.some(p => pathname.startsWith(p));
  const isAdminRoute = pathname.startsWith('/clients');
  const isClientRoute = !isPublicRoute && !isAdminRoute && pathname !== '/';

  // Clears stale Supabase auth cookies on the given response so a dead session
  // doesn't re-trigger the refresh error on every subsequent request.
  function clearAuthCookies(res: NextResponse) {
    for (const { name } of req.cookies.getAll()) {
      if (name.startsWith('sb-')) res.cookies.delete(name);
    }
    return res;
  }

  // Invalid/expired refresh token: drop the bad cookies. Redirect to login if the
  // route is protected; otherwise let the request through as anonymous.
  if (authError) {
    if (!isPublicRoute && (isAdminRoute || isClientRoute)) {
      return clearAuthCookies(NextResponse.redirect(new URL('/login', req.nextUrl)));
    }
    return clearAuthCookies(response);
  }

  // Unauthenticated user trying to access protected route
  if (!user && !isPublicRoute && (isAdminRoute || isClientRoute)) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // Authenticated user on login — redirect to their portal
  if (user && isAuthRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, brand_slug')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'agency_admin') {
      return NextResponse.redirect(new URL('/clients', req.nextUrl));
    }
    if (profile?.brand_slug) {
      return NextResponse.redirect(new URL(`/${profile.brand_slug}`, req.nextUrl));
    }
  }

  // Client user trying to access admin routes
  if (user && isAdminRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'agency_admin') {
      return NextResponse.redirect(new URL('/login', req.nextUrl));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
