import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function decodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieEncoding: "raw",
      cookieOptions: {
        path: '/',
        sameSite: 'lax' as const,
        secure: process.env.NODE_ENV === 'production',
      },
      cookies: {
        getAll(keyHints?: string[]) {
          const all = cookieStore.getAll()
          // Only return cookies for the requested key(s) so chunk reassembly gets the right pieces.
          const hint =
            Array.isArray(keyHints) && keyHints.length > 0 && keyHints[0]
              ? keyHints[0]
              : null
          const filtered = hint
            ? all.filter(
                (c) => c.name === hint || c.name.startsWith(hint + '.')
              )
            : all
          // Decode values in case the Cookie header sent them percent-encoded.
          const list = (filtered as { name: string; value: string }[]).map(
            (c) => ({ name: c.name, value: decodeCookieValue(c.value) })
          )
          // Supabase reassembles chunked auth cookies (.0, .1, …); order matters.
          return list.sort((a, b) => {
            const aChunk = a.name.match(/\.(\d+)$/)?.[1]
            const bChunk = b.name.match(/\.(\d+)$/)?.[1]
            if (aChunk != null && bChunk != null)
              return Number(aChunk) - Number(bChunk)
            return 0
          })
        },
        setAll(cookiesToSet) {
          // No-op: avoid writing cookies from Server Components / API routes so we
          // don't overwrite or clear the session (e.g. during RSC render for NavBar).
          void cookiesToSet;
        },
      },
    }
  )
}