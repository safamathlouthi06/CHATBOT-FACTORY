"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Bot,
  Database,
  Play,
  Rocket,
  Search,
  Plus,
  User,
  MoreVertical,
  Eye,
  Trash2,
  Pencil,
  X,
  AlertTriangle,
  Tag,
  Activity,
  CheckCircle,
  Clock,
  Calendar,
  FileText,
  HelpCircle,
  BarChart3,
  MessageSquare,
} from "lucide-react";

import { API_URL } from "@/services/api";

/* ========================================================= */
/* TYPES */
/* ========================================================= */

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

type Chatbot = {
  id: string;
  nom: string;
  domaine: string;
  statut: string;
  employe_id: string;

  employe?: {
    nom: string;
    prenom: string;
  };

  /* Statistiques */
  nombre_conversations: number;
  nombre_messages: number;
  nombre_documents: number;
  nombre_faq: number;
};

type EmployeeGroup = {
  employe_id: string;
  employe_nom: string;
  employe_prenom: string;
  chatbots: Chatbot[];
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

export default function ChatbotListPage() {
  /* ======================================================= */
  /* STATES */
  /* ======================================================= */

  const [search, setSearch] = useState("");

  const [chatbots, setChatbots] = useState<Chatbot[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    botId: string | null;
    botName: string;
  }>({
    isOpen: false,
    botId: null,
    botName: "",
  });

  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    bot: Chatbot | null;
  }>({
    isOpen: false,
    bot: null,
  });

  /* ======================================================= */
  /* CHARGEMENT CHATBOTS + STATISTIQUES */
  /* ======================================================= */

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "Session expirée. Veuillez vous reconnecter."
          );
        }

        /* ================================================= */
        /* 1. RÉCUPÉRER LES CHATBOTS */
        /* ================================================= */

        const chatbotResponse = await fetch(
          `${API_URL}/chatbot/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (chatbotResponse.status === 401) {
          throw new Error(
            "Session expirée. Veuillez vous reconnecter."
          );
        }

        if (!chatbotResponse.ok) {
          throw new Error(
            "Impossible de charger les chatbots."
          );
        }

        const chatbotJson = await chatbotResponse.json();

        let chatbotList: Chatbot[] = [];

        if (
          chatbotJson?.data &&
          Array.isArray(chatbotJson.data)
        ) {
          chatbotList = chatbotJson.data;
        } else if (Array.isArray(chatbotJson)) {
          chatbotList = chatbotJson;
        }

        /* ================================================= */
        /* 2. RÉCUPÉRER LES STATISTIQUES */
        /* ================================================= */

        let statistics: Overview = {
          totals: {
            nombre_chatbots: 0,
            nombre_conversations: 0,
            nombre_messages: 0,
            nombre_documents: 0,
            nombre_faq: 0,
          },
          chatbots: [],
        };

        try {
          const statisticsResponse = await fetch(
            `${API_URL}/statistiques/overview`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (statisticsResponse.ok) {
            const statisticsJson =
              await statisticsResponse.json();

            statistics = statisticsJson;
          } else {
            console.warn(
              "Les statistiques n'ont pas pu être chargées."
            );
          }
        } catch (statisticsError) {
          console.warn(
            "Erreur statistiques :",
            statisticsError
          );
        }

        /* ================================================= */
        /* 3. FUSION CHATBOTS + STATISTIQUES */
        /* ================================================= */

        const statsMap = new Map<
          string,
          ChatbotStat
        >();

        if (Array.isArray(statistics.chatbots)) {
          statistics.chatbots.forEach((stat) => {
            statsMap.set(stat.id, stat);
          });
        }

        const mergedChatbots = chatbotList.map((bot) => {
          const stat = statsMap.get(bot.id);

          return {
            ...bot,

            nombre_conversations:
              stat?.nombre_conversations ?? 0,

            nombre_messages:
              stat?.nombre_messages ?? 0,

            nombre_documents:
              stat?.nombre_documents ?? 0,

            nombre_faq:
              stat?.nombre_faq ?? 0,
          };
        });

        setChatbots(mergedChatbots);
      } catch (err) {
        console.error("Erreur chargement :", err);

        setError(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue."
        );

        setChatbots([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /* ======================================================= */
  /* GROUPEMENT PAR EMPLOYÉ */
  /* ======================================================= */

  const groupByEmployee = (): EmployeeGroup[] => {
    const groups: {
      [key: string]: EmployeeGroup;
    } = {};

    chatbots.forEach((bot) => {
      const empId = bot.employe_id || "unknown";

      if (!groups[empId]) {
        groups[empId] = {
          employe_id: empId,

          employe_nom:
            bot.employe?.nom || "Inconnu",

          employe_prenom:
            bot.employe?.prenom || "",

          chatbots: [],
        };
      }

      groups[empId].chatbots.push(bot);
    });

    return Object.values(groups);
  };

  /* ======================================================= */
  /* RECHERCHE */
  /* ======================================================= */

  const filteredGroups = groupByEmployee()
    .map((group) => ({
      ...group,

      chatbots: group.chatbots.filter((bot) =>
        bot.nom
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    }))
    .filter(
      (group) => group.chatbots.length > 0
    );

  /* ======================================================= */
  /* DELETE MODAL */
  /* ======================================================= */

  const openDeleteModal = (
    botId: string,
    botName: string
  ) => {
    setOpenMenuId(null);

    setDeleteModal({
      isOpen: true,
      botId,
      botName,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      botId: null,
      botName: "",
    });
  };

  /* ======================================================= */
  /* DELETE CHATBOT */
  /* ======================================================= */

  const confirmDelete = async () => {
    if (!deleteModal.botId) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Session expirée. Veuillez vous reconnecter."
        );
      }

      const response = await fetch(
        `${API_URL}/chatbot/${deleteModal.botId}`,
        {
          method: "DELETE",

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
          "Impossible de supprimer le chatbot."
        );
      }

      setChatbots((previous) =>
        previous.filter(
          (bot) => bot.id !== deleteModal.botId
        )
      );

      closeDeleteModal();
    } catch (err) {
      console.error(
        "Erreur lors de la suppression :",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Erreur lors de la suppression."
      );
    }
  };

  /* ======================================================= */
  /* DETAILS MODAL */
  /* ======================================================= */

  const openDetailsModal = (bot: Chatbot) => {
    setOpenMenuId(null);

    setDetailsModal({
      isOpen: true,
      bot,
    });
  };

  const closeDetailsModal = () => {
    setDetailsModal({
      isOpen: false,
      bot: null,
    });
  };

  /* ======================================================= */
  /* LOADING */
  /* ======================================================= */

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <div className="h-7 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />

          <div className="h-4 w-96 max-w-full bg-gray-200 dark:bg-gray-800 rounded mt-2 animate-pulse" />
        </div>

        <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />

        {[1, 2].map((group) => (
          <div
            key={group}
            className="space-y-4"
          >
            <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-64 bg-gray-100 dark:bg-gray-900 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ======================================================= */
  /* ERROR */
  /* ======================================================= */

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />

            <div>
              <h2 className="font-semibold text-red-600 dark:text-red-400">
                Erreur
              </h2>

              <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                {error}
              </p>
            </div>
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
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3C3C] dark:text-white">
            Chatbots par Employé
          </h1>

          <p className="text-sm text-[#2F6F6F] dark:text-gray-400 mt-1">
            Gérez vos assistants conversationnels par
            employé
          </p>
        </div>

        <Link
          href="/dashboard/chatbots/create"
          className="inline-flex items-center justify-center gap-2 bg-[#008080] hover:bg-[#005F5F] text-white px-4 py-2 rounded-lg text-sm transition"
        >
          <Plus className="w-4 h-4" />

          Créer un chatbot
        </Link>
      </div>

      {/* ================================================== */}
      {/* SEARCH */}
      {/* ================================================== */}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00A8A8]" />

        <input
          className="w-full pl-10 pr-4 py-2 border border-[#B8E0E0] dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-[#0B3C3C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
          placeholder="Rechercher un chatbot..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />
      </div>

      {/* ================================================== */}
      {/* EMPTY */}
      {/* ================================================== */}

      {filteredGroups.length === 0 && (
        <div className="text-center py-12 border border-[#B8E0E0] dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
          <Bot className="w-12 h-12 mx-auto text-[#00A8A8] mb-3" />

          <h2 className="text-lg font-semibold text-[#0B3C3C] dark:text-white mb-1">
            Aucun chatbot trouvé
          </h2>

          <p className="text-sm text-[#2F6F6F] dark:text-gray-400 mb-4">
            {search
              ? "Aucun résultat pour cette recherche"
              : "Créez votre premier assistant IA"}
          </p>

          {!search && (
            <Link
              href="/dashboard/chatbots/create"
              className="inline-flex items-center gap-2 bg-[#008080] hover:bg-[#005F5F] text-white px-4 py-2 rounded-lg text-sm transition"
            >
              <Plus className="w-4 h-4" />

              Créer un chatbot
            </Link>
          )}
        </div>
      )}

      {/* ================================================== */}
      {/* GROUPES PAR EMPLOYÉ */}
      {/* ================================================== */}

      {filteredGroups.length > 0 && (
        <div className="space-y-8">
          {filteredGroups.map((group) => (
            <div
              key={group.employe_id}
              className="space-y-4"
            >
              {/* ========================================== */}
              {/* EMPLOYEE HEADER */}
              {/* ========================================== */}

              <div className="bg-gradient-to-r from-[#D9F3F3] to-[#B8E0E0] dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-gray-900 rounded-lg">
                    <User className="w-5 h-5 text-[#008080]" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-[#0B3C3C] dark:text-white text-lg">
                      {group.employe_prenom}{" "}
                      {group.employe_nom}
                    </h2>

                    <p className="text-sm text-[#2F6F6F] dark:text-gray-400">
                      {group.chatbots.length} chatbot
                      {group.chatbots.length > 1
                        ? "s"
                        : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* ========================================== */}
              {/* CHATBOTS GRID */}
              {/* ========================================== */}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.chatbots.map((bot) => (
                  <div
                    key={bot.id}
                    className="border border-[#B8E0E0] dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900 hover:shadow-md transition relative"
                  >
                    {/* ================================= */}
                    {/* HEADER CHATBOT */}
                    {/* ================================= */}

                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Icône sans cadre */}
                        <Bot className="w-5 h-5 text-[#008080] mt-1 shrink-0" />

                        <div className="min-w-0">
                          <h3 className="font-semibold text-[#0B3C3C] dark:text-white truncate">
                            {bot.nom}
                          </h3>

                          <p className="text-xs text-[#2F6F6F] dark:text-gray-400 truncate">
                            {bot.domaine}
                          </p>
                        </div>
                      </div>

                      {/* ================================= */}
                      {/* MENU */}
                      {/* ================================= */}

                      <div className="relative shrink-0">
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === bot.id
                                ? null
                                : bot.id
                            )
                          }
                          className="p-1 rounded hover:bg-[#D9F3F3] dark:hover:bg-gray-800 transition"
                        >
                          <MoreVertical className="w-4 h-4 text-[#00A8A8]" />
                        </button>

                        {openMenuId === bot.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1">
                            <Link
                              href={`/dashboard/chatbots/${bot.id}/edit`}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                              onClick={() =>
                                setOpenMenuId(null)
                              }
                            >
                              <Pencil className="w-4 h-4" />

                              Éditer
                            </Link>

                            <button
                              onClick={() =>
                                openDetailsModal(bot)
                              }
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                              <Eye className="w-4 h-4" />

                              Voir les détails
                            </button>

                            <hr className="my-1 border-gray-200 dark:border-gray-700" />

                            <button
                              onClick={() =>
                                openDeleteModal(
                                  bot.id,
                                  bot.nom
                                )
                              }
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                            >
                              <Trash2 className="w-4 h-4" />

                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ================================= */}
                    {/* STATUS */}
                    {/* ================================= */}

                    <div className="mt-3 mb-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
                          bot.statut?.toLowerCase() ===
                          "actif"
                            ? "bg-[#D9F3F3] text-[#008080] dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            bot.statut?.toLowerCase() ===
                            "actif"
                              ? "bg-[#008080]"
                              : "bg-gray-400"
                          }`}
                        />

                        {bot.statut?.toLowerCase() ===
                        "actif"
                          ? "Actif"
                          : "Brouillon"}
                      </span>
                    </div>

                    {/* ================================= */}
                    {/* STATISTIQUES */}
                    {/* ================================= */}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {/* Conversations */}
                      <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400">
                        <MessageSquare className="w-3.5 h-3.5" />

                        <span>
                          {bot.nombre_conversations}{" "}
                          conversations
                        </span>
                      </div>

                      {/* Messages */}
                      <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
                        <BarChart3 className="w-3.5 h-3.5" />

                        <span>
                          {bot.nombre_messages} messages
                        </span>
                      </div>

                      {/* Documents */}
                      <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400">
                        <FileText className="w-3.5 h-3.5" />

                        <span>
                          {bot.nombre_documents}{" "}
                          documents
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

                    {/* ================================= */}
                    {/* ACTIONS */}
                    {/* ================================= */}

                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/chatbots/${bot.id}/base-de-connaissance`}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs border border-[#B8E0E0] dark:border-gray-700 rounded-lg hover:bg-[#D9F3F3] dark:hover:bg-gray-800 transition"
                      >
                        <Database className="w-3 h-3 text-[#008080]" />

                        <span className="text-[#0B3C3C] dark:text-gray-300">
                          Base
                        </span>
                      </Link>

                      <Link
                        href={`/dashboard/chatbots/${bot.id}/test`}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs border border-[#B8E0E0] dark:border-gray-700 rounded-lg hover:bg-[#D9F3F3] dark:hover:bg-gray-800 transition"
                      >
                        <Play className="w-3 h-3 text-[#008080]" />

                        <span className="text-[#0B3C3C] dark:text-gray-300">
                          Tester
                        </span>
                      </Link>

                      <Link
                        href={`/dashboard/chatbots/${bot.id}/deployment`}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-[#008080] text-white rounded-lg hover:bg-[#005F5F] transition"
                      >
                        <Rocket className="w-3 h-3 text-white" />

                        <span className="text-white">
                          Déployer
                        </span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================================================== */}
      {/* DELETE MODAL */}
      {/* ================================================== */}

      {deleteModal.isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeDeleteModal}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />

                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirmer la suppression
                </h2>
              </div>

              <button
                onClick={closeDeleteModal}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-gray-700 dark:text-gray-300">
                Êtes-vous sûr de vouloir supprimer le
                chatbot{" "}
                <span className="font-semibold text-[#008080]">
                  "{deleteModal.botName}"
                </span>{" "}
                ?
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Cette action est irréversible. Toutes les
                données associées seront perdues.
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Annuler
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />

                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* DETAILS MODAL */}
      {/* ================================================== */}

      {detailsModal.isOpen &&
        detailsModal.bot && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeDetailsModal}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-[#008080]" />

                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Détails du chatbot
                  </h2>
                </div>

                <button
                  onClick={closeDetailsModal}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* Nom */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#D9F3F3] dark:bg-emerald-900/30 rounded-lg">
                    <Tag className="w-4 h-4 text-[#008080]" />
                  </div>

                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Nom du chatbot
                    </p>

                    <p className="font-medium text-gray-900 dark:text-white">
                      {detailsModal.bot.nom}
                    </p>
                  </div>
                </div>

                {/* Domaine */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#D9F3F3] dark:bg-emerald-900/30 rounded-lg">
                    <Activity className="w-4 h-4 text-[#008080]" />
                  </div>

                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Secteur d'activité
                    </p>

                    <p className="font-medium text-gray-900 dark:text-white">
                      {detailsModal.bot.domaine}
                    </p>
                  </div>
                </div>

                {/* Statut */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#D9F3F3] dark:bg-emerald-900/30 rounded-lg">
                    {detailsModal.bot.statut?.toLowerCase() ===
                    "actif" ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-orange-500" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Statut
                    </p>

                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${
                        detailsModal.bot.statut?.toLowerCase() ===
                        "actif"
                          ? "bg-[#D9F3F3] text-[#008080]"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          detailsModal.bot.statut?.toLowerCase() ===
                          "actif"
                            ? "bg-[#008080]"
                            : "bg-gray-400"
                        }`}
                      />

                      {detailsModal.bot.statut?.toLowerCase() ===
                      "actif"
                        ? "Actif"
                        : "Brouillon"}
                    </span>
                  </div>
                </div>

                {/* Employé */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#D9F3F3] dark:bg-emerald-900/30 rounded-lg">
                    <User className="w-4 h-4 text-[#008080]" />
                  </div>

                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Créé par
                    </p>

                    <p className="font-medium text-gray-900 dark:text-white">
                      {detailsModal.bot.employe
                        ? `${detailsModal.bot.employe.prenom} ${detailsModal.bot.employe.nom}`
                        : "Employé inconnu"}
                    </p>
                  </div>
                </div>

                {/* ID */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#D9F3F3] dark:bg-emerald-900/30 rounded-lg">
                    <Calendar className="w-4 h-4 text-[#008080]" />
                  </div>

                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ID du chatbot
                    </p>

                    <p className="font-mono text-xs text-gray-600 dark:text-gray-400 break-all">
                      {detailsModal.bot.id}
                    </p>
                  </div>
                </div>

                {/* Statistiques */}
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                  <p className="text-sm font-semibold text-[#0B3C3C] dark:text-white mb-3">
                    Statistiques
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                      <p className="text-xs text-gray-500">
                        Conversations
                      </p>

                      <p className="text-lg font-bold text-green-600">
                        {detailsModal.bot.nombre_conversations}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                      <p className="text-xs text-gray-500">
                        Messages
                      </p>

                      <p className="text-lg font-bold text-purple-600">
                        {detailsModal.bot.nombre_messages}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                      <p className="text-xs text-gray-500">
                        Documents
                      </p>

                      <p className="text-lg font-bold text-orange-600">
                        {detailsModal.bot.nombre_documents}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-pink-50 dark:bg-pink-950/20">
                      <p className="text-xs text-gray-500">
                        FAQ
                      </p>

                      <p className="text-lg font-bold text-pink-600">
                        {detailsModal.bot.nombre_faq}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition"
                >
                  Fermer
                </button>

                <Link
                  href={`/dashboard/chatbots/${detailsModal.bot.id}/edit`}
                  onClick={closeDetailsModal}
                  className="px-4 py-2 text-sm font-medium bg-[#008080] hover:bg-[#005F5F] text-white rounded-lg transition flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4" />

                  Modifier
                </Link>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}