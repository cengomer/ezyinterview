"use client";

// TODO: Define types for questions and categories

export default function ResultsDisplay({
  questionsByCategory,
  onCopyAll,
  onGenerateNew,
}: {
  questionsByCategory: {
    [category: string]: string[];
  };
  onCopyAll?: () => void;
  onGenerateNew?: () => void;
}) {
  // TODO: Implement logic for copying and resetting
  if (!questionsByCategory || Object.keys(questionsByCategory).length === 0) return null;

  let questionIndex = 1;

  return (
    <section className="w-full bg-white py-8">
      <div className="max-w-xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Interview Questions</h2>
        {Object.entries(questionsByCategory).map(([category, questions]) => (
          <div key={category} className="mb-6">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">{category}</h3>
            <ul className="space-y-3">
              {questions.map((q, idx) => (
                <li key={idx} className="bg-gray-50 border border-gray-200 rounded-md px-4 py-3 text-gray-900 shadow-sm">
                  <span className="font-bold mr-2">{questionIndex++}.</span> {q}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="flex flex-col md:flex-row gap-3 mt-6">
          <button
            className="flex-1 bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors text-base"
            onClick={onCopyAll}
          >
            Copy All Questions
          </button>
          <button
            className="flex-1 bg-gray-200 text-gray-800 font-semibold px-6 py-2 rounded-md shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors text-base"
            onClick={onGenerateNew}
          >
            Generate New Questions
          </button>
        </div>
      </div>
    </section>
  );
}
