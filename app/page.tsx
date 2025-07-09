"use client";
import Image from "next/image";
import { useState } from "react";
import ActivityMap from "./components/ActivityMap";

function Survey() {
  const questions = [
    {
      question: "Are you an indoors or outdoors person?",
      options: ["Indoors", "Outdoors"],
      type: "choice",
    },
    {
      question: "Arts and crafts or sports?",
      options: ["Arts and Crafts", "Sports"],
      type: "choice",
    },
    {
      question: "Do you like exploring new places or familiar things?",
      options: ["Exploring New Places", "Familiar Things"],
      type: "choice",
    },
    {
      question: "What hobbies do you have?",
      type: "text",
    },
    {
      question: "What is your zip code and state?",
      type: "text",
    },
  ];

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [animating, setAnimating] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleOption = (option: string) => {
    setAnimating(true);
    setTimeout(() => {
      setAnswers((prev) => [...prev, option]);
      setStep((prev) => prev + 1);
      setAnimating(false);
    }, 500);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setAnimating(true);
    setTimeout(() => {
      setAnswers((prev) => [...prev, inputValue]);
      setStep((prev) => prev + 1);
      setAnimating(false);
      setInputValue("");
    }, 500);
  };

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate activities');
      }

      const data = await response.json();
      setActivities(data.activities);
    } catch (err) {
      setError('Failed to generate activities. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (step >= questions.length) {
    return (
      <div className="transition-all duration-500 opacity-100 scale-100 text-center max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Thank you for completing the survey!</h2>
        <div className="text-left inline-block mb-6">
          <div><b>Indoors/Outdoors:</b> {answers[0]}</div>
          <div><b>Arts/Crafts or Sports:</b> {answers[1]}</div>
          <div><b>Exploring or Familiar:</b> {answers[2]}</div>
          <div><b>Hobbies:</b> {answers[3]}</div>
          <div><b>Zip Code & State:</b> {answers[4]}</div>
        </div>
        
        {!activities.length && !loading && (
          <button
            onClick={generateActivities}
            className="py-3 px-6 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors mb-6"
          >
            Generate Local Activities
          </button>
        )}

        {loading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Generating personalized activities for you...</p>
          </div>
        )}

        {error && (
          <div className="text-red-500 mb-4">
            {error}
            <button
              onClick={generateActivities}
              className="ml-2 underline hover:no-underline"
            >
              Try again
            </button>
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
                      activity.costRange === 'Free' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      activity.costRange === '$' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      activity.costRange === '$$' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
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

  const q = questions[step];

  return (
    <div
      className={`transition-all duration-500 ${animating ? "opacity-0 scale-95" : "opacity-100 scale-100"} w-full max-w-md mx-auto bg-white/80 dark:bg-black/40 p-6 rounded-xl shadow-lg`}
    >
      <h2 className="text-lg font-semibold mb-6 text-center">{q.question}</h2>
      {q.type === "choice" ? (
        <div className="flex flex-col gap-4">
          {q.options!.map((option) => (
            <button
              key={option}
              className="py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors font-medium"
              onClick={() => handleOption(option)}
              disabled={animating}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={handleTextSubmit} className="flex flex-col gap-4 items-center">
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Your hobbies..."
            disabled={animating}
          />
          <button
            type="submit"
            className="py-2 px-4 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
            disabled={animating}
          >
            Submit
          </button>
        </form>
      )}
    </div>
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
