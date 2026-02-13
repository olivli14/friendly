import { createClient } from "@/app/api/supabase/server";
import AuthDebugPanel from "@/app/components/AuthDebugPanel";
import FavoritesList from "@/app/ui/FavoritesList";

export default async function FavoritesPage() {
  const supabase = await createClient();

  // Get the user from cookies
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <AuthDebugPanel />
        <p className="text-red-500 mt-4">
          You are not signed in. Please log in.
        </p>
      </div>
    );
  }

  // Fetch user's favorites
  const { data: favorites, error } = await supabase
    .from("favorites")
    .select("id, created_at, survey_id, activity")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <AuthDebugPanel />
        <p className="text-red-500 mt-4">Failed to load favorites: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto transition-all duration-500 opacity-100 scale-100">
      <AuthDebugPanel />
      <h1 className="text-2xl font-semibold mb-4 text-center">
        Your Favorite Activities
      </h1>
      <FavoritesList initialFavorites={favorites} />
    </div>
  );
}
