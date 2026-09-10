"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell,
  AlertTriangle,
  Check,
  CheckCheck,
  ExternalLink,
  Bot,
  X,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/services/api";

type Notification = {
  id: string;
  chatbot_id: string;
  chatbot_nom: string;
  entreprise_nom: string;
  question: string;
  reponse: string;
  motif: string;
  statut: string;
  created_at: string;
};

export default function EmployeeNotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/notifications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const data: Notification[] = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
        const unread = data.filter((n) => n.statut === "non_lu").length;
        setUnreadCount(unread);
      }
    } catch {
      // Ignorer erreurs silencieuses
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Fermeture si clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkOneRead = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, statut: "lu" } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, statut: "lu" })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* BOUTON CLOCHE */}
      <button
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2.5 rounded-2xl hover:bg-[#E8FAFB] dark:hover:bg-[#111827] text-[#134E52] dark:text-zinc-300 transition-all duration-300"
        title="Notifications et signalements"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-bounce shadow-md">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* MENU DÉROULANT DES NOTIFICATIONS */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white dark:bg-[#0F172A] border border-[#D9E3E5] dark:border-[#1E293B] rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
          {/* HEADER DU MENU */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800 dark:text-white">
                Signalements Entreprise
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
                  {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-xs text-[#007A80] hover:text-[#005C61] dark:text-[#00C7D1] font-semibold flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tout marquer lu
              </button>
            )}
          </div>

          {/* LISTE DES NOTIFICATIONS */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Aucun signalement pour le moment.
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = n.statut === "non_lu";
                return (
                  <div
                    key={n.id}
                    className={`p-4 transition-colors ${
                      isUnread
                        ? "bg-amber-50/50 dark:bg-amber-950/20"
                        : "hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#007A80] dark:text-[#00C7D1]">
                        <Bot className="w-3.5 h-3.5" />
                        <span>{n.chatbot_nom}</span>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                        )}
                      </div>

                      {isUnread && (
                        <button
                          onClick={() => handleMarkOneRead(n.id)}
                          className="text-[11px] text-slate-400 hover:text-green-600 flex items-center gap-0.5"
                          title="Marquer comme lu"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs font-medium text-amber-900 dark:text-amber-200 mt-1 line-clamp-2">
                      {n.motif}
                    </p>

                    {n.question && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic truncate">
                        « {n.question} »
                      </p>
                    )}

                    <div className="mt-2.5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        {new Date(n.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      <Link
                        href={`/employe/chatbots/${n.chatbot_id}/base-de-connaissance`}
                        onClick={() => {
                          if (isUnread) handleMarkOneRead(n.id);
                          setIsOpen(false);
                        }}
                        className="text-[#007A80] hover:underline dark:text-[#00C7D1] font-semibold flex items-center gap-1"
                      >
                        Corriger <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
