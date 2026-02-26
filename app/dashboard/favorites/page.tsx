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
        <div className="bg-white/95 dark:bg-[#2A1711] rounded-2xl shadow-lg border border-[#BB8C67]/30 dark:border-[#876047]/70 p-8 text-center max-w-sm">
          <p className="text-[#876047] dark:text-[#D9BCA6] mb-4">You must be signed in to see your favorites.</p>
          <Link
            href="/login"
            className="inline-flex px-5 py-2 rounded-xl bg-[#EE4D65] text-white text-sm font-medium hover:bg-[#D64058] transition-colors"
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
        <div className="bg-white/95 dark:bg-[#2A1711] rounded-2xl shadow-lg border border-[#BB8C67]/30 dark:border-[#876047]/70 p-8 text-center max-w-sm">
          <p className="text-red-500">Failed to load favorites: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#501F15] dark:text-[#F9EEE6] mb-6">
        Favorites
      </h1>
      <FavoritesList initialFavorites={favorites} />
    </div>
  );
}
