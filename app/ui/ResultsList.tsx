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
    if (cost === "Free") return "bg-[#9CDE9F]/35 text-[#2E6D34] dark:bg-[#9CDE9F]/20 dark:text-[#9CDE9F]";
    if (cost === "$") return "bg-[#BB8C67]/25 text-[#876047] dark:bg-[#BB8C67]/20 dark:text-[#D9BCA6]";
    if (cost === "$$") return "bg-[#EE4D65]/20 text-[#8E2537] dark:bg-[#EE4D65]/25 dark:text-[#F7A3AF]";
    return "bg-[#501F15]/20 text-[#501F15] dark:bg-[#501F15]/50 dark:text-[#EAC7B1]";
  };

  return (
    <div>
      {/* Survey info pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {survey.hobbies.map((hobby) => (
          <span
            key={hobby}
            className="px-3 py-1 rounded-full text-xs font-medium bg-[#BB8C67]/20 text-[#876047] dark:bg-[#BB8C67]/20 dark:text-[#D9BCA6]"
          >
            {hobby}
          </span>
        ))}
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#F5ECE4] text-[#501F15] dark:bg-[#3A2219] dark:text-[#F9EEE6]">
          {survey.zip}
        </span>
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden shadow-lg border border-[#BB8C67]/30 dark:border-[#876047]/70 mb-8">
        <ActivityMap activities={survey.activities} />
      </div>

      {/* Activity cards */}
      <div className="space-y-4">
        {survey.activities.map((activity, index) => (
          <div
            key={index}
            className="bg-white/95 dark:bg-[#2A1711] rounded-2xl border border-[#BB8C67]/30 dark:border-[#876047]/70 shadow-sm hover:shadow-md transition-shadow p-5"
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
                    <span className="text-[#EE4D65]">&#9829;</span>
                  ) : (
                    <span className="text-[#BB8C67]/70 dark:text-[#876047] hover:text-[#EE4D65]">&#9825;</span>
                  )}
                </button>
                <h3 className="font-semibold text-[#501F15] dark:text-[#F9EEE6]">{activity.name}</h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${costColor(activity.costRange)}`}>
                {activity.costRange}
              </span>
            </div>
            <p className="text-[#876047] dark:text-[#D9BCA6] text-sm mb-2">{activity.description}</p>
            <p className="text-sm text-[#EE4D65] dark:text-[#F7A3AF] italic">{activity.whyItMatches}</p>
            {activity.link && (
              <a
                href={activity.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-[#501F15] dark:text-[#F9EEE6] hover:text-[#EE4D65] dark:hover:text-[#F7A3AF]"
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
