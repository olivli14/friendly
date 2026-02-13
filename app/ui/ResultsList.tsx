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

  return (
    <div className="max-w-2xl mx-auto text-left">
      <h2 className="text-xl font-bold mb-4">Your Personalized Activities</h2>
      <div><b>Hobbies:</b> {survey.hobbies.join(", ")}</div>
      <div><b>Zip Code:</b> {survey.zip}</div>

      <div className="my-6">
        <ActivityMap activities={survey.activities} />
      </div>

      <div className="space-y-4">
        {survey.activities.map((activity, index) => (
          <div key={index} className="bg-white/80 dark:bg-black/40 p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFavorite(index)}
                  disabled={savingIndex === index}
                  className="text-red-500 hover:text-red-600 disabled:opacity-50"
                >
                  {savedIndexes.has(index) ? "♥" : "♡"}
                </button>
                <h4 className="font-semibold">{activity.name}</h4>
              </div>
              <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 dark:bg-gray-700">
                {activity.costRange}
              </span>
            </div>
            <p>{activity.description}</p>
            <p className="text-sm italic">{activity.whyItMatches}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
