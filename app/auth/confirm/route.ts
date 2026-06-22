import { type EmailOtpType } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  // `next` doit rester un chemin relatif same-origin pour éviter une redirection
  // ouverte (ex. ?next=//evil.com qui résoudrait vers un domaine externe).
  const nextParam = searchParams.get('next') ?? '/update-password';
  const next =
    nextParam.startsWith('/') && !nextParam.startsWith('//') && !nextParam.startsWith('/\\')
      ? nextParam
      : '/update-password';

  // On construit la réponse de redirection en amont et on écrit les cookies de
  // session directement dessus : dans un Route Handler, un NextResponse.redirect
  // séparé ne transporte pas les Set-Cookie posés via cookies() de next/headers.
  let response = NextResponse.redirect(new URL(next, request.url));

  if (token_hash && type) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      // Session posée sur `response` → on redirige vers le formulaire.
      return response;
    }

    // Échec : on renvoie vers la page d'origine (`next`) avec le bon message.
    const expired = /expired|otp_expired/i.test(error.message);
    const failUrl = new URL(next, request.url);
    failUrl.searchParams.set('error', expired ? 'expired' : 'invalid');
    return NextResponse.redirect(failUrl);
  }

  response = NextResponse.redirect(new URL('/update-password?error=invalid', request.url));
  return response;
}
