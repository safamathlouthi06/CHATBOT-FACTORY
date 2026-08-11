"use client";

import {
  Bot,
  MessageSquare,
  Building2,
  Activity,
  Shield,
  Trash2,
  Eye,
  Search,
  RefreshCw,
  CheckCircle,
  Clock,
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/services/api";

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
  entreprise?: { nomentreprise: string } | null;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"overview" | "entreprises" | "chatbots">("overview");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAdminData = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "super_admin") {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      const [entReponse, botsResponse] = await Promise.all([
        fetch(`${API_URL}/admin/entreprises`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/chatbot/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const entJson = await entReponse.json();
      const botsJson = await botsResponse.json();

      setEntreprises(Array.isArray(entJson) ? entJson : []);
      setChatbots(Array.isArray(botsJson) ? botsJson : []);
    } catch (error) {
      console.error("Erreur chargement dashboard admin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const filteredEntreprises = entreprises.filter(
    (e) =>
      e.nomentreprise?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredChatbots = chatbots.filter(
    (bot) =>
      bot.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bot.entreprise?.nomentreprise?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalEntreprises: entreprises.length,
    approvedEntreprises: entreprises.filter((e) => e.statut === "approved").length,
    pendingEntreprises: entreprises.filter((e) => e.statut === "pending").length,
    totalChatbots: chatbots.length,
    activeChatbots: chatbots.filter((b) => b.statut === "actif").length,
  };

  const handleDeleteChatbot = async (chatbotId: string) => {
    const confirmed = confirm("Supprimer ce chatbot ?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/chatbot/${chatbotId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAdminData();
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#008080]" />
            <h1 className="text-2xl font-bold text-[#0B3C3C] dark:text-white">Administration</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Gestion globale de la plateforme
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="flex items-center gap-2 bg-[#008080] hover:bg-[#006666] text-white px-4 py-2 rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Rafraîchir
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Entreprises" value={stats.totalEntreprises} icon={Building2} />
        <StatCard title="En attente" value={stats.pendingEntreprises} icon={Clock} />
        <StatCard title="Chatbots" value={stats.totalChatbots} icon={Bot} />
        <StatCard title="Chatbots actifs" value={stats.activeChatbots} icon={CheckCircle} />
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-[#1E293B] pb-2">
        {["overview", "entreprises", "chatbots"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab as any)}
            className={`px-4 py-2 rounded-lg text-sm ${
              selectedTab === tab
                ? "bg-[#008080] text-white"
                : "text-gray-600 dark:text-zinc-400"
            }`}
          >
            {tab === "overview" && "Aperçu"}
            {tab === "entreprises" && `Entreprises (${entreprises.length})`}
            {tab === "chatbots" && `Chatbots (${chatbots.length})`}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      {(selectedTab === "entreprises" || selectedTab === "chatbots") && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-[#1E293B] rounded-lg bg-white dark:bg-[#0F172A] text-[#0B3C3C] dark:text-white"
          />
        </div>
      )}

      {/* LOADING */}
      {isLoading ? (
        <div className="text-center py-20 text-[#6CAFB4] dark:text-zinc-400">Chargement...</div>
      ) : (
        <>
          {/* OVERVIEW */}
          {selectedTab === "overview" && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E293B] rounded-lg p-5">
                <h3 className="font-semibold text-[#0B3C3C] dark:text-white mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#008080]" />
                  Entreprises récentes
                </h3>
                <ul className="space-y-2">
                  {entreprises.slice(0, 5).map((e) => (
                    <li key={e.id} className="flex items-center justify-between text-sm">
                      <span className="text-[#0B3C3C] dark:text-zinc-300">{e.nomentreprise}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          e.statut === "approved"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {e.statut}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E293B] rounded-lg p-5">
                <h3 className="font-semibold text-[#0B3C3C] dark:text-white mb-3 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#008080]" />
                  Chatbots récents
                </h3>
                <ul className="space-y-2">
                  {chatbots.slice(0, 5).map((b) => (
                    <li key={b.id} className="flex items-center justify-between text-sm">
                      <span className="text-[#0B3C3C] dark:text-zinc-300">
                        {b.nom} <span className="text-[#6CAFB4] dark:text-zinc-500">· {b.entreprise?.nomentreprise || "—"}</span>
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          b.statut === "actif"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {b.statut}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ENTREPRISES */}
          {selectedTab === "entreprises" && (
            <div className="bg-white dark:bg-[#0F172A] rounded-lg border border-gray-200 dark:border-[#1E293B] overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-[#111827]">
                  <tr>
                    <th className="text-left px-4 py-3 text-[#134E52] dark:text-zinc-200">Entreprise</th>
                    <th className="text-left px-4 py-3 text-[#134E52] dark:text-zinc-200">Email</th>
                    <th className="text-left px-4 py-3 text-[#134E52] dark:text-zinc-200">Secteur</th>
                    <th className="text-left px-4 py-3 text-[#134E52] dark:text-zinc-200">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntreprises.map((e) => (
                    <tr key={e.id} className="border-t border-gray-100 dark:border-[#1E293B]">
                      <td className="px-4 py-3 text-[#0B3C3C] dark:text-zinc-300">{e.nomentreprise}</td>
                      <td className="px-4 py-3 text-[#0B3C3C] dark:text-zinc-300">{e.email}</td>
                      <td className="px-4 py-3 text-[#0B3C3C] dark:text-zinc-300">{e.secteurd_activite}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            e.statut === "approved"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}
                        >
                          {e.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-3 text-xs text-[#6CAFB4] dark:text-zinc-500 border-t border-gray-100 dark:border-[#1E293B]">
                Pour valider une entreprise en attente, rendez-vous sur la page{" "}
                <Link href="/admin/entreprise" className="text-[#008080] hover:underline">
                  Entreprise
                </Link>
                .
              </div>
            </div>
          )}

          {/* CHATBOTS */}
          {selectedTab === "chatbots" && (
            <div className="bg-white dark:bg-[#0F172A] rounded-lg border border-gray-200 dark:border-[#1E293B] overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-[#111827]">
                  <tr>
                    <th className="text-left px-4 py-3 text-[#134E52] dark:text-zinc-200">Nom</th>
                    <th className="text-left px-4 py-3 text-[#134E52] dark:text-zinc-200">Entreprise</th>
                    <th className="text-left px-4 py-3 text-[#134E52] dark:text-zinc-200">Statut</th>
                    <th className="text-left px-4 py-3 text-[#134E52] dark:text-zinc-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChatbots.map((bot) => (
                    <tr key={bot.id} className="border-t border-gray-100 dark:border-[#1E293B]">
                      <td className="px-4 py-3 text-[#0B3C3C] dark:text-zinc-300">{bot.nom}</td>
                      <td className="px-4 py-3 text-[#0B3C3C] dark:text-zinc-300">
                        {bot.entreprise?.nomentreprise || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            bot.statut === "actif"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}
                        >
                          {bot.statut}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-3">
                        <Link href={`/admin/widget-preview`} title="Tester ce chatbot">
                          <Eye className="w-4 h-4 text-[#008080]" />
                        </Link>
                        <button onClick={() => handleDeleteChatbot(bot.id)} title="Supprimer">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// STAT CARD
function StatCard({ title, value, icon: Icon }: any) {
  return (
    <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E293B] rounded-lg p-4">
      <div className="flex items-center justify-between">
        <Icon className="w-5 h-5 text-[#008080]" />
      </div>
      <div className="text-2xl font-bold mt-3 text-[#0B3C3C] dark:text-white">{value}</div>
      <div className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{title}</div>
    </div>
  );
}
