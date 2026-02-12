import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: { headers: new Headers(request.headers) },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieEncoding: "raw",
    cookieOptions: {
      path: '/',
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // No-op: never send Set-Cookie from middleware so we don't refresh or clear
        // the session. We still run getUser() to read the session (e.g. for redirects).
        void cookiesToSet;
      },
    },
  });

  // Read session only; we don't persist any cookie changes (setAll is no-op).
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - (empty/root) GET / runs middleware and can clear session cookies
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _next/data (RSC payloads; middleware clears cookies on client-side nav)
     * - favicon.ico (favicon file)
     * - auth/callback (sets session cookies; middleware would clear them)
     * - dashboard (middleware clears cookies on page loads)
     * - api (middleware clears cookies on API requests; routes read cookies from request)
     * - image files
     */
    '/((?!_next/static|_next/image|_next/data|favicon.ico|auth/callback|dashboard|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|$).*)',
  ],
};