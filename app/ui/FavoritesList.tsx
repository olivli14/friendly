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
    if (cost === "Free") return "bg-[#9CDE9F]/35 text-[#2E6D34] dark:bg-[#9CDE9F]/20 dark:text-[#9CDE9F]";
    if (cost === "$") return "bg-[#BB8C67]/25 text-[#876047] dark:bg-[#BB8C67]/20 dark:text-[#D9BCA6]";
    if (cost === "$$") return "bg-[#EE4D65]/20 text-[#8E2537] dark:bg-[#EE4D65]/25 dark:text-[#F7A3AF]";
    return "bg-[#501F15]/20 text-[#501F15] dark:bg-[#501F15]/50 dark:text-[#EAC7B1]";
  };

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-[#F5ECE4] dark:bg-[#3A2219] flex items-center justify-center mb-4">
          <span className="text-2xl text-[#BB8C67] dark:text-[#D9BCA6]">&#9825;</span>
        </div>
        <p className="text-[#876047] dark:text-[#D9BCA6] mb-4">
          No favorites yet. Tap the heart icon on your results to save them here.
        </p>
        <Link
          href="/dashboard/results"
          className="px-5 py-2 rounded-xl bg-[#EE4D65] text-white text-sm font-medium hover:bg-[#D64058] transition-colors"
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
      <div className="rounded-2xl overflow-hidden shadow-lg border border-[#BB8C67]/30 dark:border-[#876047]/70 mb-8">
        <ActivityMap activities={activities} />
      </div>

      {/* Favorite cards */}
      <div className="space-y-4">
        {favorites.map((fav) => (
          <div
            key={fav.id}
            className="bg-white/95 dark:bg-[#2A1711] rounded-2xl border border-[#BB8C67]/30 dark:border-[#876047]/70 shadow-sm hover:shadow-md transition-shadow p-5"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Remove from favorites"
                  onClick={() => handleRemove(fav)}
                  disabled={deletingId === fav.id}
                  className="text-xl text-[#EE4D65] hover:text-[#D64058] disabled:opacity-50 transition-transform hover:scale-110"
                  title="Remove from favorites"
                >
                  &#9829;
                </button>
                <h3 className="font-semibold text-[#501F15] dark:text-[#F9EEE6]">{fav.activity.name}</h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${costColor(fav.activity.costRange)}`}>
                {fav.activity.costRange}
              </span>
            </div>
            <p className="text-[#876047] dark:text-[#D9BCA6] text-sm mb-2">{fav.activity.description}</p>
            <p className="text-sm text-[#EE4D65] dark:text-[#F7A3AF] italic mb-3">
              {fav.activity.whyItMatches}
            </p>
            {fav.activity.link && (
              <a
                href={fav.activity.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-[#501F15] dark:text-[#F9EEE6] hover:text-[#EE4D65] dark:hover:text-[#F7A3AF]"
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
