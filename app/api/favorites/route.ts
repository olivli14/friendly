import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/app/api/supabase/server';
import type { Activity } from '@/app/lib/openai';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authCookies = cookieStore.getAll().filter((c) => c.name.includes('auth-token'));
    console.error('[api/favorites GET] auth cookie count:', authCookies.length, 'names:', authCookies.map((c) => c.name));

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      const code = (userError as { code?: string }).code;
      console.error('[api/favorites GET] auth error:', code ?? userError.message, userError.message);
      return NextResponse.json(
        { error: userError.message, code: code ?? undefined },
        { status: 401 }
      );
    }
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('id, created_at, survey_id, activity')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ favorites: data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authCookies = cookieStore.getAll().filter((c) => c.name.includes('auth-token'));
    console.error('[api/favorites POST] auth cookie count:', authCookies.length, 'names:', authCookies.map((c) => c.name));

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      const code = (userError as { code?: string }).code;
      console.error('[api/favorites POST] auth error:', code ?? userError.message, userError.message);
      return NextResponse.json(
        { error: userError.message, code: code ?? undefined },
        { status: 401 }
      );
    }
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { surveyId, activity } = (await req.json()) as {
      surveyId?: string;
      activity: Activity;
    };

    if (!activity || !activity.name) {
      return NextResponse.json({ error: 'Invalid activity payload' }, { status: 400 });
    }

    const payload = {
      user_id: user.id,
      survey_id: surveyId ?? null,
      activity,
      activity_name: activity.name,
      activity_link: activity.link ?? null,
    };

    const { error } = await supabase
      .from('favorites')
      .upsert(payload, { onConflict: 'user_id,activity_name,activity_link' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      const code = (userError as { code?: string }).code;
      console.error('[api/favorites DELETE] auth error:', code ?? userError.message, userError.message);
      return NextResponse.json(
        { error: userError.message, code: code ?? undefined },
        { status: 401 }
      );
    }
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { activityName, activityLink } = (await req.json()) as {
      activityName: string;
      activityLink?: string | null;
    };

    if (!activityName) {
      return NextResponse.json({ error: 'Missing activityName' }, { status: 400 });
    }

    const query = supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('activity_name', activityName);

    const { error } = activityLink
      ? await query.eq('activity_link', activityLink)
      : await query.is('activity_link', null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

