import { NextResponse } from 'next/server';
import { createClient } from '@/app/api/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = new URL(request.url);
  return NextResponse.redirect(new URL('/', url.origin));
}

