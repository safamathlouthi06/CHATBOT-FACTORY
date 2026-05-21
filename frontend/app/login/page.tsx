"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, LogIn, ArrowRight, Bot, Sparkles, Zap, Shield } from "lucide-react";

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background unique avec motifs géométriques */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B3C3C] via-[#0A2E2E] to-[#062020]">
        {/* Motif de grille stylisée */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #008080 1.5px, transparent 1.5px)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Formes organiques flottantes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#008080]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00A8A8]/20 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#008080]/5 rounded-full blur-3xl" />
        
        {/* Lignes décoratives */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#008080]/30 to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#00A8A8]/30 to-transparent" />
      </div>

      {/* Floating elements */}
      <div className="absolute top-1/4 left-[15%] w-2 h-2 bg-[#00A8A8] rounded-full animate-ping" style={{ animationDuration: '3s' }} />
      <div className="absolute bottom-1/3 right-[20%] w-3 h-3 bg-[#008080] rounded-full animate-ping" style={{ animationDuration: '4s' }} />
      <div className="absolute top-2/3 left-[10%] w-1.5 h-1.5 bg-[#00A8A8] rounded-full animate-pulse" style={{ animationDuration: '2s' }} />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-0 bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10">
            
            {/* LEFT SIDE - BRANDING UNIQUE */}
            <div className="relative p-8 lg:p-12 flex flex-col justify-between min-h-[500px] lg:min-h-[600px]">
              {/* Content */}
              <div>
                {/* Logo avec effet unique */}
                <div className="relative inline-block mb-10">
                  <div className="absolute inset-0 bg-[#008080] blur-xl opacity-50 rounded-full"></div>
                  <div className="relative flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#008080] to-[#00A8A8] flex items-center justify-center shadow-xl transform rotate-3 group-hover:rotate-6 transition">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-white tracking-tight">
                        Chatbot<span className="text-[#00A8A8]">Studio</span>
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        <Sparkles className="w-3 h-3 text-[#00A8A8]" />
                        <span className="text-xs text-white/60">AI-powered platform</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Welcome message unique */}
                <div className="space-y-4">
                  <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                    Retournez à
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00A8A8] to-[#008080]">
                      votre espace de travail
                    </span>
                  </h1>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Connectez-vous pour accéder à vos chatbots, analyser les performances 
                    et optimiser l'expérience client.
                  </p>
                </div>
              </div>

              {/* Features list avec design unique */}
              <div className="space-y-4 mt-8">
                <div className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-xl bg-white/10 group-hover:bg-[#008080]/20 transition flex items-center justify-center">
                    <Zap className="w-4 h-4 text-[#00A8A8]" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Accès instantané</p>
                    <p className="text-white/40 text-xs">Connectez-vous en quelques secondes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-xl bg-white/10 group-hover:bg-[#008080]/20 transition flex items-center justify-center">
                    <Shield className="w-4 h-4 text-[#00A8A8]" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Sécurité maximale</p>
                    <p className="text-white/40 text-xs">Vos données sont protégées</p>
                  </div>
                </div>
              </div>

              {/* Citation inspirante */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-white/40 text-xs italic">
                  "L'IA au service de votre entreprise, simplement et efficacement."
                </p>
              </div>
            </div>

            {/* RIGHT SIDE - LOGIN FORM UNIQUE */}
            <div className="bg-white dark:bg-zinc-900 p-8 lg:p-12 rounded-3xl lg:rounded-l-3xl lg:rounded-r-none">
              <div className="max-w-sm mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-[#0B3C3C] dark:text-white mb-2">
                    Bienvenue 👋
                  </h2>
                  <p className="text-sm text-[#008080] dark:text-gray-400">
                    Remplissez vos identifiants pour continuer
                  </p>
                </div>

                {/* FORM */}
                <form onSubmit={handleLogin} className="space-y-5">
                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500">
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300">
                      Adresse email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#008080] group-focus-within:text-[#00A8A8] transition" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 border-2 border-[#D0EAE8] dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all"
                        placeholder="exemple@entreprise.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300">
                      Mot de passe
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#008080] group-focus-within:text-[#00A8A8] transition" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-10 py-3 border-2 border-[#D0EAE8] dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#008080] hover:text-[#00A8A8] transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-[#D0EAE8] text-[#008080] focus:ring-[#008080] cursor-pointer"
                      />
                      <span className="text-sm text-[#0B3C3C] dark:text-gray-400">Se souvenir</span>
                    </label>
                    <Link 
                      href="/forgot-password" 
                      className="text-sm text-[#008080] hover:text-[#00A8A8] transition font-medium"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#008080] to-[#00A8A8] text-white font-semibold py-3 rounded-xl hover:from-[#005F5F] hover:to-[#008080] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      <>
                        Se connecter
                        <LogIn className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider avec style unique */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#D0EAE8] dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-4 bg-white dark:bg-zinc-900 text-[#008080]">Ou via</span>
                  </div>
                </div>

                {/* Social buttons simplifiés */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 py-2.5 border-2 border-[#D0EAE8] dark:border-gray-700 rounded-xl text-[#0B3C3C] dark:text-gray-300 font-medium hover:bg-[#F0FDFC] dark:hover:bg-gray-800 transition-all hover:border-[#008080]">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="text-sm">Google</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2.5 border-2 border-[#D0EAE8] dark:border-gray-700 rounded-xl text-[#0B3C3C] dark:text-gray-300 font-medium hover:bg-[#F0FDFC] dark:hover:bg-gray-800 transition-all hover:border-[#008080]">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span className="text-sm">GitHub</span>
                  </button>
                </div>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-[#008080] dark:text-gray-400 mt-6">
                  Nouveau sur la plateforme ?{" "}
                  <Link href="/register" className="text-[#008080] hover:text-[#00A8A8] font-bold transition">
                    Créer un compte
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}