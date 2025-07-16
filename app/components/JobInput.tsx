"use client";
import { useState } from "react";
import ErrorMessage from "./shared/ErrorMessage";

export default function JobInput({ onJobDescriptionChange }: { onJobDescriptionChange?: (desc: string) => void }) {
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState("");
  const minChars = 100;
  const maxChars = 5000;

  // TODO: Implement onChange logic, validation, and error handling

  return (
    <section className="w-full bg-white py-6">
      <div className="max-w-xl mx-auto px-4">
        <label className="block text-gray-800 font-semibold mb-2">Paste the complete job description here</label>
        <textarea
          className="w-full min-h-[120px] rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 text-gray-900 bg-white resize-none text-base placeholder-gray-400"
          placeholder="Paste the complete job description here..."
          value={jobDescription}
          maxLength={maxChars}
          onChange={e => {
            const newValue = e.target.value;
            setJobDescription(newValue);
            if (onJobDescriptionChange) onJobDescriptionChange(newValue);
            
            // Basic validation
            if (newValue.length < minChars) {
              setError(`Please enter at least ${minChars} characters`);
            } else if (newValue.length > maxChars) {
              setError(`Please enter no more than ${maxChars} characters`);
            } else {
              setError("");
            }
          }}
        />
        <div className="flex items-center justify-between mt-2 text-sm">
          <span className={
            jobDescription.length < minChars
              ? "text-red-500"
              : "text-green-600"
          }>
            {jobDescription.length} / {minChars} characters
          </span>
          <span className="text-gray-400">Max {maxChars}</span>
        </div>
        {error && <ErrorMessage message={error} />}
      </div>
    </section>
  );
}
