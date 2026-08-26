"use client";

import {
  BarChart3,
  MessageSquare,
  Bot,
  FileText,
  HelpCircle,
  Users,
  ChevronDown,
  ChevronUp,
  Loader2,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";

import { useEffect, useState } from "react";
import Link from "next/link";

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

import { API_URL } from "@/services/api";
import PeriodFilter, { Period } from "@/components/PeriodFilter";

/* =========================================================
   CONFIGURATION CHART.JS
========================================================= */

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

/* =========================================================
   TYPES
========================================================= */

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

/* =========================================================
   PAGE
========================================================= */

export default function StatsPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("tout");

  /* =======================================================
     CHARGEMENT DES STATISTIQUES
  ======================================================= */

  useEffect(() => {
    const token = localStorage.getItem("token");

    setLoading(true);

    fetch(`${API_URL}/statistiques/overview?period=${period}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur de chargement des statistiques");
        }

        return res.json();
      })
      .then((json) => {
        setData(json);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [period]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#008080]" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-6 text-center">
          <p className="text-red-600 dark:text-red-400">
            {error || "Impossible de charger les statistiques."}
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     DATA
  ======================================================= */

  const {
    totals,
    chatbots,
    par_employe = [],
  } = data;

  /* =======================================================
     CHART : CONVERSATIONS PAR CHATBOT
  ======================================================= */

  const conversationsChartData = {
    labels: chatbots.map((bot) => bot.nom),

    datasets: [
      {
        label: "Conversations",

        data: chatbots.map(
          (bot) => bot.nombre_conversations
        ),

        backgroundColor: "rgba(0, 128, 128, 0.7)",

        borderColor: "#008080",

        borderWidth: 1,

        borderRadius: 8,

        borderSkipped: false,
      },
    ],
  };

  /* =======================================================
     CHART : MESSAGES PAR CHATBOT
  ======================================================= */

  const messagesChartData = {
    labels: chatbots.map((bot) => bot.nom),

    datasets: [
      {
        label: "Messages",

        data: chatbots.map(
          (bot) => bot.nombre_messages
        ),

        backgroundColor: "rgba(99, 102, 241, 0.7)",

        borderColor: "#6366F1",

        borderWidth: 1,

        borderRadius: 8,

        borderSkipped: false,
      },
    ],
  };

  /* =======================================================
     CHART : CHATBOTS PAR EMPLOYE
  ======================================================= */

  const employeeChartData = {
    labels: par_employe.map((employee) => employee.nom),

    datasets: [
      {
        label: "Chatbots",

        data: par_employe.map(
          (employee) => employee.nombre_chatbots
        ),

        backgroundColor: "rgba(20, 184, 166, 0.7)",

        borderColor: "#14B8A6",

        borderWidth: 1,

        borderRadius: 8,

        borderSkipped: false,
      },
    ],
  };

  /* =======================================================
     CHART : DOCUMENTS / FAQ
  ======================================================= */

  const resourcesChartData = {
    labels: ["Documents", "FAQ"],

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

  /* =======================================================
     OPTIONS COMMUNES
  ======================================================= */

  const barOptions = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: "#0B3C3C",

        padding: 12,

        cornerRadius: 8,

        displayColors: false,

        titleColor: "#FFFFFF",

        bodyColor: "#E0E0E0",

        bodyFont: {
          size: 13,
        },

        titleFont: {
          size: 14,
          weight: "bold" as const,
        },
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
          color: "rgba(107, 114, 128, 0.1)",
        },
      },
    },
  };

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0B3C3C] dark:text-white flex items-center gap-3">
          
            Statistiques
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Vue globale des performances de vos chatbots
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl shadow-sm">
          <Clock className="w-4 h-4" />
          <span>Dernière mise à jour : aujourd'hui</span>
        </div>
      </div>

      {/* =================================================
          FILTRE PAR PÉRIODE
      ================================================= */}

      <PeriodFilter value={period} onChange={setPeriod} />


      {/* =================================================
          PREMIER GRAPHIQUE
      ================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CONVERSATIONS */}

        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow duration-300">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="font-semibold text-[#0B3C3C] dark:text-white text-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#008080] inline-block"></span>
                Conversations par chatbot
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Nombre total de conversations
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-[#E6F5F5] dark:bg-[#123D3D] flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#008080]" />
            </div>

          </div>

          {chatbots.length === 0 ? (
            <div className="h-[320px] flex items-center justify-center">
              <p className="text-sm text-gray-500">
                Aucun chatbot disponible.
              </p>
            </div>
          ) : (
            <div className="h-[320px]">
              <Bar
                data={conversationsChartData}
                options={barOptions}
              />
            </div>
          )}

        </div>

        {/* MESSAGES */}

        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow duration-300">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="font-semibold text-[#0B3C3C] dark:text-white text-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
                Messages par chatbot
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Nombre total de messages
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
            </div>

          </div>

          {chatbots.length === 0 ? (
            <div className="h-[320px] flex items-center justify-center">
              <p className="text-sm text-gray-500">
                Aucun chatbot disponible.
              </p>
            </div>
          ) : (
            <div className="h-[320px]">
              <Bar
                data={messagesChartData}
                options={barOptions}
              />
            </div>
          )}

        </div>

      </div>

      {/* =================================================
          DEUXIEME LIGNE DE GRAPHIQUES
      ================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* EMPLOYES */}

        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow duration-300">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="font-semibold text-[#0B3C3C] dark:text-white text-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#14B8A6] inline-block"></span>
                Chatbots par employé
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Nombre de chatbots créés par employé
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#14B8A6]" />
            </div>

          </div>

          {par_employe.length === 0 ? (
            <div className="h-[320px] flex items-center justify-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Aucun employé n'a encore créé de chatbot.
              </p>
            </div>
          ) : (
            <div className="h-[320px]">
              <Bar
                data={employeeChartData}
                options={barOptions}
              />
            </div>
          )}

        </div>

        {/* DOCUMENTS / FAQ */}

        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow duration-300">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="font-semibold text-[#0B3C3C] dark:text-white text-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                Base de connaissance
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Documents et questions fréquentes
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-500" />
            </div>

          </div>

          <div className="h-[320px] flex justify-center">

            <Doughnut
              data={resourcesChartData}
              options={{
                responsive: true,

                maintainAspectRatio: false,

                cutout: "65%",

                plugins: {
                  legend: {
                    position: "bottom",

                    labels: {
                      padding: 20,

                      usePointStyle: true,

                      color: "#6B7280",

                      font: {
                        size: 13,
                        weight: "500" as const,
                      },
                    },
                  },

                  tooltip: {
                    backgroundColor: "#0B3C3C",

                    padding: 12,

                    cornerRadius: 8,

                    titleColor: "#FFFFFF",

                    bodyColor: "#E0E0E0",

                    bodyFont: {
                      size: 13,
                    },

                    titleFont: {
                      size: 14,
                      weight: "bold" as const,
                    },
                  },
                },
              }}
            />

          </div>

        </div>

      </div>

 

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: "teal" | "green" | "indigo" | "amber" | "rose";
}) {
  const colorClasses = {
    teal: "bg-[#008080]/5 hover:bg-[#008080]/10",
    green: "bg-emerald-500/5 hover:bg-emerald-500/10",
    indigo: "bg-indigo-500/5 hover:bg-indigo-500/10",
    amber: "bg-amber-500/5 hover:bg-amber-500/10",
    rose: "bg-rose-500/5 hover:bg-rose-500/10",
  };

  const accentColors = {
    teal: "bg-[#008080]",
    green: "bg-emerald-500",
    indigo: "bg-indigo-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  };

  const selectedColor = color || "teal";

  return (
    <div
      className={`
        p-5
        rounded-xl
        bg-white
        dark:bg-gray-900
        ${colorClasses[selectedColor]}
        hover:shadow-lg
        transition-all
        duration-300
        group
        relative
        overflow-hidden
      `}
    >
      <div className={`absolute top-0 left-0 h-1 w-full ${accentColors[selectedColor]}`}></div>

      <div className="flex justify-between items-center">

        <div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </p>

          <p className="text-2xl font-bold text-[#0B3C3C] dark:text-white mt-1">
            {value.toLocaleString("fr-FR")}
          </p>

        </div>

        <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>

      </div>

    </div>
  );
}

/* =========================================================
   CHATBOT STAT ROW
========================================================= */

function ChatbotStatRow({
  bot,
  period,
}: {
  bot: ChatbotStat;
  period: Period;
}) {
  const [open, setOpen] = useState(false);

  const [conversations, setConversations] =
    useState<any[] | null>(null);

  const [loadingConv, setLoadingConv] =
    useState(false);

  /*
   * Si la période change pendant que le détail est déjà
   * chargé, on force un rechargement à la prochaine ouverture.
   */
  useEffect(() => {
    setConversations(null);
  }, [period]);

  /* =======================================================
     OUVRIR / FERMER
  ======================================================= */

  const toggle = async () => {

    setOpen((value) => !value);

    /*
     * On charge les conversations seulement
     * lors de la première ouverture (ou après
     * un changement de période).
     */

    if (!open && conversations === null) {

      setLoadingConv(true);

      try {

        const token = localStorage.getItem("token");

        const res = await fetch(
          `${API_URL}/statistiques/chatbot/${bot.id}?period=${period}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(
            "Impossible de charger les conversations"
          );
        }

        const json = await res.json();

        setConversations(
          json.conversations || []
        );

      } catch (error) {

        console.error(error);

        setConversations([]);

      } finally {

        setLoadingConv(false);

      }
    }
  };

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="rounded-xl overflow-hidden transition-all duration-200 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/50 dark:hover:bg-gray-800/50">

      {/* =================================================
          HEADER CHATBOT
      ================================================= */}

      <button
        onClick={toggle}
        className="
          w-full
          flex
          items-center
          justify-between
          p-4
          text-left
          transition
          duration-200
        "
      >

        <div className="flex-1 min-w-0 pr-4">

          <div className="flex items-center justify-between gap-4 mb-2">

            <div className="flex items-center gap-3 min-w-0">

              <div className="w-9 h-9 rounded-lg bg-[#E6F5F5] dark:bg-[#123D3D] flex items-center justify-center shrink-0">

                <Bot className="w-5 h-5 text-[#008080]" />

              </div>

              <div className="min-w-0">

                <p className="font-medium text-[#0B3C3C] dark:text-white truncate">
                  {bot.nom}
                </p>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${bot.statut === "actif" ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}>
                    {bot.statut}
                  </span>
                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              MINI STATS
          ================================================= */}

          <div className="flex flex-wrap gap-1.5">

            <span className="text-xs px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400">
              <MessageSquare className="w-3 h-3 inline mr-1" />
              {bot.nombre_conversations} conv.
            </span>

            <span className="text-xs px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
              <BarChart3 className="w-3 h-3 inline mr-1" />
              {bot.nombre_messages} msg.
            </span>

            <span className="text-xs px-2.5 py-1 rounded-md bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400">
              <FileText className="w-3 h-3 inline mr-1" />
              {bot.nombre_documents} docs
            </span>

            <span className="text-xs px-2.5 py-1 rounded-md bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400">
              <HelpCircle className="w-3 h-3 inline mr-1" />
              {bot.nombre_faq} FAQ
            </span>

          </div>

        </div>

        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
          {open ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>

      </button>

      {/* =================================================
          DETAILS
      ================================================= */}

      {open && (

        <div className="px-4 pb-4 bg-gray-50/30 dark:bg-gray-800/20">

          {loadingConv ? (

            <div className="flex justify-center py-8">

              <Loader2 className="w-5 h-5 animate-spin text-[#008080]" />

            </div>

          ) : conversations &&
            conversations.length > 0 ? (

            <div className="overflow-x-auto mt-4">

              <table className="w-full text-xs">

                <thead>

                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">

                    <th className="py-2.5 pr-4 font-medium">
                      Conversation
                    </th>

                    <th className="py-2.5 pr-4 font-medium">
                      Messages
                    </th>

                    <th className="py-2.5 pr-4 font-medium">
                      Début
                    </th>

                    <th className="py-2.5 font-medium">
                      Fin
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {conversations.map(
                    (conversation: any) => (

                      <tr
                        key={conversation.session_id}
                        className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                      >

                        <td className="py-2.5 pr-4 font-mono text-[10px] text-gray-500">

                          {conversation.session_id?.startsWith(
                            "legacy-"
                          )
                            ? "Historique"
                            : conversation.session_id?.slice(
                                0,
                                8
                              )}

                        </td>

                        <td className="py-2.5 pr-4 font-medium text-gray-700 dark:text-gray-300">

                          {conversation.nombre_messages}

                        </td>

                        <td className="py-2.5 pr-4 text-gray-500">

                          {conversation.debut
                            ? new Date(
                                conversation.debut
                              ).toLocaleString("fr-FR", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}

                        </td>

                        <td className="py-2.5 text-gray-500">

                          {conversation.fin
                            ? new Date(
                                conversation.fin
                              ).toLocaleString("fr-FR", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          ) : (

            <div className="text-center py-6">
              <MessageSquare className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Aucune conversation pour ce chatbot.
              </p>
            </div>

          )}

          {/* =================================================
              LIEN VERS CHATBOT
          ================================================= */}

          <Link
            href={`/dashboard/chatbots/${bot.id}/base-de-connaissance`}
            className="
              text-xs
              text-[#008080]
              hover:text-[#14B8A6]
              hover:underline
              inline-flex
              items-center
              gap-1.5
              mt-3
              font-medium
              transition-colors
              group
            "
          >
            Voir le chatbot
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>

        </div>

      )}

    </div>
  );
}