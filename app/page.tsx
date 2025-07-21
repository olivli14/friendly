"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import ActivityMap from "@/app/components/ActivityMap";
import { saveSurvey } from "@/app/lib/actions";

function Survey() {
  const hobbyOptions = [
    "Gardening",
    "Baking",
    "Cooking",
    "Gaming",
    "Dancing",
    "Arts",
    "Movies",
    "Music",
    "Hiking",
    "Photography",
    "Traveling",
    "Reading",
    "Writing",
    "Sports",
    "Crafts",
    "Yoga",
    "Fitness",
    "Board Games",
    "Volunteering",
    "Fishing",
    "Cycling",
    "Shopping",
    "Technology",
    "Pets",
    "Other",
  ];

  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [zipCode, setZipCode] = useState("");
  const [zipError, setZipError] = useState<string | null>(null);
  const router = useRouter();

  const zipCodeSchema = z.string().regex(/^\d{5}(-\d{4})?$/, "Please enter a valid US zip code.");

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
      const res = await saveSurvey(selectedHobbies, Number(zipCode.trim()));
  
      if (!res.success) {
        setZipError("Failed to save survey: " + res.error);
        return;
      }
  
      const params = new URLSearchParams({
        hobbies: selectedHobbies.join(","),
        zip: zipCode.trim(),
      });
  
    
      // Also navigate to /dashboard/results
      router.push(`/dashboard/results?${params.toString()}`);
    } catch (err: any) {
      setZipError("Unexpected error: " + (err.message || err.toString()));
    }
  };
  
  return (
    <form
      onSubmit={handleSubmit}
      className="transition-all duration-500 w-full max-w-md mx-auto bg-white/80 dark:bg-black/40 p-6 rounded-xl shadow-lg"
    >
      <h2 className="text-lg font-semibold mb-6 text-center">Tell us about yourself</h2>
      <div className="mb-6">
        <label className="block font-medium mb-2">Select your hobbies:</label>
        <div className="grid grid-cols-2 gap-2">
          {hobbyOptions.map((hobby) => (
            <label key={hobby} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={hobby}
                checked={selectedHobbies.includes(hobby)}
                onChange={() => handleHobbyChange(hobby)}
                className="accent-blue-500"
              />
              <span>{hobby}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <label className="block font-medium mb-2" htmlFor="zipCode">Zip Code:</label>
        <input
          id="zipCode"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="Your zip code..."
        />
        {zipError && <div className="text-red-500 text-sm mt-1">{zipError}</div>}
      </div>
      <button
        type="submit"
        className="py-2 px-4 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors w-full"
        disabled={selectedHobbies.length === 0 || !zipCode.trim()}
      >
        Submit
      </button>
    </form>
  );
}

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
        <Survey />
      </main>
    </div>
  );
}
