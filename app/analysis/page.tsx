"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import JobDescriptionInput from "../components/analysis/JobDescriptionInput";
import GenerateQuestionsButton from "../components/analysis/GenerateQuestionsButton";
import ResultsDisplay from "../components/analysis/ResultsDisplay";
import ErrorMessage from "../components/analysis/ErrorMessage";
import Spinner from "../components/analysis/Spinner";
import { saveHistory } from "../../utils/saveHistory";
import { useRouter } from "next/navigation";
import RequireAuth from "../components/auth/RequireAuth";

interface CVProfile {
  summary: string;
  fileName: string;
  updatedAt: any;
}

export default function AnalysisPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cvProfile, setCvProfile] = useState<CVProfile | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [title, setTitle] = useState("");

  // Load CV profile on component mount
  useEffect(() => {
    if (user) {
      loadCVProfile();
    }
  }, [user]);

  const loadCVProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/get-cv-profile", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      
      if (data.success) {
        setCvProfile(data.cvProfile);
        setError(null);
      } else {
        setCvProfile(null);
        setError(data.error);
      }
    } catch (err: any) {
      console.error("Failed to load CV profile:", err);
      setCvProfile(null);
      setError("Failed to load CV profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!cvProfile) {
      setError("CV profile is required. Please upload your CV in the Profile section first.");
      return;
    }
    if (jobDescription.length < 100) {
      setError("Job description must be at least 100 characters.");
      return;
    }
    if (!user) {
      setError("Please log in to generate questions.");
      return;
    }
    
    setError(null);
    setResults(null);
    setLoading(true);
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvSummary: cvProfile.summary,
          jobDescription: jobDescription,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Something went wrong.");
        setResults(null);
      } else {
        setResults(data.questions);
        
        // Save to history after successful generation
        try {
          await saveHistory({
            user,
            jobDescription,
            cvName: cvProfile.fileName,
            results: data.questions,
            title: title.trim() || jobDescription.split("\n")[0].slice(0, 80),
          });
          console.log("History saved successfully");
        } catch (historyError) {
          console.error("Failed to save history:", historyError);
          // Don't show error to user as the main functionality still works
        }
      }
    } catch (err: any) {
      setError("Something went wrong - please refresh and try again.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToProfile = () => {
    router.push("/profile");
  };

  if (loading && !cvProfile) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!cvProfile) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">New Analysis</h1>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-yellow-600 text-4xl mb-4">📄</div>
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">CV Profile Required</h2>
          <p className="text-yellow-700 mb-4">
            You need to upload and set up your CV profile before you can generate interview questions.
          </p>
          <button
            onClick={handleGoToProfile}
            className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 font-medium"
          >
            Go to Profile & Upload CV
          </button>
        </div>
        
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <RequireAuth>
      <AuthenticatedLayout>
        <div className="max-w-2xl mx-auto py-10 px-4">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">New Analysis</h1>
          
          {/* CV Profile Info */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 mb-2">✅ Using Saved CV Profile</h3>
            <p className="text-sm text-green-700">
              File: {cvProfile.fileName}
            </p>
            <p className="text-sm text-green-700">
              Last updated: {cvProfile.updatedAt?.toDate?.()?.toLocaleDateString() || "Recently"}
            </p>
            <button
              onClick={handleGoToProfile}
              className="mt-2 text-sm text-green-600 hover:text-green-800 underline"
            >
              Update CV Profile
            </button>
          </div>

          {/* CV Summary Preview */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">CV Summary:</h3>
            <div className="text-sm text-gray-600 max-h-32 overflow-y-auto border rounded p-3 bg-white whitespace-pre-line">
              {cvProfile.summary}
            </div>
          </div>

          {/* Title Input */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Analysis Title (optional)</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. iOS Developer at Sarte Industries"
              maxLength={80}
            />
            <p className="text-xs text-gray-500 mt-1">If left blank, the first line of the job description will be used.</p>
          </div>

          {/* Job Description Input */}
          <JobDescriptionInput 
            value={jobDescription} 
            setValue={setJobDescription} 
            error={error} 
            setError={setError} 
          />
          <ErrorMessage message={error} />
          <GenerateQuestionsButton
            disabled={jobDescription.length < 100 || loading || !user}
            loading={loading}
            onClick={handleGenerate}
          />
          {loading && (
            <div className="mt-4 text-center">
              <Spinner />
              <p className="text-sm text-gray-600 mt-2">
                Generating interview questions... This may take 1-2 minutes.
              </p>
            </div>
          )}
          {results && <ResultsDisplay results={results} />}
        </div>
      </AuthenticatedLayout>
    </RequireAuth>
  );
}
