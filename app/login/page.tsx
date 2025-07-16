"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../providers/AuthProvider";
import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
  const { user } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  if (user) return null;
  return <LoginForm />;
}
