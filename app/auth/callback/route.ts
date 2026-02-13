import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  const redirectTo = new URL(next, url.origin);
  const response = NextResponse.redirect(redirectTo);

  // We CANNOT use createClient() from server.ts here because cookies().set()
  // does not attach to a custom NextResponse.redirect(). Instead we create
  // a Supabase client that writes directly onto the response object — same
  // approach as your manual response.cookies.set(), but letting Supabase
  // handle the correct cookie names, encoding, and chunking via setAll.
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
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const errorRedirect = new URL("/login", url.origin);
    errorRedirect.searchParams.set("error", error.message);
    return NextResponse.redirect(errorRedirect);
  }

  return response;
}
