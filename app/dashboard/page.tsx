"use client";
import { useAuth } from "../hooks/useAuth";
import RequireAuth from "../components/auth/RequireAuth";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebaseClient";
import { collection, query, where, orderBy, getDocs, Timestamp, getDoc, doc as firestoreDoc } from "firebase/firestore";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [analysisCount, setAnalysisCount] = useState<number>(0);
  const [lastAnalysisDate, setLastAnalysisDate] = useState<string>("");
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [cvProfile, setCvProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const historiesRef = collection(db, "histories");
        const q = query(
          historiesRef,
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        setAnalysisCount(querySnapshot.size);
        const recent: any[] = [];
        Array.from(querySnapshot.docs).slice(0, 5).forEach((doc) => {
          recent.push({ id: doc.id, ...doc.data() });
        });
        setRecentAnalyses(recent);
        if (!querySnapshot.empty) {
          const last = querySnapshot.docs[0].data();
          const ts: Timestamp = last.createdAt;
          setLastAnalysisDate(new Date(ts.toDate()).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }));
        } else {
          setLastAnalysisDate("");
        }
      } catch (err) {
        setAnalysisCount(0);
        setLastAnalysisDate("");
        setRecentAnalyses([]);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const userDocRef = firestoreDoc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().cvProfile) {
          setCvProfile(userDoc.data().cvProfile);
        } else {
          setCvProfile(null);
        }
      } catch (err) {
        setCvProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [user]);

  // Prepare data for charts
  const analysesByDay: Record<string, number> = {};
  const categoryCounts = { Behavioral: 0, Technical: 0, General: 0 };
  recentAnalyses.forEach((item) => {
    // Line chart: group by day
    if (item.createdAt?.toDate) {
      const day = new Date(item.createdAt.toDate()).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      analysesByDay[day] = (analysesByDay[day] || 0) + 1;
    }
    // Pie chart: count questions by category
    if (item.results) {
      categoryCounts.Behavioral += item.results.Behavioral?.length || 0;
      categoryCounts.Technical += item.results.Technical?.length || 0;
      categoryCounts.General += item.results.General?.length || 0;
    }
  });
  const lineData = {
    labels: Object.keys(analysesByDay),
    datasets: [
      {
        label: "Analyses",
        data: Object.values(analysesByDay),
        fill: false,
        borderColor: "#2563eb",
        backgroundColor: "#60a5fa",
        tension: 0.3,
      },
    ],
  };
  const pieData = {
    labels: ["Behavioral", "Technical", "General"],
    datasets: [
      {
        data: [categoryCounts.Behavioral, categoryCounts.Technical, categoryCounts.General],
        backgroundColor: ["#2563eb", "#22c55e", "#a21caf"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <RequireAuth>
      <AuthenticatedLayout>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-1 tracking-tight">Dashboard</h1>
            <p className="text-lg text-gray-700 font-medium">
              Welcome{user?.displayName ? `, ${user.displayName}` : user?.email ? `, ${user.email}` : ""}!
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/analysis"
              className="px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow"
            >
              📝 Start New Analysis
            </a>
            <a
              href="/profile"
              className="px-5 py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition border border-gray-300 shadow"
            >
              👤 Go to Profile
            </a>
          </div>
        </div>

        {/* Profile Completion Prompt */}
        {loadingProfile ? null : !cvProfile && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-yellow-800 text-sm font-medium flex items-center gap-2 mb-8">
            <span className="text-xl">⚠️</span>
            <span>You have not uploaded a CV profile yet. <a href="/profile" className="underline hover:text-yellow-900">Upload your CV</a> to unlock full features.</span>
          </div>
        )}

        {/* Stats & Plan Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {/* Analyses Stat */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow p-6 flex flex-col items-center justify-center min-h-[140px] border border-blue-100">
            <span className="text-3xl text-blue-600 mb-2">📊</span>
            <div className="text-2xl font-bold text-blue-900">{loadingStats ? "-" : analysisCount}</div>
            <div className="text-sm text-blue-700">Analyses</div>
          </div>
          {/* Last Analysis Stat */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow p-6 flex flex-col items-center justify-center min-h-[140px] border border-green-100">
            <span className="text-3xl text-green-600 mb-2">⏰</span>
            <div className="text-lg font-bold text-green-900">{loadingStats ? "-" : lastAnalysisDate || "N/A"}</div>
            <div className="text-sm text-green-700">Last Analysis</div>
          </div>
          {/* Plan Widget */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow p-6 flex flex-col items-center justify-center min-h-[140px] border border-purple-100 col-span-1 md:col-span-2">
            <span className="text-3xl text-purple-600 mb-2">💎</span>
            <div className="text-lg font-bold text-purple-900 mb-1">Current Plan: <span className="font-semibold">Free</span></div>
            <div className="text-sm text-purple-700 mb-2">Upgrade to Pro for unlimited analyses and priority support!</div>
            <a
              href="#"
              className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition text-sm shadow"
            >
              Upgrade Plan
            </a>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100 flex flex-col items-center min-h-[320px]">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Analyses Over Time</h2>
            <div className="w-full h-64 flex items-center justify-center">
              {Object.keys(analysesByDay).length === 0 ? (
                <span className="text-gray-400">No data yet</span>
              ) : (
                <Line data={lineData} options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                }} />
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100 flex flex-col items-center min-h-[320px]">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Category Breakdown</h2>
            <div className="w-full h-64 flex items-center justify-center">
              {(categoryCounts.Behavioral + categoryCounts.Technical + categoryCounts.General) === 0 ? (
                <span className="text-gray-400">No data yet</span>
              ) : (
                <Pie data={pieData} options={{
                  responsive: true,
                  plugins: { legend: { position: "bottom" } },
                }} />
              )}
            </div>
          </div>
        </div>

        {/* Recent Analyses Section */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Analyses</h2>
          {loadingStats ? (
            <div className="text-gray-500">Loading...</div>
          ) : recentAnalyses.length === 0 ? (
            <div className="text-gray-500">No analyses yet. Start your first analysis!</div>
          ) : (
            <div className="space-y-4">
              {recentAnalyses.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {item.title ? item.title : (item.jobDescription?.split("\n")[0] || "Analysis")}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      }) : ""}
                    </div>
                  </div>
                  <a
                    href={`/history/${item.id}`}
                    className="mt-3 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium shadow"
                  >
                    View Details
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </AuthenticatedLayout>
    </RequireAuth>
  );
}
