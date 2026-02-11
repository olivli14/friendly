import { redirect } from 'next/navigation';
import { createClient } from '@/app/api/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user has any surveys
  const { data: surveys } = await supabase
    .from('surveys')
    .select('id')
    .eq('user_id', user.id)
    .limit(1);

  // If user has surveys, redirect to results; otherwise, redirect to survey page
  if ((surveys?.length ?? 0) > 0) {
    redirect('/dashboard/results');
  } else {
    redirect('/');
  }
}