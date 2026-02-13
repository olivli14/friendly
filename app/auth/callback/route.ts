import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  const redirectTo = new URL(next, url.origin);
  const errorRedirect = new URL("/login", url.origin);

  const response = NextResponse.redirect(redirectTo);

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

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    errorRedirect.searchParams.set("error", error.message);
    return NextResponse.redirect(errorRedirect);
  }

  // Re-set the session without provider_token / provider_refresh_token.
  // Google's OAuth tokens are large and can push the total cookie size past
  // browser limits (~4 KB per cookie). When that happens the cookies are
  // silently truncated, the middleware can't reassemble the session on the
  // next request, and the user appears logged-out.
  if (data.session) {
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  }

  return response;
}
