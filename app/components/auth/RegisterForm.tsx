"use client";
import { useState } from "react";
import { useAuthContext } from "../../providers/AuthProvider";
import ErrorMessage from "../shared/ErrorMessage";
import Spinner from "../shared/Spinner";
import GoogleSignInButton from "./GoogleSignInButton";

export default function RegisterForm() {
  const { register, signInWithGoogle, loading, error } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters");
      return;
    }
    await register(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Create Account</h2>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Email</label>
        <input
          type="email"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Password</label>
        <input
          type="password"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Confirm Password</label>
        <input
          type="password"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>
      <ErrorMessage message={localError || error} />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md mt-4 hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? <Spinner /> : "Create Account"}
      </button>
      <div className="my-4 flex items-center justify-center">
        <span className="text-gray-400 text-sm">or</span>
      </div>
      <GoogleSignInButton onClick={signInWithGoogle} loading={loading} />
      {/* TODO: Add password strength meter and validation */}
    </form>
  );
}
