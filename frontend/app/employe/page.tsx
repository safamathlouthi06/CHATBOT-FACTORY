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

  const [chatbotStatistics, setChatbotStatistics] = useState<
    ChatbotStatistic[]
  >([]);

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

        /* ----------------------------------------------- */
        /* Vérification session */
        /* ----------------------------------------------- */

        if (!token || role !== "employe") {
          router.push("/login");
          return;
        }

        /* ----------------------------------------------- */
        /* PROFIL EMPLOYÉ */
        /* ----------------------------------------------- */

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
          throw new Error(
            "Impossible de récupérer le profil employé."
          );
        }

        const meData: Me = await meRes.json();

        setMe(meData);

        /* ----------------------------------------------- */
        /* STATISTIQUES */
        /* ----------------------------------------------- */

        const statsRes = await fetch(
          `${API_URL}/statistiques/overview`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (statsRes.status === 401) {
          logout();
          return;
        }

        if (!statsRes.ok) {
          throw new Error(
            "Impossible de récupérer les statistiques."
          );
        }

        const statsData: Overview = await statsRes.json();

        /* ----------------------------------------------- */
        /* STATISTIQUES GLOBALES */
        /* ----------------------------------------------- */

        setStats(
          statsData.totals ?? {
            nombre_chatbots: 0,
            nombre_conversations: 0,
            nombre_messages: 0,
            nombre_documents: 0,
            nombre_faq: 0,
          }
        );

        /* ----------------------------------------------- */
        /* STATISTIQUES PAR CHATBOT */
        /* ----------------------------------------------- */

        setChatbotStatistics(statsData.chatbots ?? []);

        /* ----------------------------------------------- */
        /* CHATBOTS */
        /* ----------------------------------------------- */

        const bots: Chatbot[] = (statsData.chatbots ?? []).map(
          (bot) => ({
            id: bot.id,
            nom: bot.nom,
            domaine: "",
            statut: bot.statut,
            created_at: "",
          })
        );

        setChatbots(bots);
      } catch (err) {
        console.error(
          "Erreur dashboard employé :",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue."
        );
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  /* ======================================================= */
  /* CHATBOTS ACTIFS */
  /* ======================================================= */

  const actifs = chatbotStatistics.filter(
    (bot) => bot.statut === "actif"
  ).length;

  /* ======================================================= */
  /* CHATBOTS INACTIFS */
  /* ======================================================= */

  const inactifs =
    chatbotStatistics.length - actifs;

  /* ======================================================= */
  /* LOADING */
  /* ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7F8] dark:bg-[#0B1120] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#D9F3F3] border-t-[#008080] rounded-full animate-spin mx-auto" />

          <p className="text-sm text-gray-500 mt-3">
            Chargement du dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* ======================================================= */
  /* ERROR */
  /* ======================================================= */

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F7F8] dark:bg-[#0B1120] flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900 rounded-2xl p-6 max-w-md w-full text-center">
          <Activity className="w-10 h-10 text-red-500 mx-auto mb-3" />

          <h2 className="font-bold text-red-600">
            Erreur
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#008080] text-white rounded-lg text-sm"
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
    labels: chatbotStatistics.map(
      (bot) => bot.nom
    ),

    datasets: [
      {
        label: "Conversations",

        data: chatbotStatistics.map(
          (bot) => bot.nombre_conversations
        ),

        backgroundColor: "rgba(0, 128, 128, 0.75)",

        borderRadius: 6,
      },

      {
        label: "Messages",

        data: chatbotStatistics.map(
          (bot) => bot.nombre_messages
        ),

        backgroundColor: "rgba(99, 102, 241, 0.75)",

        borderRadius: 6,
      },
    ],
  };

  /* ======================================================= */
  /* OPTIONS BAR CHART */
  /* ======================================================= */

  const chatbotBarOptions = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "top" as const,

        labels: {
          usePointStyle: true,

          padding: 15,

          color: "#6B7280",
        },
      },

      tooltip: {
        backgroundColor: "#0B3C3C",

        padding: 10,

        cornerRadius: 8,
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
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          precision: 0,

          color: "#6B7280",
        },

        grid: {
          color: "rgba(107, 114, 128, 0.1)",
        },
      },
    },
  };

  /* ======================================================= */
  /* CHART : RÉPARTITION GLOBALE */
  /* ======================================================= */

  const globalChartData = {
    labels: [
      "Conversations",
      "Messages",
      "Documents",
      "FAQ",
    ],

    datasets: [
      {
        data: [
          stats.nombre_conversations,
          stats.nombre_messages,
          stats.nombre_documents,
          stats.nombre_faq,
        ],

        backgroundColor: [
          "#008080",
          "#6366F1",
          "#F59E0B",
          "#EC4899",
        ],

        borderWidth: 0,

        hoverOffset: 8,
      },
    ],
  };

  /* ======================================================= */
  /* OPTIONS DOUGHNUT */
  /* ======================================================= */

  const globalChartOptions = {
    responsive: true,

    maintainAspectRatio: false,

    cutout: "62%",

    plugins: {
      legend: {
        position: "bottom" as const,

        labels: {
          usePointStyle: true,

          padding: 15,

          color: "#6B7280",
        },
      },

      tooltip: {
        backgroundColor: "#0B3C3C",

        padding: 10,

        cornerRadius: 8,
      },
    },
  };

  /* ======================================================= */
  /* RENDER */
  /* ======================================================= */

  return (
    <div className="min-h-screen bg-[#F5F7F8] dark:bg-[#0B1120]">

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* ================================================= */}
        {/* ACCUEIL */}
        {/* ================================================= */}

        <div className="bg-gradient-to-r from-[#005F5F] to-[#00A8A8] rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">

          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10">

            <p className="text-white/70 text-sm mb-1">
              Bienvenue,
            </p>

            <h1 className="text-3xl font-black mb-2">
              {me
                ? `${me.prenom} ${me.nom}`
                : "..."}
            </h1>

            <p className="text-white/80 text-sm">
              Gérez vos chatbots et construisez votre
              base de connaissances.
            </p>

          </div>
        </div>

        {/* ================================================= */}
        {/* STATISTIQUES */}
        {/* ================================================= */}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

          <StatCard
            label="Mes chatbots"
            value={stats.nombre_chatbots}
            icon={Bot}
            color="text-[#008080]"
            bg="bg-[#D9F3F3]"
          />

          <StatCard
            label="Actifs"
            value={actifs}
            icon={Zap}
            color="text-green-600"
            bg="bg-green-100"
          />

          <StatCard
            label="Conversations"
            value={stats.nombre_conversations}
            icon={MessageSquare}
            color="text-blue-600"
            bg="bg-blue-100"
          />

          <StatCard
            label="Messages"
            value={stats.nombre_messages}
            icon={BarChart3}
            color="text-purple-600"
            bg="bg-purple-100"
          />

          <StatCard
            label="Documents"
            value={stats.nombre_documents}
            icon={FileText}
            color="text-orange-600"
            bg="bg-orange-100"
          />

        </div>

        {/* ================================================= */}
        {/* CHARTS */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* --------------------------------------------- */}
          {/* BAR CHART */}
          {/* --------------------------------------------- */}

          <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-[#B8E0E0] dark:border-gray-700 rounded-2xl p-6 shadow-sm">

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

              <Activity className="w-5 h-5 text-[#008080]" />

            </div>

            <div className="h-[320px]">

              {chatbotStatistics.length > 0 ? (
                <Bar
                  data={chatbotBarData}
                  options={chatbotBarOptions}
                />
              ) : (
                <div className="h-full flex items-center justify-center">

                  <div className="text-center">

                    <Bot className="w-10 h-10 text-gray-300 mx-auto mb-2" />

                    <p className="text-sm text-gray-400">
                      Aucun chatbot disponible
                    </p>

                  </div>

                </div>
              )}

            </div>

          </div>

          {/* --------------------------------------------- */}
          {/* DOUGHNUT */}
          {/* --------------------------------------------- */}

          <div className="bg-white dark:bg-gray-900 border border-[#B8E0E0] dark:border-gray-700 rounded-2xl p-6 shadow-sm">

            <div className="mb-5">

              <h2 className="font-bold text-lg text-[#0B3C3C] dark:text-white flex items-center gap-2">

                <Activity className="w-5 h-5 text-[#008080]" />

                Vue globale

              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Répartition de votre activité
              </p>

            </div>

            <div className="h-[280px]">

              {stats.nombre_conversations +
                stats.nombre_messages +
                stats.nombre_documents +
                stats.nombre_faq >
              0 ? (
                <Doughnut
                  data={globalChartData}
                  options={globalChartOptions}
                />
              ) : (
                <div className="h-full flex items-center justify-center">

                  <p className="text-sm text-gray-400">
                    Aucune activité
                  </p>

                </div>
              )}

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* RÉSUMÉ ACTIVITÉ */}
        {/* ================================================= */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <MiniStat
            label="Conversations"
            value={stats.nombre_conversations}
            icon={MessageSquare}
          />

          <MiniStat
            label="Messages"
            value={stats.nombre_messages}
            icon={BarChart3}
          />

          <MiniStat
            label="Documents"
            value={stats.nombre_documents}
            icon={FileText}
          />

          <MiniStat
            label="FAQ"
            value={stats.nombre_faq}
            icon={Database}
          />

        </div>

        {/* ================================================= */}
        {/* ACTIONS RAPIDES */}
        {/* ================================================= */}

        <div className="bg-white dark:bg-gray-900 border border-[#B8E0E0] dark:border-gray-700 rounded-2xl p-6 shadow-sm">

          <h2 className="font-bold text-lg text-[#0B3C3C] dark:text-white flex items-center gap-2 mb-4">

            <Zap className="w-5 h-5 text-[#008080]" />

            Actions rapides

          </h2>

          <div className="grid sm:grid-cols-3 gap-3">

            <ActionCard
              href="/employe/chatbots/create"
              icon={Plus}
              label="Créer un chatbot"
              desc="Nouveau projet"
            />

            <ActionCard
              href="/employe/chatbots"
              icon={Bot}
              label="Mes chatbots"
              desc="Gérer les existants"
            />

            <ActionCard
              href="/employe/stats"
              icon={BarChart3}
              label="Statistiques"
              desc="Performances"
            />

          </div>

        </div>

        {/* ================================================= */}
        {/* MES CHATBOTS */}
        {/* ================================================= */}

        <div className="bg-white dark:bg-gray-900 border border-[#B8E0E0] dark:border-gray-700 rounded-2xl p-6 shadow-sm">

          <div className="flex items-center justify-between mb-5">

            <h2 className="font-bold text-lg text-[#0B3C3C] dark:text-white flex items-center gap-2">

              <Bot className="w-5 h-5 text-[#008080]" />

              Mes chatbots

            </h2>

            <Link
              href="/employe/chatbots"
              className="text-sm text-[#008080] hover:underline font-medium"
            >
              Voir tous
            </Link>

          </div>

          {chatbots.length === 0 ? (

            <div className="text-center py-10">

              <Bot className="w-12 h-12 mx-auto text-[#00A8A8] mb-3" />

              <p className="text-[#2F6F6F] text-sm mb-3">
                Aucun chatbot encore
              </p>

              <Link
                href="/employe/chatbots/create"
                className="inline-flex items-center gap-2 bg-[#008080] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#005F5F] transition"
              >

                <Plus className="w-4 h-4" />

                Créer mon premier chatbot

              </Link>

            </div>

          ) : (

            <div className="space-y-3">

              {chatbots
                .slice(0, 5)
                .map((bot) => (

                  <div
                    key={bot.id}
                    className="flex items-center justify-between p-4 border border-[#B8E0E0] dark:border-gray-700 rounded-xl hover:bg-[#F7FFFF] dark:hover:bg-gray-800 transition"
                  >

                    {/* INFOS */}

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-[#D9F3F3] dark:bg-[#123D3D] flex items-center justify-center">

                        <Bot className="w-5 h-5 text-[#008080]" />

                      </div>

                      <div>

                        <p className="font-semibold text-sm text-[#0B3C3C] dark:text-white">
                          {bot.nom}
                        </p>

                        <p className="text-xs text-[#2F6F6F] dark:text-gray-400">
                          {bot.domaine ||
                            "Assistant IA"}
                        </p>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="flex items-center gap-2">

                      <span
                        className={`
                          text-xs
                          px-2
                          py-1
                          rounded-full
                          font-medium
                          ${
                            bot.statut === "actif"
                              ? "bg-[#D9F3F3] text-[#008080]"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                          }
                        `}
                      >
                        {bot.statut}
                      </span>

                      <div className="flex gap-1">

                        <Link
                          href={`/employe/chatbots/${bot.id}/base-de-connaissance`}
                          className="p-1.5 rounded-lg hover:bg-[#D9F3F3] text-[#008080] transition"
                          title="Base de connaissances"
                        >
                          <Database size={14} />
                        </Link>

                        <Link
                          href={`/employe/chatbots/${bot.id}/test`}
                          className="p-1.5 rounded-lg hover:bg-[#D9F3F3] text-[#008080] transition"
                          title="Tester"
                        >
                          <Play size={14} />
                        </Link>

                        <Link
                          href={`/employe/chatbots/${bot.id}/deployment`}
                          className="p-1.5 rounded-lg hover:bg-[#D9F3F3] text-[#008080] transition"
                          title="Déployer"
                        >
                          <Rocket size={14} />
                        </Link>

                      </div>

                    </div>

                  </div>

                ))}

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

/* ========================================================= */
/* STAT CARD */
/* ========================================================= */

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-[#B8E0E0] dark:border-gray-700 rounded-2xl p-5 hover:shadow-md transition">

      <div
        className={`
          w-10
          h-10
          rounded-xl
          ${bg}
          flex
          items-center
          justify-center
          mb-3
        `}
      >

        <Icon
          className={`w-5 h-5 ${color}`}
        />

      </div>

      <p className="text-2xl font-black text-[#0B3C3C] dark:text-white">
        {value.toLocaleString("fr-FR")}
      </p>

      <p className="text-xs text-[#2F6F6F] dark:text-gray-400 mt-0.5">
        {label}
      </p>

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
    <div className="bg-white dark:bg-gray-900 border border-[#B8E0E0] dark:border-gray-700 rounded-xl p-4 flex items-center gap-3">

      <div className="w-9 h-9 rounded-lg bg-[#D9F3F3] dark:bg-[#123D3D] flex items-center justify-center">

        <Icon className="w-4 h-4 text-[#008080]" />

      </div>

      <div>

        <p className="font-bold text-lg text-[#0B3C3C] dark:text-white">
          {value.toLocaleString("fr-FR")}
        </p>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          {label}
        </p>

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
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 border border-[#B8E0E0] dark:border-gray-700 rounded-xl hover:bg-[#D9F3F3] dark:hover:bg-gray-800 transition group"
    >

      <div className="w-9 h-9 rounded-xl bg-[#D9F3F3] dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-gray-700 flex items-center justify-center transition">

        <Icon className="w-4 h-4 text-[#008080]" />

      </div>

      <div>

        <p className="text-sm font-semibold text-[#0B3C3C] dark:text-white">
          {label}
        </p>

        <p className="text-xs text-[#2F6F6F] dark:text-gray-400">
          {desc}
        </p>

      </div>

    </Link>
  );
}