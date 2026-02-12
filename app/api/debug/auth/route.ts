import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/api/supabase/server";

export async function GET(request: NextRequest) {
  const debug: {
    timestamp: string;
    cookieNames: string[];
    cookieCount: number;
    hasSupabaseCookies: boolean;
    user: { id: string; email?: string } | null;
    authError: string | null;
    requestHeaders: Record<string, string>;
  } = {
    timestamp: new Date().toISOString(),
    cookieNames: [],
    cookieCount: 0,
    hasSupabaseCookies: false,
    user: null,
    authError: null,
    requestHeaders: {},
  };

  try {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const cookies = cookieHeader.split(";").map((c) => c.trim().split("=")[0]);
    debug.cookieNames = cookies.filter(Boolean);
    debug.cookieCount = debug.cookieNames.length;
    debug.hasSupabaseCookies = debug.cookieNames.some(
      (n) => n.startsWith("sb-") || n.includes("auth")
    );

    request.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (
        lower.startsWith("cookie") ||
        lower.includes("x-middleware") ||
        lower === "authorization"
      ) {
        debug.requestHeaders[key] = value.length > 200 ? `${value.slice(0, 200)}...` : value;
      }
    });

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      debug.authError = userError.message;
    }
    if (user) {
      debug.user = { id: user.id, email: user.email ?? undefined };
    }
  } catch (e) {
    debug.authError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(debug);
}
