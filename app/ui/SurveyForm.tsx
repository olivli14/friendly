"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { saveSurvey } from "@/app/lib/actions";

interface SurveyFormProps {
  recentSurvey: { id: string; hobbies: string[]; zip_code: string } | null;
  userId: string;
}

export default function SurveyForm({ recentSurvey }: SurveyFormProps) {
  const hobbyOptions = [
    "Gardening","Baking","Cooking","Gaming","Dancing","Arts","Movies","Music",
    "Hiking","Photography","Traveling","Reading","Writing","Sports","Crafts","Yoga",
    "Fitness","Board Games","Volunteering","Fishing","Cycling","Shopping","Technology","Pets","Other",
  ];

  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(recentSurvey?.hobbies ?? []);
  const [zipCode, setZipCode] = useState(recentSurvey?.zip_code ?? "");
  const [zipError, setZipError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const zipCodeSchema = z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, "Please enter a valid US zip code.");

  const handleHobbyChange = (hobby: string) => {
    setSelectedHobbies((prev) =>
      prev.includes(hobby)
        ? prev.filter((h) => h !== hobby)
        : [...prev, hobby]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setZipError(null);

    if (selectedHobbies.length === 0 || !zipCode.trim()) return;

    const result = zipCodeSchema.safeParse(zipCode.trim());
    if (!result.success) {
      setZipError(result.error.errors[0].message);
      return;
    }

    try {
      setSubmitting(true);
      const res = await saveSurvey(selectedHobbies, zipCode.trim());

      if (!res.success) {
        setZipError("Failed to save survey: " + res.error);
        return;
      }

      router.push(`/dashboard/results?surveyId=${encodeURIComponent(res.data.id)}`);
      // Don't reset submitting — let it stay true while navigating so the
      // user sees the loading state until the results page takes over.
    } catch (err: unknown) {
      let message = "Unexpected error";
      if (err instanceof Error) message = err.message;
      setZipError("Unexpected error: " + message);
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-white/10 p-8"
    >
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 text-center">
        Tell us about yourself
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 text-center">
        Select your hobbies and zip code to get personalized activity suggestions.
      </p>

      {/* Hobbies */}
      <fieldset className="mb-8">
        <legend className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Your hobbies
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {hobbyOptions.map((hobby) => {
            const selected = selectedHobbies.includes(hobby);
            return (
              <button
                key={hobby}
                type="button"
                onClick={() => handleHobbyChange(hobby)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                  selected
                    ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                    : "bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-teal-300 hover:text-teal-700 dark:hover:text-teal-400"
                }`}
              >
                {hobby}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Zip code */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="zipCode">
          Zip code
        </label>
        <input
          id="zipCode"
          type="text"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="e.g. 95032"
        />
        {zipError && <p className="text-red-500 text-sm mt-2">{zipError}</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
        disabled={selectedHobbies.length === 0 || !zipCode.trim() || submitting}
      >
        {submitting && (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {submitting ? "Generating your results..." : "Get my results"}
      </button>
    </form>
  );
}
