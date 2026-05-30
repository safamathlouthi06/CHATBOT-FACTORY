"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, LogIn, Bot, Sparkles, Zap, Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Email ou mot de passe incorrect");
        return;
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);

      // Stocker le nom de l'entreprise pour la preview email employé
      if (data.role === "entreprise" && data.user?.nomentreprise) {
        localStorage.setItem("nomentreprise", data.user.nomentreprise);
      }

      // Redirection selon le rôle
      if (data.role === "super_admin") {
        router.push("/admin");
      } else if (data.role === "entreprise") {
        router.push("/dashboard");
      } else if (data.role === "employe") {
        router.push("/employe");
      }

    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B3C3C] via-[#0A2E2E] to-[#062020]">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #008080 1.5px, transparent 1.5px)`, backgroundSize: "40px 40px" }} />
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#008080]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00A8A8]/20 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-0 bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10">

            {/* Left — branding */}
            <div className="relative p-8 lg:p-12 flex flex-col justify-between min-h-[500px]">
              <div>
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#008080] to-[#00A8A8] flex items-center justify-center shadow-xl">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-white">Chatbot<span className="text-[#00A8A8]">Studio</span></span>
                    <div className="flex items-center gap-1 mt-1">
                      <Sparkles className="w-3 h-3 text-[#00A8A8]" />
                      <span className="text-xs text-white/60">AI-powered platform</span>
                    </div>
                  </div>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
                  Retournez à<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A8A8] to-[#008080]">
                    votre espace de travail
                  </span>
                </h1>
                <p className="text-white/60 text-sm leading-relaxed">
                  Connectez-vous pour accéder à vos chatbots, analyser les performances et optimiser l'expérience client.
                </p>
              </div>

              <div className="space-y-4 mt-8">
                {[
                  { icon: Zap, title: "Accès instantané", sub: "Connectez-vous en quelques secondes" },
                  { icon: Shield, title: "Sécurité maximale", sub: "Vos données sont protégées" },
                ].map(f => (
                  <div key={f.title} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                      <f.icon className="w-4 h-4 text-[#00A8A8]" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{f.title}</p>
                      <p className="text-white/40 text-xs">{f.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Indication 3 rôles */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-white/40 text-xs mb-2">Accès disponibles :</p>
                <div className="flex gap-2 flex-wrap">
                  {["Super Admin", "Entreprise", "Employé"].map(r => (
                    <span key={r} className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60">{r}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — form */}
            <div className="bg-white dark:bg-zinc-900 p-8 lg:p-12 rounded-3xl lg:rounded-l-3xl lg:rounded-r-none">
              <div className="max-w-sm mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-[#0B3C3C] dark:text-white mb-2">Bienvenue 👋</h2>
                  <p className="text-sm text-[#008080]">Entrez vos identifiants pour continuer</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500">
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300 mb-1">
                      Adresse email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#008080]" />
                      <input
                        type="email" value={email} onChange={e => setEmail(e.target.value)} required
                        className="w-full pl-10 pr-4 py-3 border-2 border-[#D0EAE8] dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all"
                        placeholder="exemple@entreprise.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300 mb-1">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#008080]" />
                      <input
                        type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                        className="w-full pl-10 pr-10 py-3 border-2 border-[#D0EAE8] dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#008080] hover:text-[#00A8A8] transition">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit" disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#008080] to-[#00A8A8] text-white font-semibold py-3 rounded-xl hover:from-[#005F5F] hover:to-[#008080] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Connexion...</>
                    ) : (
                      <>Se connecter <LogIn className="w-4 h-4" /></>
                    )}
                  </button>
                </form>

                <p className="text-center text-sm text-[#008080] dark:text-gray-400 mt-6">
                  Nouveau sur la plateforme ?{" "}
                  <Link href="/register" className="text-[#008080] hover:text-[#00A8A8] font-bold transition">
                    Créer un compte entreprise
                  </Link>
                </p>

                {/* Info employé */}
                <div className="mt-4 p-3 rounded-xl bg-[#D9F3F3] border border-[#B8E0E0]">
                  <p className="text-xs text-[#2F6F6F] text-center">
                    👤 <strong>Employé ?</strong> Utilisez l'email et le mot de passe reçus par email de votre entreprise.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}