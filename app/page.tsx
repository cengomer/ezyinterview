"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "./hooks/useAuth";
import Image from 'next/image';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Prepare for Your</span>
            <span className="block text-blue-600">Dream Job Interview</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Get personalized interview questions based on your CV and job description. Let AI help you prepare for your next big opportunity.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <button
                onClick={() => router.push(user ? "/dashboard" : "/login")}
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            How It Works
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-center text-xl text-gray-500">
            Our AI-powered platform helps you prepare for interviews in three simple steps.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <Image
                src="/file.svg"
                alt="Upload CV"
                width={64}
                height={64}
                className="mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Upload Your CV</h3>
              <p className="text-gray-600">Upload your CV and let our AI analyze it for improvement opportunities.</p>
            </div>
            <div className="text-center">
              <Image
                src="/globe.svg"
                alt="AI Analysis"
                width={64}
                height={64}
                className="mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
              <p className="text-gray-600">Our AI provides detailed feedback and generates tailored interview questions.</p>
            </div>
            <div className="text-center">
              <Image
                src="/window.svg"
                alt="Track Progress"
                width={64}
                height={64}
                className="mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600">Monitor your improvement and practice with our interactive tools.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
