"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Building2, 
  Briefcase, 
  ArrowRight, 
  CheckCircle,
  Shield,
  Zap,
  Star,
  Rocket,
  Users,
  MessageSquare,
  Crown,
  Gift,
  AlertCircle,
  Bot
} from "lucide-react";

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
    <div className="min-h-screen flex">
      {/* LEFT SECTION - FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-10 bg-white dark:bg-zinc-900">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-[#008080] to-[#00A8A8] shadow-lg mb-4">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#0B3C3C] dark:text-white">INSCRIPTION</h1>
            <p className="text-sm text-[#008080] dark:text-gray-400 mt-1">CRÉEZ VOTRE COMPTE</p>
          </div>

          {/* FORM */}
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300 mb-1">
                Nom de l'entreprise
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#008080]" />
                <input
                  type="text"
                  value={nomentreprise}
                  onChange={(e) => setNomEntreprise(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-[#D0EAE8] dark:border-gray-700 rounded-lg bg-[#F0FDFC] dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent transition"
                  placeholder="Nom de votre entreprise"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300 mb-1">
                Secteur d'activité
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#008080]" />
                <input
                  type="text"
                  value={secteurd_activite}
                  onChange={(e) => setSecteur(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-[#D0EAE8] dark:border-gray-700 rounded-lg bg-[#F0FDFC] dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent transition"
                  placeholder="Tech, E-commerce, Service, ..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#008080]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-[#D0EAE8] dark:border-gray-700 rounded-lg bg-[#F0FDFC] dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent transition"
                  placeholder="votre@email.com"
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 border border-[#D0EAE8] dark:border-gray-700 rounded-lg bg-[#F0FDFC] dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#008080] hover:text-[#00A8A8]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="flex gap-2 mt-2 text-xs">
                  <span className={`px-2 py-0.5 rounded ${password.length >= 6 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    ✓ 6+ caractères
                  </span>
                  <span className={`px-2 py-0.5 rounded ${/[A-Z]/.test(password) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    ✓ Majuscule
                  </span>
                  <span className={`px-2 py-0.5 rounded ${/[0-9]/.test(password) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    ✓ Chiffre
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 rounded border-[#D0EAE8] text-[#008080] focus:ring-[#008080]"
              />
              <label htmlFor="terms" className="text-xs text-[#0B3C3C] dark:text-gray-400">
                J'accepte les{" "}
                <Link href="/terms" className="text-[#008080] hover:text-[#00A8A8] font-medium">
                  Conditions d'utilisation
                </Link>{" "}
                et la{" "}
                <Link href="/privacy" className="text-[#008080] hover:text-[#00A8A8] font-medium">
                  Politique de confidentialité
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#008080] to-[#00A8A8] text-white font-semibold py-2.5 rounded-lg hover:from-[#005F5F] hover:to-[#008080] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  INSCRIPTION...
                </>
              ) : (
                <>
                  S'INSCRIRE
                  <Rocket className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#D0EAE8] dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white dark:bg-zinc-900 text-[#008080]">Déjà un compte ?</span>
            </div>
          </div>

          {/* Login Link */}
          <Link 
            href="/login" 
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#D0EAE8] dark:border-gray-700 rounded-lg text-[#0B3C3C] dark:text-gray-300 font-medium hover:bg-[#F0FDFC] dark:hover:bg-gray-800 transition"
          >
            SE CONNECTER
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-[#D0EAE8] dark:border-gray-800">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto bg-[#D9F3F3] dark:bg-[#008080]/20 rounded-lg flex items-center justify-center mb-1">
                <Gift className="w-4 h-4 text-[#008080]" />
              </div>
              <p className="text-xs text-[#008080]">14 jours gratuits</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 mx-auto bg-[#D9F3F3] dark:bg-[#008080]/20 rounded-lg flex items-center justify-center mb-1">
                <Shield className="w-4 h-4 text-[#008080]" />
              </div>
              <p className="text-xs text-[#008080]">Sécurisé</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 mx-auto bg-[#D9F3F3] dark:bg-[#008080]/20 rounded-lg flex items-center justify-center mb-1">
                <Headphones className="w-4 h-4 text-[#008080]" />
              </div>
              <p className="text-xs text-[#008080]">Support 24/7</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION - ILLUSTRATION INSOMEA STYLE */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-[#008080] via-[#00A8A8] to-[#0B3C3C] relative">
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-white/5" />
        
        {/* Animated elements */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-center h-full p-12 text-white">
          <div className="max-w-md mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 mb-6">
              <Bot className="w-4 h-4" />
              <span className="text-xs">10 000+ entreprises nous font confiance</span>
            </div>
            
            <h2 className="text-3xl font-bold mb-4">
              Créez des chatbots intelligents
              <span className="block text-[#D0EAE8] mt-2">en quelques minutes</span>
            </h2>
            
            <p className="text-white/80 text-sm mb-8">
              Pas de code requis. Lancez votre assistant IA dès aujourd'hui et offrez un service client exceptionnel 24h/24 et 7j/7.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-1">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-sm">Interface intuitive</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-1">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-sm">Multiples modèles IA (GPT-4, Claude, Llama)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-1">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-sm">Analytique avancée et rapports</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-1">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-sm">Intégrations API faciles</span>
              </div>
            </div>

            {/* Testimonial */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="font-bold text-sm">SM</span>
                </div>
                <div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white/70 text-xs mt-1">
                    "La satisfaction client a augmenté de 40%"
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/20">
              <div className="text-center">
                <div className="text-xl font-bold">99.9%</div>
                <div className="text-xs text-white/70">Disponibilité</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">24/7</div>
                <div className="text-xs text-white/70">Support</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">500k+</div>
                <div className="text-xs text-white/70">Conversations/mois</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant Headphones
function Headphones(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12h3a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7Z" />
      <path d="M21 12h-3a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-7Z" />
      <path d="M9 12V7a3 3 0 0 1 6 0v5" />
    </svg>
  );
}