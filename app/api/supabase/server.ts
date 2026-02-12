import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

function decodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/** Parse Cookie header into list of { name, value } (values decoded). */
function parseCookieHeader(cookieHeader: string | null): { name: string; value: string }[] {
  if (!cookieHeader?.trim()) return []
  const list: { name: string; value: string }[] = []
  for (const part of cookieHeader.split(';')) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    const name = part.slice(0, eq).trim()
    const value = part.slice(eq + 1).trim()
    if (name) list.push({ name, value: decodeCookieValue(value) })
  }
  return list
}

/**
 * Create Supabase client from the request's Cookie header (for API routes).
 * Bypasses Next.js cookies() so we control exactly what Supabase sees.
 */
export function createClientFromRequest(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie')
  const all = parseCookieHeader(cookieHeader)

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
          const hint =
            Array.isArray(keyHints) && keyHints.length > 0 && keyHints[0]
              ? keyHints[0]
              : null
          const filtered = hint
            ? all.filter(
                (c) => c.name === hint || c.name.startsWith(hint + '.')
              )
            : all
          return filtered.sort((a, b) => {
            const aChunk = a.name.match(/\.(\d+)$/)?.[1]
            const bChunk = b.name.match(/\.(\d+)$/)?.[1]
            if (aChunk != null && bChunk != null)
              return Number(aChunk) - Number(bChunk)
            return 0
          })
        },
        setAll(cookiesToSet) {
          void cookiesToSet
        },
      },
    }
  )
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