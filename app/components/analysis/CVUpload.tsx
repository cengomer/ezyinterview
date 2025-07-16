"use client";
import React, { useRef } from "react";
import ErrorMessage from "../shared/ErrorMessage";

export default function CVUpload({
  file,
  setFile,
  error,
  setError,
}: {
  file: File | null;
  setFile: (file: File | null) => void;
  error: string | null;
  setError: (err: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      setError("Only PDF files are accepted.");
      setFile(null);
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError("File too large (max 5MB).");
      setFile(null);
      return;
    }
    setFile(selected);
  };

  // TODO: Implement drag-and-drop logic

  return (
    <section className="mb-6">
      <label className="block text-gray-800 font-semibold mb-2">Upload your CV (PDF only, max 5MB)</label>
      <div
        className="border-2 border-dashed border-blue-400 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
        onClick={() => inputRef.current?.click()}
        // TODO: Add drag-and-drop event handlers
      >
        <svg className="w-10 h-10 text-blue-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span className="text-blue-600 font-medium">Drag & drop your PDF here, or click to select</span>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {file && (
        <div className="mt-3 text-sm text-gray-700">
          <span className="font-medium">Selected:</span> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </div>
      )}
      <ErrorMessage message={error} />
    </section>
  );
}
