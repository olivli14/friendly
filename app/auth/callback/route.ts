import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";

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
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

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

  return response;
}