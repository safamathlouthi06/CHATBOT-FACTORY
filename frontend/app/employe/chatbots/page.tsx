"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import {
  Search,
  Plus,
  MoreVertical,
  Pencil,
  Play,
  Database,
  Bot,
  Trash2,
  Eye,
  X,
  AlertTriangle,
  Calendar,
  User,
  Tag,
  CheckCircle,
  Clock,
  Activity,
  Rocket,
  Check,
  Info,
  FileText,
  HelpCircle,
  BarChart3,
  MessageSquare,
  Save,
  ChevronDown,
  Globe,
} from "lucide-react";

import { API_URL } from "@/services/api";
import { CHATBOT_ROLES, DEFAULT_ROLE, getRoleLabel } from "@/constants/roles";

/* =========================================================
   TYPES
========================================================= */

type Chatbot = {
  id: string;
  nom: string;
  domaine: string;
  statut: string;
  role?: string;
  entreprise_id: string;
  created_at: string;

  nombre_conversations: number;
  nombre_messages: number;
  nombre_documents: number;
  nombre_faq: number;
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

type Notification = {
  isOpen: boolean;
  type: "success" | "error" | "info";
  title: string;
  message: string;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function ChatbotListPage() {
  /* =======================================================
     STATES
  ======================================================= */

  const [search, setSearch] = useState("");

  const [chatbots, setChatbots] = useState<Chatbot[]>([]);

  const [loading, setLoading] = useState(true);

  const [statsLoading, setStatsLoading] = useState(false);

  const [statsData, setStatsData] =
    useState<Overview | null>(null);

  const [openMenuId, setOpenMenuId] =
    useState<string | null>(null);

  /* =======================================================
     DELETE MODAL
  ======================================================= */

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    botId: string | null;
    botName: string;
  }>({
    isOpen: false,
    botId: null,
    botName: "",
  });

  /* =======================================================
     DETAILS MODAL
  ======================================================= */

  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    bot: Chatbot | null;
  }>({
    isOpen: false,
    bot: null,
  });

  /* =======================================================
     EDIT MODAL
  ======================================================= */

  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    bot: Chatbot | null;
  }>({
    isOpen: false,
    bot: null,
  });

  const [editForm, setEditForm] = useState({
    nom: "",
    domaine: "",
    statut: "brouillon",
    role: DEFAULT_ROLE,
  });

  const [savingEdit, setSavingEdit] = useState(false);

  /* =======================================================
     NOTIFICATION
  ======================================================= */

  const [notification, setNotification] =
    useState<Notification>({
      isOpen: false,
      type: "info",
      title: "",
      message: "",
    });

  /* =======================================================
     NOTIFICATION FUNCTIONS
  ======================================================= */

  const showNotification = (
    type: "success" | "error" | "info",
    title: string,
    message: string
  ) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message,
    });
  };

  const closeNotification = () => {
    setNotification((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  /* =======================================================
     FETCH CHATBOTS + STATISTIQUES
  ======================================================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setStatsLoading(true);

        const token = localStorage.getItem("token");

        if (!token) {
          showNotification(
            "error",
            "Session expirée",
            "Veuillez vous reconnecter."
          );

          return;
        }

        /* =================================================
           1. RÉCUPÉRER LES CHATBOTS
        ================================================= */

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

        const chatbotData =
          await chatbotResponse.json().catch(() => null);

        if (!chatbotResponse.ok) {
          throw new Error(
            chatbotData?.detail ||
              chatbotData?.message ||
              "Impossible de récupérer les chatbots."
          );
        }

        let bots: Chatbot[] = [];

        if (
          chatbotData?.data &&
          Array.isArray(chatbotData.data)
        ) {
          bots = chatbotData.data;
        } else if (Array.isArray(chatbotData)) {
          bots = chatbotData;
        }

        /* =================================================
           2. RÉCUPÉRER LES STATISTIQUES
        ================================================= */

        const statsResponse = await fetch(
          `${API_URL}/statistiques/overview`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (statsResponse.ok) {
          const statsJson: Overview =
            await statsResponse.json();

          setStatsData(statsJson);

          /* ===============================================
             3. FUSION CHATBOTS + STATISTIQUES
          =============================================== */

          const botsWithStats = bots.map((bot) => {
            const stat = statsJson.chatbots?.find(
              (item) => item.id === bot.id
            );

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

          setChatbots(botsWithStats);
        } else {
          console.warn(
            "Impossible de récupérer les statistiques."
          );

          setChatbots(
            bots.map((bot) => ({
              ...bot,
              nombre_conversations: 0,
              nombre_messages: 0,
              nombre_documents: 0,
              nombre_faq: 0,
            }))
          );
        }
      } catch (error) {
        console.error("Erreur API:", error);

        setChatbots([]);

        showNotification(
          "error",
          "Erreur",
          error instanceof Error
            ? error.message
            : "Impossible de récupérer les données."
        );
      } finally {
        setLoading(false);
        setStatsLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =======================================================
     CLICK OUTSIDE DU MENU
     
     IMPORTANT :
     Si le clic est en dehors de la liste du menu,
     le menu se ferme.
  ======================================================= */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Aucun menu ouvert
      if (!openMenuId) {
        return;
      }

      // Vérifie si le clic est dans le bouton/menu
      const clickedInsideMenu =
        target.closest("[data-chatbot-menu]");

      // Si le clic est ailleurs -> fermer
      if (!clickedInsideMenu) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [openMenuId]);

  /* =======================================================
     SEARCH
  ======================================================= */

  const filtered = chatbots.filter((c) =>
    (c.nom || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* =======================================================
     DELETE
  ======================================================= */

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

  const confirmDelete = async () => {
    if (!deleteModal.botId) return;

    try {
      const token =
        localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/chatbot/${deleteModal.botId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Impossible de supprimer le chatbot."
        );
      }

      setChatbots((prev) =>
        prev.filter(
          (bot) =>
            bot.id !== deleteModal.botId
        )
      );

      const deletedName =
        deleteModal.botName;

      closeDeleteModal();

      showNotification(
        "success",
        "Chatbot supprimé",
        `Le chatbot "${deletedName}" a été supprimé avec succès.`
      );
    } catch (error) {
      console.error(
        "Erreur lors de la suppression:",
        error
      );

      closeDeleteModal();

      showNotification(
        "error",
        "Erreur de suppression",
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la suppression."
      );
    }
  };

  /* =======================================================
     DETAILS
  ======================================================= */

  const openDetailsModal = (
    bot: Chatbot
  ) => {
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

  /* =======================================================
     EDIT
  ======================================================= */

  const openEditModal = (
    bot: Chatbot
  ) => {
    setOpenMenuId(null);

    setEditForm({
      nom: bot.nom || "",
      domaine: bot.domaine || "",
      statut:
        bot.statut || "brouillon",
      role: bot.role || DEFAULT_ROLE,
    });

    setEditModal({
      isOpen: true,
      bot,
    });
  };

  const closeEditModal = () => {
    if (savingEdit) return;

    setEditModal({
      isOpen: false,
      bot: null,
    });
  };

  /* =======================================================
     SAVE EDIT
  ======================================================= */

  const handleEditSubmit = async () => {
    if (!editModal.bot) return;

    if (!editForm.nom.trim()) {
      showNotification(
        "error",
        "Nom obligatoire",
        "Veuillez saisir un nom pour le chatbot."
      );

      return;
    }

    if (!editForm.domaine.trim()) {
      showNotification(
        "error",
        "Domaine obligatoire",
        "Veuillez saisir le secteur d'activité du chatbot."
      );

      return;
    }

    try {
      setSavingEdit(true);

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/chatbot/${editModal.bot.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            nom: editForm.nom.trim(),

            domaine:
              editForm.domaine.trim(),

            statut:
              editForm.statut,

            role:
              editForm.role,

            entreprise_id:
              editModal.bot
                .entreprise_id,
          }),
        }
      );

      const data =
        await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Erreur lors de la modification du chatbot."
        );
      }

      const updatedBot =
        data?.data?.[0] ||
        data?.data ||
        data;

      setChatbots((prev) =>
        prev.map((bot) => {
          if (
            bot.id !==
            editModal.bot?.id
          ) {
            return bot;
          }

          return {
            ...bot,
            ...updatedBot,

            nom:
              editForm.nom.trim(),

            domaine:
              editForm.domaine.trim(),

            statut:
              editForm.statut,

            role:
              editForm.role,
          };
        })
      );

      const chatbotName =
        editForm.nom.trim();

      setEditModal({
        isOpen: false,
        bot: null,
      });

      showNotification(
        "success",
        "Modification réussie",
        `Le chatbot "${chatbotName}" a été modifié avec succès.`
      );
    } catch (error) {
      console.error(
        "Erreur modification chatbot:",
        error
      );

      showNotification(
        "error",
        "Modification impossible",
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la modification du chatbot."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  /* =======================================================
     DUPLICATE
  ======================================================= */

  const handleDuplicate = async (
    bot: Chatbot
  ) => {
    try {
      const token =
        localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/chatbot/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            nom: `${bot.nom} (copie)`,

            domaine:
              bot.domaine,

            statut:
              "brouillon",

            role:
              bot.role || DEFAULT_ROLE,

            entreprise_id:
              bot.entreprise_id,
          }),
        }
      );

      const data =
        await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Impossible de dupliquer le chatbot."
        );
      }

      const newBot =
        data?.data?.[0] ||
        data?.data ||
        data;

      setChatbots((prev) => [
        ...prev,

        {
          ...newBot,

          nombre_conversations: 0,
          nombre_messages: 0,
          nombre_documents: 0,
          nombre_faq: 0,
        },
      ]);

      showNotification(
        "success",
        "Duplication réussie",
        `Le chatbot "${bot.nom}" a été dupliqué avec succès.`
      );
    } catch (error) {
      console.error(
        "Erreur lors de la duplication:",
        error
      );

      showNotification(
        "error",
        "Duplication impossible",
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la duplication."
      );
    }

    setOpenMenuId(null);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>

          <h1 className="text-2xl font-bold text-[#0B3C3C] dark:text-white">
            Mes chatbots
          </h1>

          <p className="text-sm text-[#2F6F6F] dark:text-gray-400 mt-1">
            Gérez vos assistants conversationnels
          </p>

        </div>

        <Link
          href="/employe/chatbots/create"
          className="inline-flex items-center gap-2 bg-[#008080] hover:bg-[#005F5F] text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Nouveau Chatbot
        </Link>

      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="relative">

        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00A8A8]" />

        <input
          className="w-full pl-10 pr-4 py-2 border border-[#B8E0E0] dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-[#0B3C3C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
          placeholder="Rechercher un chatbot..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-[#B8E0E0] dark:border-gray-700 rounded-lg p-4"
            >

              <div className="flex items-start gap-3">

                <div className="w-10 h-10 rounded-lg bg-[#D9F3F3] dark:bg-gray-700 animate-pulse" />

                <div className="flex-1">

                  <div className="h-4 w-32 bg-[#D9F3F3] dark:bg-gray-700 rounded mb-2 animate-pulse" />

                  <div className="h-3 w-24 bg-[#D9F3F3] dark:bg-gray-700 rounded animate-pulse" />

                </div>

              </div>

            </div>
          ))}

        </div>
      )}

      {/* =================================================
          EMPTY
      ================================================= */}

      {!loading &&
        chatbots.length === 0 && (
          <div className="text-center py-12 border border-[#B8E0E0] dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">

            <Bot className="w-12 h-12 mx-auto text-[#00A8A8] mb-3" />

            <h2 className="text-lg font-semibold text-[#0B3C3C] dark:text-white mb-1">
              Aucun chatbot
            </h2>

            <p className="text-sm text-[#2F6F6F] dark:text-gray-400 mb-4">
              Créez votre premier assistant IA
            </p>

            <Link
              href="/employe/chatbots/create"
              className="inline-flex items-center gap-2 bg-[#008080] hover:bg-[#005F5F] text-white px-4 py-2 rounded-lg text-sm transition"
            >
              <Plus className="w-4 h-4" />
              Créer un chatbot
            </Link>

          </div>
        )}

      {/* =================================================
          CHATBOT LIST
      ================================================= */}

      {!loading &&
        filtered.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

            {filtered.map((bot) => (

              <div
                key={bot.id}
                className="border border-[#B8E0E0] dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900 hover:shadow-md transition relative"
              >

                {/* =================================================
                    CARD HEADER
                ================================================= */}

                <div className="flex items-start justify-between">

                  {/* CHATBOT INFO */}

                  <div className="flex items-start gap-3">

                    <div className="w-10 h-10 rounded-lg bg-[#D9F3F3] dark:bg-emerald-900/30 flex items-center justify-center">

                      <Bot className="w-5 h-5 text-[#008080]" />

                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#0B3C3C] dark:text-white truncate">
                        {bot.nom}
                      </h3>
                      <p className="text-xs text-[#2F6F6F] dark:text-gray-400 truncate">
                        {bot.domaine}
                      </p>
                      {bot.role && (
                        <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#D9F3F3] text-[#008080] dark:bg-teal-900/30 dark:text-teal-300">
                          {getRoleLabel(bot.role)}
                        </span>
                      )}
                    </div>

                  </div>

                  {/* =================================================
                      MENU
                  ================================================= */}

                  <div
                    className="relative"
                    data-chatbot-menu
                  >

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();

                        setOpenMenuId(
                          (current) =>
                            current === bot.id
                              ? null
                              : bot.id
                        );
                      }}
                      className="p-1.5 rounded-xl hover:bg-[#E8FAFB] dark:hover:bg-[#1E293B] transition-all duration-200 group"
                      aria-label={`Menu du chatbot ${bot.nom}`}
                    >

                      <MoreVertical className="w-4 h-4 text-[#6CAFB4] group-hover:text-[#007A80] dark:group-hover:text-[#00B7C2] transition-colors" />

                    </button>

                    {/* =================================================
                        DROPDOWN AMÉLIORÉ
                    ================================================= */}

                    {openMenuId === bot.id && (
                      <div
                        data-chatbot-menu
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-[#D7F3F5] dark:border-[#1E293B] z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                      >

                        {/* ÉDITER */}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();

                            setOpenMenuId(null);

                            openEditModal(bot);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#134E52] dark:text-zinc-200 hover:bg-[#E8FAFB] dark:hover:bg-[#111827] transition-all duration-200 group"
                        >

                          <div className="w-7 h-7 rounded-lg bg-[#E8FAFB] dark:bg-[#111827] flex items-center justify-center group-hover:bg-[#007A80]/10 dark:group-hover:bg-[#007A80]/20 transition-colors">

                            <Pencil className="w-4 h-4 text-[#007A80]" />

                          </div>

                          <div className="flex-1 text-left">
                            <span className="font-medium">Éditer</span>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500">
                              Modifier les paramètres
                            </p>
                          </div>

                        </button>

                        {/* DÉTAILS */}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();

                            setOpenMenuId(null);

                            openDetailsModal(bot);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#134E52] dark:text-zinc-200 hover:bg-[#E8FAFB] dark:hover:bg-[#111827] transition-all duration-200 group"
                        >

                          <div className="w-7 h-7 rounded-lg bg-[#E8FAFB] dark:bg-[#111827] flex items-center justify-center group-hover:bg-[#007A80]/10 dark:group-hover:bg-[#007A80]/20 transition-colors">

                            <Eye className="w-4 h-4 text-[#007A80]" />

                          </div>

                          <div className="flex-1 text-left">
                            <span className="font-medium">Voir les détails</span>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500">
                              Informations complètes
                            </p>
                          </div>

                        </button>

                        {/* SÉPARATEUR STYLISÉ */}

                        <div className="relative my-1.5 px-4">
                          <div className="border-t border-[#E5E7EB] dark:border-[#1E293B]"></div>
                        </div>

                        {/* SUPPRIMER */}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();

                            setOpenMenuId(null);

                            openDeleteModal(
                              bot.id,
                              bot.nom
                            );
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                        >

                          <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">

                            <Trash2 className="w-4 h-4 text-red-500" />

                          </div>

                          <div className="flex-1 text-left">
                            <span className="font-medium">Supprimer</span>
                            <p className="text-[10px] text-red-400/60 dark:text-red-400/50">
                              Supprimer définitivement
                            </p>
                          </div>

                        </button>

                      </div>
                    )}

                  </div>

                </div>

                {/* =================================================
                    STATUS
                ================================================= */}

                <div className="mt-3 mb-4">

                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
                      bot.statut === "actif"
                        ? "bg-[#D9F3F3] text-[#008080] dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >

                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        bot.statut === "actif"
                          ? "bg-[#008080]"
                          : "bg-gray-400"
                      }`}
                    />

                    {bot.statut === "actif"
                      ? "Actif"
                      : "Brouillon"}

                  </span>

                </div>

                {/* =================================================
                    STATISTIQUES
                ================================================= */}

                <div className="flex flex-wrap gap-2 mt-3 mb-4">

                  {/* CONVERSATIONS */}

                  <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400">

                    <MessageSquare className="w-3.5 h-3.5" />

                    <span>
                      {bot.nombre_conversations ?? 0}{" "}
                      conversation
                      {(bot.nombre_conversations ?? 0) !==
                      1
                        ? "s"
                        : ""}
                    </span>

                  </div>

                  {/* MESSAGES */}

                  <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">

                    <BarChart3 className="w-3.5 h-3.5" />

                    <span>
                      {bot.nombre_messages ?? 0}{" "}
                      message
                      {(bot.nombre_messages ?? 0) !==
                      1
                        ? "s"
                        : ""}
                    </span>

                  </div>

                  {/* DOCUMENTS */}

                  <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400">

                    <FileText className="w-3.5 h-3.5" />

                    <span>
                      {bot.nombre_documents ?? 0}{" "}
                      document
                      {(bot.nombre_documents ?? 0) !==
                      1
                        ? "s"
                        : ""}
                    </span>

                  </div>

                  {/* FAQ */}

                  <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400">

                    <HelpCircle className="w-3.5 h-3.5" />

                    <span>
                      {bot.nombre_faq ?? 0} FAQ
                    </span>

                  </div>

                </div>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="flex gap-2">

                  <Link
                    href={`/employe/chatbots/${bot.id}/base-de-connaissance`}
                    onClick={() =>
                      setOpenMenuId(null)
                    }
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs border border-[#B8E0E0] dark:border-gray-700 rounded-lg hover:bg-[#D9F3F3] dark:hover:bg-gray-800 transition"
                  >

                    <Database className="w-3 h-3 text-[#008080]" />

                    <span className="text-[#0B3C3C] dark:text-gray-300">
                      Base
                    </span>

                  </Link>

                  <Link
                    href={`/employe/chatbots/${bot.id}/test`}
                    onClick={() =>
                      setOpenMenuId(null)
                    }
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs border border-[#B8E0E0] dark:border-gray-700 rounded-lg hover:bg-[#D9F3F3] dark:hover:bg-gray-800 transition"
                  >

                    <Play className="w-3 h-3 text-[#008080]" />

                    <span className="text-[#0B3C3C] dark:text-gray-300">
                      Tester
                    </span>

                  </Link>

                  <Link
                    href={`/employe/chatbots/${bot.id}/deployment`}
                    onClick={() =>
                      setOpenMenuId(null)
                    }
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
        )}

      {/* =================================================
          SEARCH EMPTY
      ================================================= */}

      {!loading &&
        chatbots.length > 0 &&
        filtered.length === 0 && (

          <div className="text-center py-12 border border-[#B8E0E0] dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">

            <Search className="w-12 h-12 mx-auto text-[#00A8A8] mb-3" />

            <h2 className="text-lg font-semibold text-[#0B3C3C] dark:text-white mb-1">
              Aucun résultat
            </h2>

            <p className="text-sm text-[#2F6F6F] dark:text-gray-400">
              Aucun chatbot ne correspond à votre recherche.
            </p>

          </div>
        )}

      {/* =================================================
          DELETE MODAL
      ================================================= */}

      {deleteModal.isOpen && (

        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeDeleteModal();
            }
          }}
        >

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">

            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">

              <div className="flex items-center gap-2">

                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">

                  <AlertTriangle className="w-5 h-5 text-red-500" />

                </div>

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

            <div className="p-5">

              <p className="text-gray-700 dark:text-gray-300">

                Êtes-vous sûr de vouloir supprimer
                le chatbot{" "}

                <span className="font-semibold text-[#008080]">
                  "{deleteModal.botName}"
                </span>

                {" ?"}

              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">

                Cette action est irréversible.
                Toutes les données associées seront
                perdues.

              </p>

            </div>

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

      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {detailsModal.isOpen && detailsModal.bot && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeDetailsModal();
            }
          }}
        >
          <div
            className="
              bg-white dark:bg-gray-800
              rounded-xl shadow-xl
              max-w-md w-full
              max-h-[85vh]
              flex flex-col
              mx-4
              animate-in fade-in zoom-in duration-200
            "
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#008080]" />

                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Détails du chatbot
                </h2>
              </div>

              <button
                onClick={closeDetailsModal}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* CONTENU */}
            <div className="px-4 py-3 space-y-3 overflow-y-auto">

              {/* NOM */}
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-[#D9F3F3] dark:bg-emerald-900/30 rounded-lg shrink-0">
                  <Tag className="w-4 h-4 text-[#008080]" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Nom du chatbot
                  </p>

                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {detailsModal.bot.nom}
                  </p>
                </div>
              </div>

              {/* DOMAINE */}
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-[#D9F3F3] dark:bg-emerald-900/30 rounded-lg shrink-0">
                  <Activity className="w-4 h-4 text-[#008080]" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Secteur d'activité
                  </p>

                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {detailsModal.bot.domaine}
                  </p>
                </div>
              </div>

              {/* RÔLE */}
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-[#D9F3F3] dark:bg-emerald-900/30 rounded-lg shrink-0">
                  <Tag className="w-4 h-4 text-[#008080]" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Rôle
                  </p>

                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getRoleLabel(detailsModal.bot.role)}
                  </p>
                </div>
              </div>

              {/* STATUT */}
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-[#D9F3F3] dark:bg-emerald-900/30 rounded-lg shrink-0">
                  {detailsModal.bot.statut === "actif" ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-orange-500" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                    Statut
                  </p>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded ${
                      detailsModal.bot.statut === "actif"
                        ? "bg-[#D9F3F3] text-[#008080]"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        detailsModal.bot.statut === "actif"
                          ? "bg-[#008080]"
                          : "bg-gray-400"
                      }`}
                    />

                    {detailsModal.bot.statut === "actif"
                      ? "Actif"
                      : "Brouillon"}
                  </span>
                </div>
              </div>

              {/* ID */}
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-[#D9F3F3] dark:bg-emerald-900/30 rounded-lg shrink-0">
                  <User className="w-4 h-4 text-[#008080]" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    ID du chatbot
                  </p>

                  <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                    {detailsModal.bot.id}
                  </p>
                </div>
              </div>

              {/* DATE */}
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-[#D9F3F3] dark:bg-emerald-900/30 rounded-lg shrink-0">
                  <Calendar className="w-4 h-4 text-[#008080]" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Date de création
                  </p>

                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {detailsModal.bot.created_at
                      ? new Date(
                          detailsModal.bot.created_at
                        ).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Date inconnue"}
                  </p>
                </div>
              </div>

              {/* STATISTIQUES */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                <p className="text-xs font-semibold text-[#0B3C3C] dark:text-white mb-2">
                  Statistiques
                </p>

                <div className="grid grid-cols-4 gap-2">

                  {/* CONVERSATIONS */}
                  <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
                    <p className="text-[9px] text-gray-500 uppercase tracking-wide">
                      Conversations
                    </p>

                    <p className="text-sm font-bold text-green-600">
                      {detailsModal.bot.nombre_conversations}
                    </p>
                  </div>

                  {/* MESSAGES */}
                  <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-center">
                    <p className="text-[9px] text-gray-500 uppercase tracking-wide">
                      Messages
                    </p>

                    <p className="text-sm font-bold text-purple-600">
                      {detailsModal.bot.nombre_messages}
                    </p>
                  </div>

                  {/* DOCUMENTS */}
                  <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-center">
                    <p className="text-[9px] text-gray-500 uppercase tracking-wide">
                      Documents
                    </p>

                    <p className="text-sm font-bold text-orange-600">
                      {detailsModal.bot.nombre_documents}
                    </p>
                  </div>

                  {/* FAQ */}
                  <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-950/20 text-center">
                    <p className="text-[9px] text-gray-500 uppercase tracking-wide">
                      FAQ
                    </p>

                    <p className="text-sm font-bold text-pink-600">
                      {detailsModal.bot.nombre_faq}
                    </p>
                  </div>

                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700 shrink-0">

              <button
                onClick={closeDetailsModal}
                className="
                  px-3 py-1.5
                  text-xs font-medium
                  bg-gray-100 hover:bg-gray-200
                  dark:bg-gray-700 dark:hover:bg-gray-600
                  text-gray-700 dark:text-gray-300
                  rounded-lg transition
                "
              >
                Fermer
              </button>

              <button
                onClick={() => {
                  const bot = detailsModal.bot;

                  closeDetailsModal();

                  if (bot) {
                    openEditModal(bot);
                  }
                }}
                className="
                  px-3 py-1.5
                  text-xs font-medium
                  bg-[#008080] hover:bg-[#005F5F]
                  text-white rounded-lg
                  transition
                  flex items-center gap-1.5
                "
              >
                <Pencil className="w-3.5 h-3.5" />
                Modifier
              </button>

            </div>
          </div>
        </div>
      )}
      {/* =================================================
          EDIT MODAL
      ================================================= */}

{/* =====================================================
    EDIT MODAL — VERSION INTERMÉDIAIRE
===================================================== */}

{editModal.isOpen && editModal.bot && (
  <div
    className="
      fixed inset-0
      z-[60]
      flex items-center justify-center
      bg-black/50
      backdrop-blur-sm
      p-4
    "
    onMouseDown={(e) => {
      if (e.target === e.currentTarget) {
        closeEditModal();
      }
    }}
  >
    {/* MODAL */}
    <div
      className="
        bg-white
        dark:bg-[#0F172A]
        rounded-2xl
        shadow-2xl
        max-w-lg
        w-full
        mx-auto
        max-h-[90vh]
        overflow-y-auto
        border
        border-[#D7F3F5]
        dark:border-[#1E293B]
        animate-in
        fade-in
        zoom-in
        duration-200
      "
      onMouseDown={(e) => e.stopPropagation()}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          relative
          px-5
          py-4
          bg-gradient-to-r
          from-[#F8FCFD]
          to-white
          dark:from-[#0B1120]
          dark:to-[#0F172A]
          border-b
          border-[#D9E3E5]
          dark:border-[#1E293B]
        "
      >

        <div className="flex items-center justify-between">

          {/* TITRE */}
          <div className="flex items-center gap-3">

            <div
              className="
                p-2.5
                rounded-xl
                bg-gradient-to-br
                from-[#007A80]
                to-[#00B7C2]
                shadow-md
                shadow-[#007A80]/20
              "
            >
              <Pencil className="w-5 h-5 text-white" />
            </div>

            <div>

              <h2
                className="
                  text-lg
                  font-bold
                  text-[#134E52]
                  dark:text-white
                "
              >
                Modifier le chatbot
              </h2>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Modifiez les informations du chatbot
              </p>

            </div>

          </div>


          {/* BOUTON FERMER */}
          <button
            type="button"
            onClick={closeEditModal}
            disabled={savingEdit}
            className="
              p-2
              rounded-lg
              hover:bg-[#E8FAFB]
              dark:hover:bg-[#1E293B]
              transition
              disabled:opacity-50
            "
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

        </div>

      

      </div>


      {/* =================================================
          CONTENU DU FORMULAIRE
      ================================================= */}

      <div className="px-5 py-4 space-y-4">

        {/* =================================================
            NOM DU CHATBOT
        ================================================= */}

        <div>

          <label
            htmlFor="edit-chatbot-nom"
            className="
              block
              text-sm
              font-semibold
              text-[#134E52]
              dark:text-gray-300
              mb-1.5
            "
          >
            Nom du chatbot
            <span className="text-red-500 ml-1">*</span>
          </label>

          <div className="relative">

            {/* ICÔNE */}
            <div
              className="
                absolute
                inset-y-0
                left-3
                flex
                items-center
                pointer-events-none
              "
            >
              <Bot className="w-4 h-4 text-gray-400" />
            </div>

            {/* INPUT */}
            <input
              id="edit-chatbot-nom"
              type="text"
              value={editForm.nom}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  nom: e.target.value,
                }))
              }
              disabled={savingEdit}
              placeholder="Ex : Assistant commercial"
              className="
                w-full
                pl-10
                pr-3
                py-2.5
                bg-[#F8FCFD]
                dark:bg-[#111827]
                border
                border-[#D9E3E5]
                dark:border-[#1E293B]
                rounded-xl
                text-sm
                text-[#134E52]
                dark:text-white
                placeholder-gray-400
                dark:placeholder-gray-500
                focus:outline-none
                focus:ring-2
                focus:ring-[#007A80]
                focus:border-transparent
                transition
                disabled:opacity-60
              "
            />

          </div>

          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
            Donnez un nom descriptif à votre chatbot.
          </p>

        </div>


        {/* =================================================
            SECTEUR D'ACTIVITÉ
        ================================================= */}

        <div>

          <label
            htmlFor="edit-chatbot-domaine"
            className="
              block
              text-sm
              font-semibold
              text-[#134E52]
              dark:text-gray-300
              mb-1.5
            "
          >
            Secteur d'activité
            <span className="text-red-500 ml-1">*</span>
          </label>

          <div className="relative">

            {/* ICÔNE */}
            <div
              className="
                absolute
                inset-y-0
                left-3
                flex
                items-center
                pointer-events-none
              "
            >
              <Globe className="w-4 h-4 text-gray-400" />
            </div>

            {/* INPUT */}
            <input
              id="edit-chatbot-domaine"
              type="text"
              value={editForm.domaine}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  domaine: e.target.value,
                }))
              }
              disabled={savingEdit}
              placeholder="Ex : E-commerce, Finance, Santé..."
              className="
                w-full
                pl-10
                pr-3
                py-2.5
                bg-[#F8FCFD]
                dark:bg-[#111827]
                border
                border-[#D9E3E5]
                dark:border-[#1E293B]
                rounded-xl
                text-sm
                text-[#134E52]
                dark:text-white
                placeholder-gray-400
                dark:placeholder-gray-500
                focus:outline-none
                focus:ring-2
                focus:ring-[#007A80]
                focus:border-transparent
                transition
                disabled:opacity-60
              "
            />

          </div>

          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
            Précisez le secteur d'activité de votre entreprise.
          </p>

        </div>


        {/* =================================================
            RÔLE
        ================================================= */}

        <div>

          <label
            htmlFor="edit-chatbot-role"
            className="
              block
              text-sm
              font-semibold
              text-[#134E52]
              dark:text-gray-300
              mb-1.5
            "
          >
            Rôle du chatbot
          </label>

          <div className="relative">

            {/* ICÔNE */}
            <div
              className="
                absolute
                inset-y-0
                left-3
                flex
                items-center
                pointer-events-none
                z-10
              "
            >
              <User className="w-4 h-4 text-gray-400" />
            </div>

            {/* SELECT */}

            <select
              id="edit-chatbot-role"
              value={editForm.role}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  role: e.target.value,
                }))
              }
              disabled={savingEdit}
              className="
                w-full
                pl-10
                pr-10
                py-2.5
                bg-[#F8FCFD]
                dark:bg-[#111827]
                border
                border-[#D9E3E5]
                dark:border-[#1E293B]
                rounded-xl
                text-sm
                text-[#134E52]
                dark:text-white
                focus:outline-none
                focus:ring-2
                focus:ring-[#007A80]
                focus:border-transparent
                transition
                disabled:opacity-60
                appearance-none
              "
            >

              <option value="">
                Sélectionner un rôle
              </option>

              {CHATBOT_ROLES.map((role) => (
                <option
                  key={role.value}
                  value={role.value}
                >
                  {role.label}
                </option>
              ))}

            </select>

            {/* FLÈCHE */}

            <div
              className="
                absolute
                inset-y-0
                right-3
                flex
                items-center
                pointer-events-none
              "
            >
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>

          </div>

          {editForm.role && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">

              Rôle sélectionné :

              <span className="ml-1 font-medium text-[#007A80]">
                {getRoleLabel(editForm.role)}
              </span>

            </p>
          )}

        </div>


        {/* =================================================
            STATUT
        ================================================= */}

        <div>

          <label
            className="
              block
              text-sm
              font-semibold
              text-[#134E52]
              dark:text-gray-300
              mb-1.5
            "
          >
            Statut
          </label>

          <div className="grid grid-cols-2 gap-3">

            {/* BROUILLON */}

            <button
              type="button"
              onClick={() =>
                setEditForm((prev) => ({
                  ...prev,
                  statut: "brouillon",
                }))
              }
              disabled={savingEdit}
              className={`
                flex
                items-center
                justify-center
                gap-2
                px-3
                py-2.5
                rounded-xl
                border
                transition
                ${
                  editForm.statut === "brouillon"
                    ? `
                      border-yellow-500
                      bg-yellow-50
                      dark:bg-yellow-950/20
                      text-yellow-700
                      dark:text-yellow-400
                    `
                    : `
                      border-[#D9E3E5]
                      dark:border-[#1E293B]
                      bg-[#F8FCFD]
                      dark:bg-[#111827]
                      text-gray-500
                      dark:text-gray-400
                      hover:border-yellow-300
                    `
                }
              `}
            >

              <FileText className="w-4 h-4" />

              <span className="text-sm font-medium">
                Brouillon
              </span>

            </button>


            {/* ACTIF */}

            <button
              type="button"
              onClick={() =>
                setEditForm((prev) => ({
                  ...prev,
                  statut: "actif",
                }))
              }
              disabled={savingEdit}
              className={`
                flex
                items-center
                justify-center
                gap-2
                px-3
                py-2.5
                rounded-xl
                border
                transition
                ${
                  editForm.statut === "actif"
                    ? `
                      border-green-500
                      bg-green-50
                      dark:bg-green-950/20
                      text-green-700
                      dark:text-green-400
                    `
                    : `
                      border-[#D9E3E5]
                      dark:border-[#1E293B]
                      bg-[#F8FCFD]
                      dark:bg-[#111827]
                      text-gray-500
                      dark:text-gray-400
                      hover:border-green-300
                    `
                }
              `}
            >

              <CheckCircle className="w-4 h-4" />

              <span className="text-sm font-medium">
                Actif
              </span>

            </button>

          </div>

        </div>


     
      </div>


      {/* =================================================
          FOOTER
      ================================================= */}

      <div
        className="
          flex
          justify-end
          gap-3
          px-5
          py-4
          bg-[#F8FCFD]
          dark:bg-[#0B1120]
          border-t
          border-[#D9E3E5]
          dark:border-[#1E293B]
        "
      >

        {/* ANNULER */}

        <button
          type="button"
          onClick={closeEditModal}
          disabled={savingEdit}
          className="
            px-5
            py-2.5
            text-sm
            font-medium
            text-[#134E52]
            dark:text-gray-300
            bg-white
            dark:bg-[#1E293B]
            border
            border-[#D9E3E5]
            dark:border-[#334155]
            rounded-xl
            hover:bg-[#E8FAFB]
            dark:hover:bg-[#111827]
            transition
            disabled:opacity-50
          "
        >
          Annuler
        </button>


        {/* ENREGISTRER */}

        <button
          type="button"
          onClick={handleEditSubmit}
          disabled={
            savingEdit ||
            !editForm.nom.trim() ||
            !editForm.domaine.trim()
          }
          className="
            px-5
            py-2.5
            bg-gradient-to-r
            from-[#007A80]
            to-[#00B7C2]
            text-white
            text-sm
            font-medium
            rounded-xl
            shadow-md
            shadow-[#007A80]/20
            hover:shadow-[#007A80]/30
            transition
            disabled:opacity-50
            disabled:cursor-not-allowed
            flex
            items-center
            justify-center
            gap-2
          "
        >

          {savingEdit ? (
            <>
              <span
                className="
                  w-4
                  h-4
                  border-2
                  border-white/30
                  border-t-white
                  rounded-full
                  animate-spin
                "
              />

              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Enregistrer
            </>
          )}

        </button>

      </div>

    </div>
  </div>
)}

      {/* =================================================
          NOTIFICATION POPUP
      ================================================= */}

      {notification.isOpen && (

        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]">

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">

            {/* HEADER */}

            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">

              <div className="flex items-center gap-3">

                {/* SUCCESS */}

                {notification.type ===
                  "success" && (

                  <div className="w-10 h-10 rounded-full bg-[#007A80]/10 flex items-center justify-center">

                    <Check className="w-5 h-5 text-[#007A80]" />

                  </div>
                )}

                {/* ERROR */}

                {notification.type ===
                  "error" && (

                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">

                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />

                  </div>
                )}

                {/* INFO */}

                {notification.type ===
                  "info" && (

                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">

                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />

                  </div>
                )}

                {/* TITLE */}

                <h2
                  className={`text-lg font-semibold ${
                    notification.type ===
                    "success"
                      ? "bg-gradient-to-r from-[#007A80] to-[#00B7C2] bg-clip-text text-transparent"
                      : notification.type ===
                        "error"
                      ? "text-red-700 dark:text-red-400"
                      : "text-blue-700 dark:text-blue-400"
                  }`}
                >

                  {notification.title}

                </h2>

              </div>

              <button
                onClick={
                  closeNotification
                }
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >

                <X className="w-5 h-5 text-gray-500" />

              </button>

            </div>

            {/* MESSAGE */}

            <div className="p-5">

              <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">

                {notification.message}

              </p>

            </div>

            {/* FOOTER */}

            <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">

              <button
                onClick={
                  closeNotification
                }
                className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition ${
                  notification.type ===
                  "success"
                    ? "bg-gradient-to-r from-[#007A80] to-[#00B7C2] hover:from-[#00666B] hover:to-[#009FA8]"
                    : notification.type ===
                      "error"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                OK
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}