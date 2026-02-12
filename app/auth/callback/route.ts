import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createChunks, type CookieOptions } from "@supabase/ssr";

export const runtime = "nodejs";

function getAuthTokenCookieKey(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "sb-auth-token";
  try {
    const ref = new URL(url).hostname.split(".")[0];
    return ref ? `sb-${ref}-auth-token` : "sb-auth-token";
  } catch {
    return "sb-auth-token";
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function successHtml(redirectUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Signed in</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 400px; margin: 60px auto; padding: 24px; text-align: center; }
    a { display: inline-block; margin-top: 16px; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
    a:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <h1>You're signed in!</h1>
  <p>Click the button below to continue to the dashboard.</p>
  <a href="${redirectUrl}">Continue to dashboard</a>
</body>
</html>`;
}

function errorHtml(redirectUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Sign-in error</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 400px; margin: 60px auto; padding: 24px; text-align: center; }
    a { display: inline-block; margin-top: 16px; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
    a:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <h1>Sign-in failed</h1>
  <p><a href="${redirectUrl}">Return to login</a></p>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";
  const redirectUrl = new URL(next, url.origin).href;

  if (!code) {
    return new NextResponse(successHtml(redirectUrl), {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  }

  // No automatic redirect - show a page with a link. User clicks to continue.
  // This avoids the OAuth redirect chain context that causes browsers to reject
  // cookies. The user-initiated click is a fresh navigation with cookies stored.
  const response = new NextResponse(successHtml(redirectUrl), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieEncoding: "raw",
    cookieOptions: {
      path: "/",
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
      
    },
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({
          name,
          value: "",
          ...options,
        });
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const errorRedirectUrl = new URL(
      `/login?error=${encodeURIComponent(error.message)}`,
      url.origin
    ).href;
    return new NextResponse(errorHtml(errorRedirectUrl), {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  }

  // Replace session cookies with a smaller payload (strip provider_token) so the
  // Cookie header stays under size limits and the server can read the session.
  const session = data.session;
  if (session) {
    const cookieKey = getAuthTokenCookieKey();
    const cookieOptions: CookieOptions = {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    };
    // Clear existing chunked cookies
    const existingNames = response.cookies.getAll().map((c) => c.name);
    for (const name of existingNames) {
      if (name === cookieKey || name.startsWith(cookieKey + ".")) {
        response.cookies.set({ name, value: "", maxAge: 0, path: "/" });
      }
    }
    // Strip provider_token (large Google token) so the cookie fits and isn't truncated.
    const stripped = { ...session, provider_token: undefined } as typeof session;
    const chunks = createChunks(cookieKey, JSON.stringify(stripped));
    for (const { name, value } of chunks) {
      response.cookies.set({ name, value, ...cookieOptions });
    }
  }

  return response;
}