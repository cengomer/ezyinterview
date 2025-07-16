"use client";
import { ReactNode } from "react";
import { AuthProvider } from "../providers/AuthProvider";

export default function ClientRoot({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <main className="flex-1 pt-0 min-h-screen bg-white">
        {children}
      </main>
    </AuthProvider>
  );
} 