import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/api/supabase/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin));
    }

    // After successful login, check if user has surveys
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Check if user has any surveys
      const { data: surveys } = await supabase
        .from('surveys')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      // If user has surveys, redirect to results; otherwise, redirect to survey page
      const redirectTo = (surveys?.length ?? 0) > 0 ? '/dashboard/results' : '/';
      return NextResponse.redirect(new URL(redirectTo, url.origin));
    }
  }

  // Fallback: use next param or default to home
  return NextResponse.redirect(new URL(next ?? '/', url.origin));
}

