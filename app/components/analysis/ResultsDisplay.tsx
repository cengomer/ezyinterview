"use client";
import React, { useState } from "react";

interface QA {
  question: string;
  answer: string;
}

interface ResultsDisplayProps {
  results: {
    Behavioral: QA[];
    Technical: QA[];
    General: QA[];
  };
}

const categories: Array<keyof ResultsDisplayProps["results"]> = [
  "Behavioral",
  "Technical",
  "General",
];

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  if (!results) return null;
  const maxRows = Math.max(
    results.Behavioral.length,
    results.Technical.length,
    results.General.length
  );

  const [selectedCategory, setSelectedCategory] = useState<keyof typeof results>("Behavioral");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const qa = results[selectedCategory][selectedIndex];

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold mb-6 text-gray-900">Generated Questions & Model Answers</h2>
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Y axis: Question numbers */}
        <div className="flex md:flex-col gap-2 mb-4 md:mb-0">
          {Array.from({ length: maxRows }).map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`px-4 py-2 rounded-md border text-sm font-semibold transition-colors
                ${selectedIndex === i ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50"}`}
              aria-label={`Question ${i + 1}`}
            >
              Q{i + 1}
            </button>
          ))}
        </div>
        <div className="flex-1">
          {/* X axis: Category selector */}
          <div className="flex gap-2 mb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-md border text-sm font-semibold transition-colors
                  ${selectedCategory === cat ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50"}`}
                aria-label={cat}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Focus square: Show only the selected question/answer */}
          <div className="border border-gray-300 rounded-lg shadow-sm bg-white p-6 min-h-[160px] flex flex-col gap-4">
            {qa ? (
              <>
                <div className="flex gap-2 items-start">
                  <span className="font-bold text-gray-700">Question:</span>
                  <span className="text-gray-900 font-medium">{qa.question}</span>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="font-semibold text-green-700">Model Answer:</span>
                  <span className="text-gray-800">{qa.answer}</span>
                </div>
              </>
            ) : (
              <span className="text-gray-400 italic">No question for this slot.</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
