"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  MessageSquare,
  Bot,
  FileText,
  HelpCircle,
  Loader2,
  PieChart,
  TrendingUp,
  Clock,
  Zap,
  Sparkles,
} from "lucide-react";

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
import PeriodFilter, { Period } from "@/components/PeriodFilter";

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

type ChatbotStat = {
  id: string;
  nom: string;
  statut: string;
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
};

/* ========================================================= */
/* PAGE */
/* ========================================================= */

export default function EmployeStatsPage() {
  const router = useRouter();

  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("tout");

  /* ======================================================= */
  /* CHARGEMENT */
  /* ======================================================= */

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "employe") {
      router.push("/login");
      return;
    }

    setLoading(true);

    const loadStatistics = async () => {
      try {
        const response = await fetch(
          `${API_URL}/statistiques/overview?period=${period}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            "Erreur de chargement des statistiques"
          );
        }

        const json: Overview = await response.json();

        setData(json);
      } catch (err) {
        console.error(
          "Erreur statistiques :",
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

    loadStatistics();
  }, [router, period]);

  /* ======================================================= */
  /* LOADING */
  /* ======================================================= */

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-[#008080]/20 border-t-[#008080] animate-spin"></div>
            <Bot className="w-6 h-6 text-[#008080] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Chargement des statistiques...
          </p>
        </div>
      </div>
    );
  }

  /* ======================================================= */
  /* ERROR */
  /* ======================================================= */

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-red-600 dark:text-red-400">
                Erreur
              </p>
              <p className="text-sm text-red-500 dark:text-red-300 mt-1">
                {error || "Impossible de charger les statistiques."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { totals, chatbots } = data;

  /* ======================================================= */
  /* DONNÉES GRAPHIQUES */
  /* ======================================================= */

  const chatbotNames = chatbots.map(
    (bot) => bot.nom
  );

  /* ======================================================= */
  /* GRAPHIQUE CONVERSATIONS */
  /* ======================================================= */

  const conversationsChartData = {
    labels: chatbotNames,

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

  /* ======================================================= */
  /* GRAPHIQUE MESSAGES */
  /* ======================================================= */

  const messagesChartData = {
    labels: chatbotNames,

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

  /* ======================================================= */
  /* GRAPHIQUE DOCUMENTS + FAQ */
  /* ======================================================= */

  const resourcesChartData = {
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
  /* OPTIONS BAR */
  /* ======================================================= */

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

        titleColor: "#FFFFFF",

        bodyColor: "#E0E0E0",

        titleFont: {
          size: 14,
          weight: "bold" as const,
        },

        bodyFont: {
          size: 13,
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
          color: "#6B7280",

          font: {
            size: 11,
          },

          precision: 0,
        },

        grid: {
          color: "rgba(107, 114, 128, 0.1)",
        },
      },
    },
  };

  /* ======================================================= */
  /* OPTIONS DOUGHNUT */
  /* ======================================================= */

  const doughnutOptions = {
    responsive: true,

    maintainAspectRatio: false,

    cutout: "65%",

    plugins: {
      legend: {
        position: "bottom" as const,

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

        titleFont: {
          size: 14,
          weight: "bold" as const,
        },

        bodyFont: {
          size: 13,
        },

        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      },
    },
  };

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
            
            Mes statistiques
          </h1>

          <p className="text-sm text-[#2F6F6F] dark:text-gray-400 mt-1">
            Performances de vos chatbots
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-full shadow-sm">
          <Clock className="w-4 h-4" />
          <span>Mise à jour en temps réel</span>
        </div>
      </div>

      {/* ================================================== */}
      {/* FILTRE PAR PÉRIODE */}
      {/* ================================================== */}

      <PeriodFilter value={period} onChange={setPeriod} />

      {/* ================================================== */}
     { /* STATISTIQUES GLOBALES */}
      {/* ================================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

        <StatCard
          title="Chatbots"
          value={totals.nombre_chatbots}
          icon={<Bot className="w-6 h-6 text-[#008080]" />}
          color="teal"
        />

        <StatCard
          title="Conversations"
          value={totals.nombre_conversations}
          icon={<MessageSquare className="w-6 h-6 text-emerald-500" />}
          color="green"
        />

        <StatCard
          title="Messages"
          value={totals.nombre_messages}
          icon={<BarChart3 className="w-6 h-6 text-indigo-500" />}
          color="indigo"
        />

        <StatCard
          title="Documents"
          value={totals.nombre_documents}
          icon={<FileText className="w-6 h-6 text-amber-500" />}
          color="amber"
        />

        <StatCard
          title="FAQ"
          value={totals.nombre_faq}
          icon={<HelpCircle className="w-6 h-6 text-rose-500" />}
          color="rose"
        />

      </div>

      {/* ================================================== */}
      {/* GRAPHIQUES */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ================================================= */}
       { /* CONVERSATIONS PAR CHATBOT */}
       {/* ================================================= */}

        <ChartCard
          title="Conversations par chatbot"
          icon={<MessageSquare className="w-5 h-5 text-[#008080]" />}
          color="teal"
        >
          {chatbots.length > 0 ? (
            <div className="h-[300px]">
              <Bar
                data={conversationsChartData}
                options={barOptions}
              />
            </div>
          ) : (
            <EmptyChart icon={<MessageSquare className="w-12 h-12 text-gray-300" />} />
          )}
        </ChartCard>

        {/* ================================================= */}
      {  /* MESSAGES PAR CHATBOT */}
        {/* ================================================= */}

        <ChartCard
          title="Messages par chatbot"
          icon={<BarChart3 className="w-5 h-5 text-indigo-500" />}
          color="indigo"
        >
          {chatbots.length > 0 ? (
            <div className="h-[300px]">
              <Bar
                data={messagesChartData}
                options={barOptions}
              />
            </div>
          ) : (
            <EmptyChart icon={<BarChart3 className="w-12 h-12 text-gray-300" />} />
          )}
        </ChartCard>

      </div>

      {/* ================================================== */}
     { /* RESSOURCES */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ================================================= */}
        {/* DOCUMENTS + FAQ */}
        {/* ================================================= */}

        <ChartCard
          title="Ressources utilisées"
          icon={<PieChart className="w-5 h-5 text-amber-500" />}
          color="amber"
        >
          {totals.nombre_documents + totals.nombre_faq > 0 ? (
            <div className="h-[280px]">
              <Doughnut
                data={resourcesChartData}
                options={doughnutOptions}
              />
            </div>
          ) : (
            <EmptyChart icon={<PieChart className="w-12 h-12 text-gray-300" />} />
          )}
        </ChartCard>

        {/* ================================================= */}
       { /* RÉSUMÉ */}
        {/* ================================================= */}

        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow duration-300">

          <div className="flex items-center gap-2 mb-6">

            <div className="w-10 h-10 rounded-xl bg-[#E6F5F5] dark:bg-[#123D3D] flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#008080]" />
            </div>

            <div>
              <h2 className="font-semibold text-[#0B3C3C] dark:text-white">
                Résumé
              </h2>
              <p className="text-xs text-gray-400">Vue d'ensemble de vos données</p>
            </div>

          </div>

          <div className="space-y-3">

            <SummaryRow
              label="Chatbots"
              value={totals.nombre_chatbots}
              icon={<Bot className="w-4 h-4 text-[#008080]" />}
              color="teal"
            />

            <SummaryRow
              label="Conversations"
              value={totals.nombre_conversations}
              icon={<MessageSquare className="w-4 h-4 text-emerald-500" />}
              color="green"
            />

            <SummaryRow
              label="Messages"
              value={totals.nombre_messages}
              icon={<BarChart3 className="w-4 h-4 text-indigo-500" />}
              color="indigo"
            />

            <SummaryRow
              label="Documents"
              value={totals.nombre_documents}
              icon={<FileText className="w-4 h-4 text-amber-500" />}
              color="amber"
            />

            <SummaryRow
              label="FAQ"
              value={totals.nombre_faq}
              icon={<HelpCircle className="w-4 h-4 text-rose-500" />}
              color="rose"
            />

          </div>

          {chatbots.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Total ressources</span>
                <span className="font-semibold text-[#008080]">
                  {totals.nombre_documents + totals.nombre_faq}
                </span>
              </div>
            </div>
          )}

        </div>

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
  icon,
  color = "teal",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: "teal" | "green" | "indigo" | "amber" | "rose";
}) {
  const colorClasses = {
    teal: "bg-[#008080]/5 border-[#008080]/20",
    green: "bg-emerald-500/5 border-emerald-500/20",
    indigo: "bg-indigo-500/5 border-indigo-500/20",
    amber: "bg-amber-500/5 border-amber-500/20",
    rose: "bg-rose-500/5 border-rose-500/20",
  };

  const accentColors = {
    teal: "bg-[#008080]",
    green: "bg-emerald-500",
    indigo: "bg-indigo-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  };

  return (
    <div className={`p-5 rounded-xl border bg-white dark:bg-gray-900 ${colorClasses[color]} hover:shadow-lg transition-all duration-300 group relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 h-1 w-full ${accentColors[color]}`}></div>

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

/* ========================================================= */
/* CHART CARD */
/* ========================================================= */

function ChartCard({
  title,
  icon,
  children,
  color = "teal",
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  color?: "teal" | "indigo" | "amber" | "rose" | "green";
}) {
  const colors = {
    teal: "border-[#008080]/20",
    indigo: "border-indigo-500/20",
    amber: "border-amber-500/20",
    rose: "border-rose-500/20",
    green: "border-emerald-500/20",
  };

  return (
    <div className={`p-6 rounded-2xl bg-white dark:bg-gray-900 border ${colors[color]} shadow-sm hover:shadow-md transition-shadow duration-300`}>

      <div className="flex items-center gap-2 mb-5">

        <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
          {icon}
        </div>

        <h2 className="font-semibold text-[#0B3C3C] dark:text-white">
          {title}
        </h2>

      </div>

      {children}

    </div>
  );
}

/* ========================================================= */
/* EMPTY CHART */
/* ========================================================= */

function EmptyChart({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="h-[280px] flex items-center justify-center">

      <div className="text-center">

        {icon}

        <p className="text-sm text-gray-400 mt-3">
          Aucune donnée disponible
        </p>

      </div>

    </div>
  );
}

/* ========================================================= */
/* SUMMARY ROW */
/* ========================================================= */

function SummaryRow({
  label,
  value,
  icon,
  color = "teal",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: "teal" | "green" | "indigo" | "amber" | "rose";
}) {
  const bgColors = {
    teal: "bg-[#008080]/5",
    green: "bg-emerald-500/5",
    indigo: "bg-indigo-500/5",
    amber: "bg-amber-500/5",
    rose: "bg-rose-500/5",
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${bgColors[color]} transition-colors duration-200 hover:bg-opacity-10`}>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {label}
        </span>
      </div>

      <span className="font-semibold text-[#0B3C3C] dark:text-white">
        {value.toLocaleString("fr-FR")}
      </span>

    </div>
  );
}