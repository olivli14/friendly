import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update request cookies so downstream Server Components see the
          // refreshed values when they call cookies().
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )

          // Recreate the response so it carries the updated request headers.
          supabaseResponse = NextResponse.next({ request })

          // Also set Set-Cookie headers on the response so the browser stores them.
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Don't attempt to refresh the session on the auth callback route.
  if (!request.nextUrl.pathname.startsWith("/auth/callback")) {
    const allCookies = request.cookies.getAll()
    const sbCookies = allCookies.filter(c => c.name.startsWith("sb-"))
    console.log(`[middleware] ${request.nextUrl.pathname} — ${sbCookies.length} sb-* cookies:`, sbCookies.map(c => c.name))

    const { data, error } = await supabase.auth.getUser()
    console.log(`[middleware] getUser result:`, { userId: data?.user?.id ?? null, error: error?.message ?? null })
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
