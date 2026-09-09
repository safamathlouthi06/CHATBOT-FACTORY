"use client";

import {
  useEffect,
  useState,
} from "react";

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
  Shield,
  Zap,
  Rocket,
  Gift,
  Bot,
  Fingerprint,
  Sparkles,
  TrendingUp,
  Award,
  MapPin,
  Globe,
  Headphones,
} from "lucide-react";

import { API_URL } from "@/services/api";

import PhoneNumberField, {
  isPhoneNumberValid,
} from "@/components/PhoneNumberField";

/* =========================================================
   REGISTER PAGE
========================================================= */

export default function RegisterPage() {
  const router = useRouter();

  /* =========================================================
     ANIMATIONS
  ========================================================= */

  const [mousePosition, setMousePosition] =
    useState({
      x: 0,
      y: 0,
    });

  const [typedText, setTypedText] =
    useState("");

  const [isTyping, setIsTyping] =
    useState(true);

  const [particles, setParticles] =
    useState<
      {
        left: number;
        top: number;
        size: number;
        opacity: number;
        delay: number;
        duration: number;
      }[]
    >([]);

  /* =========================================================
     FORMULAIRE
  ========================================================= */

  const [
    nomentreprise,
    setNomEntreprise,
  ] = useState("");

  const [
    secteurd_activite,
    setSecteur,
  ] = useState("");

  const [tel, setTel] =
    useState("");

  const [adresse, setAdresse] =
    useState("");

  const [site_web, setSiteWeb] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [acceptTerms, setAcceptTerms] =
    useState(false);

  const fullText =
    "Rejoignez la révolution de l'IA";

  /* =========================================================
     TEXTE ANIMÉ
  ========================================================= */

  useEffect(() => {
    if (
      isTyping &&
      typedText.length < fullText.length
    ) {
      const timeout = setTimeout(() => {
        setTypedText(
          fullText.slice(
            0,
            typedText.length + 1
          )
        );
      }, 50);

      return () =>
        clearTimeout(timeout);
    }

    if (
      typedText.length ===
      fullText.length
    ) {
      setIsTyping(false);

      const timeout = setTimeout(() => {
        setTypedText("");
        setIsTyping(true);
      }, 3000);

      return () =>
        clearTimeout(timeout);
    }
  }, [
    typedText,
    isTyping,
    fullText,
  ]);

  /* =========================================================
     PARTICULES
  ========================================================= */

  useEffect(() => {
    const generatedParticles =
      Array.from(
        { length: 50 },
        () => ({
          left: Math.random() * 100,
          top: Math.random() * 100,
          size:
            Math.random() * 4 + 1,
          opacity:
            Math.random() * 0.5 + 0.2,
          delay:
            Math.random() * 5,
          duration:
            Math.random() * 3 + 2,
        })
      );

    setParticles(
      generatedParticles
    );
  }, []);

  /* =========================================================
     SOURIS
  ========================================================= */

  useEffect(() => {
    const handleMouseMove = (
      e: MouseEvent
    ) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );
    };
  }, []);

  /* =========================================================
     FORCE PASSWORD
  ========================================================= */

  const getPasswordStrength =
    () => {
      let strength = 0;

      if (password.length >= 6) {
        strength++;
      }

      if (/[A-Z]/.test(password)) {
        strength++;
      }

      if (/[0-9]/.test(password)) {
        strength++;
      }

      if (
        /[^A-Za-z0-9]/.test(password)
      ) {
        strength++;
      }

      return strength;
    };

  const passwordStrength =
    getPasswordStrength();

  /* =========================================================
     REGISTER
  ========================================================= */

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    /* =====================================================
       CONDITIONS
    ===================================================== */

    if (!acceptTerms) {
      setError(
        "Veuillez accepter les conditions d'utilisation."
      );

      return;
    }

    /* =====================================================
       PASSWORD
    ===================================================== */

    if (password.length < 6) {
      setError(
        "Le mot de passe doit contenir au moins 6 caractères."
      );

      return;
    }

    /* =====================================================
       TELEPHONE
    ===================================================== */

    if (
      tel.trim() &&
      !isPhoneNumberValid(tel)
    ) {
      setError(
        "Le numéro de téléphone est invalide."
      );

      return;
    }

    /* =====================================================
       LOADING
    ===================================================== */

    setIsLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/register`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            nomentreprise:
              nomentreprise.trim(),

            secteurd_activite:
              secteurd_activite.trim(),

            email:
              email.trim(),

            password,

            tel:
              tel.trim() || null,

            adresse:
              adresse.trim() || null,

            site_web:
              site_web.trim() || null,
          }),
        }
      );

      let data: any = null;

      try {
        data = await res.json();
      } catch {
        data = null;
      }

      console.log(
        "REGISTER STATUS :",
        res.status
      );

      console.log(
        "REGISTER RESPONSE :",
        data
      );

      /* ===================================================
         ERREUR BACKEND
      =================================================== */

      if (!res.ok) {
        if (
          Array.isArray(data?.detail)
        ) {
          const fieldNames: Record<
            string,
            string
          > = {
            nomentreprise:
              "Nom de l'entreprise",

            secteurd_activite:
              "Secteur d'activité",

            email: "Email",

            password:
              "Mot de passe",

            tel: "Téléphone",

            adresse: "Adresse",

            site_web:
              "Site web",
          };

          const messages =
            data.detail
              .map(
                (validationError: any) => {
                  const field =
                    validationError?.loc?.[
                      validationError.loc
                        .length - 1
                    ];

                  const fieldName =
                    fieldNames[field] ||
                    field ||
                    "Champ";

                  return `${fieldName}: ${
                    validationError?.msg ||
                    "Valeur invalide"
                  }`;
                }
              )
              .join(" | ");

          setError(
            messages ||
              "Erreur de validation."
          );
        } else if (
          typeof data?.detail ===
          "string"
        ) {
          setError(data.detail);
        } else if (
          typeof data?.message ===
          "string"
        ) {
          setError(data.message);
        } else {
          setError(
            "Erreur lors de l'inscription."
          );
        }

        setIsLoading(false);

        return;
      }

      /* ===================================================
         SUCCÈS
      =================================================== */

      console.log(
        "INSCRIPTION RÉUSSIE :",
        data
      );

      router.push("/login");
    } catch (err) {
      console.error(
        "ERREUR REGISTER :",
        err
      );

      setError(
        "Impossible de contacter le serveur. Vérifiez que votre backend est démarré."
      );

      setIsLoading(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0A2E2E] via-[#0B3C3C] to-[#062020]">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="absolute inset-0 overflow-hidden">

        {/* GRILLE */}

        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(
                rgba(0,128,128,0.3) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(0,128,128,0.3) 1px,
                transparent 1px
              )
            `,

            backgroundSize: "50px 50px",

            transform: `
              translate(
                ${mousePosition.x * 0.02}px,
                ${mousePosition.y * 0.02}px
              )
            `,
          }}
        />

        {/* PARTICULES */}

        {particles.map(
          (particle, index) => (
            <div
              key={index}
              className="absolute rounded-full animate-float"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: `rgba(0,168,168,${particle.opacity})`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            />
          )
        )}

        {/* GLOW */}

        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 pointer-events-none transition-all duration-300"
          style={{
            background:
              "radial-gradient(circle, #00A8A8 0%, transparent 70%)",

            left:
              mousePosition.x - 300,

            top:
              mousePosition.y - 300,
          }}
        />
      </div>

      {/* =====================================================
          CONTENU
      ===================================================== */}

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">

        <div className="w-full max-w-6xl">

          {/* CARD */}

          <div className="relative group">

            <div className="absolute -inset-1 bg-gradient-to-r from-[#008080] to-[#00A8A8] rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-500" />

            <div className="relative grid lg:grid-cols-2 gap-0 bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl">

              {/* =================================================
                  LEFT
              ================================================== */}

              <div className="relative p-8 lg:p-12 flex flex-col justify-between min-h-[800px] overflow-hidden">

                <div className="absolute inset-0 bg-gradient-to-br from-[#008080]/20 via-transparent to-[#00A8A8]/20 animate-gradient" />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white/10 rounded-full animate-spin-slow" />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border border-white/5 rounded-full animate-spin-slower" />

                <div className="relative z-10">

                  {/* LOGO */}

                  <div className="relative inline-block mb-10">

                    <div className="relative flex items-center gap-3">

                      <div className="relative">

                        <div className="absolute inset-0 bg-gradient-to-r from-[#008080] to-[#00A8A8] rounded-2xl blur-lg animate-pulse" />

                        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#008080] to-[#00A8A8] flex items-center justify-center shadow-2xl transform rotate-3">
                          <Bot className="w-7 h-7 text-white" />
                        </div>

                      </div>

                      <div>

                        <span className="text-2xl font-bold text-white tracking-tight">
                          Chatbot
                          <span className="text-[#00A8A8]">
                            Studio
                          </span>
                        </span>

                        <div className="flex items-center gap-1 mt-1">

                          <Sparkles className="w-3 h-3 text-[#00A8A8]" />

                          <span className="text-xs text-white/60">
                            AI-powered platform
                            v3.0
                          </span>

                        </div>

                      </div>

                    </div>
                  </div>

                  {/* TEXTE */}

                  <div className="space-y-4">

                    <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">

                      {typedText}

                      <span className="inline-block w-1 h-8 bg-[#00A8A8] ml-1 animate-blink" />

                    </h1>

                    <p className="text-white/60 text-sm leading-relaxed">
                      Créez votre compte et
                      commencez à bâtir
                      l'avenir de votre
                      entreprise avec notre
                      plateforme de chatbots
                      nouvelle génération.
                    </p>

                  </div>

                </div>

                {/* OFFRE */}

                <div className="relative z-10 mt-8 p-4 rounded-xl bg-gradient-to-r from-[#008080]/20 to-[#00A8A8]/20 backdrop-blur-sm border border-white/10">

                  <div className="flex items-center gap-2 mb-2">

                    <Gift className="w-4 h-4 text-[#00A8A8]" />

                    <span className="text-white text-sm font-semibold">
                      Offre de lancement
                    </span>

                  </div>

                  <p className="text-white/80 text-xs">
                    Inscrivez-vous maintenant
                    et bénéficiez de{" "}
                    <span className="text-[#00A8A8] font-bold">
                      14 jours gratuits
                    </span>{" "}
                    sur tous nos plans
                    premium !
                  </p>

                </div>

                {/* FEATURES */}

                <div className="relative z-10 space-y-3 mt-6">

                  {[
                    {
                      icon: Zap,
                      text: "Configuration rapide",
                      sub: "Prêt en moins de 5 minutes",
                    },
                    {
                      icon: Shield,
                      text: "Données sécurisées",
                      sub: "Chiffrement de bout en bout",
                    },
                    {
                      icon: TrendingUp,
                      text: "Analytique avancée",
                      sub: "Tableaux de bord en temps réel",
                    },
                  ].map(
                    (item, index) => {
                      const Icon =
                        item.icon;

                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3"
                        >

                          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-[#00A8A8]" />
                          </div>

                          <div>

                            <p className="text-white text-sm font-medium">
                              {item.text}
                            </p>

                            <p className="text-white/40 text-xs">
                              {item.sub}
                            </p>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

                {/* TEMOIGNAGE */}

                <div className="relative z-10 mt-8 pt-6 border-t border-white/10">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#008080] to-[#00A8A8] flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>

                    <div>

                      <p className="text-white/70 text-xs italic">
                        "La meilleure décision pour notre service client"
                      </p>

                      <p className="text-white/40 text-xs mt-1">
                        - Sophie Martin, CEO TechCorp
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  RIGHT
              ================================================== */}

              <div className="bg-white dark:bg-zinc-900 p-8 lg:p-12 rounded-3xl lg:rounded-l-3xl lg:rounded-r-none relative">

                <div className="relative max-w-sm mx-auto">

                  {/* HEADER */}

                  <div className="text-center mb-8">

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#008080]/10 to-[#00A8A8]/10 border border-[#008080]/20 mb-4">

                      <Fingerprint className="w-3 h-3 text-[#008080]" />

                      <span className="text-xs text-[#008080] font-medium">
                        Inscription sécurisée
                      </span>

                    </div>

                    <h2 className="text-2xl font-bold text-[#0B3C3C] dark:text-white mb-2">
                      Créez votre compte
                    </h2>

                    <p className="text-sm text-[#008080] dark:text-gray-400">
                      Remplissez le formulaire pour commencer
                    </p>

                  </div>

                  {/* FORM */}

                  <form
                    onSubmit={
                      handleRegister
                    }
                    className="space-y-4"
                  >

                    {/* ERREUR */}

                    {error && (
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500">

                        <p className="text-sm text-red-600 dark:text-red-400">
                          {error}
                        </p>

                      </div>
                    )}

                    {/* NOM ENTREPRISE */}

                    <div className="space-y-1">

                      <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300">
                        Nom de l'entreprise
                      </label>

                      <div className="relative">

                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#008080]" />

                        <input
                          type="text"
                          value={
                            nomentreprise
                          }
                          onChange={(e) =>
                            setNomEntreprise(
                              e.target.value
                            )
                          }
                          required
                          className="w-full pl-10 pr-4 py-3 border-2 border-[#D0EAE8] dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20"
                          placeholder="Votre entreprise"
                        />

                      </div>

                    </div>

                    {/* SECTEUR */}

                    <div className="space-y-1">

                      <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300">
                        Secteur d'activité
                      </label>

                      <div className="relative">

                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#008080]" />

                        <input
                          type="text"
                          value={
                            secteurd_activite
                          }
                          onChange={(e) =>
                            setSecteur(
                              e.target.value
                            )
                          }
                          required
                          className="w-full pl-10 pr-4 py-3 border-2 border-[#D0EAE8] dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20"
                          placeholder="Tech, E-commerce, Service..."
                        />

                      </div>

                    </div>

                    {/* TELEPHONE */}

                    <PhoneNumberField
                      value={tel}
                      onChange={setTel}
                      label="Téléphone"
                      required={true}
                      showValidationHint={true}
                    />

                    {/* ADRESSE */}

                    <div className="space-y-1">

                      <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300">
                        Adresse{" "}
                        <span className="text-xs text-gray-400">
                          
                        </span>
                      </label>

                      <div className="relative">

                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#008080]" />

                        <input
                          type="text"
                          value={adresse}
                          onChange={(e) =>
                            setAdresse(
                              e.target.value
                            )
                          }
                          className="w-full pl-10 pr-4 py-3 border-2 border-[#D0EAE8] dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#008080]"
                          placeholder="Adresse de l'entreprise"
                        />

                      </div>

                    </div>

                    {/* SITE WEB */}

                    <div className="space-y-1">

                      <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300">
                        Site web{" "}
                        <span className="text-xs text-gray-400">
                         
                        </span>
                      </label>

                      <div className="relative">

                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#008080]" />

                        <input
                          type="url"
                          value={site_web}
                          onChange={(e) =>
                            setSiteWeb(
                              e.target.value
                            )
                          }
                          className="w-full pl-10 pr-4 py-3 border-2 border-[#D0EAE8] dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#008080]"
                          placeholder="https://www.exemple.com"
                        />

                      </div>

                    </div>

                    {/* EMAIL */}

                    <div className="space-y-1">

                      <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300">
                        Email
                      </label>

                      <div className="relative">

                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#008080]" />

                        <input
                          type="email"
                          value={email}
                          onChange={(e) =>
                            setEmail(
                              e.target.value
                            )
                          }
                          required
                          className="w-full pl-10 pr-4 py-3 border-2 border-[#D0EAE8] dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#008080]"
                          placeholder="votre@email.com"
                        />

                      </div>

                    </div>

                    {/* PASSWORD */}

                    <div className="space-y-1">

                      <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300">
                        Mot de passe
                      </label>

                      <div className="relative">

                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#008080]" />

                        <input
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          value={password}
                          onChange={(e) =>
                            setPassword(
                              e.target.value
                            )
                          }
                          required
                          minLength={6}
                          className="w-full pl-10 pr-10 py-3 border-2 border-[#D0EAE8] dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#008080]"
                          placeholder="••••••••"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (previous) =>
                                !previous
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#008080]"
                          aria-label={
                            showPassword
                              ? "Masquer le mot de passe"
                              : "Afficher le mot de passe"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>

                      </div>

                      {/* FORCE PASSWORD */}

                      {password && (
                        <div className="space-y-2 mt-2">

                          <div className="flex gap-1">

                            {[
                              0,
                              1,
                              2,
                              3,
                            ].map(
                              (index) => (
                                <div
                                  key={
                                    index
                                  }
                                  className="h-1 flex-1 rounded-full"
                                  style={{
                                    background:
                                      passwordStrength >
                                      index
                                        ? "linear-gradient(90deg, #008080, #00A8A8)"
                                        : "#E5E7EB",
                                  }}
                                />
                              )
                            )}

                          </div>

                          <div className="flex flex-wrap gap-2 text-xs">

                            <span
                              className={`px-2 py-0.5 rounded ${
                                password.length >=
                                6
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              ✓ 6+ caractères
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded ${
                                /[A-Z]/.test(
                                  password
                                )
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              ✓ Majuscule
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded ${
                                /[0-9]/.test(
                                  password
                                )
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              ✓ Chiffre
                            </span>

                          </div>

                        </div>
                      )}

                    </div>

                    {/* CONDITIONS */}

                    <div className="flex items-start gap-2">

                      <input
                        type="checkbox"
                        id="terms"
                        checked={
                          acceptTerms
                        }
                        onChange={(e) =>
                          setAcceptTerms(
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 mt-0.5 rounded border-[#D0EAE8] text-[#008080]"
                      />

                      <label
                        htmlFor="terms"
                        className="text-xs text-[#0B3C3C] dark:text-gray-400"
                      >
                        J'accepte les{" "}

                        <Link
                          href="/terms"
                          className="text-[#008080] font-medium hover:underline"
                        >
                          Conditions
                        </Link>

                        {" "}et la{" "}

                        <Link
                          href="/privacy"
                          className="text-[#008080] font-medium hover:underline"
                        >
                          Politique de confidentialité
                        </Link>

                      </label>

                    </div>

                    {/* BOUTON */}

                    <button
                      type="submit"
                      disabled={
                        isLoading
                      }
                      className="relative w-full overflow-hidden rounded-xl shadow-lg transition-all duration-300 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >

                      <div className="absolute inset-0 bg-gradient-to-r from-[#008080] to-[#00A8A8]" />

                      <div className="relative py-3 flex items-center justify-center gap-2 text-white font-semibold">

                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />

                            Inscription
                            en cours...
                          </>
                        ) : (
                          <>
                            Créer mon compte

                            <Rocket className="w-4 h-4" />
                          </>
                        )}

                      </div>

                    </button>

                  </form>

                  {/* LOGIN */}

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

                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[#D0EAE8] dark:border-gray-700 rounded-xl text-[#0B3C3C] dark:text-gray-300 font-medium hover:bg-[#F0FDFC] transition-all"
                  >
                    Se connecter

                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {/* BADGES */}

                  <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-[#D0EAE8] dark:border-gray-800">

                    <div className="text-center">

                      <div className="w-8 h-8 mx-auto bg-[#D9F3F3] rounded-lg flex items-center justify-center mb-1">
                        <Gift className="w-4 h-4 text-[#008080]" />
                      </div>

                      <p className="text-xs text-[#008080]">
                        14 jours gratuits
                      </p>

                    </div>

                    <div className="text-center">

                      <div className="w-8 h-8 mx-auto bg-[#D9F3F3] rounded-lg flex items-center justify-center mb-1">
                        <Shield className="w-4 h-4 text-[#008080]" />
                      </div>

                      <p className="text-xs text-[#008080]">
                        Sécurisé
                      </p>

                    </div>

                    <div className="text-center">

                      <div className="w-8 h-8 mx-auto bg-[#D9F3F3] rounded-lg flex items-center justify-center mb-1">
                        <Headphones className="w-4 h-4 text-[#008080]" />
                      </div>

                      <p className="text-xs text-[#008080]">
                        Support 24/7
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* FOOTER */}

          <div className="text-center mt-8 text-white/30 text-xs">

            <div className="flex items-center justify-center gap-4 flex-wrap">

              <span>
                © 2024 Chatbot Factory
              </span>

              <span>•</span>

              <span>
                Sécurisé par encryption AES-256
              </span>

              <span>•</span>

              <span>
                Certifié ISO 27001
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          CSS
      ====================================================== */}

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform:
              translateY(0px)
              translateX(0px);
          }

          25% {
            transform:
              translateY(-20px)
              translateX(10px);
          }

          75% {
            transform:
              translateY(10px)
              translateX(-10px);
          }
        }

        @keyframes gradient {
          0%,
          100% {
            opacity: 0.5;
          }

          50% {
            opacity: 1;
          }
        }

        @keyframes spin-slow {
          from {
            transform:
              translate(-50%, -50%)
              rotate(0deg);
          }

          to {
            transform:
              translate(-50%, -50%)
              rotate(360deg);
          }
        }

        @keyframes spin-slower {
          from {
            transform:
              translate(-50%, -50%)
              rotate(360deg);
          }

          to {
            transform:
              translate(-50%, -50%)
              rotate(0deg);
          }
        }

        @keyframes blink {
          0%,
          50% {
            opacity: 1;
          }

          51%,
          100% {
            opacity: 0;
          }
        }

        .animate-float {
          animation:
            float 3s ease-in-out infinite;
        }

        .animate-gradient {
          animation:
            gradient 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation:
            spin-slow 20s linear infinite;
        }

        .animate-spin-slower {
          animation:
            spin-slower 30s linear infinite;
        }

        .animate-blink {
          animation:
            blink 1s step-end infinite;
        }
      `}</style>

    </div>
  );
}