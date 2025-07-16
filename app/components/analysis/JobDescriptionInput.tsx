"use client";
import React from "react";

export default function JobDescriptionInput({
  value,
  setValue,
  error,
  setError,
}: {
  value: string;
  setValue: (v: string) => void;
  error: string | null;
  setError: (err: string | null) => void;
}) {
  const minChars = 100;
  const maxChars = 5000;

  // TODO: Add validation and error handling

  return (
    <section className="mb-6">
      <label className="block text-gray-800 font-semibold mb-2">Paste the complete job description here</label>
      <textarea
        className="w-full min-h-[120px] rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 text-gray-900 bg-white resize-none text-base placeholder-gray-400"
        placeholder="Paste the complete job description here..."
        value={value}
        maxLength={maxChars}
        onChange={e => setValue(e.target.value)}
      />
      <div className="flex items-center justify-between mt-2 text-sm">
        <span className={
          value.length < minChars
            ? "text-red-500"
            : "text-green-600"
        }>
          {value.length} / {minChars} characters
        </span>
        <span className="text-gray-400">Max {maxChars}</span>
      </div>
    </section>
  );
}
