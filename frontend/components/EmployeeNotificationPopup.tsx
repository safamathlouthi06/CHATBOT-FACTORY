"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  Bot,
  Building2,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { API_URL } from "@/services/api";

export type NotificationItem = {
  id: string;
  employe_id: string;
  entreprise_id: string;
  entreprise_nom: string;
  chatbot_id: string;
  chatbot_nom: string;
  question: string;
  reponse: string;
  motif: string;
  statut: string;
  created_at: string;
  lu_at?: string | null;
};

/* Son de notification synthétisé (Web Audio API - ne dépend d'aucun fichier externe) */
function playChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof window.AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // Ignoré si restrictions autoplay du navigateur
  }
}

export default function EmployeeNotificationPopup() {
  const router = useRouter();
  const [unreadList, setUnreadList] = useState<NotificationItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  // Pour monter le portail uniquement côté client (évite erreurs SSR)
  const [mounted, setMounted] = useState(false);

  // Pour mémoriser les IDs déjà vus pour ne pas re-bipper
  const knownIdsRef = useRef<Set<string>>(new Set());
  const initialCheckDone = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchUnread = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/notifications/unread`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const data: NotificationItem[] = await res.json();

      if (Array.isArray(data)) {
        setUnreadList(data);

        // Détecter s'il y a de nouvelles notifications non vues
        const hasNew = data.some((item) => !knownIdsRef.current.has(item.id));

        if (data.length > 0) {
          // Si c'est le premier chargement (l'employé se connecte ou rafraîchit)
          // OU si une nouvelle notification arrive pendant qu'il est connecté
          if (!initialCheckDone.current || hasNew) {
            setIsOpen(true);
            playChime();
          }

          // Mettre à jour le set des IDs connus
          data.forEach((item) => knownIdsRef.current.add(item.id));
        }

        initialCheckDone.current = true;
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des notifications:", err);
    }
  }, []);

  // Polling automatique toutes les 10 secondes + au focus
  useEffect(() => {
    fetchUnread();

    const interval = setInterval(fetchUnread, 10000);

    const handleFocus = () => {
      fetchUnread();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchUnread]);

  // Si currentIndex dépasse la longueur après suppression
  useEffect(() => {
    if (currentIndex >= unreadList.length && unreadList.length > 0) {
      setCurrentIndex(unreadList.length - 1);
    }
  }, [unreadList.length, currentIndex]);

  const currentNotif = unreadList[currentIndex];

  const handleMarkAsRead = async (andNavigateTo?: string) => {
    if (!currentNotif) return;
    setLoadingAction(true);

    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`${API_URL}/notifications/${currentNotif.id}/read`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // Retirer la notification de la liste locale
      const updated = unreadList.filter((item) => item.id !== currentNotif.id);
      setUnreadList(updated);

      if (updated.length === 0) {
        setIsOpen(false);
      } else if (currentIndex >= updated.length) {
        setCurrentIndex(updated.length - 1);
      }

      if (andNavigateTo) {
        setIsOpen(false);
        router.push(andNavigateTo);
      }
    } catch (err) {
      console.error("Erreur lors du marquage de la notification:", err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleMarkAllRead = async () => {
    setLoadingAction(true);
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`${API_URL}/notifications/read-all`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      setUnreadList([]);
      setIsOpen(false);
    } catch (err) {
      console.error("Erreur mark-all:", err);
    } finally {
      setLoadingAction(false);
    }
  };

  if (!mounted || !isOpen || !currentNotif) return null;

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const popupContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#0F172A] border border-amber-500/20 dark:border-amber-500/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* BANDEAU SUPÉRIEUR — orange (aligné avec le thème global) */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-white/15 px-2.5 py-0.5 rounded-full">
                  Signalement Entreprise
                </span>
                {unreadList.length > 0 && (
                  <span className="text-[11px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                    {currentIndex + 1} / {unreadList.length}
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold mt-0.5">
                Résultat insatisfaisant lors du test
              </h2>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl hover:bg-white/15 text-white/90 hover:text-white transition-colors"
            title="Fermer temporairement"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CORPS DU POPUP - SCROLLABLE */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* INFOS CHATBOT ET ENTREPRISE — cartes neutres, icônes amber */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  Chatbot concerné
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {currentNotif.chatbot_nom}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  Signalé par
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {currentNotif.entreprise_nom}
                </p>
              </div>
            </div>
          </div>

          {/* MOTIF DE L'ENTREPRISE — bloc neutre, label amber */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-[11px] uppercase tracking-wide mb-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Remarque de l'entreprise</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {currentNotif.motif}
            </p>
          </div>

          {/* DÉTAIL DE L'ÉCHANGE TESTÉ */}
          {(currentNotif.question || currentNotif.reponse) && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Échange testé par l'entreprise
              </p>

              {currentNotif.question && (
                <div className="p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1">
                    Question posée
                  </p>
                  <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                    « {currentNotif.question} »
                  </p>
                </div>
              )}

              {currentNotif.reponse && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
                  <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold mb-1">
                    Réponse insatisfaisante du chatbot
                  </p>
                  <p className="text-sm text-red-900 dark:text-red-200 italic">
                    « {currentNotif.reponse} »
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Reçu le {formatDate(currentNotif.created_at)}
            </span>

            {/* NAVIGATION MULTIPLE NOTIFICATIONS */}
            {unreadList.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-semibold">
                  {currentIndex + 1} / {unreadList.length}
                </span>
                <button
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      Math.min(unreadList.length - 1, prev + 1)
                    )
                  }
                  disabled={currentIndex === unreadList.length - 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PIED DE PAGE : ACTIONS — bouton principal orange, secondaire neutre */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <button
            onClick={() =>
              handleMarkAsRead(
                `/employe/chatbots/${currentNotif.chatbot_id}/base-de-connaissance`
              )
            }
            disabled={loadingAction}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <Wrench className="w-4 h-4" />
            <span>Corriger la base de connaissances</span>
          </button>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleMarkAsRead()}
              disabled={loadingAction}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-sm transition-colors"
            >
              <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Marquer comme vu</span>
            </button>

            {unreadList.length > 1 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loadingAction}
                className="px-3 py-2.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Tout marquer lu
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(popupContent, document.body);
}