import SurveyForm from "@/app/ui/SurveyForm";
import { createClient } from "@/app/api/supabase/server";
import AuthDebugPanel from "@/app/components/AuthDebugPanel";
import Link from "next/link";

// Run on every request so we can read the user's auth cookies
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  // Get authenticated user from cookies
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    // User not authenticated → show sign in option
    return (
      <div className="max-w-2xl mx-auto text-center">
        <AuthDebugPanel />
        <h1 className="text-2xl font-semibold mb-4">Welcome to Quokka Bay</h1>
        <p className="mb-6">
          You are not signed in. To save your survey results and favorites, please sign in with Google.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          Sign in with Google
        </Link>
      </div>
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

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
        <SurveyForm recentSurvey={recentSurvey} userId={user.id} />
      </main>
    </div>
  );
}
