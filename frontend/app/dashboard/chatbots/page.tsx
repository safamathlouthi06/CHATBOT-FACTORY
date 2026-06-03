"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

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
};

type EmployeeGroup = {
  employe_id: string;
  employe_nom: string;
  employe_prenom: string;
  chatbots: Chatbot[];
};

export default function ChatbotListPage() {
  const [search, setSearch] = useState("");
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchChatbots = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch("http://127.0.0.1:8000/chatbot/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log("CHATBOTS:", data);

        // Gérer la structure de réponse { data: [...] } ou directement [...]
        if (data.data && Array.isArray(data.data)) {
          setChatbots(data.data);
        } else if (Array.isArray(data)) {
          setChatbots(data);
        } else {
          setChatbots([]);
        }
      } catch (error) {
        console.error("Erreur API:", error);
        setChatbots([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChatbots();
    
  }, []);

  // Grouper les chatbots par employé
  const groupByEmployee = (): EmployeeGroup[] => {
    const groups: { [key: string]: EmployeeGroup } = {};

    chatbots.forEach((bot) => {
      const empId = bot.employe_id || "unknown";
      
      if (!groups[empId]) {
        groups[empId] = {
          employe_id: empId,
          employe_nom: bot.employe?.nom || "Inconnu",
          employe_prenom: bot.employe?.prenom || "",
          chatbots: [],
        };
      }
      groups[empId].chatbots.push(bot);
      
    });

    return Object.values(groups);
  };

  // Filtrer les chatbots par recherche
  const filteredGroups = groupByEmployee()
    .map((group) => ({
      ...group,
      chatbots: group.chatbots.filter((bot) =>
        bot.nom.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((group) => group.chatbots.length > 0);

  const openDeleteModal = (botId: string, botName: string) => {
    setOpenMenuId(null);
    setDeleteModal({ isOpen: true, botId, botName });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, botId: null, botName: "" });
  };

  const confirmDelete = async () => {
    if (deleteModal.botId) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://127.0.0.1:8000/chatbot/${deleteModal.botId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          setChatbots(chatbots.filter((bot) => bot.id !== deleteModal.botId));
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
      closeDeleteModal();
    }
  };

  const openDetailsModal = (bot: Chatbot) => {
    setOpenMenuId(null);
    setDetailsModal({ isOpen: true, bot });
  };

  const closeDetailsModal = () => {
    setDetailsModal({ isOpen: false, bot: null });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3C3C] dark:text-white">
            Chatbots par Employé
          </h1>
          <p className="text-sm text-[#2F6F6F] dark:text-gray-400 mt-1">
            Gérez vos assistants conversationnels par employé
          </p>
        </div>

      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00A8A8]" />
        <input
          className="w-full pl-10 pr-4 py-2 border border-[#B8E0E0] dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-[#0B3C3C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
          placeholder="Rechercher un chatbot..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* LOADING */}
      {loading && (
        <div className="space-y-6">
          {[1, 2].map((groupIdx) => (
            <div key={groupIdx} className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg h-12 animate-pulse" />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="border border-[#B8E0E0] dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#D9F3F3] dark:bg-gray-700" />
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-[#D9F3F3] dark:bg-gray-700 rounded mb-2" />
                        <div className="h-3 w-24 bg-[#D9F3F3] dark:bg-gray-700 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!loading && filteredGroups.length === 0 && (
        <div className="text-center py-12 border border-[#B8E0E0] dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
          <Bot className="w-12 h-12 mx-auto text-[#00A8A8] mb-3" />
          <h2 className="text-lg font-semibold text-[#0B3C3C] dark:text-white mb-1">
            Aucun chatbot trouvé
          </h2>
          <p className="text-sm text-[#2F6F6F] dark:text-gray-400 mb-4">
            {search ? "Aucun résultat pour cette recherche" : "Créez votre premier assistant IA"}
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

      {/* LIST GROUPED BY EMPLOYEE */}
      {!loading && filteredGroups.length > 0 && (
        <div className="space-y-8">
          {filteredGroups.map((group) => (
            <div key={group.employe_id} className="space-y-4">
              {/* Employee Header */}
              <div className="bg-gradient-to-r from-[#D9F3F3] to-[#B8E0E0] dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-gray-900 rounded-lg">
                    <User className="w-5 h-5 text-[#008080]" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[#0B3C3C] dark:text-white text-lg">
                      {group.employe_prenom} {group.employe_nom}
                    </h2>
                    <p className="text-sm text-[#2F6F6F] dark:text-gray-400">
                      {group.chatbots.length} chatbot{group.chatbots.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chatbots Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.chatbots.map((bot) => (
                  <div
                    key={bot.id}
                    className="border border-[#B8E0E0] dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900 hover:shadow-md transition relative"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#D9F3F3] dark:bg-emerald-900/30 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-[#008080]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#0B3C3C] dark:text-white">
                            {bot.nom}
                          </h3>
                          <p className="text-xs text-[#2F6F6F] dark:text-gray-400">
                            {bot.domaine}
                          </p>
                        </div>
                      </div>

                      {/* Menu button */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === bot.id ? null : bot.id)
                          }
                          className="p-1 rounded hover:bg-[#D9F3F3] dark:hover:bg-gray-800 transition"
                        >
                          <MoreVertical className="w-4 h-4 text-[#00A8A8]" />
                        </button>

                        {/* Dropdown menu */}
                        {openMenuId === bot.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 py-1">
                            <Link
                              href={`/dashboard/chatbots/${bot.id}/edit`}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                              onClick={() => setOpenMenuId(null)}
                            >
                              <Pencil className="w-4 h-4" />
                              Éditer
                            </Link>
                            <button
                              onClick={() => openDetailsModal(bot)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                              <Eye className="w-4 h-4" />
                              Voir les détails
                            </button>
                            <hr className="my-1 border-gray-200 dark:border-gray-700" />
                            <button
                              onClick={() => openDeleteModal(bot.id, bot.nom)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status */}
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
                        {bot.statut === "actif" ? "Actif" : "Brouillon"}
                      </span>
                    </div>

                    {/* Actions */}
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
                        <span className="text-white">Déployer</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4">
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

            <div className="p-4">
              <p className="text-gray-700 dark:text-gray-300">
                Êtes-vous sûr de vouloir supprimer le chatbot{" "}
                <span className="font-semibold text-[#008080]">
                  "{deleteModal.botName}"
                </span>{" "}
                ?
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Cette action est irréversible. Toutes les données associées
                seront perdues.
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

      {/* DETAILS MODAL */}
      {detailsModal.isOpen && detailsModal.bot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full mx-4">
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

            <div className="p-5 space-y-4">
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

              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#D9F3F3] dark:bg-emerald-900/30 rounded-lg">
                  {detailsModal.bot.statut === "actif" ? (
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
                    {detailsModal.bot.statut === "actif" ? "Actif" : "Brouillon"}
                  </span>
                </div>
              </div>

              {/* Employee info */}
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
            </div>

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