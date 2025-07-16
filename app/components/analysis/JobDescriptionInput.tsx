"use client";
import React from 'react';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-2">
        Job Description
      </label>
      <textarea
        className="w-full h-48 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job description here..."
        disabled={disabled}
      />
    </div>
  );
};

export default JobDescriptionInput;
