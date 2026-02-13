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
    <div className="max-w-2xl mx-auto py-12 text-center">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Hey, {firstName}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        What would you like to do today?
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <DashCard
          href="/dashboard/results"
          title="View results"
          description="See your personalized activity suggestions"
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
      className="group flex flex-col items-start gap-3 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md hover:border-teal-200 dark:hover:border-teal-800 transition-all"
    >
      <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 transition-colors">
        {icon}
      </div>
      <div>
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </Link>
  );
}
