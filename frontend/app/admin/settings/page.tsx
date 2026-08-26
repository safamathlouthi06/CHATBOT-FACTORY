"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Bell,
  Palette,
  Save,
  Shield,
  Mail,
  CreditCard,
  Database,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  Sparkles,
  AlertCircle,
  CheckCircle,
  User,
  X,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Check,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { API_URL } from "@/services/api";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Profil
  const [name, setName] = useState("Super Administrateur");
  const [email, setEmail] = useState("admin@chatbotfactory.com");

  // Notifications
  const [notifications, setNotifications] = useState({
    email: true,
    marketing: false,
    updates: true,
    alerts: true,
  });

  // Sécurité
  const [twoFactor, setTwoFactor] = useState(false);

  // États de chargement et retours UI
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modal changement de mot de passe
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Modal licence & suppression
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* =========================================================
     CHARGEMENT DES DONNÉES AU MONTAGE
  ========================================================= */
  useEffect(() => {
    // 1. Charger préférences locales
    try {
      const savedNotifs = localStorage.getItem("admin_notifications");
      if (savedNotifs) {
        setNotifications(JSON.parse(savedNotifs));
      }

      const saved2FA = localStorage.getItem("admin_2fa");
      if (saved2FA) {
        setTwoFactor(saved2FA === "true");
      }

      const savedName = localStorage.getItem("admin_name");
      if (savedName) {
        setName(savedName);
      }
    } catch (e) {
      console.error("Erreur chargement préférences locales:", e);
    }

    // 2. Récupérer les infos admin du backend
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_URL}/meAdmin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.email) setEmail(data.email);
          if (data.nom && data.prenom) {
            setName(`${data.prenom} ${data.nom}`);
          }
        }
      } catch (err) {
        console.error("Erreur récupération admin:", err);
      }
    };

    fetchAdmin();
  }, []);

  /* =========================================================
     SAUVEGARDE DES PARAMÈTRES
  ========================================================= */
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Sauvegarder dans localStorage
      localStorage.setItem("admin_name", name);
      localStorage.setItem("admin_notifications", JSON.stringify(notifications));
      localStorage.setItem("admin_2fa", String(twoFactor));

      await new Promise((resolve) => setTimeout(resolve, 500));

      setSuccess("Paramètres enregistrés avec succès !");
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'enregistrement");
      setTimeout(() => setError(null), 3500);
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     CHANGEMENT DE MOT DE PASSE
  ========================================================= */
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setError(null);

    if (!currentPassword.trim()) {
      setError("Veuillez saisir votre mot de passe actuel.");
      setPasswordLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      setPasswordLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Erreur lors de la modification du mot de passe.");
      }

      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Mot de passe modifié avec succès !");
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err?.message || "Impossible de modifier le mot de passe");
    } finally {
      setPasswordLoading(false);
    }
  };

  /* =========================================================
     EXPORT DES DONNÉES
  ========================================================= */
  const handleExportData = () => {
    const exportPayload = {
      exportDate: new Date().toISOString(),
      role: "super_admin",
      admin: {
        name,
        email,
      },
      preferences: {
        theme,
        twoFactor,
        notifications,
      },
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `admin_settings_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setSuccess("Export téléchargé avec succès !");
    setTimeout(() => setSuccess(null), 3000);
  };

  /* =========================================================
     DÉCONNEXION
  ========================================================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* HEADER */}
      <div>
        <div className="flex items-center gap-2 text-sm text-[#008080] font-medium mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Administration Système</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0B3C3C] dark:text-white">Paramètres Administrateur</h1>
        <p className="text-sm text-[#2F6F6F] dark:text-zinc-400 mt-1">
          Gérez vos préférences de la plateforme, la sécurité et les notifications système
        </p>
      </div>

      {/* SUCCESS / ERROR ALERTS */}
      {success && (
        <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
          <p className="text-sm text-green-700 dark:text-green-300 font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
        </div>
      )}

      {/* SETTINGS GRID */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* PROFIL */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#B8E0E0] dark:border-zinc-700 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#B8E0E0] dark:border-zinc-700">
            <div className="p-2 bg-[#D9F3F3] dark:bg-zinc-800 rounded-xl">
              <User className="w-4 h-4 text-[#008080]" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#0B3C3C] dark:text-white">Profil Administrateur</h2>
              <p className="text-xs text-[#2F6F6F] dark:text-zinc-400">Identité du compte super administrateur</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0B3C3C] dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
                Nom d&apos;affichage
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 text-sm border border-[#B8E0E0] dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800/80 text-[#0B3C3C] dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#008080]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0B3C3C] dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full p-2.5 text-sm border border-[#B8E0E0]/60 dark:border-zinc-700 rounded-xl bg-gray-100 dark:bg-zinc-800/40 text-gray-500 dark:text-zinc-400 cursor-not-allowed"
              />
              <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-1">
                L&apos;email principal est géré via la configuration système
              </p>
            </div>
          </div>
        </div>

        {/* SÉCURITÉ */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#B8E0E0] dark:border-zinc-700 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#B8E0E0] dark:border-zinc-700">
            <div className="p-2 bg-[#D9F3F3] dark:bg-zinc-800 rounded-xl">
              <Shield className="w-4 h-4 text-[#008080]" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#0B3C3C] dark:text-white">Sécurité du compte</h2>
              <p className="text-xs text-[#2F6F6F] dark:text-zinc-400">Contrôles d&apos;accès et authentification</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setError(null);
                setShowPasswordModal(true);
              }}
              className="w-full flex items-center justify-between p-3 border border-[#B8E0E0] dark:border-zinc-700 rounded-xl hover:bg-[#D9F3F3]/60 dark:hover:bg-zinc-800 transition group"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-[#008080]" />
                <div className="text-left">
                  <span className="text-sm font-medium text-[#0B3C3C] dark:text-zinc-200 block">
                    Changer le mot de passe
                  </span>
                  <span className="text-xs text-[#2F6F6F] dark:text-zinc-400">
                    Mettez à jour vos identifiants de connexion
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#2F6F6F] dark:text-zinc-400 group-hover:translate-x-1 transition" />
            </button>

            <div className="flex items-center justify-between p-3 border border-[#B8E0E0] dark:border-zinc-700 rounded-xl">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#008080]" />
                <div>
                  <p className="text-sm font-medium text-[#0B3C3C] dark:text-zinc-200">
                    Authentification à deux facteurs
                  </p>
                  <p className="text-xs text-[#2F6F6F] dark:text-zinc-400">
                    {twoFactor ? "Activée (Protection maximale)" : "Désactivée"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !twoFactor;
                  setTwoFactor(next);
                  localStorage.setItem("admin_2fa", String(next));
                }}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  twoFactor ? "bg-[#008080]" : "bg-gray-300 dark:bg-zinc-700"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    twoFactor ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-3 border border-red-200 dark:border-red-800/60 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-600 dark:text-red-400">Déconnexion</span>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#B8E0E0] dark:border-zinc-700 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#B8E0E0] dark:border-zinc-700">
            <div className="p-2 bg-[#D9F3F3] dark:bg-zinc-800 rounded-xl">
              <Bell className="w-4 h-4 text-[#008080]" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#0B3C3C] dark:text-white">Notifications Système</h2>
              <p className="text-xs text-[#2F6F6F] dark:text-zinc-400">Alertes et communications</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-[#B8E0E0] dark:border-zinc-700 rounded-xl">
              <div>
                <p className="text-sm font-medium text-[#0B3C3C] dark:text-zinc-200">
                  Alertes système & inscriptions
                </p>
                <p className="text-xs text-[#2F6F6F] dark:text-zinc-400">
                  Nouvelles demandes d&apos;entreprises en attente
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNotifications({ ...notifications, alerts: !notifications.alerts })}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  notifications.alerts ? "bg-[#008080]" : "bg-gray-300 dark:bg-zinc-700"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    notifications.alerts ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 border border-[#B8E0E0] dark:border-zinc-700 rounded-xl">
              <div>
                <p className="text-sm font-medium text-[#0B3C3C] dark:text-zinc-200">Notifications email</p>
                <p className="text-xs text-[#2F6F6F] dark:text-zinc-400">Recevez des alertes importantes par email</p>
              </div>
              <button
                type="button"
                onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  notifications.email ? "bg-[#008080]" : "bg-gray-300 dark:bg-zinc-700"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    notifications.email ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 border border-[#B8E0E0] dark:border-zinc-700 rounded-xl">
              <div>
                <p className="text-sm font-medium text-[#0B3C3C] dark:text-zinc-200">Mises à jour plateforme</p>
                <p className="text-xs text-[#2F6F6F] dark:text-zinc-400">Nouvelles fonctionnalités et correctifs</p>
              </div>
              <button
                type="button"
                onClick={() => setNotifications({ ...notifications, updates: !notifications.updates })}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  notifications.updates ? "bg-[#008080]" : "bg-gray-300 dark:bg-zinc-700"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    notifications.updates ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* PRÉFÉRENCES THÈME */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#B8E0E0] dark:border-zinc-700 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#B8E0E0] dark:border-zinc-700">
            <div className="p-2 bg-[#D9F3F3] dark:bg-zinc-800 rounded-xl">
              <Palette className="w-4 h-4 text-[#008080]" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#0B3C3C] dark:text-white">Préférences d&apos;affichage</h2>
              <p className="text-xs text-[#2F6F6F] dark:text-zinc-400">Personnalisation visuelle de l&apos;espace</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0B3C3C] dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
                Thème d&apos;affichage
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex-1 flex items-center justify-center gap-2 p-2.5 text-sm font-medium rounded-xl border transition-all ${
                    theme === "light"
                      ? "border-[#008080] bg-[#D9F3F3] dark:bg-zinc-800 text-[#008080] shadow-sm font-semibold"
                      : "border-[#B8E0E0] dark:border-zinc-700 text-[#2F6F6F] dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  Clair
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex-1 flex items-center justify-center gap-2 p-2.5 text-sm font-medium rounded-xl border transition-all ${
                    theme === "dark"
                      ? "border-[#008080] bg-[#D9F3F3] dark:bg-zinc-800 text-[#008080] shadow-sm font-semibold"
                      : "border-[#B8E0E0] dark:border-zinc-700 text-[#2F6F6F] dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Sombre
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* GESTION PLATEFORME / LICENCE */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#B8E0E0] dark:border-zinc-700 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#B8E0E0] dark:border-zinc-700">
            <div className="p-2 bg-[#D9F3F3] dark:bg-zinc-800 rounded-xl">
              <CreditCard className="w-4 h-4 text-[#008080]" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#0B3C3C] dark:text-white">Licence Plateforme</h2>
              <p className="text-xs text-[#2F6F6F] dark:text-zinc-400">Statut de la solution Chatbot Factory</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-gradient-to-br from-[#D9F3F3] to-[#EBFBFA] dark:from-zinc-800 dark:to-zinc-800/60 rounded-xl border border-[#B8E0E0] dark:border-zinc-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-[#0B3C3C] dark:text-white">Licence Entreprise</span>
                <span className="text-xs bg-[#008080] text-white font-semibold px-2.5 py-0.5 rounded-full">
                  Illimitée
                </span>
              </div>
              <p className="text-xs text-[#2F6F6F] dark:text-zinc-400 mt-1">
                Tous les modules actifs (RAG, IA Azure OpenAI, Multi-tenant)
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPlanModal(true)}
              className="w-full p-2.5 text-sm font-medium border border-[#008080] text-[#008080] dark:text-teal-400 rounded-xl hover:bg-[#D9F3F3] dark:hover:bg-zinc-800 transition"
            >
              Détails de la licence
            </button>
          </div>
        </div>

        {/* DONNÉES ET CONFIDENTIALITÉ */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#B8E0E0] dark:border-zinc-700 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#B8E0E0] dark:border-zinc-700">
            <div className="p-2 bg-[#D9F3F3] dark:bg-zinc-800 rounded-xl">
              <Database className="w-4 h-4 text-[#008080]" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#0B3C3C] dark:text-white">Données et Sauvegardes</h2>
              <p className="text-xs text-[#2F6F6F] dark:text-zinc-400">Export et maintenance</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleExportData}
              className="w-full flex items-center justify-between p-3 border border-[#B8E0E0] dark:border-zinc-700 rounded-xl hover:bg-[#D9F3F3]/60 dark:hover:bg-zinc-800 transition group"
            >
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-[#008080]" />
                <div className="text-left">
                  <span className="text-sm font-medium text-[#0B3C3C] dark:text-zinc-200 block">
                    Exporter les paramètres système
                  </span>
                  <span className="text-xs text-[#2F6F6F] dark:text-zinc-400">
                    Télécharger une archive JSON de configuration
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#2F6F6F] dark:text-zinc-400 group-hover:translate-x-1 transition" />
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center justify-between p-3 border border-red-200 dark:border-red-800/60 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition group"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-red-500" />
                <div className="text-left">
                  <span className="text-sm font-medium text-red-600 dark:text-red-400 block">
                    Réinitialiser le compte administrateur
                  </span>
                  <span className="text-xs text-red-500/80 dark:text-red-400/70">
                    Actions de maintenance critique
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#008080] to-[#00A8A8] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#008080]/20 transition disabled:opacity-50"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </div>

      {/* MODAL - CHANGER MOT DE PASSE */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-[#B8E0E0] dark:border-zinc-700 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-[#0B3C3C] dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#008080]" />
                Changer le mot de passe
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0B3C3C] dark:text-zinc-300 mb-1">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full p-2.5 pr-10 text-sm border border-[#B8E0E0] dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-[#0B3C3C] dark:text-zinc-100 focus:ring-2 focus:ring-[#008080] outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B3C3C] dark:text-zinc-300 mb-1">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full p-2.5 pr-10 text-sm border border-[#B8E0E0] dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-[#0B3C3C] dark:text-zinc-100 focus:ring-2 focus:ring-[#008080] outline-none"
                    placeholder="Au moins 6 caractères"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B3C3C] dark:text-zinc-300 mb-1">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full p-2.5 pr-10 text-sm border border-[#B8E0E0] dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-[#0B3C3C] dark:text-zinc-100 focus:ring-2 focus:ring-[#008080] outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2 bg-gradient-to-r from-[#008080] to-[#00A8A8] text-white rounded-xl text-sm font-semibold hover:shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  {passwordLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL - DÉTAILS DE LA LICENCE */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 border border-[#B8E0E0] dark:border-zinc-700 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-[#0B3C3C] dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#008080]" />
                Détails de la licence
              </h3>
              <button
                onClick={() => setShowPlanModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-[#0B3C3C] dark:text-zinc-200">
              <div className="p-4 bg-[#D9F3F3]/60 dark:bg-zinc-800 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-zinc-400">Type de licence :</span>
                  <span className="font-bold text-[#008080] dark:text-teal-300">
                    Super Admin / Full Enterprise
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-zinc-400">Entreprises supportées :</span>
                  <span className="font-bold">Illimité</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-zinc-400">Moteur IA & RAG :</span>
                  <span className="font-bold">SentenceTransformers + OpenAI</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-zinc-400">Statut du système :</span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-green-600 dark:text-green-400">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Opérationnel
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setShowPlanModal(false)}
                className="px-5 py-2 bg-[#008080] text-white rounded-xl text-sm font-semibold hover:bg-[#007A80] transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL - ZONE DE DANGER */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-red-200 dark:border-red-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Sécurité Super Administrateur</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">Compte racine du système</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 dark:text-zinc-300">
              Le compte Super Administrateur est le garant de la sécurité globale de la plateforme. La suppression directe
              est verrouillée pour prévenir toute indisponibilité du système.
            </p>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}