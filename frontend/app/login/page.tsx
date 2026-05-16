"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, LogIn, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Email ou mot de passe incorrect");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);

      if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }

    } catch (error) {
      setError("Erreur de connexion au serveur");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SECTION - LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-10 bg-white dark:bg-zinc-900">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">LOGIN</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">SIGN IN</p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <Link 
                href="/forgot-password" 
                className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin" />
                  LOGIN...
                </>
              ) : (
                <>
                  LOGIN
                  <LogIn className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white dark:bg-gray-900 text-gray-400">Or Login With</span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT SECTION - ILLUSTRATION */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 relative">
        {/* Simple background pattern */}
        <div className="absolute inset-0 bg-white/5" />
        
        {/* Animated elements */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse delay-1000" />
        
        <div className="relative z-10 flex flex-col justify-center h-full p-12 text-white">
          <div className="max-w-md mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 mb-6">
              <span className="text-xs">10,000+ companies</span>
            </div>
            
            <h2 className="text-3xl font-bold mb-4">
              Welcome back!
              <span className="block text-emerald-200">Great to see you again</span>
            </h2>
            
            <p className="text-white/80 text-sm mb-8">
              Access your dashboard and continue building amazing AI chatbots for your business.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm">Manage multiple chatbots</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm">Advanced analytics dashboard</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm">Real-time conversation tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm">24/7 AI-powered support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}