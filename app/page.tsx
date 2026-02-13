import SurveyForm from "@/app/ui/SurveyForm";
import { createClient } from "@/app/api/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent mb-3">
            Quokka Bay
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Discover personalized activities, events, and spots near you based on your hobbies.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20"
          >
            Get started
          </Link>
        </div>
      </main>
    );
  }

  // Fetch the most recent survey for this user
  const { data: surveys } = await supabase
    .from("surveys")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const recentSurvey = surveys?.[0] ?? null;

  // Returning users who already have a survey -> send them to results
  if (recentSurvey) {
    redirect("/dashboard/results");
  }

  // First-time users -> show the survey form
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <SurveyForm recentSurvey={null} userId={user.id} />
    </main>
  );
}
