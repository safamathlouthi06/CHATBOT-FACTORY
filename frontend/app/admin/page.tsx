"use client";

import {
  Bot,
  MessageSquare,
  Users,
  Activity,
  Shield,
  Server,
  AlertTriangle,
  Trash2,
  Eye,
  Search,
  Download,
  RefreshCw,
} from "lucide-react";

import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "suspended";
  chatbotsCount: number;
  createdAt: string;
}

interface Chatbot {
  id: number;
  nom: string;
  description: string;
  userId: number;
  userEmail: string;
  status: "active" | "inactive";
  conversations: number;
  messages: number;
  lastActivity: string;
}

interface AdminStats {
  totalUsers: number;
  totalChatbots: number;
  totalConversations: number;
  totalMessages: number;
  activeUsers: number;
  suspendedUsers: number;
  activeChatbots: number;
  systemHealth: "healthy" | "warning" | "critical";
  recentAlerts: string[];
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);

  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalChatbots: 0,
    totalConversations: 0,
    totalMessages: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    activeChatbots: 0,
    systemHealth: "healthy",
    recentAlerts: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  const [selectedTab, setSelectedTab] = useState<
    "overview" | "users" | "chatbots"
  >("overview");

  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = "http://127.0.0.1:8000";

  // FETCH ADMIN DATA
  const fetchAdminData = async () => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Token introuvable");
        return;
      }

      // REQUESTS
      const [usersRes, chatbotsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }),

        fetch(`${API_URL}/admin/chatbots`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }),

        fetch(`${API_URL}/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }),
      ]);

      // JSON
      const usersJson = await usersRes.json();
      const chatbotsJson = await chatbotsRes.json();
      const statsJson = await statsRes.json();

      console.log("USERS =>", usersJson);
      console.log("CHATBOTS =>", chatbotsJson);
      console.log("STATS =>", statsJson);

      // SAFE ARRAYS
      const usersArray = Array.isArray(usersJson)
        ? usersJson
        : usersJson.users ||
          usersJson.data ||
          usersJson.utilisateurs ||
          [];

      const chatbotsArray = Array.isArray(chatbotsJson)
        ? chatbotsJson
        : chatbotsJson.chatbots ||
          chatbotsJson.data ||
          [];

      // FORMAT USERS
      const formattedUsers: User[] = usersArray.map((user: any) => ({
        id: user.id,
        name: user.name || user.nom || "Sans nom",
        email: user.email || "",
        role: user.role || "user",
        status: user.status || "active",
        chatbotsCount:
          user.chatbotsCount ||
          user.chatbots_count ||
          0,
        createdAt: user.created_at || "",
      }));

      // FORMAT CHATBOTS
      const formattedChatbots: Chatbot[] =
        chatbotsArray.map((bot: any) => ({
          id: bot.id,
          nom: bot.nom || "Sans nom",
          description: bot.description || "",
          userId: bot.user_id || 0,
          userEmail:
            bot.userEmail ||
            bot.user_email ||
            "Inconnu",
          status: bot.status || "active",
          conversations: bot.conversations || 0,
          messages: bot.messages || 0,
          lastActivity: bot.lastActivity || "",
        }));

      setUsers(formattedUsers);
      setChatbots(formattedChatbots);

      // STATS
      setStats({
        totalUsers:
          statsJson.totalUsers ||
          formattedUsers.length,

        totalChatbots:
          statsJson.totalChatbots ||
          formattedChatbots.length,

        totalConversations:
          statsJson.totalConversations || 0,

        totalMessages:
          statsJson.totalMessages || 0,

        activeUsers:
          statsJson.activeUsers ||
          formattedUsers.filter(
            (u) => u.status === "active"
          ).length,

        suspendedUsers:
          statsJson.suspendedUsers ||
          formattedUsers.filter(
            (u) => u.status === "suspended"
          ).length,

        activeChatbots:
          statsJson.activeChatbots ||
          formattedChatbots.filter(
            (b) => b.status === "active"
          ).length,

        systemHealth:
          statsJson.systemHealth || "healthy",

        recentAlerts:
          statsJson.recentAlerts || [],
      });
    } catch (error) {
      console.error(
        "Erreur chargement dashboard admin:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // FILTER USERS
  const filteredUsers = users.filter(
    (user) =>
      user.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // FILTER CHATBOTS
  const filteredChatbots = chatbots.filter(
    (bot) =>
      bot.nom
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      bot.userEmail
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // SUSPEND USER
  const handleSuspendUser = async (userId: number) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(
        `${API_URL}/admin/users/${userId}/suspend`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      fetchAdminData();
    } catch (error) {
      console.error("Erreur suspension:", error);
    }
  };

  // REACTIVATE USER
  const handleReactivateUser = async (
    userId: number
  ) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(
        `${API_URL}/admin/users/${userId}/reactivate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      fetchAdminData();
    } catch (error) {
      console.error("Erreur réactivation:", error);
    }
  };

  // DELETE CHATBOT
  const handleDeleteChatbot = async (
    chatbotId: number
  ) => {
    try {
      const confirmed = confirm(
        "Supprimer ce chatbot ?"
      );

      if (!confirmed) return;

      const token = localStorage.getItem("token");

      await fetch(
        `${API_URL}/admin/chatbots/${chatbotId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

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

            <h1 className="text-2xl font-bold text-[#0B3C3C] dark:text-white">
              Administration
            </h1>
          </div>

          <p className="text-sm text-gray-500 mt-1">
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
        <StatCard
          title="Utilisateurs"
          value={stats.totalUsers}
          icon={Users}
        />

        <StatCard
          title="Chatbots"
          value={stats.totalChatbots}
          icon={Bot}
        />

        <StatCard
          title="Conversations"
          value={stats.totalConversations}
          icon={MessageSquare}
        />

        <StatCard
          title="Messages"
          value={stats.totalMessages}
          icon={Activity}
        />
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b border-gray-200 pb-2">
        {["overview", "users", "chatbots"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() =>
                setSelectedTab(tab as any)
              }
              className={`px-4 py-2 rounded-lg text-sm ${
                selectedTab === tab
                  ? "bg-[#008080] text-white"
                  : "text-gray-600"
              }`}
            >
              {tab === "overview" && "Aperçu"}
              {tab === "users" &&
                `Utilisateurs (${users.length})`}
              {tab === "chatbots" &&
                `Chatbots (${chatbots.length})`}
            </button>
          )
        )}
      </div>

      {/* SEARCH */}
      {(selectedTab === "users" ||
        selectedTab === "chatbots") && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      )}

      {/* LOADING */}
      {isLoading ? (
        <div className="text-center py-20">
          Chargement...
        </div>
      ) : (
        <>
          {/* USERS */}
          {selectedTab === "users" && (
            <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="text-left px-4 py-3">
                      Utilisateur
                    </th>

                    <th className="text-left px-4 py-3">
                      Email
                    </th>

                    <th className="text-left px-4 py-3">
                      Statut
                    </th>

                    <th className="text-left px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-t"
                    >
                      <td className="px-4 py-3">
                        {user.name}
                      </td>

                      <td className="px-4 py-3">
                        {user.email}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 flex gap-3">
                        {user.status === "active" ? (
                          <button
                            onClick={() =>
                              handleSuspendUser(
                                user.id
                              )
                            }
                            className="text-red-600"
                          >
                            Suspendre
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleReactivateUser(
                                user.id
                              )
                            }
                            className="text-green-600"
                          >
                            Réactiver
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CHATBOTS */}
          {selectedTab === "chatbots" && (
            <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="text-left px-4 py-3">
                      Nom
                    </th>

                    <th className="text-left px-4 py-3">
                      Propriétaire
                    </th>

                    <th className="text-left px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredChatbots.map((bot) => (
                    <tr
                      key={bot.id}
                      className="border-t"
                    >
                      <td className="px-4 py-3">
                        {bot.nom}
                      </td>

                      <td className="px-4 py-3">
                        {bot.userEmail}
                      </td>

                      <td className="px-4 py-3 flex gap-3">
                        <Link
                          href={`/dashboard/chatbots/${bot.id}`}
                        >
                          <Eye className="w-4 h-4 text-[#008080]" />
                        </Link>

                        <button
                          onClick={() =>
                            handleDeleteChatbot(
                              bot.id
                            )
                          }
                        >
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
function StatCard({
  title,
  value,
  icon: Icon,
}: any) {
  return (
    <div className="bg-white dark:bg-gray-900 border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <Icon className="w-5 h-5 text-[#008080]" />
      </div>

      <div className="text-2xl font-bold mt-3">
        {value}
      </div>

      <div className="text-sm text-gray-500 mt-1">
        {title}
      </div>
    </div>
  );
}