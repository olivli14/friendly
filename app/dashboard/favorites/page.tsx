import { createClient } from "@/app/api/supabase/server";
import FavoritesList from "@/app/ui/FavoritesList";
import Link from "next/link";

export default async function FavoritesPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-white/10 p-8 text-center max-w-sm">
          <p className="text-gray-600 dark:text-gray-400 mb-4">You must be signed in to see your favorites.</p>
          <Link
            href="/login"
            className="inline-flex px-5 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const { data: favorites, error } = await supabase
    .from("favorites")
    .select("id, created_at, survey_id, activity")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-white/10 p-8 text-center max-w-sm">
          <p className="text-red-500">Failed to load favorites: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Favorites
      </h1>
      <FavoritesList initialFavorites={favorites} />
    </div>
  );
}
