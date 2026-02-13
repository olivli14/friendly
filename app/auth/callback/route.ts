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
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const errorRedirect = new URL("/login", url.origin);
    errorRedirect.searchParams.set("error", error.message);
    return NextResponse.redirect(errorRedirect);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
