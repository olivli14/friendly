"use client";
import Image from "next/image";
import { useState } from "react";

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

  if (step >= questions.length) {
    return (
      <div className="transition-all duration-500 opacity-100 scale-100 text-center">
        <h2 className="text-xl font-bold mb-4">Thank you for completing the survey!</h2>
        <div className="text-left inline-block">
          <div><b>Indoors/Outdoors:</b> {answers[0]}</div>
          <div><b>Arts/Crafts or Sports:</b> {answers[1]}</div>
          <div><b>Exploring or Familiar:</b> {answers[2]}</div>
          <div><b>Hobbies:</b> {answers[3]}</div>
          <div><b>Zip Code & State:</b> {answers[4]}</div>
        </div>
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
