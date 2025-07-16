"use client";
import { useRef, useState } from "react";
import ErrorMessage from "./shared/ErrorMessage";

export default function FileUpload({ onFileSelected }: { onFileSelected?: (file: File | null) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Basic file validation
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    
    if (selectedFile) {
      // Basic validation
      if (!selectedFile.type.includes('pdf')) {
        setError('Please select a PDF file');
        setFile(null);
        onFileSelected?.(null);
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        setFile(null);
        onFileSelected?.(null);
        return;
      }

      setError('');
      setFile(selectedFile);
      onFileSelected?.(selectedFile);
    }
  };

  // TODO: Implement drag-and-drop logic, file validation, and error handling

  return (
    <section className="w-full bg-white py-6" id="get-started">
      <div className="max-w-xl mx-auto px-4">
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
        {error && <ErrorMessage message={error} />}
      </div>
    </section>
  );
}
