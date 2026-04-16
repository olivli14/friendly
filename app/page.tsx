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
      <main className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-[#EE4D65]/15 blur-3xl" />
          <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#9CDE9F]/20 blur-3xl" />
        </div>

        <div className="relative max-w-2xl w-full">
          <div className="bg-white/90 dark:bg-[#2A1711]/90 backdrop-blur-sm rounded-3xl border border-[#BB8C67]/30 dark:border-[#876047]/70 shadow-xl shadow-[#BB8C67]/20 dark:shadow-black/25 p-8 sm:p-10 text-center">
            <p className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.18em] bg-[#EE4D65]/10 text-[#8E2537] dark:bg-[#EE4D65]/20 dark:text-[#F7A3AF] mb-5">
              Personalized plans in under a minute
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#501F15] dark:text-[#F9EEE6] mb-3">
              Quokka
            </h1>
            <p className="text-base sm:text-lg text-[#876047] dark:text-[#D9BCA6] mb-8 max-w-xl mx-auto">
              Discover personalized activities, events, and spots near you based on your hobbies.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center px-7 py-3 rounded-xl bg-[#EE4D65] text-white font-semibold hover:bg-[#D64058] transition-all duration-200 shadow-lg shadow-[#EE4D65]/20 hover:shadow-xl hover:shadow-[#EE4D65]/30 hover:-translate-y-0.5"
            >
              Get started
            </Link>

            <div className="mt-10 grid sm:grid-cols-3 gap-3 text-left">
              <StepCard title="Tell us your hobbies" detail="Pick what you enjoy and where you are." />
              <StepCard title="Get smart matches" detail="See local ideas tailored to your style." />
              <StepCard title="Save your favorites" detail="Build a shortlist for the week." />
            </div>

            <div className="mt-6 rounded-2xl border border-[#BB8C67]/25 dark:border-[#876047]/50 bg-[#FFF8F2] dark:bg-[#3A2219] p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8E2537] dark:text-[#F7A3AF]">
                Exciting updates ahead
              </p>
              <p className="mt-2 text-sm text-[#876047] dark:text-[#D9BCA6]">
                We’re building friend scheduling so Quokka can suggest plans that match both people&apos;s hobbies and
                shared free time.
              </p>
            </div>
          </div>
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

function StepCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl bg-[#FFF8F2] dark:bg-[#3A2219] border border-[#BB8C67]/20 dark:border-[#876047]/50 p-4">
      <h2 className="text-sm font-semibold text-[#501F15] dark:text-[#F9EEE6]">{title}</h2>
      <p className="mt-1 text-xs text-[#876047] dark:text-[#D9BCA6] leading-relaxed">{detail}</p>
    </div>
  );
}
