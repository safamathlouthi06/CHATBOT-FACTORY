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
  FileText,
  HelpCircle,
  Activity,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  ChevronRight,
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

interface Statistics {
  nombre_chatbots: number;
  nombre_conversations: number;
  nombre_messages: number;
  nombre_documents: number;
  nombre_faq: number;
}

interface Overview {
  totals: Statistics;
  par_entreprise?: StatsParEntreprise[];
}

/* ========================================================= */
/* DASHBOARD ADMIN */
/* ========================================================= */

export default function AdminDashboardPage() {
  const router = useRouter();

  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [parEntreprise, setParEntreprise] = useState<
    StatsParEntreprise[]
  >([]);

  const [totals, setTotals] = useState<Statistics>({
    nombre_chatbots: 0,
    nombre_conversations: 0,
    nombre_messages: 0,
    nombre_documents: 0,
    nombre_faq: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  const [selectedTab, setSelectedTab] = useState<
    "overview" | "entreprises" | "chatbots"
  >("overview");

  const [searchTerm, setSearchTerm] = useState("");

  /* ======================================================= */
  /* CHARGEMENT DES DONNÉES */
  /* ======================================================= */

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

        fetch(`${API_URL}/statistiques/overview`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      /* ================================================= */
      /* ENTREPRISES */
      /* ================================================= */

      const entJson = await entReponse.json();

      setEntreprises(
        Array.isArray(entJson)
          ? entJson
          : []
      );

      /* ================================================= */
      /* CHATBOTS */
      /* ================================================= */

      const botsJson = await botsResponse.json();

      setChatbots(
        Array.isArray(botsJson)
          ? botsJson
          : []
      );

      /* ================================================= */
      /* STATISTIQUES */
      /* ================================================= */

      if (statsResponse.ok) {
        const statsJson: Overview =
          await statsResponse.json();

        if (statsJson.totals) {
          setTotals(statsJson.totals);
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

  /* ======================================================= */
  /* INITIALISATION */
  /* ======================================================= */

  useEffect(() => {
    fetchAdminData();
  }, []);

  /* ======================================================= */
  /* FILTRES */
  /* ======================================================= */

  const filteredEntreprises =
    entreprises.filter(
      (e) =>
        e.nomentreprise
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        e.email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );

  const filteredChatbots =
    chatbots.filter(
      (bot) =>
        bot.nom
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        bot.entreprise?.nomentreprise
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );

  /* ======================================================= */
  /* STATISTIQUES ENTREPRISES */
  /* ======================================================= */

  const stats = {
    totalEntreprises:
      entreprises.length,

    approvedEntreprises:
      entreprises.filter(
        (e) => e.statut === "approved"
      ).length,

    pendingEntreprises:
      entreprises.filter(
        (e) => e.statut === "pending"
      ).length,

    totalChatbots:
      chatbots.length,

    activeChatbots:
      chatbots.filter(
        (b) => b.statut === "actif"
      ).length,
  };

  /* ======================================================= */
  /* SUPPRESSION CHATBOT */
  /* ======================================================= */

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

      await fetch(
        `${API_URL}/chatbot/${chatbotId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchAdminData();
    } catch (error) {
      console.error(
        "Erreur suppression:",
        error
      );
    }
  };

  /* ======================================================= */
  /* CHART 1 : ENTREPRISES */
  /* ======================================================= */

  const entreprisesChartData = {
    labels: [
      "Approuvées",
      "En attente",
    ],

    datasets: [
      {
        data: [
          stats.approvedEntreprises,
          stats.pendingEntreprises,
        ],

        backgroundColor: [
          "#008080",
          "#F59E0B",
        ],

        borderWidth: 0,

        hoverOffset: 8,
      },
    ],
  };

  /* ======================================================= */
  /* CHART 2 : CHATBOTS PAR ENTREPRISE */
  /* ======================================================= */

  const sortedEntreprises =
    [...parEntreprise]
      .sort(
        (a, b) =>
          b.nombre_chatbots -
          a.nombre_chatbots
      )
      .slice(0, 10);

  const chatbotEntrepriseChartData = {
    labels:
      sortedEntreprises.map(
        (e) => e.nomentreprise
      ),

    datasets: [
      {
        label: "Chatbots",

        data:
          sortedEntreprises.map(
            (e) => e.nombre_chatbots
          ),

        backgroundColor:
          "rgba(0, 128, 128, 0.7)",

        borderColor: "#008080",

        borderWidth: 1,

        borderRadius: 8,

        borderSkipped: false,
      },
    ],
  };

  /* ======================================================= */
  /* CHART 3 : ACTIVITÉ PAR ENTREPRISE */
  /* ======================================================= */

  const activityChartData = {
    labels:
      sortedEntreprises.map(
        (e) => e.nomentreprise
      ),

    datasets: [
      {
        label: "Chatbots",

        data:
          sortedEntreprises.map(
            (e) => e.nombre_chatbots
          ),

        backgroundColor:
          "rgba(0, 128, 128, 0.7)",

        borderColor: "#008080",

        borderWidth: 1,

        borderRadius: 6,

        borderSkipped: false,
      },

      {
        label: "Conversations",

        data:
          sortedEntreprises.map(
            (e) =>
              e.nombre_conversations
          ),

        backgroundColor:
          "rgba(16, 185, 129, 0.7)",

        borderColor: "#10B981",

        borderWidth: 1,

        borderRadius: 6,

        borderSkipped: false,
      },

      {
        label: "Messages",

        data:
          sortedEntreprises.map(
            (e) => e.nombre_messages
          ),

        backgroundColor:
          "rgba(99, 102, 241, 0.7)",

        borderColor: "#6366F1",

        borderWidth: 1,

        borderRadius: 6,

        borderSkipped: false,
      },
    ],
  };

  /* ======================================================= */
  /* CHART OPTIONS */
  /* ======================================================= */

  const barOptions = {
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

          precision: 0,

          font: {
            size: 11,
          },
        },

        grid: {
          color:
            "rgba(107, 114, 128, 0.1)",
        },
      },
    },
  };

  /* ======================================================= */
  /* LOADING */
  /* ======================================================= */

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-[#008080]/20 border-t-[#008080] animate-spin mx-auto" />
              <Shield className="w-6 h-6 text-[#008080] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-4">
              Chargement du dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ======================================================= */
  /* RENDER */
  /* ======================================================= */

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F5F5] dark:bg-[#123D3D] flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#008080]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0B3C3C] dark:text-white flex items-center gap-2">
                Administration
                <span className="text-xs bg-[#008080]/10 text-[#008080] px-2 py-0.5 rounded-full font-normal">
                  Super Admin
                </span>
              </h1>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                Gestion globale de la plateforme
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="flex items-center gap-2 bg-[#008080] hover:bg-[#006666] text-white px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Rafraîchir
        </button>
      </div>

      {/* ================================================= */}
      {/* STATISTIQUES */}
      {/* ================================================= */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          title="Entreprises"
          value={stats.totalEntreprises}
          icon={Building2}
          color="teal"
          change="+2"
        />

        <StatCard
          title="En attente"
          value={stats.pendingEntreprises}
          icon={Clock}
          color="amber"
        />

        <StatCard
          title="Chatbots"
          value={stats.totalChatbots}
          icon={Bot}
          color="teal"
          change="+5"
        />

        <StatCard
          title="Chatbots actifs"
          value={stats.activeChatbots}
          icon={CheckCircle}
          color="green"
        />

      </div>




   
      {/* ================================================= */}
      {/* GRAPHIQUES */}
      {/* ================================================= */}

      {selectedTab === "overview" && (
        <div className="space-y-6">

          {/* ============================================= */}
          {/* PREMIÈRE LIGNE */}
          {/* ============================================= */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* =========================================== */}
            {/* ENTREPRISES */}
            {/* =========================================== */}

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-800">

              <div className="flex items-center justify-between mb-5">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-[#E6F5F5] dark:bg-[#123D3D] flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#008080]" />
                  </div>

                  <div>

                    <h3 className="font-semibold text-[#0B3C3C] dark:text-white">
                      État des entreprises
                    </h3>

                    <p className="text-xs text-gray-400 mt-0.5">
                      Répartition par statut
                    </p>

                  </div>

                </div>

                <span className="text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                  {stats.totalEntreprises} total
                </span>

              </div>

              <div className="h-[260px] flex justify-center">

                {stats.totalEntreprises > 0 ? (
                  <Doughnut
                    data={entreprisesChartData}
                    options={{
                      responsive: true,

                      maintainAspectRatio: false,

                      cutout: "65%",

                      plugins: {
                        legend: {
                          position: "bottom",

                          labels: {
                            usePointStyle: true,

                            padding: 20,

                            color: "#6B7280",

                            font: {
                              size: 13,
                              weight: "500" as const,
                            },
                          },
                        },

                        tooltip: {
                          backgroundColor:
                            "#0B3C3C",

                          padding: 12,

                          cornerRadius: 8,

                          titleColor: "#FFFFFF",

                          bodyColor: "#E0E0E0",

                          callbacks: {
                            label: function(context: any) {
                              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                              const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                              return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                          }
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Building2 className="w-12 h-12 text-gray-300 mb-3" />
                    <span className="text-sm">Aucune entreprise</span>
                  </div>
                )}

              </div>

            </div>

            {/* =========================================== */}
            {/* CHATBOTS PAR ENTREPRISE */}
            {/* =========================================== */}

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-800">

              <div className="flex items-center justify-between mb-5">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-[#E6F5F5] dark:bg-[#123D3D] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-[#008080]" />
                  </div>

                  <div>

                    <h3 className="font-semibold text-[#0B3C3C] dark:text-white">
                      Chatbots par entreprise
                    </h3>

                    <p className="text-xs text-gray-400 mt-0.5">
                      Top 10 entreprises
                    </p>

                  </div>

                </div>

              </div>

              <div className="h-[260px]">

                {sortedEntreprises.length > 0 ? (
                  <Bar
                    data={chatbotEntrepriseChartData}
                    options={{
                      ...barOptions,

                      plugins: {
                        legend: {
                          display: false,
                        },

                        tooltip: {
                          backgroundColor:
                            "#0B3C3C",

                          padding: 12,

                          cornerRadius: 8,

                          titleColor: "#FFFFFF",

                          bodyColor: "#E0E0E0",

                          callbacks: {
                            label: (
                              context
                            ) =>
                              `${context.parsed.y} chatbot(s)`,
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Bot className="w-12 h-12 text-gray-300 mb-3" />
                    <span className="text-sm">Aucune donnée disponible</span>
                  </div>
                )}

              </div>

            </div>

          </div>

          {/* ============================================= */}
          {/* ACTIVITÉ PAR ENTREPRISE */}
          {/* ============================================= */}

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-800">

            <div className="flex items-center justify-between mb-5">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-indigo-500" />
                </div>

                <div>

                  <h3 className="font-semibold text-[#0B3C3C] dark:text-white">
                    Activité par entreprise
                  </h3>

                  <p className="text-xs text-gray-400 mt-0.5">
                    Chatbots, conversations et messages
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{sortedEntreprises.length} entreprises</span>
              </div>

            </div>

            <div className="h-[320px]">

              {sortedEntreprises.length > 0 ? (
                <Bar
                  data={activityChartData}
                  options={barOptions}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <BarChart3 className="w-12 h-12 text-gray-300 mb-3" />
                  <span className="text-sm">Aucune donnée disponible</span>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ================================================= */}
      {/* ENTREPRISES TAB */}
      {/* ================================================= */}

      {selectedTab === "entreprises" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Secteur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredEntreprises.map((entreprise) => (
                  <tr key={entreprise.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#008080]" />
                        <span className="font-medium text-[#0B3C3C] dark:text-white">{entreprise.nomentreprise}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{entreprise.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{entreprise.secteurd_activite || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${
                        entreprise.statut === "approved" 
                          ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400" 
                          : "bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
                      }`}>
                        {entreprise.statut === "approved" ? "Approuvée" : "En attente"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/admin/entreprises/${entreprise.id}`}>
                        <button className="text-[#008080] hover:underline text-sm">Voir</button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* CHATBOTS TAB */}
      {/* ================================================= */}

      {selectedTab === "chatbots" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chatbot</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredChatbots.map((chatbot) => (
                  <tr key={chatbot.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-[#008080]" />
                        <span className="font-medium text-[#0B3C3C] dark:text-white">{chatbot.nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{chatbot.entreprise?.nomentreprise || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${
                        chatbot.statut === "actif"
                          ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                      }`}>
                        {chatbot.statut || "inactif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/chatbots/${chatbot.id}`}>
                          <button className="text-[#008080] hover:underline text-sm">Voir</button>
                        </Link>
                        <button
                          onClick={() => handleDeleteChatbot(chatbot.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================= */}
     { /* SEARCH */}
      {/* ================================================= */}

      {(selectedTab === "entreprises" ||
        selectedTab === "chatbots") && (

        <div className="relative">

          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-[#0B3C3C] dark:text-white outline-none focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] transition-all duration-200"
          />

        </div>
      )}

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
  change,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color?: "teal" | "amber" | "green" | "rose" | "indigo";
  change?: string;
}) {
  const colorClasses = {
    teal: "bg-[#008080]/5 border-[#008080]/20",
    amber: "bg-amber-500/5 border-amber-500/20",
    green: "bg-emerald-500/5 border-emerald-500/20",
    rose: "bg-rose-500/5 border-rose-500/20",
    indigo: "bg-indigo-500/5 border-indigo-500/20",
  };

  const iconColors = {
    teal: "text-[#008080]",
    amber: "text-amber-500",
    green: "text-emerald-500",
    rose: "text-rose-500",
    indigo: "text-indigo-500",
  };

  const accentColors = {
    teal: "bg-[#008080]",
    amber: "bg-amber-500",
    green: "bg-emerald-500",
    rose: "bg-rose-500",
    indigo: "bg-indigo-500",
  };

  return (
    <div className={`p-5 rounded-xl border bg-white dark:bg-gray-900 ${colorClasses[color]} hover:shadow-lg transition-all duration-300 group relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 h-1 w-full ${accentColors[color]}`}></div>

      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 ${iconColors[color]}`} />
        {change && (
          <span className="text-xs text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
            +{change}
          </span>
        )}
      </div>

      <div className="text-2xl font-bold text-[#0B3C3C] dark:text-white">
        {value.toLocaleString("fr-FR")}
      </div>

      <div className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
        {title}
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
  color = "indigo",
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color?: "emerald" | "indigo" | "amber" | "rose";
}) {
  const colorClasses = {
    emerald: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500",
    indigo: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500",
    amber: "bg-amber-50 dark:bg-amber-950/30 text-amber-500",
    rose: "bg-rose-50 dark:bg-rose-950/30 text-rose-500",
  };

  const iconColors = {
    emerald: "text-emerald-500",
    indigo: "text-indigo-500",
    amber: "text-amber-500",
    rose: "text-rose-500",
  };

  return (
    <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-all duration-300">

      <div className="flex items-center gap-2 mb-2">

        <div className={`w-8 h-8 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${iconColors[color]}`} />
        </div>

        <span className="text-xs text-gray-500 dark:text-zinc-400">
          {label}
        </span>

      </div>

      <p className="text-xl font-bold text-[#0B3C3C] dark:text-white">

        {value.toLocaleString("fr-FR")}

      </p>

    </div>
  );
}