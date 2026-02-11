'use server';

//import postgres from 'postgres';
//import { z } from 'zod';
//import { revalidatePath } from 'next/cache';
//import { redirect } from 'next/navigation';
//import { signIn } from '@/auth';
//import AuthError from 'next-auth';
import { createClient } from '@/app/api/supabase/server';

export async function saveSurvey(hobbies: string[], zipCode: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return {
      success: false,
      error: userError.message || 'Failed to read user session',
    };
  }

  if (!user) {
    return {
      success: false,
      error: 'You must be signed in to save your survey.',
    };
  }

  const { data, error } = await supabase
    .from('surveys')
    .insert([{ user_id: user.id, hobbies, zip_code: zipCode }])
    .select()
    .single();


  if (error) {
    console.error('Supabase Insert Error:', error);
    console.log('Insert Payload:', { hobbies, zipCode });
    return {
      success: false,
      error: error.message || 'Unknown error from Supabase',
    };
  }
  

  return {
    success: true,
    data,
  };
}



export async function getSurveys() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('surveys')
    .select('id, created_at, hobbies, zip_code')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function hasSurveys(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return false;
  }

  const { data, error } = await supabase
    .from('surveys')
    .select('id')
    .eq('user_id', user.id)
    .limit(1);

  if (error) {
    return false;
  }

  return (data?.length ?? 0) > 0;
}


