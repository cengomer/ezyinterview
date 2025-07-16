"use client";
import Spinner from "./Spinner";

export default function GenerateQuestionsButton({
  disabled,
  loading,
  onClick,
}: {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <div className="mb-6">
      <button
        className="w-full bg-blue-600 text-white font-semibold px-8 py-3 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled}
        onClick={onClick}
      >
        {loading ? <Spinner /> : "Generate Interview Questions"}
      </button>
    </div>
  );
}
