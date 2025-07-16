"use client";
import Link from "next/link";

export default function NavigationBar() {
  return (
    <nav className="w-full bg-white border-b border-gray-200 text-gray-900 fixed top-0 left-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        <Link href="/" className="flex items-center gap-2 select-none" prefetch={false}>
          {/* Logo SVG or text */}
          <span className="font-bold text-xl tracking-tight text-blue-600">InterviewAI</span>
        </Link>
        <Link href="#get-started" className="ml-4">
          <button className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors text-base">
            Get Started
          </button>
        </Link>
      </div>
    </nav>
  );
}
