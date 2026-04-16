import Link from "next/link";
import { createClient } from "@/app/api/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="max-w-3xl mx-auto py-12 text-center">
      <p className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.18em] bg-[#EE4D65]/10 text-[#8E2537] dark:bg-[#EE4D65]/20 dark:text-[#F7A3AF] mb-4">
        Your activity hub
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold text-[#501F15] dark:text-[#F9EEE6] mb-2">
        Hey, {firstName}
      </h1>
      <p className="text-[#876047] dark:text-[#D9BCA6] mb-10 text-lg">
        What would you like to explore today?
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <DashCard
          href="/dashboard/results"
          title="See my plan"
          description="Open your personalized activity recommendations"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <DashCard
          href="/dashboard/survey"
          title="New survey"
          description="Fill out a new survey for fresh suggestions"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          }
        />
        <DashCard
          href="/dashboard/favorites"
          title="Favorites"
          description="Activities you've saved for later"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
        />
        <DashCard
          href="/dashboard/friends"
          title="Friends"
          description="Create groups and preview shared planning"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20a4 4 0 00-8 0m8 0H7m10 0h3m-3 0a4 4 0 00-8 0m0 0H4m8-9a4 4 0 110-8 4 4 0 010 8zm6-1a3 3 0 100-6 3 3 0 000 6zM6 10a3 3 0 100-6 3 3 0 000 6z"
              />
            </svg>
          }
        />
      </div>
    </div>
  );
}

function DashCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-start gap-3 p-5 bg-white/95 dark:bg-[#2A1711] rounded-2xl border border-[#BB8C67]/30 dark:border-[#876047]/70 shadow-sm hover:shadow-lg hover:border-[#EE4D65]/40 transition-all duration-200 hover:-translate-y-1"
    >
      <div className="p-2 rounded-xl bg-[#F5ECE4] dark:bg-[#3A2219] text-[#876047] dark:text-[#D9BCA6] group-hover:bg-[#EE4D65]/20 group-hover:text-[#501F15] dark:group-hover:text-[#F9EEE6] transition-colors">
        {icon}
      </div>
      <div>
        <h2 className="font-semibold text-[#501F15] dark:text-[#F9EEE6]">{title}</h2>
        <p className="text-sm text-[#876047] dark:text-[#D9BCA6]">{description}</p>
      </div>
    </Link>
  );
}
