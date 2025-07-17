"use client";
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { CVProfile, AnalysisResults } from '../types';
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import JobDescriptionInput from "../components/analysis/JobDescriptionInput";
import ResultsDisplay from "../components/analysis/ResultsDisplay";
import ErrorMessage from "../components/analysis/ErrorMessage";
import Spinner from "../components/analysis/Spinner";
import { saveHistory } from "../../utils/saveHistory";
import RequireAuth from "../components/auth/RequireAuth";

export default function AnalysisPage() {
  const { user } = useAuth();
  
  const [cvProfile, setCvProfile] = useState<CVProfile | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [title, setTitle] = useState("");

  const loadCVProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const response = await fetch('/api/get-cv-profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setCvProfile(data.cvProfile);
      } else {
        setError(data.error || 'Failed to load CV profile');
      }
    } catch (error) {
      console.error('CV Profile loading error:', error);
      setError('Failed to load CV profile');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCVProfile();
  }, [loadCVProfile]);

  const handleGenerate = async () => {
    if (!cvProfile || !jobDescription.trim()) {
      setError('Please provide both CV and job description');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Sending request to generate questions...');
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cv: cvProfile.extractedText,
          jobDescription,
          title,
        }),
      });

      const data = await response.json();
      console.log('Received response:', data);

      if (data.success) {
        const results = data.data.results;
        setResults(results);
        
        // Save to history after successful generation
        try {
          await saveHistory({
            jobDescription,
            cvContent: cvProfile.extractedText,
            results: results,
            title: title.trim() || jobDescription.split("\n")[0].slice(0, 80),
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          // Log error but don't affect user experience
          console.error('Error saving to history:', error);
        }
      } else {
        console.error('Failed to generate questions:', data.error);
        throw new Error(data.error || 'Failed to generate questions. Please try again.');
      }
    } catch (error) {
      console.error('Question generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth>
      <AuthenticatedLayout>
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Interview Question Generator</h1>
          
          {error && <ErrorMessage message={error} />}
          
          {/* CV Profile Display */}
          {cvProfile && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">Active CV Profile</h2>
              <div className="text-sm text-blue-700">
                <p>File: {cvProfile.fileName}</p>
                <p>Size: {(cvProfile.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                <p className="mt-2 text-blue-600">
                  Questions will be generated based on this CV. You can update your CV in the Profile section.
                </p>
              </div>
            </div>
          )}
          
          <div className="space-y-6">
            <JobDescriptionInput
              value={jobDescription}
              onChange={setJobDescription}
              disabled={loading}
            />
            
            <input
              type="text"
              placeholder="Optional: Give this analysis a title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={loading}
            />
            
            <button
              onClick={handleGenerate}
              disabled={loading || !cvProfile}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Spinner /> : 'Generate Questions'}
            </button>
          </div>

          {results && <ResultsDisplay results={results} />}
        </div>
      </AuthenticatedLayout>
    </RequireAuth>
  );
}
