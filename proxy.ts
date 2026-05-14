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

  const { data: { user } } = await supabase.auth.getUser();

  const publicPaths = ['/login', '/forgot-password', '/set-password', '/update-password'];
  const isAuthRoute = pathname.startsWith('/login');
  const isPublicRoute = publicPaths.some(p => pathname.startsWith(p));
  const isAdminRoute = pathname.startsWith('/clients');
  const isClientRoute = !isPublicRoute && !isAdminRoute && pathname !== '/';

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
