"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./hooks/useAuth";
import Image from 'next/image';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) return null;
  if (user) return null; // Will redirect

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      {/* Hero Section */}
      <section className="w-full max-w-3xl text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 drop-shadow-lg">
          Ace Your Next Interview with <span className="text-indigo-600">EZY Interview</span>
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          EZY Interview helps you upload your CV, get tailored interview questions, and practice with advanced AI. Trusted by job seekers and professionals worldwide.
        </p>
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-2xl text-xl shadow-lg transition-colors mb-4"
          onClick={() => router.push("/login")}
        >
          Get Started
        </button>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="bg-white/80 rounded-2xl shadow-lg p-8 flex flex-col items-center">
          <span className="text-4xl mb-4">📄</span>
          <h3 className="text-xl font-bold mb-2 text-indigo-700">Upload Your CV</h3>
          <p className="text-gray-600">Easily upload your resume and let EZY Interview's AI analyze your experience and skills.</p>
        </div>
        <div className="bg-white/80 rounded-2xl shadow-lg p-8 flex flex-col items-center">
          <span className="text-4xl mb-4">🤖</span>
          <h3 className="text-xl font-bold mb-2 text-indigo-700">Tailored Questions</h3>
          <p className="text-gray-600">Receive interview questions customized to your background and the job you want, powered by EZY Interview.</p>
        </div>
        <div className="bg-white/80 rounded-2xl shadow-lg p-8 flex flex-col items-center">
          <span className="text-4xl mb-4">📈</span>
          <h3 className="text-xl font-bold mb-2 text-indigo-700">Track Progress</h3>
          <p className="text-gray-600">See your improvement over time and get actionable feedback from EZY Interview's AI.</p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full max-w-4xl mb-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">What Others Say About EZY Interview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center">
            <img src="https://i.pravatar.cc/100?img=12" alt="User" className="w-16 h-16 rounded-full mb-3" />
            <p className="text-gray-700 italic mb-2">“EZY Interview helped me land my dream job! The AI questions were spot on.”</p>
            <span className="font-semibold text-indigo-700">Aylin K.</span>
            <span className="text-gray-400 text-xs">Software Engineer</span>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center">
            <img src="https://i.pravatar.cc/100?img=32" alt="User" className="w-16 h-16 rounded-full mb-3" />
            <p className="text-gray-700 italic mb-2">“I felt so much more confident going into interviews with EZY Interview. Highly recommended!”</p>
            <span className="font-semibold text-indigo-700">James T.</span>
            <span className="text-gray-400 text-xs">Product Manager</span>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center">
            <img src="https://i.pravatar.cc/100?img=45" alt="User" className="w-16 h-16 rounded-full mb-3" />
            <p className="text-gray-700 italic mb-2">“The feedback and analytics from EZY Interview are next level. I recommend it to all my friends.”</p>
            <span className="font-semibold text-indigo-700">Sena D.</span>
            <span className="text-gray-400 text-xs">Data Analyst</span>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full max-w-2xl text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started with EZY Interview?</h2>
        <button
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 px-10 rounded-2xl text-xl shadow-lg transition-colors mr-4"
          onClick={() => router.push("/login")}
        >
          Get Started
        </button>
        <button
          className="bg-white border border-indigo-300 text-indigo-700 font-bold py-4 px-10 rounded-2xl text-xl shadow-lg transition-colors mt-4 md:mt-0"
          onClick={() => router.push("/login")}
        >
          Sign In
        </button>
      </section>
    </div>
  );
}
