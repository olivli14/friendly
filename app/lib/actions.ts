'use server';

import postgres from 'postgres';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
//import { signIn } from '@/auth';
import AuthError from 'next-auth';
import { createClient } from '@/app/api/supabase/server';

export async function saveSurvey(hobbies: string[], zipCode: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('surveys')
    .insert([{ hobbies, zip_code: zipCode }])
    .select();


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
  const { data, error } = await supabase
    .from('surveys')
    .select('hobbies, zip_code');

  if (error) {
    throw new Error(error.message);
  }
  return data;
}


