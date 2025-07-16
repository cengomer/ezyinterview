"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../../providers/AuthProvider";
import Spinner from "../shared/Spinner";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || (!user && typeof window !== "undefined")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!user) return null;
  return <>{children}</>;
} 