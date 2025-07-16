"use client";
import Spinner from "./shared/Spinner";

export default function GenerateButton({
  disabled,
  loading,
  error,
  onClick,
  onRetry,
}: {
  disabled: boolean;
  loading: boolean;
  error?: string;
  onClick?: () => void;
  onRetry?: () => void;
}) {
  // TODO: Wire up button logic and error handling
  return (
    <section className="w-full bg-white py-6">
      <div className="max-w-xl mx-auto px-4 flex flex-col items-center">
        {!loading && !error && (
          <button
            className="w-full bg-blue-600 text-white font-semibold px-8 py-3 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
            onClick={onClick}
          >
            Generate Interview Questions
          </button>
        )}
        {loading && (
          <div className="flex flex-col items-center gap-2 w-full">
            <Spinner />
            <span className="text-blue-600 font-medium mt-2">AI is analyzing...</span>
          </div>
        )}
        {error && !loading && (
          <div className="flex flex-col items-center gap-2 w-full">
            <span className="text-red-600 font-medium">{error}</span>
            <button
              className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors text-base"
              onClick={onRetry}
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
