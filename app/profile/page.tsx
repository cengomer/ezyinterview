"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import CVUpload from "../components/analysis/CVUpload";
import ErrorMessage from "../components/analysis/ErrorMessage";
import Spinner from "../components/analysis/Spinner";
import { saveCVProfile, getCVProfile, CVProfile } from "../../utils/saveCVProfile";
import RequireAuth from "../components/auth/RequireAuth";
import { FirebaseError } from "firebase/app";

export default function ProfilePage() {
  const { user } = useAuth();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [extractedCVText, setExtractedCVText] = useState<string>("");
  const [cvSummary, setCvSummary] = useState<string>("");
  const [savedCVProfile, setSavedCVProfile] = useState<CVProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadCVProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      const profile = await getCVProfile(user);
      setSavedCVProfile(profile);
    } catch (err) {
      console.error("Failed to load CV profile:", err);
    }
  }, [user]);

  // Load existing CV profile on component mount
  useEffect(() => {
    if (user) {
      loadCVProfile();
    }
  }, [user, loadCVProfile]);

  const handleCVUpload = async (file: File | null) => {
    if (!file) {
      setCvFile(null);
      setExtractedCVText("");
      setCvSummary("");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract-cv", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to extract text from CV.");
        setCvFile(null);
        setExtractedCVText("");
        setCvSummary("");
      } else {
        setCvFile(file);
        setExtractedCVText(data.text);
        setCvSummary("");
        setError(null);
      }
    } catch (err: unknown) {
      console.error("CV upload error:", err);
      setError("Something went wrong - please refresh and try again.");
      setCvFile(null);
      setExtractedCVText("");
      setCvSummary("");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!extractedCVText) {
      setError("No CV text to summarize.");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/summarize-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvText: extractedCVText,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to generate summary.");
      } else {
        setCvSummary(data.summary);
        setError(null);
      }
    } catch (err: unknown) {
      console.error("Summary generation error:", err);
      setError("Something went wrong - please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCVProfile = async () => {
    if (!user || !cvFile || !extractedCVText || !cvSummary) {
      setError("Please complete CV upload and summarization first.");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await saveCVProfile({
        user,
        extractedText: extractedCVText,
        summary: cvSummary,
        fileName: cvFile.name,
        fileSize: cvFile.size,
      });
      
      setSuccess("CV profile saved successfully! You can now use this for generating interview questions.");
      await loadCVProfile(); // Reload the saved profile
    } catch (err: unknown) {
      console.error("Save CV profile error:", err);
      if (err instanceof FirebaseError) {
        setError(`Failed to save CV profile: ${err.message}`);
      } else {
        setError("Failed to save CV profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCVProfile = async () => {
    if (!user) return;
    
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      // Clear the CV profile by setting it to null
      const { saveCVProfile } = await import("../../utils/saveCVProfile");
      await saveCVProfile({
        user,
        extractedText: "",
        summary: "",
        fileName: "",
        fileSize: 0,
      });
      
      setSavedCVProfile(null);
      setCvFile(null);
      setExtractedCVText("");
      setCvSummary("");
      setSuccess("CV profile deleted successfully.");
    } catch (err: unknown) {
      console.error("Delete CV profile error:", err);
      if (err instanceof FirebaseError) {
        setError(`Failed to delete CV profile: ${err.message}`);
      } else {
        setError("Failed to delete CV profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth>
      <AuthenticatedLayout>
        <div className="max-w-4xl mx-auto py-10 px-4">
          <h1 className="text-3xl font-bold mb-8 text-gray-900">Profile</h1>
          
          {/* CV Profile Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">CV Profile</h2>
            
            {savedCVProfile ? (
              /* Show existing CV profile */
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">✅ CV Profile Active</h3>
                  <p className="text-sm text-green-700">
                    File: {savedCVProfile.fileName} ({(savedCVProfile.fileSize / 1024 / 1024).toFixed(2)} MB)
                  </p>
                  <p className="text-sm text-green-700">
                    Last updated: {savedCVProfile.updatedAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">CV Summary:</h4>
                  <div className="text-sm text-gray-600 max-h-32 overflow-y-auto whitespace-pre-line">
                    {savedCVProfile.summary}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteCVProfile}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? "Deleting..." : "Delete CV Profile"}
                  </button>
                  <p className="text-sm text-gray-600 self-center">
                    You can now go to &quot;New Analysis&quot; to generate questions using this CV.
                  </p>
                </div>
              </div>
            ) : (
              /* CV Upload and Processing */
              <div className="space-y-6">
                <p className="text-gray-600">
                  Upload your CV to create a profile that will be used for generating interview questions. 
                  This only needs to be done once.
                </p>
                
                <CVUpload 
                  file={cvFile} 
                  setFile={handleCVUpload} 
                  error={error} 
                  setError={setError} 
                />
                
                {extractedCVText && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Extracted CV Text:</h4>
                    <div className="text-sm text-gray-600 max-h-32 overflow-y-auto border rounded p-3 bg-white">
                      {extractedCVText}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Text length: {extractedCVText.length} characters
                    </div>
                  </div>
                )}
                
                {extractedCVText && !cvSummary && (
                  <button
                    onClick={handleGenerateSummary}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? "Generating Summary..." : "Generate CV Summary"}
                  </button>
                )}
                
                {cvSummary && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">CV Summary:</h4>
                      <div className="text-sm text-gray-600 max-h-32 overflow-y-auto border rounded p-3 bg-white whitespace-pre-line">
                        {cvSummary}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Summary length: {cvSummary.length} characters
                      </div>
                    </div>
                    
                    <button
                      onClick={handleSaveCVProfile}
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {loading ? "Saving..." : "Save CV Profile"}
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <ErrorMessage message={error} />
            {success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">{success}</p>
              </div>
            )}
            {loading && <Spinner />}
          </div>
        </div>
      </AuthenticatedLayout>
    </RequireAuth>
  );
}
