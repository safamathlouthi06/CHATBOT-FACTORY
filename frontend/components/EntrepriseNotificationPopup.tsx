"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Rocket,
  Bot,
  User,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Play,
  X,
} from "lucide-react";
import { API_URL } from "@/services/api";

export type EnterpriseNotificationItem = {
  id: string;
  employe_id: string;
  employe_nom?: string;
  entreprise_id: string;
  entreprise_nom?: string;
  chatbot_id: string;
  chatbot_nom: string;
  motif: string;
  statut: string;
  type: string;
  created_at: string;
  lu_at?: string | null;
};

/* Son de notification synthétisé (Web Audio API) */
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
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.55);
  } catch {
    // Ignoré si restrictions autoplay du navigateur
  }
}

export default function EntrepriseNotificationPopup() {
  const router = useRouter();
  const [unreadList, setUnreadList] = useState<EnterpriseNotificationItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [mounted, setMounted] = useState(false);

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
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data: EnterpriseNotificationItem[] = await res.json();

      if (Array.isArray(data)) {
        setUnreadList(data);

        const hasNew = data.some((item) => !knownIdsRef.current.has(item.id));

        if (data.length > 0) {
          if (!initialCheckDone.current || hasNew) {
            setIsOpen(true);
            playChime();
          }
          data.forEach((item) => knownIdsRef.current.add(item.id));
        }

        initialCheckDone.current = true;
      }
    } catch (err) {
      console.error("Erreur notifications entreprise:", err);
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    const handleFocus = () => fetchUnread();
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchUnread]);

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
          headers: { Authorization: `Bearer ${token}` },
        });
      }

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
      console.error("Erreur marquage notification:", err);
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
          headers: { Authorization: `Bearer ${token}` },
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
    <div className="relative w-full max-w-xl max-h-[90vh] bg-white dark:bg-[#0F172A] border border-amber-500/20 dark:border-amber-500/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
      {/* BANDEAU SUPÉRIEUR — orange (aligné avec le thème du popup) */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/15 px-2.5 py-0.5 rounded-full">
                Nouveau déploiement
              </span>
              {unreadList.length > 1 && (
                <span className="text-[11px] font-semibold bg-black/15 px-2 py-0.5 rounded-full">
                  {currentIndex + 1} / {unreadList.length}
                </span>
              )}
            </div>
            <h2 className="text-base font-bold mt-0.5">
              Un chatbot a été déployé avec succès
            </h2>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="p-2 rounded-xl hover:bg-white/15 text-white/90 hover:text-white transition-colors"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* CORPS SCROLLABLE */}
      <div className="p-6 space-y-4 overflow-y-auto flex-1">
        {/* INFOS CHATBOT & EMPLOYÉ — cartes neutres, icônes amber */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                Chatbot déployé
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {currentNotif.chatbot_nom}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                Déployé par
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {currentNotif.employe_nom || "Votre employé"}
              </p>
            </div>
          </div>
        </div>

        {/* MESSAGE — bloc neutre, label amber */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700">
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-1.5">
            Message
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
            {currentNotif.motif}
          </p>
        </div>

        {/* PIED : DATE + NAVIGATION */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Reçu le {formatDate(currentNotif.created_at)}
          </span>

          {unreadList.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
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
                  setCurrentIndex((p) =>
                    Math.min(unreadList.length - 1, p + 1)
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

      {/* ACTIONS — bouton principal orange, secondaire neutre */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
        <button
          onClick={() =>
            handleMarkAsRead(`/dashboard/chatbots/${currentNotif.chatbot_id}/test`)
          }
          disabled={loadingAction}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors shadow-sm"
        >
          <Play className="w-4 h-4" />
          <span>Tester le chatbot</span>
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