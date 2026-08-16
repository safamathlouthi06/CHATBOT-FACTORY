"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Bot,
  Plus,
  MessageSquare,
  Play,
  Database,
  Rocket,
  Zap,
  BarChart3,
  FileText,
  HelpCircle,
  Activity,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  ChevronRight,
} from "lucide-react";

import { API_URL } from "@/services/api";

/* ========================================================= */
/* CHART.JS */
/* ========================================================= */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

/* ========================================================= */
/* TYPES */
/* ========================================================= */

type Chatbot = {
  id: string;
  nom: string;
  domaine: string;
  statut: string;
  created_at: string;
};

type Me = {
  nom: string;
  prenom: string;
  email: string;
  entreprise_id: string;
};

type Statistics = {
  nombre_chatbots: number;
  nombre_conversations: number;
  nombre_messages: number;
  nombre_documents: number;
  nombre_faq: number;
};

type ChatbotStatistic = {
  id: string;
  nom: string;
  statut: string;
  employe_id: string | null;
  nombre_conversations: number;
  nombre_messages: number;
  nombre_documents: number;
  nombre_faq: number;
};

type Overview = {
  totals: Statistics;
  chatbots: ChatbotStatistic[];
};

/* ========================================================= */
/* DASHBOARD EMPLOYE */
/* ========================================================= */

export default function EmployeDashboard() {
  const router = useRouter();

  const [me, setMe] = useState<Me | null>(null);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [chatbotStatistics, setChatbotStatistics] = useState<ChatbotStatistic[]>([]);
  const [stats, setStats] = useState<Statistics>({
    nombre_chatbots: 0,
    nombre_conversations: 0,
    nombre_messages: 0,
    nombre_documents: 0,
    nombre_faq: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ======================================================= */
  /* LOGOUT */
  /* ======================================================= */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  /* ======================================================= */
  /* CHARGEMENT DES DONNÉES */
  /* ======================================================= */

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "employe") {
          router.push("/login");
          return;
        }

        const meRes = await fetch(`${API_URL}/meEmploye`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (meRes.status === 401) {
          logout();
          return;
        }

        if (!meRes.ok) {
          throw new Error("Impossible de récupérer le profil employé.");
        }

        const meData: Me = await meRes.json();
        setMe(meData);

        const statsRes = await fetch(`${API_URL}/statistiques/overview`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (statsRes.status === 401) {
          logout();
          return;
        }

        if (!statsRes.ok) {
          throw new Error("Impossible de récupérer les statistiques.");
        }

        const statsData: Overview = await statsRes.json();

        setStats(
          statsData.totals ?? {
            nombre_chatbots: 0,
            nombre_conversations: 0,
            nombre_messages: 0,
            nombre_documents: 0,
            nombre_faq: 0,
          }
        );

        setChatbotStatistics(statsData.chatbots ?? []);

        const bots: Chatbot[] = (statsData.chatbots ?? []).map((bot) => ({
          id: bot.id,
          nom: bot.nom,
          domaine: "",
          statut: bot.statut,
          created_at: "",
        }));

        setChatbots(bots);
      } catch (err) {
        console.error("Erreur dashboard employé :", err);
        setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const actifs = chatbotStatistics.filter((bot) => bot.statut === "actif").length;
  const inactifs = chatbotStatistics.length - actifs;

  /* ======================================================= */
  /* LOADING */
  /* ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7F8] to-[#E8F0F0] dark:from-[#0B1120] dark:to-[#0F1A2A] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-[#D9F3F3] border-t-[#008080] rounded-full animate-spin" />
            <div className="absolute inset-2 border-4 border-[#D9F3F3] border-b-[#008080] rounded-full animate-spin animation-delay-150" />
          </div>
          <p className="text-sm text-gray-500 mt-4 font-medium">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  /* ======================================================= */
  /* ERROR */
  /* ======================================================= */

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7F8] to-[#E8F0F0] dark:from-[#0B1120] dark:to-[#0F1A2A] flex items-center justify-center px-4">
        <div className="bg-white/80 backdrop-blur-lg dark:bg-gray-900/80 border border-red-200 dark:border-red-900 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-bold text-xl text-red-600 mb-2">Erreur</h2>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2.5 bg-gradient-to-r from-[#008080] to-[#00A8A8] text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  /* ======================================================= */
  /* CHART : BARRES PAR CHATBOT */
  /* ======================================================= */

  const chatbotBarData = {
    labels: chatbotStatistics.map((bot) => bot.nom),
    datasets: [
      {
        label: "Conversations",
        data: chatbotStatistics.map((bot) => bot.nombre_conversations),
        backgroundColor: "rgba(0, 128, 128, 0.85)",
        borderRadius: 8,
        barPercentage: 0.6,
      },
      {
        label: "Messages",
        data: chatbotStatistics.map((bot) => bot.nombre_messages),
        backgroundColor: "rgba(99, 102, 241, 0.85)",
        borderRadius: 8,
        barPercentage: 0.6,
      },
    ],
  };

  const chatbotBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: "#6B7280",
          font: {
            size: 12,
            weight: "500" as const,
          },
        },
      },
      tooltip: {
        backgroundColor: "#0B3C3C",
        padding: 12,
        cornerRadius: 12,
        titleColor: "#FFFFFF",
        bodyColor: "#D9F3F3",
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
          maxRotation: 45,
          minRotation: 0,
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: "#6B7280",
          font: {
            size: 11,
          },
        },
        grid: {
          color: "rgba(107, 114, 128, 0.08)",
          drawBorder: false,
        },
      },
    },
  };

  /* ======================================================= */
  /* CHART : RÉPARTITION GLOBALE */
  /* ======================================================= */

  const globalChartData = {
    labels: ["Conversations", "Messages", "Documents", "FAQ"],
    datasets: [
      {
        data: [
          stats.nombre_conversations,
          stats.nombre_messages,
          stats.nombre_documents,
          stats.nombre_faq,
        ],
        backgroundColor: ["#008080", "#6366F1", "#F59E0B", "#EC4899"],
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  };

  const globalChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          color: "#6B7280",
          font: {
            size: 11,
            weight: "500" as const,
          },
        },
      },
      tooltip: {
        backgroundColor: "#0B3C3C",
        padding: 12,
        cornerRadius: 12,
        titleColor: "#FFFFFF",
        bodyColor: "#D9F3F3",
      },
    },
  };


    const displayedChatbots = chatbots.slice(0, 5);

  const remainingChatbots = Math.max(
    chatbots.length - 5,
    0
  );




  function ChatbotStatRow({
  bot,
}: {
  bot: ChatbotStatistic;
}) {
  const isActive =
    bot.statut?.toLowerCase() === "actif";

  return (
    <div
      className="
        rounded-xl
        p-4
        bg-gray-50/50
        dark:bg-gray-800/30
        hover:bg-gray-100/50
        dark:hover:bg-gray-800/50
        transition-all
        duration-200
      "
    >

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex items-center justify-between gap-4">

        {/* INFORMATIONS CHATBOT */}

        <div className="flex items-center gap-3 min-w-0">

          <div className="min-w-0">

            <div className="flex items-center gap-2">

              <p className="font-medium text-[#0B3C3C] dark:text-white truncate">
                {bot.nom}
              </p>

              <span
                className={`
                  text-xs
                  px-2
                  py-0.5
                  rounded-full
                  ${
                    isActive
                      ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  }
                `}
              >
                {bot.statut}
              </span>

            </div>

          </div>

        </div>

        {/* ACTIONS */}

        <div className="flex items-center gap-1 shrink-0">

          {/* BASE DE CONNAISSANCES */}

          <Link
            href={`/employe/chatbots/${bot.id}/base-de-connaissance`}
            className="
              p-2
              rounded-xl
              hover:bg-[#D9F3F3]
              dark:hover:bg-[#123D3D]
              text-[#008080]
              transition-colors
            "
            title="Base de connaissances"
          >
            <Database size={15} />
          </Link>

          {/* TESTER */}

          <Link
            href={`/employe/chatbots/${bot.id}/test`}
            className="
              p-2
              rounded-xl
              hover:bg-[#D9F3F3]
              dark:hover:bg-[#123D3D]
              text-[#008080]
              transition-colors
            "
            title="Tester"
          >
            <Play size={15} />
          </Link>

          {/* DÉPLOYER */}

          <Link
            href={`/employe/chatbots/${bot.id}/deployment`}
            className="
              p-2
              rounded-xl
              hover:bg-[#D9F3F3]
              dark:hover:bg-[#123D3D]
              text-[#008080]
              transition-colors
            "
            title="Déployer"
          >
            <Rocket size={15} />
          </Link>

        </div>

      </div>

      {/* ================================================= */}
      {/* STATISTIQUES */}
      {/* ================================================= */}

      <div className="flex flex-wrap gap-2 mt-3">

        {/* CONVERSATIONS */}

        <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400">

          <MessageSquare className="w-3.5 h-3.5" />

          <span>
            {bot.nombre_conversations} conversations
          </span>

        </div>

        {/* MESSAGES */}

        <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">

          <BarChart3 className="w-3.5 h-3.5" />

          <span>
            {bot.nombre_messages} messages
          </span>

        </div>

        {/* DOCUMENTS */}

        <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400">

          <FileText className="w-3.5 h-3.5" />

          <span>
            {bot.nombre_documents} documents
          </span>

        </div>

        {/* FAQ */}

        <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400">

          <HelpCircle className="w-3.5 h-3.5" />

          <span>
            {bot.nombre_faq} FAQ
          </span>

        </div>

      </div>

    </div>
  );
}

  /* ======================================================= */
  /* RENDER */
  /* ======================================================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7F8] via-[#EEF4F4] to-[#E8F0F0] dark:from-[#0B1120] dark:via-[#0F1828] dark:to-[#0F1A2A]">
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* ================================================= */}
        {/* ACCUEIL - CARD PRINCIPALE */}
        {/* ================================================= */}

        <div className="relative overflow-hidden bg-gradient-to-br from-[#005F5F] via-[#008080] to-[#00A8A8] rounded-3xl p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Bienvenue
              </p>
              <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
                {me ? `${me.prenom} ${me.nom}` : "..."}
              </h1>
              <p className="text-white/80 text-sm max-w-md">
                Gérez vos chatbots et construisez votre base de connaissances en toute simplicité.
              </p>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Clock className="w-4 h-4 text-white/70" />
              <span className="text-sm font-medium">
                {new Date().toLocaleDateString("fr-FR", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* STATISTIQUES - ICÔNE À CÔTÉ DES CHIFFRES */}
        {/* ================================================= */}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            label="Mes chatbots"
            value={stats.nombre_chatbots}
            icon={Bot}
            color="text-[#008080]"
            bg="bg-[#D9F3F3]"
            borderColor="border-[#008080]/20"
          />
          <StatCard
            label="Conversations"
            value={stats.nombre_conversations}
            icon={MessageSquare}
            color="text-blue-600"
            bg="bg-blue-100"
            borderColor="border-blue-600/20"
          />
          <StatCard
            label="Messages"
            value={stats.nombre_messages}
            icon={BarChart3}
            color="text-purple-600"
            bg="bg-purple-100"
            borderColor="border-purple-600/20"
          />
          <StatCard
            label="Documents"
            value={stats.nombre_documents}
            icon={FileText}
            color="text-orange-600"
            bg="bg-orange-100"
            borderColor="border-orange-600/20"
          />
          <StatCard
            label="FAQ"
            value={stats.nombre_faq}
            icon={HelpCircle}
            color="text-green-600"
            bg="bg-green-100"
            borderColor="border-green-600/20"
          />
        </div>

        {/* ================================================= */}
        {/* ACTIONS RAPIDES */}
        {/* ================================================= */}

        <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 border border-[#B8E0E0]/50 dark:border-gray-700/50 rounded-3xl p-6 shadow-xl">
          <h2 className="font-bold text-lg text-[#0B3C3C] dark:text-white flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-[#008080] fill-[#008080]/20" />
            Actions rapides
          </h2>

          <div className="grid sm:grid-cols-3 gap-3">
            <ActionCard
              href="/employe/chatbots/create"
              icon={Plus}
              label="Créer un chatbot"
              desc="Nouveau projet"
              gradient="from-emerald-500/10 to-teal-500/10"
            />
            <ActionCard
              href="/employe/chatbots"
              icon={Bot}
              label="Mes chatbots"
              desc="Gérer les existants"
              gradient="from-blue-500/10 to-indigo-500/10"
            />
            <ActionCard
              href="/employe/stats"
              icon={TrendingUp}
              label="Statistiques"
              desc="Performances"
              gradient="from-purple-500/10 to-pink-500/10"
            />
          </div>
        </div>

        {/* ================================================= */}
        {/* CHARTS */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* --------------------------------------------- */}
          {/* BAR CHART */}
          {/* --------------------------------------------- */}

          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 border border-[#B8E0E0]/50 dark:border-gray-700/50 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-lg text-[#0B3C3C] dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#008080]" />
                  Activité des chatbots
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Conversations et messages par chatbot
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#D9F3F3]/50 dark:bg-[#123D3D]/50 rounded-xl">
                <Activity className="w-4 h-4 text-[#008080]" />
                <span className="text-xs font-medium text-[#008080]">
                  {chatbotStatistics.length} chatbots
                </span>
              </div>
            </div>

            <div className="h-[320px]">
              {chatbotStatistics.length > 0 ? (
                <Bar data={chatbotBarData} options={chatbotBarOptions} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Bot className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Aucun chatbot disponible</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* --------------------------------------------- */}
          {/* DOUGHNUT */}
          {/* --------------------------------------------- */}

          <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 border border-[#B8E0E0]/50 dark:border-gray-700/50 rounded-3xl p-6 shadow-xl">
            <div className="mb-5">
              <h2 className="font-bold text-lg text-[#0B3C3C] dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#008080]" />
                Vue globale
              </h2>
              <p className="text-xs text-gray-500 mt-1">Répartition de votre activité</p>
            </div>

            <div className="h-[280px]">
              {stats.nombre_conversations +
                stats.nombre_messages +
                stats.nombre_documents +
                stats.nombre_faq >
              0 ? (
                <Doughnut data={globalChartData} options={globalChartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-gray-400">Aucune activité</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* MES CHATBOTS */}
        {/* ================================================= */}

      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow duration-300">

        {/* HEADER */}

        <div className="flex items-start justify-between gap-4 mb-5">

          <div className="flex items-start gap-3">

            {/* 
              ICÔNE SANS CADRE
              Aucun bg, aucun border, aucun rounded container
            */}

            <Bot className="w-5 h-5 text-blue-500 mt-1 shrink-0" />

            <div>

              <div className="flex items-center gap-2">

                <h2 className="font-semibold text-[#0B3C3C] dark:text-white text-lg">
                  Vos chatbots
                </h2>

                <span className="text-xs bg-[#D9F3F3] dark:bg-[#123D3D] text-[#008080] px-2 py-0.5 rounded-full">
                  {chatbots.length}
                </span>

              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Consultez les statistiques de vos chatbots
              </p>

              {remainingChatbots > 0 && (
                <p className="text-xs text-[#2F6F6F] dark:text-gray-400 italic mt-1">
                  Affichage des 5 premiers chatbots.{" "}
                  {remainingChatbots} autres disponibles.
                </p>
              )}

            </div>

          </div>

          {/* VOIR TOUS */}

          <Link
            href="/dashboard/chatbots"
            className="text-sm text-[#008080] hover:underline flex items-center gap-1 shrink-0"
          >
            Voir tous

            <ChevronRight className="w-4 h-4" />
          </Link>

        </div>

        {/* LISTE DES CHATBOTS */}

        {chatbots.length === 0 ? (

          <div className="text-center py-8">

            <Bot className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Aucun chatbot pour le moment.
            </p>

            <Link
              href="/dashboard/chatbots/create"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-[#008080] text-white text-sm hover:bg-[#006666] transition"
            >
              <Plus className="w-4 h-4" />
              Créer un chatbot
            </Link>

          </div>

        ) : (

          <div className="space-y-3">

            {displayedChatbots.map((bot) => (
              <ChatbotStatRow
                key={bot.id}
                bot={bot}
              />
            ))}

          </div>

        )}

      </div>
      </main>
    </div>
  );
}

/* ========================================================= */
/* STAT CARD - ICÔNE À CÔTÉ DES CHIFFRES */
/* ========================================================= */

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  borderColor,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bg: string;
  borderColor: string;
}) {
  return (
    <div
      className={`
        bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 
        border ${borderColor} dark:border-gray-700/50 
        rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 
        hover:-translate-y-1 group
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-black text-[#0B3C3C] dark:text-white tracking-tight">
            {value.toLocaleString("fr-FR")}
          </p>
          <p className="text-xs text-[#2F6F6F] dark:text-gray-400 mt-0.5 font-medium">
            {label}
          </p>
        </div>
        <div
          className={`
            w-12 h-12 rounded-2xl ${bg} 
            flex items-center justify-center 
            group-hover:scale-110 transition-transform duration-300
          `}
        >
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}

/* ========================================================= */
/* MINI STAT */
/* ========================================================= */

function MiniStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 border border-[#B8E0E0]/50 dark:border-gray-700/50 rounded-xl p-4 flex items-center gap-3 hover:shadow-lg transition-all duration-300">
      <div className="w-9 h-9 rounded-lg bg-[#D9F3F3] dark:bg-[#123D3D] flex items-center justify-center">
        <Icon className="w-4 h-4 text-[#008080]" />
      </div>
      <div>
        <p className="font-bold text-lg text-[#0B3C3C] dark:text-white">
          {value.toLocaleString("fr-FR")}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

/* ========================================================= */
/* ACTION CARD */
/* ========================================================= */

function ActionCard({
  href,
  icon: Icon,
  label,
  desc,
  gradient,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  desc: string;
  gradient?: string;
}) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 p-4 
        bg-gradient-to-br ${gradient || "from-gray-100/50 to-gray-200/50"} 
        dark:bg-gray-800/50 
        border border-[#B8E0E0]/50 dark:border-gray-700/50 
        rounded-2xl hover:shadow-xl transition-all duration-300 
        group hover:-translate-y-0.5
      `}
    >
      <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-gray-700/80 group-hover:bg-white dark:group-hover:bg-gray-600 flex items-center justify-center transition-all duration-300 shadow-sm">
        <Icon className="w-5 h-5 text-[#008080]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#0B3C3C] dark:text-white">
          {label}
        </p>
        <p className="text-xs text-[#2F6F6F] dark:text-gray-400">{desc}</p>
      </div>
    </Link>
  );
}


