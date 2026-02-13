"use client";

import { useState } from "react";
import ActivityMap from "@/app/components/ActivityMap";
import type { Activity } from "@/app/lib/openai";
import Link from "next/link";

type FavoriteRow = {
  id: string;
  created_at: string;
  survey_id: string | null;
  activity: Activity;
};

export default function FavoritesList({ initialFavorites }: { initialFavorites: FavoriteRow[] }) {
  const [favorites, setFavorites] = useState<FavoriteRow[]>(initialFavorites);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleRemove = async (favorite: FavoriteRow) => {
    if (deletingId) return;

    try {
      setDeletingId(favorite.id);
      const response = await fetch("/api/favorites", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityName: favorite.activity.name,
          activityLink: favorite.activity.link ?? null,
        }),
      });

      if (!response.ok) {
        const { error: apiError } = await response.json().catch(() => ({
          error: "Failed to remove favorite",
        }));
        throw new Error(apiError || "Failed to remove favorite");
      }

      setFavorites((prev) => prev.filter((f) => f.id !== favorite.id));
    } catch (err) {
      console.error("Failed to remove favorite", err);
      alert("Failed to remove favorite. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const costColor = (cost: string) => {
    if (cost === "Free") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
    if (cost === "$") return "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300";
    if (cost === "$$") return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
    return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
  };

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mb-4">
          <span className="text-2xl text-gray-400">&#9825;</span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          No favorites yet. Tap the heart icon on your results to save them here.
        </p>
        <Link
          href="/dashboard/results"
          className="px-5 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          View results
        </Link>
      </div>
    );
  }

  const activities = favorites.map((f) => f.activity);

  return (
    <>
      {/* Map */}
      <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-white/10 mb-8">
        <ActivityMap activities={activities} />
      </div>

      {/* Favorite cards */}
      <div className="space-y-4">
        {favorites.map((fav) => (
          <div
            key={fav.id}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow p-5"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Remove from favorites"
                  onClick={() => handleRemove(fav)}
                  disabled={deletingId === fav.id}
                  className="text-xl text-rose-500 hover:text-rose-600 disabled:opacity-50 transition-transform hover:scale-110"
                  title="Remove from favorites"
                >
                  &#9829;
                </button>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{fav.activity.name}</h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${costColor(fav.activity.costRange)}`}>
                {fav.activity.costRange}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{fav.activity.description}</p>
            <p className="text-sm text-teal-600 dark:text-teal-400 italic mb-3">
              {fav.activity.whyItMatches}
            </p>
            {fav.activity.link && (
              <a
                href={fav.activity.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
              >
                Learn more
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
