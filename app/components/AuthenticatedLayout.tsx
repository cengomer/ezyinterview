"use client";
import { ReactNode } from "react";
import Sidebar from "./sidebar/Sidebar";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-16 md:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[calc(100vh-3rem)]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
} 