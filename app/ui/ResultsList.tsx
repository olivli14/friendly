"use client";
import { useState } from "react";
import ActivityMap from "@/app/components/ActivityMap";
import type { Activity } from "@/app/lib/openai";

interface Props {
  survey: {
    id: string;
    hobbies: string[];
    zip: string;
    activities: Activity[];
  };
}

export default function ResultsList({ survey }: Props) {
  const [savedIndexes, setSavedIndexes] = useState<Set<number>>(new Set());
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  const handleFavorite = async (index: number) => {
    const activity = survey.activities[index];
    if (!activity) return;

    try {
      setSavingIndex(index);
      const isSaved = savedIndexes.has(index);

      const response = await fetch("/api/favorites", {
        method: isSaved ? "DELETE" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isSaved
            ? { activityName: activity.name, activityLink: activity.link ?? null }
            : { surveyId: survey.id, activity }
        ),
      });

      if (!response.ok) throw new Error("Failed to update favorite");

      setSavedIndexes(prev => {
        const next = new Set(prev);
        if (isSaved) {
          next.delete(index);
        } else {
          next.add(index);
        }
        return next;
      });
    } catch (err) {
      console.error(err);
      alert("Failed to save/remove favorite");
    } finally {
      setSavingIndex(null);
    }
  };

  const costColor = (cost: string) => {
    if (cost === "Free") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
    if (cost === "$") return "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300";
    if (cost === "$$") return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
    return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
  };

  return (
    <div>
      {/* Survey info pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {survey.hobbies.map((hobby) => (
          <span
            key={hobby}
            className="px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
          >
            {hobby}
          </span>
        ))}
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
          {survey.zip}
        </span>
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-white/10 mb-8">
        <ActivityMap activities={survey.activities} />
      </div>

      {/* Activity cards */}
      <div className="space-y-4">
        {survey.activities.map((activity, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow p-5"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleFavorite(index)}
                  disabled={savingIndex === index}
                  className="text-xl transition-transform hover:scale-110 disabled:opacity-50"
                  aria-label={savedIndexes.has(index) ? "Remove from favorites" : "Add to favorites"}
                >
                  {savedIndexes.has(index) ? (
                    <span className="text-rose-500">&#9829;</span>
                  ) : (
                    <span className="text-gray-300 dark:text-gray-600 hover:text-rose-400">&#9825;</span>
                  )}
                </button>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{activity.name}</h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${costColor(activity.costRange)}`}>
                {activity.costRange}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{activity.description}</p>
            <p className="text-sm text-teal-600 dark:text-teal-400 italic">{activity.whyItMatches}</p>
            {activity.link && (
              <a
                href={activity.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
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
    </div>
  );
}
