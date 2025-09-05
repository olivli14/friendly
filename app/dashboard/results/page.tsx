"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ActivityMap from "@/app/components/ActivityMap";
import { Suspense } from "react";

function ResultsInner() {
  const searchParams = useSearchParams();
  const hobbies = searchParams.get("hobbies")?.split(",") || [];
  const zip = searchParams.get("zip") || "";

  const [activities, setActivities] = useState<Array<{
    name: string;
    description: string;
    whyItMatches: string;
    costRange: string;
    link: string;
    coordinates: { lat: number; lng: number };
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hobbies.length || !zip) return;
    // Only call OpenAI API if this is a fresh submission (not just a reload)
    const submissionKey = `survey_submitted_${hobbies.join('_')}_${zip}`;
    const hasSubmitted = sessionStorage.getItem(submissionKey);
    if (hasSubmitted) return;
    const fetchActivities = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/generate-activities", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ answers: [hobbies, zip] }),
        });
        if (!response.ok) {
          throw new Error("Failed to generate activities");
        }
        const data = await response.json();
        setActivities(data.activities);
        // Mark as submitted so we don't call again on reload
        sessionStorage.setItem(submissionKey, "true");
      } catch (err) {
        setError("Failed to generate activities. Please try again.");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [hobbies, zip]);


  return (
    <div className="transition-all duration-500 opacity-100 scale-100 text-center max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Your Personalized Activities</h2>
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
      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}
      {activities.length > 0 && (
        <div className="text-left">
          <h3 className="text-lg font-semibold mb-4">Here are some activities perfect for you:</h3>
          {/* Map Section */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-3">Activity Locations</h4>
            <ActivityMap activities={activities} />
          </div>
          {/* Activities List */}
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="bg-white/80 dark:bg-black/40 p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <h4 className="font-semibold text-lg">{activity.name}</h4>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    activity.costRange === "Free"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : activity.costRange === "$"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : activity.costRange === "$$"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}>
                    {activity.costRange}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-2">{activity.description}</p>
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
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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