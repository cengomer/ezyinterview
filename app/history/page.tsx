"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { db } from "../firebase/firebaseClient";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import RequireAuth from "../components/auth/RequireAuth";
import Spinner from "../components/analysis/Spinner";
import { useRouter } from "next/navigation";
import AuthenticatedLayout from "../components/AuthenticatedLayout";

interface HistoryItem {
  id: string;
  createdAt: Timestamp;
  jobDescription: string;
  cvName?: string;
  results: {
    Behavioral: Array<{ question: string; answer: string }>;
    Technical: Array<{ question: string; answer: string }>;
    General: Array<{ question: string; answer: string }>;
  };
  title?: string;
}

function ClientDate({ timestamp }: { timestamp: Timestamp }) {
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    setDate(
      new Date(timestamp.toDate()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    );
  }, [timestamp]);

  return <span>{date}</span>;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const historiesRef = collection(db, "histories");
        const q = query(
          historiesRef,
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const historyData: HistoryItem[] = [];
        
        querySnapshot.forEach((doc) => {
          historyData.push({
            id: doc.id,
            ...doc.data()
          } as HistoryItem);
        });
        
        console.log("[HistoryPage] Fetched history:", historyData);
        setHistory(historyData);
      } catch (err: any) {
        console.error("[HistoryPage] Error fetching history:", err);
        setError("Failed to load history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <RequireAuth>
        <div className="max-w-4xl mx-auto py-10 px-4">
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <AuthenticatedLayout>
        <div className="max-w-4xl mx-auto py-10 px-4">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Analysis History</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {history.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No analysis history yet</h3>
              <p className="text-gray-500 mb-4">Generate your first set of interview questions to see them here.</p>
              <a
                href="/analysis"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Start New Analysis
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {history.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.title ? truncateText(item.title, 80) : truncateText(item.jobDescription, 80)}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <ClientDate timestamp={item.createdAt} />
                        {item.cvName && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {item.cvName}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/history/${item.id}`)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      View Details
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-md p-3">
                      <h4 className="font-medium text-blue-900 mb-2">Behavioral</h4>
                      <p className="text-sm text-blue-700">{item.results.Behavioral.length} questions</p>
                    </div>
                    <div className="bg-green-50 rounded-md p-3">
                      <h4 className="font-medium text-green-900 mb-2">Technical</h4>
                      <p className="text-sm text-green-700">{item.results.Technical.length} questions</p>
                    </div>
                    <div className="bg-purple-50 rounded-md p-3">
                      <h4 className="font-medium text-purple-900 mb-2">General</h4>
                      <p className="text-sm text-purple-700">{item.results.General.length} questions</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AuthenticatedLayout>
    </RequireAuth>
  );
} 