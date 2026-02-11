"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ActivityMap from "@/app/components/ActivityMap";
import { Suspense } from "react";
import Link from "next/link";

function ResultsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const surveyId = searchParams.get("surveyId") || "";

  const [activities, setActivities] = useState<
    Array<{
      name: string;
      description: string;
      whyItMatches: string;
      costRange: string;
      link: string;
      coordinates: { lat: number; lng: number };
    }>
  >([]);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [zip, setZip] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSurveyId, setCurrentSurveyId] = useState<string>(surveyId);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [savedIndexes, setSavedIndexes] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchSurveyActivities = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = surveyId
          ? `/api/surveys/${encodeURIComponent(surveyId)}`
          : "/api/surveys/latest";
        const response = await fetch(url);
        if (!response.ok) {
          const { error: apiError } = await response
            .json()
            .catch(() => ({ error: "Failed to load activities" }));
          throw new Error(apiError || "Failed to load activities");
        }
        const data = await response.json();
        setActivities(data.activities || []);
        setHobbies(data.survey?.hobbies || []);
        setZip(data.survey?.zip_code || "");
        if (data.survey?.id) {
          setCurrentSurveyId(data.survey.id);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load activities. Please try again."
        );
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSurveyActivities();
  }, [surveyId]);

  const handleFavorite = async (activityIndex: number) => {
    const activity = activities[activityIndex];
    if (!activity || !currentSurveyId) return;

    try {
      setSavingIndex(activityIndex);
      const isSaved = savedIndexes.has(activityIndex);

      const response = await fetch("/api/favorites", {
        method: isSaved ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isSaved
            ? {
                activityName: activity.name,
                activityLink: activity.link ?? null,
              }
            : {
                surveyId: currentSurveyId,
                activity,
              }
        ),
      });

      if (!response.ok) {
        const { error: apiError } = await response.json().catch(() => ({
          error: isSaved ? "Failed to remove favorite" : "Failed to save favorite",
        }));
        throw new Error(
          apiError ||
            (isSaved ? "Failed to remove favorite" : "Failed to save favorite")
        );
      }

      setSavedIndexes((prev) => {
        const next = new Set(prev);
        if (isSaved) {
          next.delete(activityIndex);
        } else {
          next.add(activityIndex);
        }
        return next;
      });
    } catch (err) {
      console.error("Failed to update favorite", err);
      alert(
        `Failed to ${
          savedIndexes.has(activityIndex) ? "remove from" : "save to"
        } favorites. Please try again.`
      );
    } finally {
      setSavingIndex(null);
    }
  };

  return (
    <div className="transition-all duration-500 opacity-100 scale-100 text-center max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Personalized Activities</h2>
        <Link
          href="/"
          className="text-sm px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Fill Out New Survey
        </Link>
      </div>
      <div className="text-left inline-block mb-6">
        <div>
          <b>Hobbies:</b> {hobbies.join(", ")}
        </div>
        <div>
          <b>Zip Code:</b> {zip}
        </div>
      </div>
      {loading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Generating personalized activities for you...</p>
        </div>
      )}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {activities.length > 0 && (
        <div className="text-left">
          <h3 className="text-lg font-semibold mb-4">
            Here are some activities perfect for you:
          </h3>
          {/* Map Section */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-3">Activity Locations</h4>
            <ActivityMap activities={activities} />
          </div>
          {/* Activities List */}
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="bg-white/80 dark:bg-black/40 p-4 rounded-lg shadow-md"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={
                        savedIndexes.has(index)
                          ? "Remove from favorites"
                          : "Save to favorites"
                      }
                      onClick={() => handleFavorite(index)}
                      disabled={savingIndex === index}
                      className="text-red-500 hover:text-red-600 disabled:opacity-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-6 h-6"
                        fill={savedIndexes.has(index) ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.995 5.495c-1.2-1.35-3.16-1.8-4.79-.86-1.63.94-2.31 2.95-1.59 4.7.72 1.76 5.01 5.42 6.38 6.55 1.37-1.13 5.66-4.79 6.38-6.55.72-1.75.04-3.76-1.59-4.7-1.63-.94-3.59-.49-4.79.86z"
                        />
                      </svg>
                    </button>
                    <h4 className="font-semibold text-lg">{activity.name}</h4>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      activity.costRange === "Free"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : activity.costRange === "$"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : activity.costRange === "$$"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {activity.costRange}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  {activity.description}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 italic mb-3">
                  Why this matches you: {activity.whyItMatches}
                </p>
                {activity.link && (
                  <a
                    href={activity.link}
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
      )}
    </div>
  );
}

export default function Results() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading results...</div>}>
      <ResultsInner />
    </Suspense>
  );
}
