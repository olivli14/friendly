"use client";
import { useEffect, useState } from "react";
import ActivityMap from "@/app/components/ActivityMap";
import AuthDebugPanel from "@/app/components/AuthDebugPanel";
import type { Activity } from "@/app/lib/openai";

type FavoriteRow = {
  id: string;
  created_at: string;
  survey_id: string | null;
  activity: Activity;
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch("/api/favorites", { credentials: "include" });
        if (!response.ok) {
          const { error: apiError } = await response.json().catch(() => ({ error: "Failed to load favorites" }));
          throw new Error(apiError || "Failed to load favorites");
        }
        const data = await response.json();
        setFavorites(data.favorites || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load favorites");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemove = async (favorite: FavoriteRow) => {
    if (deletingId) return; // Prevent multiple simultaneous deletions

    try {
      setDeletingId(favorite.id);
      const response = await fetch("/api/favorites", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activityName: favorite.activity.name,
          activityLink: favorite.activity.link ?? null,
        }),
      });

      if (!response.ok) {
        const { error: apiError } = await response.json().catch(() => ({ error: "Failed to remove favorite" }));
        throw new Error(apiError || "Failed to remove favorite");
      }

      // Optimistically remove from UI
      setFavorites((prev) => prev.filter((f) => f.id !== favorite.id));
    } catch (err) {
      console.error("Failed to remove favorite", err);
      alert("Failed to remove favorite. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <AuthDebugPanel />
        <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Favorites</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading favorites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <AuthDebugPanel />
        <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Favorites</h1>
        <p className="text-red-500">Failed to load favorites: {error}</p>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <AuthDebugPanel />
        <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Favorites</h1>
        <p className="text-gray-600 dark:text-gray-300">
          You don&apos;t have any favorite activities yet. Generate some results and tap the heart
          icon to save them here.
        </p>
        </div>
      </div>
    );
  }

  const activities = favorites.map((f) => f.activity);

  return (
    <div className="transition-all duration-500 opacity-100 scale-100 max-w-3xl mx-auto">
      <AuthDebugPanel />
      <h1 className="text-2xl font-semibold mb-4 text-center">Your Favorite Activities</h1>

      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3">Favorite Locations</h2>
        <ActivityMap activities={activities} />
      </div>

      <div className="space-y-4 mt-6">
        {favorites.map((fav) => (
          <div
            key={fav.id}
            className="bg-white/80 dark:bg-black/40 p-4 rounded-lg shadow-md"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Remove from favorites"
                  onClick={() => handleRemove(fav)}
                  disabled={deletingId === fav.id}
                  className="text-red-500 hover:text-red-600 disabled:opacity-50 transition-colors"
                  title="Remove from favorites"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <h3 className="font-semibold text-lg">{fav.activity.name}</h3>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  fav.activity.costRange === "Free"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : fav.activity.costRange === "$"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : fav.activity.costRange === "$$"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}
              >
                {fav.activity.costRange}
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              {fav.activity.description}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 italic mb-3">
              Why this matches you: {fav.activity.whyItMatches}
            </p>
            {fav.activity.link && (
              <a
                href={fav.activity.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors"
              >
                Learn More
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
