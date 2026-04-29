"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, Building2, Briefcase, UserPlus, ArrowRight, Sparkles, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [nomentreprise, setNomEntreprise] = useState("");
  const [secteurd_activite, setSecteur] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      setError("Veuillez accepter les conditions d'utilisation");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nomentreprise,
          secteurd_activite,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Erreur lors de l'inscription");
        setIsLoading(false);
        return;
      }

      router.push("/login");

    } catch (error) {
      setError("Erreur de connexion au serveur");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* LEFT SECTION - REGISTER FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-900 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-xl mb-3">
              CB
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Créer un compte
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Commencez votre essai gratuit
            </p>
          </div>

          {/* Desktop title */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Inscription
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Créez votre compte en quelques secondes
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleRegister} className="space-y-5">
            {/* ERROR MESSAGE */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                      Erreur d'inscription
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-0.5">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* COMPANY NAME FIELD */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom de l'entreprise
              </label>
              <div className="group relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  value={nomentreprise}
                  onChange={(e) => setNomEntreprise(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-800 transition-all"
                  placeholder="Ma Super Entreprise"
                />
              </div>
            </div>

            {/* SECTOR FIELD */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Secteur d'activité
              </label>
              <div className="group relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  value={secteurd_activite}
                  onChange={(e) => setSecteur(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-800 transition-all"
                  placeholder="Tech, E-commerce, Service..."
                />
              </div>
            </div>

            {/* EMAIL FIELD */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email professionnel
              </label>
              <div className="group relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-800 transition-all"
                  placeholder="contact@entreprise.com"
                />
              </div>
            </div>

            {/* PASSWORD FIELD */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mot de passe
              </label>
              <div className="group relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-800 transition-all"
                  placeholder="Mot de passe sécurisé"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* PASSWORD REQUIREMENTS */}
            {password && (
              <div className="flex flex-wrap gap-2 text-xs">
                <span className={`px-2 py-1 rounded ${password.length >= 6 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                  ✓ 6+ caractères
                </span>
                <span className={`px-2 py-1 rounded ${/[A-Z]/.test(password) ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                  ✓ Majuscule
                </span>
                <span className={`px-2 py-1 rounded ${/[0-9]/.test(password) ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                  ✓ Chiffre
                </span>
              </div>
            )}

            {/* TERMS AND CONDITIONS */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                J'accepte les{" "}
                <Link href="/terms" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  conditions d'utilisation
                </Link>{" "}
                et la{" "}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  politique de confidentialité
                </Link>
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Création du compte...
                </>
              ) : (
                <>
                  S'inscrire
                  <UserPlus className="w-4 h-4" />
                </>
              )}
            </button>

            {/* DIVIDER */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-900 text-gray-500">
                  Déjà inscrit ?
                </span>
              </div>
            </div>

            {/* LOGIN LINK */}
            <Link 
              href="/login" 
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              Se connecter
              <ArrowRight className="w-4 h-4" />
            </Link>
          </form>

          {/* FEATURES */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Gratuit 14 jours", icon: "🎁" },
                { label: "Sans engagement", icon: "💳" },
                { label: "Support inclus", icon: "🎧" },
              ].map((feature) => (
                <div key={feature.label} className="text-center">
                  <div className="text-lg mb-1">{feature.icon}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{feature.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION - ILLUSTRATION (même que le login) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Animated background patterns */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold text-lg">ChatbotStudio</span>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/80 text-xs">Inscription gratuite</span>
              </div>
              <h2 className="text-4xl font-bold text-white leading-tight">
                Rejoignez l'aventure<br />
                <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                  et boostez votre entreprise
                </span>
              </h2>
              <p className="text-white/70 text-lg">
                Créez votre espace, développez des chatbot intelligents et offrez un service client exceptionnel.
              </p>
            </div>
            
            <div className="space-y-3 pt-8">
              {[
                "Interface intuitive et moderne",
                "Support client 24/7 inclus",
                "Essai gratuit de 14 jours"
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-300" />
                  <span className="text-white/80 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-white/40 text-xs">
            © 2024 ChatbotStudio. Tous droits réservés.
          </div>
        </div>
      </div>
    </div>
  );
}