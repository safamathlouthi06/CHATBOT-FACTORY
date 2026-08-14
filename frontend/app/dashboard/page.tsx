"use client";

import {
  Bot,
  MessageSquare,
  Users,
  Plus,
  ArrowRight,
  Zap,
  BarChart3,
  Database,
  Settings,
  ChevronRight,
  Sparkles,
  FileText,
  HelpCircle,
} from "lucide-react";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_URL } from "@/services/api";

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

/* ========================================================= */
/* CHART.JS */
/* ========================================================= */

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
  description?: string;
  statut: string;
  employe_id?: string | null;
};

type ChatbotStat = {
  id: string;
  nom: string;
  statut: string;
  employe_id: string | null;
  nombre_conversations: number;
  nombre_messages: number;
  nombre_documents: number;
  nombre_faq: number;
};

type EmployeStat = {
  employe_id: string | null;
  nom: string;
  nombre_chatbots: number;
  nombre_conversations: number;
  nombre_messages: number;
  nombre_documents: number;
  nombre_faq: number;
};

type Overview = {
  totals: {
    nombre_chatbots: number;
    nombre_conversations: number;
    nombre_messages: number;
    nombre_documents: number;
    nombre_faq: number;
  };

  chatbots: ChatbotStat[];

  par_employe?: EmployeStat[];
};

/* ========================================================= */
/* DASHBOARD */
/* ========================================================= */

export default function DashboardPage() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);

  const [data, setData] = useState<Overview | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /* ======================================================= */
  /* CHARGEMENT */
  /* ======================================================= */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Session expirée. Veuillez vous reconnecter.");
      setLoading(false);
      return;
    }

    const loadStatistics = async () => {
      try {
        const response = await fetch(
          `${API_URL}/statistiques/overview`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 401) {
          throw new Error(
            "Session expirée. Veuillez vous reconnecter."
          );
        }

        if (!response.ok) {
          throw new Error(
            "Erreur lors du chargement des statistiques."
          );
        }

        const json: Overview = await response.json();

        console.log("STATISTIQUES :", json);

        setData(json);

        /* ================================================= */
        /* CHATBOTS */
        /* ================================================= */

        setChatbots(
          json.chatbots.map((bot) => ({
            id: bot.id,
            nom: bot.nom,
            statut: bot.statut,
            employe_id: bot.employe_id,
          }))
        );
      } catch (err) {
        console.error("Erreur statistiques :", err);

        setError(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue."
        );
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, []);

  /* ======================================================= */
  /* VALEURS */
  /* ======================================================= */

  const totals = data?.totals ?? {
    nombre_chatbots: 0,
    nombre_conversations: 0,
    nombre_messages: 0,
    nombre_documents: 0,
    nombre_faq: 0,
  };

  const chatbotStats = data?.chatbots ?? [];

  /* ======================================================= */
  /* CHATBOTS ACTIFS / INACTIFS */
  /* ======================================================= */

  const activeChatbots = chatbotStats.filter(
    (bot) => bot.statut === "actif"
  ).length;

  const inactiveChatbots =
    chatbotStats.length - activeChatbots;

  const totalChatbots = chatbotStats.length;

  const activePercentage =
    totalChatbots > 0
      ? Math.round((activeChatbots / totalChatbots) * 100)
      : 0;

  const inactivePercentage =
    totalChatbots > 0
      ? Math.round((inactiveChatbots / totalChatbots) * 100)
      : 0;

  /* ======================================================= */
  /* DONNEES BAR CHART */
  /* ======================================================= */

  const chatbotLabels = chatbotStats.map(
    (bot) => bot.nom
  );

  const conversationsData = chatbotStats.map(
    (bot) => bot.nombre_conversations
  );

  const messagesDataValues = chatbotStats.map(
    (bot) => bot.nombre_messages
  );

  const chatbotActivityData = {
    labels: chatbotLabels,

    datasets: [
      {
        label: "Conversations",
        data: conversationsData,
        backgroundColor: "rgba(0, 128, 128, 0.75)",
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: "Messages",
        data: messagesDataValues,
        backgroundColor: "rgba(99, 102, 241, 0.70)",
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  /* ======================================================= */
  /* DOUGHNUT CHATBOTS */
  /* ======================================================= */

  const chatbotDistributionData = {
    labels: [
      "Chatbots actifs",
      "Chatbots inactifs",
    ],

    datasets: [
      {
        data: [
          activeChatbots,
          inactiveChatbots,
        ],

        backgroundColor: [
          "#008080",
          "#E5E7EB",
        ],

        borderWidth: 0,

        hoverOffset: 8,
      },
    ],
  };

  /* ======================================================= */
  /* DOUGHNUT RESSOURCES */
  /* ======================================================= */

  const resourcesData = {
    labels: [
      "Documents",
      "FAQ",
    ],

    datasets: [
      {
        data: [
          totals.nombre_documents,
          totals.nombre_faq,
        ],

        backgroundColor: [
          "#F59E0B",
          "#EC4899",
        ],

        borderWidth: 0,

        hoverOffset: 8,
      },
    ],
  };

  /* ======================================================= */
  /* CONFIGURATION BAR */
  /* ======================================================= */

  const barOptions = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "top" as const,

        labels: {
          usePointStyle: true,

          padding: 15,

          color: "#6B7280",

          font: {
            size: 11,
          },
        },
      },

      tooltip: {
        backgroundColor: "#0B3C3C",

        padding: 10,

        cornerRadius: 8,

        titleColor: "#FFFFFF",

        bodyColor: "#E0E0E0",
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          color: "#6B7280",

          font: {
            size: 10,
          },

          maxRotation: 45,

          minRotation: 0,
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          color: "#6B7280",

          font: {
            size: 11,
          },
        },

        grid: {
          color: "rgba(107, 114, 128, 0.1)",
        },
      },
    },
  };

  /* ======================================================= */
  /* DOUGHNUT OPTIONS */
  /* ======================================================= */

  const doughnutOptions = {
    responsive: true,

    maintainAspectRatio: false,

    cutout: "62%",

    plugins: {
      legend: {
        position: "bottom" as const,

        labels: {
          padding: 12,

          usePointStyle: true,

          color: "#6B7280",

          font: {
            size: 11,
          },
        },
      },

      tooltip: {
        backgroundColor: "#0B3C3C",

        padding: 10,

        cornerRadius: 8,

        titleColor: "#FFFFFF",

        bodyColor: "#E0E0E0",
      },
    },
  };

  /* ======================================================= */
  /* LOADING */
  /* ======================================================= */

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">

            <div className="w-10 h-10 border-4 border-[#D9F3F3] border-t-[#008080] rounded-full animate-spin mx-auto mb-4" />

            <p className="text-sm text-gray-500">
              Chargement des statistiques...
            </p>

          </div>
        </div>
      </div>
    );
  }

  /* ======================================================= */
  /* ERROR */
  /* ======================================================= */

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-6">

          <h2 className="font-semibold text-red-600 dark:text-red-400">
            Erreur
          </h2>

          <p className="text-sm text-red-500 mt-2">
            {error}
          </p>

        </div>

      </div>
    );
  }

  /* ======================================================= */
  /* RENDER */
  /* ======================================================= */

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>

          <h1 className="text-2xl font-bold text-[#0B3C3C] dark:text-white flex items-center gap-2">

            <Sparkles className="w-6 h-6 text-[#008080]" />

            Dashboard

          </h1>

          <p className="text-sm text-[#2F6F6F] dark:text-gray-400 mt-1">
            Gérez vos assistants IA et suivez leurs performances
          </p>

        </div>

        <Link
          href="/dashboard/chatbots/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] transition"
        >

          <Plus className="w-4 h-4" />

          Nouveau chatbot

        </Link>

      </div>

      {/* ================================================== */}
      {/* GLOBAL STATS */}
      {/* ================================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

        <StatCard
          title="Chatbots"
          value={totals.nombre_chatbots}
          icon={Bot}
          color="teal"
        />

        <StatCard
          title="Conversations"
          value={totals.nombre_conversations}
          icon={MessageSquare}
          color="green"
        />

        <StatCard
          title="Messages"
          value={totals.nombre_messages}
          icon={BarChart3}
          color="indigo"
        />

        <StatCard
          title="Documents"
          value={totals.nombre_documents}
          icon={FileText}
          color="amber"
        />

        <StatCard
          title="FAQ"
          value={totals.nombre_faq}
          icon={HelpCircle}
          color="rose"
        />

      </div>

      {/* ================================================== */}
      {/* GRAPHIQUES */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ================================================= */}
        {/* ACTIVITE PAR CHATBOT */}
        {/* ================================================= */}

        <div className="rounded-xl p-5 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow duration-300">

          <div className="flex items-center justify-between mb-4">

            <div className="flex items-center gap-2">

              <BarChart3 className="w-5 h-5 text-indigo-500" />

              <h2 className="font-semibold text-[#0B3C3C] dark:text-white">
                Activité par chatbot
              </h2>

            </div>

            <span className="text-xs text-gray-400">
              Conversations / Messages
            </span>

          </div>

          <div className="h-[280px]">

            {chatbotStats.length > 0 ? (

              <Bar
                data={chatbotActivityData}
                options={barOptions}
              />

            ) : (

              <div className="h-full flex items-center justify-center">

                <div className="text-center">

                  <Bot className="w-10 h-10 text-gray-300 mx-auto mb-2" />

                  <p className="text-xs text-gray-400">
                    Aucun chatbot
                  </p>

                </div>

              </div>

            )}

          </div>

        </div>

        {/* ================================================= */}
        {/* REPARTITION CHATBOTS */}
        {/* ================================================= */}

        <div className="rounded-xl p-5 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow duration-300">

          <div className="flex items-center justify-between mb-4">

            <div className="flex items-center gap-2">

              <Database className="w-5 h-5 text-[#008080]" />

              <h2 className="font-semibold text-[#0B3C3C] dark:text-white">
                Répartition des chatbots
              </h2>

            </div>

            <span className="text-xs text-gray-400">
              {totalChatbots} total
            </span>

          </div>

          <div className="flex items-center gap-6">

            <div className="h-[190px] w-[190px]">

              {totalChatbots > 0 ? (

                <Doughnut
                  data={chatbotDistributionData}
                  options={doughnutOptions}
                />

              ) : (

                <div className="h-full w-full flex items-center justify-center">

                  <Bot className="w-10 h-10 text-gray-300" />

                </div>

              )}

            </div>

            <div className="flex-1 space-y-4">

              {/* ACTIFS */}

              <div>

                <div className="flex items-center justify-between text-sm mb-1">

                  <span className="text-gray-500">
                    Actifs
                  </span>

                  <span className="font-semibold text-[#008080]">
                    {activeChatbots}
                  </span>

                </div>

                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-[#008080] rounded-full transition-all"
                    style={{
                      width: `${activePercentage}%`,
                    }}
                  />

                </div>

                <p className="text-[11px] text-gray-400 mt-1">
                  {activePercentage}% du total
                </p>

              </div>

              {/* INACTIFS */}

              <div>

                <div className="flex items-center justify-between text-sm mb-1">

                  <span className="text-gray-500">
                    Inactifs
                  </span>

                  <span className="font-semibold text-gray-400">
                    {inactiveChatbots}
                  </span>

                </div>

                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-gray-400 rounded-full transition-all"
                    style={{
                      width: `${inactivePercentage}%`,
                    }}
                  />

                </div>

                <p className="text-[11px] text-gray-400 mt-1">
                  {inactivePercentage}% du total
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ================================================== */}
      {/* RESSOURCES */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ================================================= */}
        {/* DOCUMENTS / FAQ */}
        {/* ================================================= */}

        <div className="rounded-xl p-5 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow duration-300">

          <div className="flex items-center justify-between mb-4">

            <div className="flex items-center gap-2">

              <FileText className="w-5 h-5 text-amber-500" />

              <h2 className="font-semibold text-[#0B3C3C] dark:text-white">
                Base de connaissances
              </h2>

            </div>

            <span className="text-xs text-gray-400">
              Ressources
            </span>

          </div>

          <div className="flex items-center gap-6">

            <div className="h-[180px] w-[180px]">

              {(totals.nombre_documents + totals.nombre_faq) > 0 ? (

                <Doughnut
                  data={resourcesData}
                  options={doughnutOptions}
                />

              ) : (

                <div className="h-full flex items-center justify-center">

                  <Database className="w-10 h-10 text-gray-300" />

                </div>

              )}

            </div>

            <div className="flex-1 space-y-4">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <div className="w-3 h-3 rounded-full bg-amber-500" />

                  <span className="text-sm text-gray-500">
                    Documents
                  </span>

                </div>

                <span className="font-semibold text-[#0B3C3C] dark:text-white">
                  {totals.nombre_documents}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <div className="w-3 h-3 rounded-full bg-pink-500" />

                  <span className="text-sm text-gray-500">
                    FAQ
                  </span>

                </div>

                <span className="font-semibold text-[#0B3C3C] dark:text-white">
                  {totals.nombre_faq}
                </span>

              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800">

                <p className="text-xs text-gray-400">
                  Total des ressources
                </p>

                <p className="text-xl font-bold text-[#008080]">
                  {(
                    totals.nombre_documents +
                    totals.nombre_faq
                  ).toLocaleString("fr-FR")}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* RESUME ACTIVITE */}
        {/* ================================================= */}

        <div className="rounded-xl p-5 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow duration-300">

          <div className="flex items-center gap-2 mb-5">

            <Zap className="w-5 h-5 text-[#008080]" />

            <h2 className="font-semibold text-[#0B3C3C] dark:text-white">
              Résumé de l'activité
            </h2>

          </div>

          <div className="space-y-4">

            {/* CONVERSATIONS */}

            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-950/40 flex items-center justify-center">

                  <MessageSquare className="w-4 h-4 text-green-600" />

                </div>

                <div>

                  <p className="text-sm font-medium text-[#0B3C3C] dark:text-white">
                    Conversations
                  </p>

                  <p className="text-xs text-gray-400">
                    Total enregistré
                  </p>

                </div>

              </div>

              <span className="text-lg font-bold text-green-600">
                {totals.nombre_conversations.toLocaleString("fr-FR")}
              </span>

            </div>

            {/* MESSAGES */}

            <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/20">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center">

                  <BarChart3 className="w-4 h-4 text-indigo-600" />

                </div>

                <div>

                  <p className="text-sm font-medium text-[#0B3C3C] dark:text-white">
                    Messages
                  </p>

                  <p className="text-xs text-gray-400">
                    Total échangé
                  </p>

                </div>

              </div>

              <span className="text-lg font-bold text-indigo-600">
                {totals.nombre_messages.toLocaleString("fr-FR")}
              </span>

            </div>

            {/* MOYENNE */}

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#D9F3F3] dark:bg-[#123D3D]">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center">

                  <Bot className="w-4 h-4 text-[#008080]" />

                </div>

                <div>

                  <p className="text-sm font-medium text-[#0B3C3C] dark:text-white">
                    Messages / conversation
                  </p>

                  <p className="text-xs text-gray-400">
                    Moyenne
                  </p>

                </div>

              </div>

              <span className="text-lg font-bold text-[#008080]">

                {totals.nombre_conversations > 0
                  ? (
                      totals.nombre_messages /
                      totals.nombre_conversations
                    ).toFixed(1)
                  : "0"}

              </span>

            </div>

          </div>

        </div>

      </div>

      {/* ================================================== */}
      {/* QUICK ACTIONS */}
      {/* ================================================== */}

      <div className="rounded-xl p-5 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow duration-300">

        <div className="flex items-center gap-2 mb-4">

          <Zap className="w-5 h-5 text-[#008080]" />

          <h2 className="font-semibold text-[#0B3C3C] dark:text-white">
            Actions rapides
          </h2>

        </div>

        <div className="grid sm:grid-cols-3 gap-3">

          <ActionCard
            title="Gérer les employés"
            icon={Users}
            href="/dashboard/employes"
            color="teal"
          />

          <ActionCard
            title="Gérer les chatbots"
            icon={Settings}
            href="/dashboard/chatbots"
            color="indigo"
          />

          <ActionCard
            title="Voir les analytics"
            icon={BarChart3}
            href="/dashboard/stats"
            color="amber"
          />

        </div>

      </div>

      {/* ================================================== */}
      {/* CHATBOTS */}
      {/* ================================================== */}

      <div className="rounded-xl p-5 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow duration-300">

        <div className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-2">

            <Bot className="w-5 h-5 text-[#008080]" />

            <h2 className="font-semibold text-[#0B3C3C] dark:text-white">
              Vos chatbots
            </h2>

            <span className="text-xs bg-[#D9F3F3] dark:bg-[#123D3D] text-[#008080] px-2 py-0.5 rounded-full">
              {chatbots.length}
            </span>

          </div>

          <Link
            href="/dashboard/chatbots"
            className="text-sm text-[#008080] hover:underline flex items-center gap-1"
          >
            Voir tous

            <ChevronRight className="w-4 h-4" />

          </Link>

        </div>

        {chatbots.length === 0 ? (

          <div className="text-center py-12">

            <Bot className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />

            <p className="text-[#2F6F6F] dark:text-gray-400 text-sm mb-3">
              Aucun chatbot pour le moment
            </p>

            <Link
              href="/dashboard/chatbots/create"
              className="inline-flex items-center gap-2 text-sm text-[#008080] hover:underline font-medium"
            >
              Créer votre premier chatbot

              <ArrowRight className="w-4 h-4" />

            </Link>

          </div>

        ) : (

          <div className="space-y-2">

            {chatbots
              .slice(0, 5)
              .map((bot) => (

                <ChatbotRow
                  key={bot.id}
                  bot={bot}
                />

              ))}

            {chatbots.length > 5 && (

              <p className="text-xs text-[#2F6F6F] dark:text-gray-400 italic text-center pt-3 border-t border-[#B8E0E0] dark:border-gray-800">

                Affichage des 5 premiers chatbots.
                {" "}
                {chatbots.length - 5}
                {" "}
                autres disponibles.

              </p>

            )}

          </div>

        )}

      </div>

    </div>
  );
}

/* ========================================================= */
/* STAT CARD */
/* ========================================================= */

function StatCard({
  title,
  value,
  icon: Icon,
  color = "teal",
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: "teal" | "green" | "indigo" | "amber" | "rose";
}) {

  const colorClasses = {
    teal:
      "bg-[#008080]/5 border-[#008080]/20",

    green:
      "bg-emerald-500/5 border-emerald-500/20",

    indigo:
      "bg-indigo-500/5 border-indigo-500/20",

    amber:
      "bg-amber-500/5 border-amber-500/20",

    rose:
      "bg-rose-500/5 border-rose-500/20",
  };

  const iconColors = {
    teal:
      "text-[#008080]",

    green:
      "text-emerald-500",

    indigo:
      "text-indigo-500",

    amber:
      "text-amber-500",

    rose:
      "text-rose-500",
  };

  return (
    <div
      className={`
        rounded-xl
        p-4
        bg-white
        dark:bg-gray-900
        border
        ${colorClasses[color]}
        hover:shadow-lg
        transition-all
        duration-300
      `}
    >

      <div className="flex items-center justify-between mb-2">

        <Icon
          className={`
            w-6 h-6
            ${iconColors[color]}
          `}
        />

      </div>

      <div className="text-2xl font-bold text-[#0B3C3C] dark:text-white">

        {value.toLocaleString("fr-FR")}

      </div>

      <div className="text-xs text-[#2F6F6F] dark:text-gray-400 mt-1">

        {title}

      </div>

    </div>
  );
}

/* ========================================================= */
/* ACTION CARD */
/* ========================================================= */

function ActionCard({
  title,
  icon: Icon,
  href,
  color = "teal",
}: {
  title: string;
  icon: React.ElementType;
  href: string;
  color: "teal" | "indigo" | "amber";
}) {

  const colors = {

    teal:
      "hover:bg-[#008080]/5 border-[#008080]/20",

    indigo:
      "hover:bg-indigo-500/5 border-indigo-500/20",

    amber:
      "hover:bg-amber-500/5 border-amber-500/20",
  };

  return (

    <Link href={href}>

      <div
        className={`
          flex
          items-center
          gap-3
          p-3
          border
          rounded-lg
          ${colors[color]}
          hover:shadow-sm
          transition-all
          duration-200
          group
        `}
      >

        <Icon
          className="w-4 h-4 text-[#008080] group-hover:scale-110 transition-transform"
        />

        <span className="text-sm text-[#0B3C3C] dark:text-white">
          {title}
        </span>

        <ChevronRight
          className="w-4 h-4 text-gray-300 ml-auto group-hover:translate-x-1 transition-transform"
        />

      </div>

    </Link>
  );
}

/* ========================================================= */
/* CHATBOT ROW */
/* ========================================================= */

function ChatbotRow({
  bot,
}: {
  bot: Chatbot;
}) {

  const statusColors = {

    actif:
      "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",

    inactif:
      "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  };

  const status =
    bot.statut === "actif"
      ? "actif"
      : "inactif";

  return (

    <div className="flex items-center justify-between p-3 rounded-lg border border-[#B8E0E0] dark:border-gray-700 hover:border-[#008080]/30 hover:shadow-sm transition-all duration-200">

      <div className="flex items-center gap-3 min-w-0">

        <div className="w-10 h-10 rounded-lg bg-[#D9F3F3] dark:bg-[#123D3D] flex items-center justify-center shrink-0">

          <Bot className="w-5 h-5 text-[#008080]" />

        </div>

        <div className="min-w-0">

          <p className="font-medium text-[#0B3C3C] dark:text-white truncate">
            {bot.nom}
          </p>

          <div className="flex items-center gap-2">

            <p className="text-xs text-[#2F6F6F] dark:text-gray-400 truncate">
              {bot.description || "Aucune description"}
            </p>

            <span
              className={`
                text-xs
                px-1.5
                py-0.5
                rounded-full
                ${statusColors[status]}
              `}
            >
              {status}
            </span>

          </div>

        </div>

      </div>

      <Link
        href={`/dashboard/chatbots/${bot.id}`}
        className="text-sm text-[#008080] hover:underline flex items-center gap-1 shrink-0"
      >

        Gérer

        <ChevronRight className="w-4 h-4" />

      </Link>

    </div>
  );
}