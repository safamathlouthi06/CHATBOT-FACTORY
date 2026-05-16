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
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg mb-4">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">REGISTER</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">SIGN UP</p>
          </div>

          {/* FORM */}
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={nomentreprise}
                  onChange={(e) => setNomEntreprise(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="Your company name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Industry
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={secteurd_activite}
                  onChange={(e) => setSecteur(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="Tech, E-commerce, Service..."
                />
              </div>
            </div>

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
              {password && (
                <div className="flex gap-2 mt-2 text-xs">
                  <span className={`px-2 py-0.5 rounded ${password.length >= 6 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    ✓ 6+ chars
                  </span>
                  <span className={`px-2 py-0.5 rounded ${/[A-Z]/.test(password) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    ✓ Uppercase
                  </span>
                  <span className={`px-2 py-0.5 rounded ${/[0-9]/.test(password) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    ✓ Number
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
                className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
              />
              <label htmlFor="terms" className="text-xs text-gray-500 dark:text-gray-400">
                I accept the{" "}
                <Link href="/terms" className="text-emerald-600 hover:text-emerald-700">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin" />
                  REGISTER...
                </>
              ) : (
                <>
                  REGISTER
                  <Rocket className="w-4 h-4" />
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
              <span className="px-3 bg-white dark:bg-gray-900 text-gray-400">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <Link 
            href="/login" 
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            SIGN IN
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-1">
                <Gift className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-gray-500">14 days free</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-1">
                <Shield className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-gray-500">Secure</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-1">
                <Headphones className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-gray-500">24/7 Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION - ILLUSTRATION */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 relative">
        {/* Simple background pattern without SVG */}
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
              Create intelligent chatbots
              <span className="block text-emerald-200">in minutes</span>
            </h2>
            
            <p className="text-white/80 text-sm mb-8">
              No code needed. Launch your AI assistant today and provide exceptional customer service 24/7.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-1">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-sm">Intuitive interface</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-1">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-sm">Multiple AI models (GPT-4, Claude, Llama)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-1">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-sm">Advanced analytics & reports</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-1">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-sm">Easy API integrations</span>
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
                    "Customer satisfaction increased by 40%"
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