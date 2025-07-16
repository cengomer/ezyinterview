"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../providers/AuthProvider";
import RegisterForm from "../components/auth/RegisterForm";

export default function RegisterPage() {
  const { user } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  if (user) return null;
  return <RegisterForm />;
}
