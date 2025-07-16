"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "../../firebase/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import Spinner from "../../components/analysis/Spinner";
import ErrorMessage from "../../components/analysis/ErrorMessage";

export default function HistoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, "histories", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHistory(docSnap.data());
        } else {
          setError("History not found.");
        }
      } catch (err) {
        setError("Failed to load history details.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!history) return null;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-2 text-gray-900">
        {history.title ? history.title : (history.jobDescription?.split("\n")[0] || "Analysis Details")}
      </h1>
      <div className="mb-4 text-gray-500 text-sm">
        Analysis Details
      </div>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">Job Description</h2>
        <div className="text-sm text-gray-700 whitespace-pre-line">
          {history.jobDescription}
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">Questions & Answers</h2>
        {['Behavioral', 'Technical', 'General'].map((cat) => (
          <div key={cat} className="mb-4">
            <h3 className="font-medium text-blue-700 mb-2">{cat} Questions</h3>
            <ul className="space-y-2">
              {history.results?.[cat]?.map((qa: any, idx: number) => (
                <li key={idx} className="bg-white border rounded p-3">
                  <div className="font-semibold text-gray-900 mb-1">Q: {qa.question}</div>
                  <div className="text-gray-700">A: {qa.answer}</div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <button
        onClick={() => router.back()}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Back
      </button>
    </div>
  );
} 