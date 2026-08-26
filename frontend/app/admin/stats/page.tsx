"use client";

import {
  Bot,
  MessageSquare,
  Building2,
  Shield,
  Trash2,
  Eye,
  Search,
  RefreshCw,
  CheckCircle,
  Clock,
  BarChart3,
  Users,
  FileText,
  HelpCircle,
  Activity
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import PeriodFilter, { Period } from "@/components/PeriodFilter";

/* ========================================================= */
/* CHART JS */
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

interface Entreprise {
  id: string;
  nomentreprise: string;
  email: string;
  secteurd_activite: string;
  statut: string;
}

interface Chatbot {
  id: string;
  nom: string;
  domaine: string | null;
  statut: string;
  entreprise_id: string;
  entreprise?: {
    nomentreprise: string;
  } | null;
}

interface StatsParEntreprise {
  entreprise_id: string;
  nomentreprise: string;
  nombre_chatbots: number;
  nombre_conversations: number;
  nombre_messages: number;
  nombre_documents: number;
  nombre_faq: number;
}

interface GlobalStats {
  nombre_chatbots: number;
  nombre_conversations: number;
  nombre_messages: number;
  nombre_documents: number;
  nombre_faq: number;
}

interface OverviewResponse {
  totals: GlobalStats;
  par_entreprise?: StatsParEntreprise[];
}

/* ========================================================= */
/* PAGE */
/* ========================================================= */

export default function AdminDashboardPage() {
  const router = useRouter();

  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [parEntreprise, setParEntreprise] = useState<
    StatsParEntreprise[]
  >([]);

  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    nombre_chatbots: 0,
    nombre_conversations: 0,
    nombre_messages: 0,
    nombre_documents: 0,
    nombre_faq: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  const [period, setPeriod] = useState<Period>("tout");

  const [selectedTab, setSelectedTab] = useState<
    "overview" | "entreprises" | "chatbots"
  >("overview");

  const [searchTerm, setSearchTerm] = useState("");

  /* ========================================================= */
  /* CHARGEMENT */
  /* ========================================================= */

  const fetchAdminData = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "super_admin") {
      router.push("/login");
      return;
    }

    setIsLoading(true);

    try {
      const [
        entReponse,
        botsResponse,
        statsResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/admin/entreprises`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch(`${API_URL}/chatbot/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch(`${API_URL}/statistiques/overview?period=${period}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      /* ===================================================== */
      /* ENTREPRISES */
      /* ===================================================== */

      if (entReponse.status === 401) {
        router.push("/login");
        return;
      }

      const entJson = await entReponse.json();

      setEntreprises(
        Array.isArray(entJson)
          ? entJson
          : []
      );

      /* ===================================================== */
      /* CHATBOTS */
      /* ===================================================== */

      if (botsResponse.status === 401) {
        router.push("/login");
        return;
      }

      const botsJson = await botsResponse.json();

      setChatbots(
        Array.isArray(botsJson)
          ? botsJson
          : []
      );

      /* ===================================================== */
      /* STATISTIQUES */
      /* ===================================================== */

      if (statsResponse.status === 401) {
        router.push("/login");
        return;
      }

      if (statsResponse.ok) {
        const statsJson: OverviewResponse =
          await statsResponse.json();

        console.log(
          "STATISTIQUES ADMIN :",
          statsJson
        );

        if (statsJson.totals) {
          setGlobalStats(
            statsJson.totals
          );
        }

        setParEntreprise(
          Array.isArray(
            statsJson.par_entreprise
          )
            ? statsJson.par_entreprise
            : []
        );
      }
    } catch (error) {
      console.error(
        "Erreur chargement dashboard admin:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* ========================================================= */
  /* EFFECT */
  /* ========================================================= */

  useEffect(() => {
    fetchAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  /* ========================================================= */
  /* FILTRES */
  /* ========================================================= */

  const filteredEntreprises =
    entreprises.filter(
      (e) =>
        e.nomentreprise
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||
        e.email
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          )
    );

  const filteredChatbots =
    chatbots.filter(
      (bot) =>
        bot.nom
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||
        bot.entreprise?.nomentreprise
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          )
    );

  /* ========================================================= */
  /* STATS */
  /* ========================================================= */

  const totalEntreprises =
    entreprises.length;

  const approvedEntreprises =
    entreprises.filter(
      (e) => e.statut === "approved"
    ).length;

  const pendingEntreprises =
    entreprises.filter(
      (e) => e.statut === "pending"
    ).length;

  const totalChatbots =
    globalStats.nombre_chatbots ||
    chatbots.length;

  const activeChatbots =
    chatbots.filter(
      (b) => b.statut === "actif"
    ).length;

  const inactiveChatbots =
    Math.max(
      0,
      totalChatbots - activeChatbots
    );

  /* ========================================================= */
  /* DONNEES GRAPHIQUE ENTREPRISES */
  /* ========================================================= */

  const sortedEntreprises =
    [...parEntreprise]
      .sort(
        (a, b) =>
          b.nombre_chatbots -
          a.nombre_chatbots
      )
      .slice(0, 10);

  const entrepriseLabels =
    sortedEntreprises.map(
      (e) => e.nomentreprise
    );

  /* ========================================================= */
  /* CHART : CHATBOTS PAR ENTREPRISE */
  /* ========================================================= */

  const chatbotsEntrepriseData = {
    labels: entrepriseLabels,

    datasets: [
      {
        label: "Chatbots",

        data: sortedEntreprises.map(
          (e) =>
            e.nombre_chatbots
        ),

        backgroundColor:
          "rgba(0, 128, 128, 0.75)",

        borderColor:
          "#008080",

        borderWidth: 1,

        borderRadius: 6,
      },
    ],
  };

  /* ========================================================= */
  /* CHART : CONVERSATIONS / MESSAGES */
  /* ========================================================= */

  const activityEntrepriseData = {
    labels: entrepriseLabels,

    datasets: [
      {
        label: "Conversations",

        data: sortedEntreprises.map(
          (e) =>
            e.nombre_conversations
        ),

        backgroundColor:
          "rgba(16, 185, 129, 0.7)",

        borderRadius: 6,
      },

      {
        label: "Messages",

        data: sortedEntreprises.map(
          (e) =>
            e.nombre_messages
        ),

        backgroundColor:
          "rgba(99, 102, 241, 0.7)",

        borderRadius: 6,
      },
    ],
  };

  /* ========================================================= */
  /* CHART : ENTREPRISES */
  /* ========================================================= */

  const entreprisesStatusData = {
    labels: [
      "Approuvées",
      "En attente",
    ],

    datasets: [
      {
        data: [
          approvedEntreprises,
          pendingEntreprises,
        ],

        backgroundColor: [
          "#10B981",
          "#F59E0B",
        ],

        borderWidth: 0,

        hoverOffset: 8,
      },
    ],
  };

  /* ========================================================= */
  /* CHART : CHATBOTS */
  /* ========================================================= */

  const chatbotsStatusData = {
    labels: [
      "Actifs",
      "Inactifs",
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

  /* ========================================================= */
  /* OPTIONS BAR */
  /* ========================================================= */

  const barOptions = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: true,

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

          maxRotation: 45,

          minRotation: 0,
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          color: "#6B7280",

          precision: 0,
        },

        grid: {
          color:
            "rgba(107,114,128,0.1)",
        },
      },
    },
  };

  /* ========================================================= */
  /* OPTIONS DOUGHNUT */
  /* ========================================================= */

  const doughnutOptions = {
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
        },
      },

      tooltip: {
        backgroundColor: "#0B3C3C",

        padding: 10,

        cornerRadius: 8,
      },
    },
  };

  /* ========================================================= */
  /* DELETE CHATBOT */
  /* ========================================================= */

  const handleDeleteChatbot = async (
    chatbotId: string
  ) => {
    const confirmed = confirm(
      "Supprimer ce chatbot ?"
    );

    if (!confirmed) return;

    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/chatbot/${chatbotId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Erreur lors de la suppression"
        );
      }

      await fetchAdminData();
    } catch (error) {
      console.error(
        "Erreur suppression:",
        error
      );

      alert(
        "Impossible de supprimer le chatbot."
      );
    }
  };

  /* ========================================================= */
  /* LOADING */
  /* ========================================================= */

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#D9F3F3] border-t-[#008080] rounded-full animate-spin mx-auto mb-4" />

            <p className="text-sm text-gray-500">
              Chargement du dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================= */
  /* RENDER */
  /* ========================================================= */

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="flex items-center justify-between">

        <div>
          <div className="flex items-center gap-2">

            <Shield className="w-6 h-6 text-[#008080]" />

            <h1 className="text-2xl font-bold text-[#0B3C3C] dark:text-white">
              Statistiques administrateur
            </h1>

          </div>

          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Gestion globale de la plateforme
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PeriodFilter value={period} onChange={setPeriod} />

       
        </div>

      </div>

     

      {/* ================================================== */}
      {/* CHARTS */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ================================================= */}
        {/* CHATBOTS PAR ENTREPRISE */}
        {/* ================================================= */}

        <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E293B] rounded-xl p-5">

          <div className="flex items-center justify-between mb-5">

            <div className="flex items-center gap-2">

              <Bot className="w-5 h-5 text-[#008080]" />

              <h3 className="font-semibold text-[#0B3C3C] dark:text-white">
                Chatbots par entreprise
              </h3>

            </div>

            <span className="text-xs text-gray-400">
              Top 10
            </span>

          </div>

          <div className="h-[280px]">

            {sortedEntreprises.length > 0 ? (
              <Bar
                data={chatbotsEntrepriseData}
                options={{
                  ...barOptions,

                  plugins: {
                    ...barOptions.plugins,

                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            ) : (
              <EmptyChart />
            )}

          </div>

        </div>

        {/* ================================================= */}
        {/* ENTREPRISES STATUS */}
        {/* ================================================= */}

        <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E293B] rounded-xl p-5">

          <div className="flex items-center gap-2 mb-5">

            <Building2 className="w-5 h-5 text-[#008080]" />

            <h3 className="font-semibold text-[#0B3C3C] dark:text-white">
              Statut des entreprises
            </h3>

          </div>

          <div className="h-[280px] flex justify-center">

            {totalEntreprises > 0 ? (
              <Doughnut
                data={entreprisesStatusData}
                options={doughnutOptions}
              />
            ) : (
              <EmptyChart />
            )}

          </div>

        </div>

        {/* ================================================= */}
        {/* ACTIVITE PAR ENTREPRISE */}
        {/* ================================================= */}

        <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E293B] rounded-xl p-5 lg:col-span-2">

          <div className="flex items-center justify-between mb-5">

            <div className="flex items-center gap-2">

              <Activity className="w-5 h-5 text-indigo-500" />

              <h3 className="font-semibold text-[#0B3C3C] dark:text-white">
                Activité par entreprise
              </h3>

            </div>

            <span className="text-xs text-gray-400">
              Conversations / Messages
            </span>

          </div>

          <div className="h-[300px]">

            {sortedEntreprises.length > 0 ? (
              <Bar
                data={activityEntrepriseData}
                options={barOptions}
              />
            ) : (
              <EmptyChart />
            )}

          </div>

        </div>

        {/* ================================================= */}
        {/* CHATBOTS STATUS */}
        {/* ================================================= */}

        <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E293B] rounded-xl p-5">

          <div className="flex items-center gap-2 mb-5">

            <Bot className="w-5 h-5 text-[#008080]" />

            <h3 className="font-semibold text-[#0B3C3C] dark:text-white">
              Statut des chatbots
            </h3>

          </div>

          <div className="h-[280px]">

            {totalChatbots > 0 ? (
              <Doughnut
                data={chatbotsStatusData}
                options={doughnutOptions}
              />
            ) : (
              <EmptyChart />
            )}

          </div>

        </div>

        {/* ================================================= */}
        {/* RESSOURCES */}
        {/* ================================================= */}

        <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E293B] rounded-xl p-5">

          <div className="flex items-center gap-2 mb-5">

            <BarChart3 className="w-5 h-5 text-[#008080]" />

            <h3 className="font-semibold text-[#0B3C3C] dark:text-white">
              Ressources utilisées
            </h3>

          </div>

          <div className="space-y-5">

            <ResourceBar
              label="Conversations"
              value={globalStats.nombre_conversations}
              icon={MessageSquare}
            />

            <ResourceBar
              label="Messages"
              value={globalStats.nombre_messages}
              icon={MessageSquare}
            />

            <ResourceBar
              label="Documents"
              value={globalStats.nombre_documents}
              icon={FileText}
            />

            <ResourceBar
              label="FAQ"
              value={globalStats.nombre_faq}
              icon={HelpCircle}
            />

          </div>

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
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E293B] rounded-xl p-4 hover:shadow-md transition">

      <div className="flex items-center justify-between">

        <Icon className="w-5 h-5 text-[#008080]" />

      </div>

      <div className="text-2xl font-bold mt-3 text-[#0B3C3C] dark:text-white">

        {value.toLocaleString("fr-FR")}

      </div>

      <div className="text-sm text-gray-500 dark:text-zinc-400 mt-1">

        {title}

      </div>

    </div>
  );
}

/* ========================================================= */
/* EMPTY CHART */
/* ========================================================= */

function EmptyChart() {
  return (
    <div className="h-full flex items-center justify-center">

      <div className="text-center">

        <BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-2" />

        <p className="text-sm text-gray-400">
          Aucune donnée disponible
        </p>

      </div>

    </div>
  );
}

/* ========================================================= */
/* RESOURCE BAR */
/* ========================================================= */

function ResourceBar({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div>

      <div className="flex items-center justify-between mb-2">

        <div className="flex items-center gap-2">

          <Icon className="w-4 h-4 text-[#008080]" />

          <span className="text-sm text-gray-600 dark:text-gray-300">
            {label}
          </span>

        </div>

        <span className="text-sm font-semibold text-[#0B3C3C] dark:text-white">
          {value.toLocaleString("fr-FR")}
        </span>

      </div>

      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">

        <div
          className="h-full bg-[#008080] rounded-full"
          style={{
            width: `${
              value > 0 ? 100 : 0
            }%`,
          }}
        />

      </div>

    </div>
  );
}