"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Handle Form Submission (Login or Register)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (isLogin) {
      // 1. LOGIN FLOW: Send credentials directly via NextAuth
      const res = await signIn("credentials", {
        username: username,
        password: password,
        redirect: false,
      });

      setLoading(false);

      if (res?.ok) {
        router.push("/");
        router.refresh();
      } else {
        setErrorMessage("Invalid username or password. Please try again.");
      }
    } else {
      // 2. REGISTER FLOW: Submit to Next.js API route
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match!");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        });

        const data = await res.json();
        setLoading(false);

        if (res.ok) {
          alert("Account registered successfully! Please sign in.");
          setIsLogin(true); // Switch tab to login
          setPassword("");
          setConfirmPassword("");
        } else {
          setErrorMessage(data.error || "Failed to create account.");
        }
      } catch (err) {
        setLoading(false);
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  // Optional: Handle Keycloak Hosted SSO Redirect
  const handleKeycloakSSO = () => {
    signIn("keycloak", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
        
        {/* App Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            SURVEY REALM
          </h1>
          <p className="text-slate-400 text-sm">
            {isLogin
              ? "Sign in to access your dashboard"
              : "Create an account to start taking surveys"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 p-1 rounded-xl mb-6 border border-slate-700">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setErrorMessage("");
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              isLogin
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setErrorMessage("");
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              !isLogin
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert Message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-xs text-center">
            {errorMessage}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition text-sm"
            />
          </div>

          {/* Email Input (Register Only) */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition text-sm"
              />
            </div>
          )}

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition text-sm"
            />
          </div>

          {/* Confirm Password Input (Register Only) */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition text-sm"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-lg disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-800 px-3 text-slate-400">Or continue with</span>
          </div>
        </div>

        {/* Keycloak SSO Redirect Button */}
        <button
          onClick={handleKeycloakSSO}
          type="button"
          className="w-full bg-slate-900 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium py-2.5 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 text-sm"
        >
          Keycloak Hosted SSO
        </button>

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <Link href="/" className="hover:text-blue-400 transition">
            ← Return to Home
          </Link>
        </div>

      </div>
    </div>
  );
}