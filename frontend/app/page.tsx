"use client";

import {
  Bot,
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  MessageSquare,
  CheckCircle,
  Star,
  Users,
  Clock,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Vérifier si token existe
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleStart = async () => {
    try {
      const token = localStorage.getItem("token");

      // ❌ Pas connecté → login
      if (!token) {
        router.push("/login");
        return;
      }

      // ✅ Test backend
      const res = await fetch("http://localhost:8000/protected", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      console.log("Backend response:", data);

      if (res.ok) {
        router.push("/dashboard");
      } else {
        console.error("Token invalide");
        localStorage.removeItem("token");
        router.push("/login");
      }
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      title: "Ultra rapide",
      description: "Temps de réponse instantané pour vos chatbots"
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      title: "Sécurisé",
      description: "Authentification JWT et données chiffrées"
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
      title: "Personnalisable",
      description: "Créez des conversations sur mesure"
    },
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Multi-utilisateurs",
      description: "Gérez plusieurs chatbots facilement"
    },
    {
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      title: "Disponible 24/7",
      description: "Service client automatisé jour et nuit"
    },
    {
      icon: <Star className="w-6 h-6 text-blue-600" />,
      title: "IA avancée",
      description: "Modèles de langage à la pointe"
    }
  ];

  const stats = [
    { value: "10k+", label: "Chatbots créés" },
    { value: "98%", label: "Satisfaction client" },
    { value: "24/7", label: "Support disponible" },
    { value: "50+", label: "Intégrations" }
  ];

  return (
    <>
      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-20 max-w-6xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm mb-6 animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>✨ La nouvelle génération de chatbots IA</span>
        </div>

        {/* Main title */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
          Créez des chatbots
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            vraiment intelligents
          </span>
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mb-10">
          Plateforme SaaS puissante avec FastAPI, JWT et Supabase. 
          Créez, entraînez et déployez vos chatbots en quelques minutes.
        </p>

        {/* CTA Button */}
        <button
          onClick={handleStart}
          className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl flex items-center gap-2 hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg font-semibold"
        >
          Commencer gratuitement
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Trust badge */}
        <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-4">
          🔒 Aucune carte de crédit requise • Essai gratuit 14 jours
        </p>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 px-4 bg-white dark:bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
              Fonctionnalités puissantes
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Tout ce dont vous avez besoin pour créer des chatbots exceptionnels
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-zinc-600 dark:text-zinc-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à révolutionner votre service client ?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Rejoignez des milliers d'entreprises qui nous font confiance
            </p>
            <button
              onClick={handleStart}
              className="px-8 py-3 bg-white text-blue-600 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
            >
              Créer mon chatbot gratuitement
            </button>
          </div>
        </div>
      </section>
    </>
  );
}