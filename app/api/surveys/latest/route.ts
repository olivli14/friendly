import { NextResponse } from 'next/server';
import { createClient } from '@/app/api/supabase/server';
import { generateActivities } from '@/app/lib/openai';

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 401 });
    }
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('id, hobbies, zip_code, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (surveyError) {
      return NextResponse.json({ error: surveyError.message }, { status: 500 });
    }
    if (!survey) {
      return NextResponse.json({ error: 'No surveys found for this user' }, { status: 404 });
    }

    const { data: existing, error: existingError } = await supabase
      .from('survey_activities')
      .select('activities')
      .eq('survey_id', survey.id)
      .single();

    if (!existingError && existing?.activities) {
      return NextResponse.json({
        survey,
        activities: existing.activities,
        cached: true,
      });
    }

    const activities = await generateActivities({
      hobbies: survey.hobbies,
      zipCode: survey.zip_code,
    });

    const { error: insertError } = await supabase.from('survey_activities').insert([
      {
        user_id: user.id,
        survey_id: survey.id,
        activities,
        openai_model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      },
    ]);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ survey, activities, cached: false });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

