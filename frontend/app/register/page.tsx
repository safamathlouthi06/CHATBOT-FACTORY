"use client";

import { useState, useEffect } from "react";
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
  Bot,
  Fingerprint,
  Cpu,
  Sparkles,
  TrendingUp,
  Award
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const [nomentreprise, setNomEntreprise] = useState("");
  const [secteurd_activite, setSecteur] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const fullText = "Rejoignez la révolution de l'IA";

  // Effet de texte tapé
  useEffect(() => {
    if (isTyping && typedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 50);
      return () => clearTimeout(timeout);
    } else if (typedText.length === fullText.length) {
      setIsTyping(false);
      setTimeout(() => {
        setTypedText("");
        setIsTyping(true);
      }, 3000);
    }
  }, [typedText, isTyping]);

  // Suivi de la souris pour l'effet parallaxe
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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

  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0A2E2E] via-[#0B3C3C] to-[#062020]">
      
      {/* ============ BACKGROUND 3D INTERACTIF ============ */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grille 3D animée */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(0,128,128,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,128,128,0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          }}
        />
        
        {/* Particules flottantes */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              background: `rgba(0,168,168,${Math.random() * 0.5 + 0.2})`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
        
        {/* Vagues animées */}
        <svg className="absolute bottom-0 left-0 w-full opacity-10" viewBox="0 0 1440 320">
          <path fill="#008080" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,186.7C672,192,768,224,864,229.3C960,235,1056,213,1152,192C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
            <animate attributeName="d" dur="10s" repeatCount="indefinite" values="
              M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,186.7C672,192,768,224,864,229.3C960,235,1056,213,1152,192C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
              M0,160L48,165.3C96,171,192,181,288,192C384,203,480,213,576,208C672,203,768,181,864,176C960,171,1056,181,1152,192C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
              M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,186.7C672,192,768,224,864,229.3C960,235,1056,213,1152,192C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z
            "/>
          </path>
        </svg>
        
        {/* Effet de lueur suivant la souris */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 pointer-events-none transition-all duration-300"
          style={{
            background: 'radial-gradient(circle, #00A8A8 0%, transparent 70%)',
            left: mousePosition.x - 300,
            top: mousePosition.y - 300,
          }}
        />
      </div>

      {/* ============ CONTENU PRINCIPAL ============ */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl">
          
          {/* ============ CARD PRINCIPALE ============ */}
          <div className="relative group">
            {/* Glow effect autour de la carte */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#008080] to-[#00A8A8] rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-500" />
            
            <div className="relative grid lg:grid-cols-2 gap-0 bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              
              {/* ============ LEFT SIDE - BRANDING EXPERIENTIEL ============ */}
              <div className="relative p-8 lg:p-12 flex flex-col justify-between min-h-[700px] overflow-hidden group">
                {/* Background gradient animé */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#008080]/20 via-transparent to-[#00A8A8]/20 animate-gradient" />
                
                {/* Orbites animées */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white/10 rounded-full animate-spin-slow" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border border-white/5 rounded-full animate-spin-slower" />
                
                {/* Logo avec animation */}
                <div>
                  <div className="relative inline-block mb-10">
                    <div className="absolute inset-0 bg-[#008080] blur-2xl opacity-30 rounded-full animate-ping" />
                    <div className="relative flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#008080] to-[#00A8A8] rounded-2xl blur-lg animate-pulse" />
                        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#008080] to-[#00A8A8] flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-all duration-300">
                          <Bot className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      <div>
                        <span className="text-2xl font-bold text-white tracking-tight">
                          Chatbot<span className="text-[#00A8A8]">Studio</span>
                        </span>
                        <div className="flex items-center gap-1 mt-1">
                          <Sparkles className="w-3 h-3 text-[#00A8A8] animate-pulse" />
                          <span className="text-xs text-white/60">AI-powered platform v3.0</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Texte animé */}
                  <div className="space-y-4">
                    <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                      {typedText}
                      <span className="inline-block w-1 h-8 bg-[#00A8A8] ml-1 animate-blink"></span>
                    </h1>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Créez votre compte et commencez à bâtir l'avenir de votre entreprise 
                      avec notre plateforme de chatbots nouvelle génération.
                    </p>
                  </div>
                </div>

                {/* Offre spéciale */}
                <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-[#008080]/20 to-[#00A8A8]/20 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-4 h-4 text-[#00A8A8]" />
                    <span className="text-white text-sm font-semibold">Offre de lancement</span>
                  </div>
                  <p className="text-white/80 text-xs">
                    Inscrivez-vous maintenant et bénéficiez de <span className="text-[#00A8A8] font-bold">14 jours gratuits</span> sur tous nos plans premium !
                  </p>
                </div>

                {/* Features avec hover effets */}
                <div className="space-y-3 mt-6">
                  {[
                    { icon: Zap, text: "Configuration rapide", sub: "Prêt en moins de 5 minutes" },
                    { icon: Shield, text: "Données sécurisées", sub: "Chiffrement de bout en bout" },
                    { icon: TrendingUp, text: "Analytique avancée", sub: "Tableaux de bord en temps réel" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 group/item cursor-pointer">
                      <div className="w-10 h-10 rounded-xl bg-white/10 group-hover/item:bg-[#008080]/20 transition-all flex items-center justify-center group-hover/item:scale-110">
                        <item.icon className="w-5 h-5 text-[#00A8A8]" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium group-hover/item:text-[#00A8A8] transition">
                          {item.text}
                        </p>
                        <p className="text-white/40 text-xs">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Témoignage */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#008080] to-[#00A8A8] flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/70 text-xs italic">
                        "La meilleure décision pour notre service client"
                      </p>
                      <p className="text-white/40 text-xs mt-1">- Sophie Martin, CEO TechCorp</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ============ RIGHT SIDE - FORMULAIRE INTERACTIF ============ */}
              <div className="bg-white dark:bg-zinc-900 p-8 lg:p-12 rounded-3xl lg:rounded-l-3xl lg:rounded-r-none relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#008080]/5 to-transparent rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-[#00A8A8]/5 to-transparent rounded-full blur-2xl" />
                
                <div className="relative max-w-sm mx-auto">
                  {/* Header with animation */}
                  <div className="text-center mb-8 animate-slide-down">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#008080]/10 to-[#00A8A8]/10 border border-[#008080]/20 mb-4">
                      <Fingerprint className="w-3 h-3 text-[#008080]" />
                      <span className="text-xs text-[#008080] font-medium">Inscription sécurisée</span>
                    </div>
                    <h2 className="text-2xl font-bold text-[#0B3C3C] dark:text-white mb-2">
                      Créez votre compte
                    </h2>
                    <p className="text-sm text-[#008080] dark:text-gray-400">
                      Remplissez le formulaire pour commencer
                    </p>
                  </div>

                  {/* Formulaire */}
                  <form onSubmit={handleRegister} className="space-y-4">
                    {error && (
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 animate-shake">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                      </div>
                    )}

                    {/* Champ Nom entreprise */}
                    <div className="space-y-1 group">
                      <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        Nom de l'entreprise
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#008080] group-focus-within:text-[#00A8A8] transition-all group-focus-within:scale-110" />
                        <input
                          type="text"
                          value={nomentreprise}
                          onChange={(e) => setNomEntreprise(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-3 border-2 border-[#D0EAE8] dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all group-focus-within:shadow-lg"
                          placeholder="Votre entreprise"
                        />
                      </div>
                    </div>

                    {/* Champ Secteur */}
                    <div className="space-y-1 group">
                      <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        Secteur d'activité
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#008080] group-focus-within:text-[#00A8A8] transition-all group-focus-within:scale-110" />
                        <input
                          type="text"
                          value={secteurd_activite}
                          onChange={(e) => setSecteur(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-3 border-2 border-[#D0EAE8] dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all"
                          placeholder="Tech, E-commerce, Service..."
                        />
                      </div>
                    </div>

                    {/* Champ Email */}
                    <div className="space-y-1 group">
                      <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#008080] group-focus-within:text-[#00A8A8] transition-all group-focus-within:scale-110" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-3 border-2 border-[#D0EAE8] dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 transition-all"
                          placeholder="votre@email.com"
                        />
                      </div>
                    </div>

                    {/* Champ Password */}
                    <div className="space-y-1 group">
                      <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Mot de passe
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#008080] group-focus-within:text-[#00A8A8] transition-all group-focus-within:scale-110" />
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#008080] hover:text-[#00A8A8] transition-all hover:scale-110"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      {/* Password strength indicator */}
                      {password && (
                        <div className="space-y-2 mt-2">
                          <div className="flex gap-1">
                            {[...Array(4)].map((_, i) => (
                              <div
                                key={i}
                                className="h-1 flex-1 rounded-full transition-all duration-300"
                                style={{
                                  background: passwordStrength > i 
                                    ? 'linear-gradient(90deg, #008080, #00A8A8)'
                                    : '#E5E7EB'
                                }}
                              />
                            ))}
                          </div>
                          <div className="flex gap-2 text-xs">
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
                        </div>
                      )}
                    </div>

                    {/* Terms */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="w-4 h-4 rounded border-[#D0EAE8] text-[#008080] focus:ring-[#008080] cursor-pointer"
                      />
                      <label htmlFor="terms" className="text-xs text-[#0B3C3C] dark:text-gray-400">
                        J'accepte les{" "}
                        <Link href="/terms" className="text-[#008080] hover:text-[#00A8A8] font-medium hover:underline">
                          Conditions
                        </Link>{" "}
                        et la{" "}
                        <Link href="/privacy" className="text-[#008080] hover:text-[#00A8A8] font-medium hover:underline">
                          Politique de confidentialité
                        </Link>
                      </label>
                    </div>

                    {/* Bouton Register */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="relative w-full group/btn overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-2"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#008080] to-[#00A8A8] opacity-100 group-hover/btn:opacity-90 transition" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00A8A8] to-[#008080] opacity-0 group-hover/btn:opacity-100 transition duration-300" />
                      <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-0 w-full h-full bg-white/20 skew-x-12 transition-transform duration-500" />
                      
                      <div className="relative py-3 flex items-center justify-center gap-2 text-white font-semibold">
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Inscription en cours...
                          </>
                        ) : (
                          <>
                            Créer mon compte
                            <Rocket className="w-4 h-4 group-hover/btn:translate-x-1 transition" />
                          </>
                        )}
                      </div>
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#D0EAE8] dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 bg-white dark:bg-zinc-900 text-xs text-[#008080]">
                        Déjà un compte ?
                      </span>
                    </div>
                  </div>

                  {/* Login Link */}
                  <Link 
                    href="/login" 
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[#D0EAE8] dark:border-gray-700 rounded-xl text-[#0B3C3C] dark:text-gray-300 font-medium hover:bg-[#F0FDFC] dark:hover:bg-gray-800 transition-all hover:border-[#008080] hover:scale-105 transform duration-200"
                  >
                    Se connecter
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </Link>

                  {/* Features badges */}
                  <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-[#D0EAE8] dark:border-gray-800">
                    <div className="text-center group/badge">
                      <div className="w-8 h-8 mx-auto bg-[#D9F3F3] dark:bg-[#008080]/20 rounded-lg flex items-center justify-center mb-1 group-hover/badge:scale-110 transition transform">
                        <Gift className="w-4 h-4 text-[#008080]" />
                      </div>
                      <p className="text-xs text-[#008080]">14 jours gratuits</p>
                    </div>
                    <div className="text-center group/badge">
                      <div className="w-8 h-8 mx-auto bg-[#D9F3F3] dark:bg-[#008080]/20 rounded-lg flex items-center justify-center mb-1 group-hover/badge:scale-110 transition transform">
                        <Shield className="w-4 h-4 text-[#008080]" />
                      </div>
                      <p className="text-xs text-[#008080]">Sécurisé</p>
                    </div>
                    <div className="text-center group/badge">
                      <div className="w-8 h-8 mx-auto bg-[#D9F3F3] dark:bg-[#008080]/20 rounded-lg flex items-center justify-center mb-1 group-hover/badge:scale-110 transition transform">
                        <Headphones className="w-4 h-4 text-[#008080]" />
                      </div>
                      <p className="text-xs text-[#008080]">Support 24/7</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-white/30 text-xs">
            <div className="flex items-center justify-center gap-4">
              <span>© 2024 ChatbotStudio</span>
              <span>•</span>
              <span>Sécurisé par encryption AES-256</span>
              <span>•</span>
              <span>Certifié ISO 27001</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============ STYLES CSS PERSONNALISÉS ============ */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          75% { transform: translateY(10px) translateX(-10px); }
        }
        
        @keyframes gradient {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        @keyframes spin-slower {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-gradient {
          animation: gradient 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-spin-slower {
          animation: spin-slower 30s linear infinite;
        }
        
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.5s ease-out;
        }
      `}</style>
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