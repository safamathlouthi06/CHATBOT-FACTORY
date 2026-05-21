"use client";

import { useState, useEffect, useRef } from "react";
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
  Copy,
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
} from "lucide-react";

type Chatbot = {
  id: string;
  nom: string;
  domaine: string;
  statut: string;
  entreprise_id: string;
};

export default function ChatbotListPage() {
  const [search, setSearch] = useState("");
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; botId: string | null; botName: string }>({
    isOpen: false,
    botId: null,
    botName: "",
  });
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; bot: Chatbot | null }>({
    isOpen: false,
    bot: null,
  });
  
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const fetchChatbots = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch("http://127.0.0.1:8000/chatbot/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutside = Object.values(menuRefs.current).every(
        (ref) => ref && !ref.contains(event.target as Node)
      );
      if (isOutside) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = chatbots.filter((c) =>
    (c.nom || "").toLowerCase().includes(search.toLowerCase())
  );

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
        const res = await fetch(`http://127.0.0.1:8000/chatbot/${deleteModal.botId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
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

  const handleDuplicate = async (bot: Chatbot) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8000/chatbot/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom: `${bot.nom} (copie)`,
          domaine: bot.domaine,
          statut: "brouillon",
          entreprise_id: bot.entreprise_id,
        }),
      });
      if (res.ok) {
        const newBot = await res.json();
        // Gérer la structure de réponse
        if (newBot.data && newBot.data[0]) {
          setChatbots([...chatbots, newBot.data[0]]);
        } else {
          setChatbots([...chatbots, newBot]);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la duplication:", error);
    }
    setOpenMenuId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3C3C] dark:text-white">
            Mes Chatbots
          </h1>
          <p className="text-sm text-[#2F6F6F] dark:text-gray-400 mt-1">
            Gérez vos assistants conversationnels
          </p>
        </div>
        <Link
          href="/dashboard/chatbots/create"
          className="inline-flex items-center gap-2 bg-[#008080] hover:bg-[#005F5F] text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Nouveau Chatbot
        </Link>
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className=" border border-[#B8E0E0] dark:border-gray-700 rounded-lg p-4">
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
      )}

      {/* EMPTY */}
      {!loading && chatbots.length === 0 && (
        <div className="text-center py-12 border border-[#B8E0E0] dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
          <Bot className="w-12 h-12 mx-auto text-[#00A8A8] mb-3" />
          <h2 className="text-lg font-semibold text-[#0B3C3C] dark:text-white mb-1">
            Aucun chatbot
          </h2>
          <p className="text-sm text-[#2F6F6F] dark:text-gray-400 mb-4">
            Créez votre premier assistant IA
          </p>
          <Link
            href="/dashboard/chatbots/create"
            className="inline-flex items-center gap-2 bg-[#008080] hover:bg-[#005F5F] text-white px-4 py-2 rounded-lg text-sm transition"
          >
            <Plus className="w-4 h-4" />
            Créer un chatbot
          </Link>
        </div>
      )}

      {/* LIST */}
      {!loading && filtered.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((bot) => (
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
                    <h2 className="font-semibold text-[#0B3C3C] dark:text-white">
                      {bot.nom}
                    </h2>
                    <p className="text-xs text-[#2F6F6F] dark:text-gray-400">
                      {bot.domaine}
                    </p>
                  </div>
                </div>
                
                {/* Menu button */}
                <div 
                  className="relative" 
                  ref={(el) => {
                    menuRefs.current[bot.id] = el;
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === bot.id ? null : bot.id);
                    }}
                    className="p-1 rounded hover:bg-[#D9F3F3] dark:hover:bg-gray-800 transition"
                  >
                    <MoreVertical className="w-4 h-4 text-[#00A8A8]" />
                  </button>

                  {/* Dropdown menu */}
                  {openMenuId === bot.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 py-1">
                      {/* Éditer à la place de Dupliquer */}
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
                      bot.statut === "actif" ? "bg-[#008080]" : "bg-gray-400"
                    }`}
                  />
                  {bot.statut === "actif" ? "Actif" : "Brouillon"}
                </span>
              </div>

              {/* Actions - Déploiement à la place de Éditer */}
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/chatbots/${bot.id}/base-de-connaissance`}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs border border-[#B8E0E0] dark:border-gray-700 rounded-lg hover:bg-[#D9F3F3] dark:hover:bg-gray-800 transition"
                >
                  <Database className="w-3 h-3 text-[#008080]" />
                  <span className="text-[#0B3C3C] dark:text-gray-300">Base</span>
                </Link>
                <Link
                  href={`/dashboard/chatbots/${bot.id}/test`}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs border border-[#B8E0E0] dark:border-gray-700 rounded-lg hover:bg-[#D9F3F3] dark:hover:bg-gray-800 transition"
                >
                  <Play className="w-3 h-3 text-[#008080]" />
                  <span className="text-[#0B3C3C] dark:text-gray-300">Tester</span>
                </Link>
                {/* Bouton Déploiement - même couleur que les autres */}
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
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
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
                </span> ?
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Cette action est irréversible. Toutes les données associées seront perdues.
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full mx-4 animate-in fade-in zoom-in duration-200">
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">Nom du chatbot</p>
                  <p className="font-medium text-gray-900 dark:text-white">{detailsModal.bot.nom}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#D9F3F3] dark:bg-emerald-900/30 rounded-lg">
                  <Activity className="w-4 h-4 text-[#008080]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Secteur d'activité</p>
                  <p className="font-medium text-gray-900 dark:text-white">{detailsModal.bot.domaine}</p>
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">Statut</p>
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${
                      detailsModal.bot.statut === "actif"
                        ? "bg-[#D9F3F3] text-[#008080]"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        detailsModal.bot.statut === "actif" ? "bg-[#008080]" : "bg-gray-400"
                      }`}
                    />
                    {detailsModal.bot.statut === "actif" ? "Actif" : "Brouillon"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#D9F3F3] dark:bg-emerald-900/30 rounded-lg">
                  <User className="w-4 h-4 text-[#008080]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">ID du chatbot</p>
                  <p className="font-mono text-xs text-gray-600 dark:text-gray-400 break-all">
                    {detailsModal.bot.id}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#D9F3F3] dark:bg-emerald-900/30 rounded-lg">
                  <Calendar className="w-4 h-4 text-[#008080]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Date de création</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date().toLocaleDateString("fr-FR")}
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