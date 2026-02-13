import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/api/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const errorRedirect = new URL("/login", url.origin);
    errorRedirect.searchParams.set("error", error.message);
    return NextResponse.redirect(errorRedirect);
  }

  // ⚡ Create a redirect response
  const response = NextResponse.redirect(new URL(next, url.origin));

  // ⚡ Copy cookies from Supabase into the redirect
  const cookie = data?.session?.access_token; // or use Supabase's cookie headers
  const refresh = data?.session?.refresh_token;

  // Example using NextResponse cookies API
  if (cookie && refresh) {
    response.cookies.set("sb-access-token", cookie, { path: "/", httpOnly: true });
    response.cookies.set("sb-refresh-token", refresh, { path: "/", httpOnly: true });
  }

  return response;
}
