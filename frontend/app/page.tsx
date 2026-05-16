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
  Leaf,
  Award,
  BarChart3,
  Cloud,
  Cpu,
  Heart,
  Globe,
  Lock,
  Infinity,
  Gift,
  Play,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("http://localhost:8000/protected", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        localStorage.removeItem("token");
        router.push("/login");
      }
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Ultra rapide",
      description: "Temps de réponse < 100ms pour vos chatbots",
      gradient: "from-[#005F5F] to-[#00A8A8]",
      stat: "99.9% uptime",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Sécurité renforcée",
      description: "Authentification JWT et chiffrement AES-256",
      gradient: "from-[#008080] to-[#00A8A8]",
      stat: "ISO 27001 certifié",
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Personnalisation IA",
      description: "Entraînez votre modèle avec vos données",
      gradient: "from-[#005F5F] to-[#00A8A8]",
      stat: "+45% d'engagement",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Gestion multi-agents",
      description: "Jusqu'à 50 chatbots par compte",
      gradient: "from-[#008080] to-[#00A8A8]",
      stat: "Équipes illimitées",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Disponibilité 24/7",
      description: "Support client automatisé jour et nuit",
      gradient: "from-[#005F5F] to-[#00A8A8]",
      stat: "-70% tickets support",
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "IA de pointe",
      description: "GPT-4, Claude, Llama 3 intégrés",
      gradient: "from-[#008080] to-[#00A8A8]",
      stat: "50+ modèles IA",
    },
  ];

  const stats = [
    {
      value: "10k+",
      label: "Chatbots créés",
      icon: Bot,
    },
    {
      value: "98%",
      label: "Satisfaction client",
      icon: Heart,
    },
    {
      value: "24/7",
      label: "Support disponible",
      icon: Clock,
    },
    {
      value: "50+",
      label: "Intégrations",
      icon: Cloud,
    },
  ];

  const testimonials = [
    {
      name: "Sophie Martin",
      role: "Directrice Customer Success",
      company: "TechCorp",
      avatar: "SM",
      content:
        "Grâce à INSOMEA, nous avons réduit nos délais de réponse de 85%.",
      rating: 5,
    },
    {
      name: "Thomas Bernard",
      role: "CTO",
      company: "InnovateAI",
      avatar: "TB",
      content:
        "Une plateforme ultra propre, rapide et moderne. L'intégration est fluide.",
      rating: 5,
    },
    {
      name: "Julie Dubois",
      role: "Head of Product",
      company: "EcoSolutions",
      avatar: "JD",
      content:
        "Nos conversions ont explosé grâce aux agents IA intelligents.",
      rating: 5,
    },
  ];

  const partners = [
    "Google",
    "Microsoft",
    "Amazon",
    "Slack",
    "Zoom",
    "Notion",
  ];

  return (
    <>
      <section id="hero" className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#008080]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00A8A8]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#005F5F]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#D9F3F3] text-[#008080] px-4 py-2 rounded-full text-sm mb-6 border border-[#B8E0E0]">
            <Sparkles className="w-4 h-4" />
            <span>Plateforme IA nouvelle génération</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            <span className="bg-gradient-to-r from-[#005F5F] via-[#008080] to-[#00A8A8] bg-clip-text text-transparent">
              Réinventez votre
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#00A8A8] to-[#005F5F] bg-clip-text text-transparent">
              expérience client IA
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-[#2F6F6F] mb-10">
            Créez des agents IA intelligents en quelques minutes avec une interface moderne, rapide et scalable.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <button
              onClick={handleStart}
              className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-[#005F5F] to-[#00A8A8] text-white font-semibold flex items-center gap-2 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-[#008080]/30"
            >
              Commencer gratuitement
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="group px-8 py-4 rounded-2xl border-2 border-[#008080] text-[#008080] hover:bg-[#008080] hover:text-white transition-all duration-300 flex items-center gap-2 font-semibold">
              <Play className="w-5 h-5" />
              Voir la démo
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-[#008080]">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Sans carte bancaire
            </span>

            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Sécurisé AES-256
            </span>

            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Essai gratuit 14 jours
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-10 border-t border-[#B8E0E0]">
            {[
              {
                value: "10k+",
                label: "Clients actifs",
              },
              {
                value: "50M+",
                label: "Messages/mois",
              },
              {
                value: "99.9%",
                label: "Uptime",
              },
              {
                value: "4.9/5",
                label: "Avis clients",
              },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold text-[#0B3C3C]">
                  {stat.value}
                </div>
                <div className="text-sm text-[#00A8A8]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-[#D9F3F3]/40">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm tracking-widest text-[#00A8A8] mb-8">
            ILS NOUS FONT CONFIANCE
          </p>

          <div className="flex flex-wrap justify-center gap-8 opacity-70">
            {partners.map((partner, index) => (
              <span
                key={index}
                className="text-lg font-semibold text-[#0B3C3C]"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#D9F3F3] text-[#008080] px-4 py-2 rounded-full text-sm mb-6">
              <Leaf className="w-4 h-4" />
              Fonctionnalités premium
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-[#0B3C3C] mb-4">
              Une stack IA complète
            </h2>

            <p className="text-[#2F6F6F] max-w-2xl mx-auto text-lg">
              Pensé pour les startups, les scale-ups et les entreprises modernes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="group p-6 bg-white rounded-3xl border border-[#B8E0E0] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div
                  className={`p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} w-fit mb-5 shadow-lg`}
                >
                  <div className="text-white">{feature.icon}</div>
                </div>

                <h3 className="text-2xl font-bold text-[#0B3C3C] mb-3">
                  {feature.title}
                </h3>

                <p className="text-[#2F6F6F] mb-4">
                  {feature.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs bg-[#D9F3F3] text-[#008080] px-3 py-1 rounded-full font-medium">
                    {feature.stat}
                  </span>

                  {hoveredFeature === index && (
                    <ChevronRight className="w-5 h-5 text-[#008080]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-[#005F5F] to-[#00A8A8] rounded-[32px] p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 text-center mb-12">
              <h3 className="text-4xl font-bold mb-3">
                L'IA au service de votre croissance
              </h3>

              <p className="text-white/80 text-lg">
                Des performances réelles. Pas juste du marketing.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
              {stats.map((stat, index) => {
                const Icon = stat.icon;

                return (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 rounded-2xl bg-white/20">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="text-4xl font-black mb-2">
                      {stat.value}
                    </div>

                    <div className="text-white/80">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-[#D9F3F3]/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#D9F3F3] text-[#008080] px-4 py-2 rounded-full text-sm mb-6">
            <Heart className="w-4 h-4" />
            Témoignages clients
          </div>

          <h2 className="text-4xl font-bold text-[#0B3C3C] mb-12">
            Plus de 10 000 entreprises convaincues
          </h2>

          <div className="bg-white border border-[#B8E0E0] rounded-[32px] p-10 shadow-xl">
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 fill-[#00A8A8] text-[#00A8A8]"
                />
              ))}
            </div>

            <p className="text-xl text-[#0B3C3C] italic mb-8 leading-relaxed">
              “{testimonials[currentTestimonial].content}”
            </p>

            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#005F5F] to-[#00A8A8] text-white flex items-center justify-center font-bold">
                {testimonials[currentTestimonial].avatar}
              </div>

              <div className="text-left">
                <div className="font-semibold text-[#0B3C3C]">
                  {testimonials[currentTestimonial].name}
                </div>

                <div className="text-sm text-[#008080]">
                  {testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].company}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#D9F3F3] text-[#008080] px-4 py-2 rounded-full text-sm mb-6">
              <Mail className="w-4 h-4" />
              Contact
            </div>

            <h2 className="text-4xl font-bold text-[#0B3C3C] mb-4">
              Discutons de votre projet
            </h2>

            <p className="text-[#2F6F6F] text-lg">
              Notre équipe vous répond rapidement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="p-4 rounded-2xl bg-[#D9F3F3]">
                  <Mail className="w-5 h-5 text-[#008080]" />
                </div>

                <div>
                  <h3 className="font-semibold text-[#0B3C3C]">Email</h3>
                  <p className="text-[#2F6F6F]">contact@insomea.ai</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-4 rounded-2xl bg-[#D9F3F3]">
                  <Phone className="w-5 h-5 text-[#008080]" />
                </div>

                <div>
                  <h3 className="font-semibold text-[#0B3C3C]">Téléphone</h3>
                  <p className="text-[#2F6F6F]">+33 1 23 45 67 89</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-4 rounded-2xl bg-[#D9F3F3]">
                  <MapPin className="w-5 h-5 text-[#008080]" />
                </div>

                <div>
                  <h3 className="font-semibold text-[#0B3C3C]">Adresse</h3>
                  <p className="text-[#2F6F6F]">Paris, France</p>
                </div>
              </div>
            </div>

            <form className="space-y-4 bg-white border border-[#B8E0E0] p-8 rounded-[32px] shadow-xl">
              <input
                type="text"
                placeholder="Votre nom"
                className="w-full px-4 py-4 rounded-2xl border border-[#B8E0E0] focus:outline-none focus:border-[#008080]"
              />

              <input
                type="email"
                placeholder="Votre email"
                className="w-full px-4 py-4 rounded-2xl border border-[#B8E0E0] focus:outline-none focus:border-[#008080]"
              />

              <textarea
                rows={5}
                placeholder="Votre message"
                className="w-full px-4 py-4 rounded-2xl border border-[#B8E0E0] focus:outline-none focus:border-[#008080]"
              />

              <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#005F5F] to-[#00A8A8] text-white font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all duration-300">
                Envoyer
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
