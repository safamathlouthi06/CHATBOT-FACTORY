"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  CreditCard,
  History,
  Bell,
  Shield,
  Calendar,
  Award,
  TrendingUp,
  LogOut,
  Edit3,
  X,
  Bot,
  FileText,
  MessageSquare,
} from "lucide-react";
import { API_URL } from "@/services/api";

// ─── Types ───────────────────────────────────────────────────────────────────
type EmployeProfile = {
  id: string;
  nom: string;
  prenom: string;
  email_personnel: string;
  avatar?: string;
  created_at: string;
  email_verified: boolean;
};

// ─── Notification ─────────────────────────────────────────────────────────────
function useNotif() {
  const [notif, setNotif] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const show = (type: "success" | "error", msg: string) => {
    setNotif({ type, msg });
    setTimeout(() => setNotif(null), 3500);
  };
  return { notif, show };
}

export default function ProfilePage() {
  const router = useRouter();
  const { notif, show } = useNotif();

  const [profile, setProfile] = useState<EmployeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Éditions
  const [editMode, setEditMode] = useState(false);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  
  // Changement de mot de passe
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [popupType, setPopupType] = useState<"success" | "error">("success");
  const [popupMessage, setPopupMessage] = useState("");

  // ─── Statistiques ──────────────────────────────────────────────────────────
  const [stats, setStats] = useState({
    chatbots: 0,
    documents: 0,
    conversations: 0,
  });

  // ─── Chargement du profil ──────────────────────────────────────────────────
  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_URL}/meEmploye`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
        }
        throw new Error("Erreur lors du chargement du profil");
      }

      const data = await res.json();
 
      setProfile(data);
      setNom(data.nom);
      setPrenom(data.prenom);
      setEmail(data.email_personnel);
    } catch (e: any) {
      show("error", e.message ?? "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/statistiques/overview`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setStats({
          chatbots: data.totals?.nombre_chatbots || 0,
          documents: data.totals?.nombre_documents || 0,
          conversations: data.totals?.nombre_conversations || 0,
        });
      }
    } catch (e) {
      // Silencieux
    }
  };

  // ─── Mise à jour du profil ─────────────────────────────────────────────────
  const updateProfile = async () => {
    if (!nom.trim()) {
      show("error", "Le nom est requis");
      return;
    }
    if (!prenom.trim()) {
      show("error", "Le prénom est requis");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      show("error", "Email invalide");
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/meEmploye`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nom: nom.trim(), prenom: prenom.trim(), email: email.trim() }),
      });

      if (!res.ok) throw new Error("Erreur lors de la mise à jour");

      const updated = await res.json();
      setProfile(updated);
      setEditMode(false);
      show("success", "Profil mis à jour avec succès ✅");
    } catch (e: any) {
      show("error", e.message ?? "Erreur");
    } finally {
      setUpdating(false);
    }
  };

  // ─── Changement de mot de passe ────────────────────────────────────────────
  const changePassword = async () => {
    if (!currentPassword.trim()) {
      setPopupType("error");
      setPopupMessage("Veuillez saisir votre mot de passe actuel.");
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 2000);
      return;
    }

    if (!newPassword.trim()) {
      setPopupType("error");
      setPopupMessage("Veuillez saisir un nouveau mot de passe.");
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 2000);
      return;
    }

    if (newPassword.length < 6) {
      setPopupType("error");
      setPopupMessage("Le mot de passe doit contenir au moins 6 caractères.");
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 2000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPopupType("error");
      setPopupMessage("Les deux mots de passe ne correspondent pas.");
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 2000);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setPopupType("error");
      setPopupMessage("Votre session a expiré.");
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 2000);
      return;
    }

    setUpdating(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/employes/change-password", {
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

      const data = await response.json();

      if (!response.ok) {
        setPopupType("error");
        setPopupMessage(data.detail || "Une erreur est survenue.");
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 2000);
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordModal(false);

      setPopupType("success");
      setPopupMessage("Modification effectuée avec succès.");
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 2000);
    } catch (error) {
      setPopupType("error");
      setPopupMessage("Impossible de contacter le serveur.");
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 2000);
    } finally {
      setUpdating(false);
    }
  };

  // ─── Déconnexion ───────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // ─── Formatage de date ─────────────────────────────────────────────────────
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F9F9] via-white to-[#F0F9F9] dark:from-[#0B1120] dark:via-[#0F1A2A] dark:to-[#0B1120]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-[#D9F3F3] border-t-[#008080] rounded-full animate-spin" />
            <div className="absolute inset-2 border-4 border-[#D9F3F3] border-b-[#008080] rounded-full animate-spin animation-delay-150" />
          </div>
          <p className="text-[#2F6F6F] dark:text-zinc-400 mt-4 font-medium">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9F9] via-white to-[#F0F9F9] dark:from-[#0B1120] dark:via-[#0F1A2A] dark:to-[#0B1120] py-8 px-4">
      {/* Notification Toast */}
      {notif && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm animate-in slide-in-from-top-2 duration-300
            ${notif.type === "success" ? "bg-gradient-to-r from-[#008080] to-[#00A8A8]" : "bg-gradient-to-r from-red-600 to-red-500"}`}
        >
          {notif.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {notif.msg}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header avec bouton retour */}
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#0B3C3C] dark:text-white tracking-tight">Mon profil</h1>
            <p className="text-[#2F6F6F] dark:text-zinc-400 text-sm mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#008080] rounded-full" />
              Gérez vos informations personnelles et votre sécurité
            </p>
          </div>
        </div>

        {/* Container avec hauteur égale pour sidebar et contenu */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Profil et navigation */}
          <div className="lg:col-span-1 flex">
            <div className="bg-white/80 backdrop-blur-sm dark:bg-zinc-900/80 rounded-3xl shadow-xl border border-[#B8E0E0]/50 dark:border-zinc-700/50 p-6 w-full flex flex-col">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="relative w-28 h-28 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#008080] to-[#00A8A8] rounded-full p-1">
                    <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center">
                      <User className="w-14 h-14 text-[#008080]" />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                    <CheckCircle size={14} className="text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-[#0B3C3C] dark:text-white">
                  {profile?.prenom} {profile?.nom}
                </h2>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-[#D9F3F3] dark:bg-zinc-800 rounded-full text-xs font-medium text-[#008080] dark:text-teal-300">
                  <Shield size={12} />
                  {profile?.email_verified ? "Email vérifié" : "Email non vérifié"}
                </div>
              </div>

              {/* Navigation - prend tout l'espace disponible */}
              <div className="space-y-2 pt-4 border-t border-[#E5F5F5] dark:border-zinc-700 flex-1">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#2F6F6F] dark:text-zinc-300 hover:bg-[#D9F3F3] dark:hover:bg-zinc-800 rounded-xl transition-all duration-200 group"
                >
                  <div className="p-1.5 rounded-lg bg-[#D9F3F3]/50 dark:bg-zinc-800 group-hover:bg-[#008080]/20 transition-colors">
                    <Lock size={15} className="text-[#008080]" />
                  </div>
                  Changer le mot de passe
                </button>
              </div>

              {/* Déconnexion - en bas de la carte */}
              <button
                onClick={logout}
                className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium hover:from-red-100 hover:to-red-200 dark:hover:from-red-950/50 dark:hover:to-red-950/40 transition-all duration-300 flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/30"
              >
                <LogOut size={16} />
                Se déconnecter
              </button>
            </div>
          </div>

          {/* Main content - même hauteur que la sidebar */}
          <div className="lg:col-span-3 flex">
            <div className="w-full space-y-6 flex flex-col">
              {/* Carte des informations personnelles */}
              <div className="bg-white/80 backdrop-blur-sm dark:bg-zinc-900/80 rounded-3xl shadow-xl border border-[#B8E0E0]/50 dark:border-zinc-700/50 p-6 flex-1">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#0B3C3C] dark:text-white flex items-center gap-2">
                      <User size={18} className="text-[#008080]" />
                      Informations personnelles
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                      {editMode ? "Modifiez vos informations" : "Consultez vos informations"}
                    </p>
                  </div>
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#008080]/10 text-[#008080] rounded-xl text-sm font-medium hover:bg-[#008080]/20 transition-all duration-300 group"
                    >
                      <Edit3 size={14} className="group-hover:rotate-12 transition-transform" />
                      Modifier
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditMode(false);
                          setNom(profile?.nom || "");
                          setPrenom(profile?.prenom || "");
                          setEmail(profile?.email_personnel || "");
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-xl text-sm text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={updateProfile}
                        disabled={updating}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#008080] to-[#00A8A8] text-white rounded-xl text-sm font-medium hover:shadow-lg disabled:opacity-50 transition-all duration-300"
                      >
                        {updating ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Save size={14} />
                        )}
                        Sauvegarder
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-5">
                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-medium text-[#0B3C3C] dark:text-zinc-200 mb-1.5">
                      <User size={14} className="inline mr-1.5 text-[#008080]" />
                      Nom
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        className="w-full border-2 border-[#B8E0E0] dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent bg-white dark:bg-zinc-900 text-[#0B3C3C] dark:text-zinc-100 transition-all duration-200"
                        placeholder="Votre nom"
                      />
                    ) : (
                      <p className="text-gray-700 dark:text-zinc-300 py-3 px-4 bg-[#F7FFFF] dark:bg-zinc-800/50 rounded-xl border border-[#E5F5F5] dark:border-zinc-700/50">
                        {profile?.nom || "-"}
                      </p>
                    )}
                  </div>

                  {/* Prénom */}
                  <div>
                    <label className="block text-sm font-medium text-[#0B3C3C] dark:text-zinc-200 mb-1.5">
                      <User size={14} className="inline mr-1.5 text-[#008080]" />
                      Prénom
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={prenom}
                        onChange={(e) => setPrenom(e.target.value)}
                        className="w-full border-2 border-[#B8E0E0] dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent bg-white dark:bg-zinc-900 text-[#0B3C3C] dark:text-zinc-100 transition-all duration-200"
                        placeholder="Votre prénom"
                      />
                    ) : (
                      <p className="text-gray-700 dark:text-zinc-300 py-3 px-4 bg-[#F7FFFF] dark:bg-zinc-800/50 rounded-xl border border-[#E5F5F5] dark:border-zinc-700/50">
                        {profile?.prenom || "-"}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-[#0B3C3C] dark:text-zinc-200 mb-1.5">
                      <Mail size={14} className="inline mr-1.5 text-[#008080]" />
                      Adresse email personnelle
                    </label>
                    {editMode ? (
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border-2 border-[#B8E0E0] dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent bg-white dark:bg-zinc-900 text-[#0B3C3C] dark:text-zinc-100 transition-all duration-200"
                        placeholder="votre@email.com"
                      />
                    ) : (
                      <p className="text-gray-700 dark:text-zinc-300 py-3 px-4 bg-[#F7FFFF] dark:bg-zinc-800/50 rounded-xl border border-[#E5F5F5] dark:border-zinc-700/50">
                        {profile?.email_personnel || "-"}
                      </p>
                    )}
                  </div>

                  {/* Date d'inscription */}
                  <div>
                    <label className="block text-sm font-medium text-[#0B3C3C] dark:text-zinc-200 mb-1.5">
                      <Calendar size={14} className="inline mr-1.5 text-[#008080]" />
                      Membre depuis
                    </label>
                    <p className="text-gray-700 dark:text-zinc-300 py-3 px-4 bg-[#F7FFFF] dark:bg-zinc-800/50 rounded-xl border border-[#E5F5F5] dark:border-zinc-700/50 flex items-center gap-2">
                      <Award size={16} className="text-[#008080]" />
                      {profile?.created_at ? formatDate(profile.created_at) : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal - Changement de mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in duration-300">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-700">
              <h2 className="font-bold text-xl text-[#0B3C3C] dark:text-white flex items-center gap-2">
                <div className="p-2 bg-[#D9F3F3] dark:bg-[#123D3D] rounded-xl">
                  <Lock size={18} className="text-[#008080]" />
                </div>
                Changer le mot de passe
              </h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Mot de passe actuel */}
              <div>
                <label className="block text-sm font-medium text-[#0B3C3C] dark:text-zinc-200 mb-1.5">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border-2 border-[#B8E0E0] dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent pr-11 bg-white dark:bg-zinc-900 text-[#0B3C3C] dark:text-zinc-100 transition-all duration-200"
                    placeholder="••••••••"
                  />
                  <button
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Nouveau mot de passe */}
              <div>
                <label className="block text-sm font-medium text-[#0B3C3C] dark:text-zinc-200 mb-1.5">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border-2 border-[#B8E0E0] dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent pr-11 bg-white dark:bg-zinc-900 text-[#0B3C3C] dark:text-zinc-100 transition-all duration-200"
                    placeholder="•••••••• (min. 6 caractères)"
                  />
                  <button
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirmation */}
              <div>
                <label className="block text-sm font-medium text-[#0B3C3C] dark:text-zinc-200 mb-1.5">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border-2 border-[#B8E0E0] dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent pr-11 bg-white dark:bg-zinc-900 text-[#0B3C3C] dark:text-zinc-100 transition-all duration-200"
                    placeholder="••••••••"
                  />
                  <button
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-zinc-700">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-5 py-2.5 border-2 border-[#B8E0E0] dark:border-zinc-700 rounded-xl text-sm font-medium text-[#0B3C3C] dark:text-zinc-200 hover:bg-[#D9F3F3] dark:hover:bg-zinc-800 transition-all duration-200"
              >
                Annuler
              </button>
              <button
                onClick={changePassword}
                disabled={updating}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#008080] to-[#00A8A8] text-white rounded-xl text-sm font-semibold hover:shadow-lg disabled:opacity-50 transition-all duration-300"
              >
                {updating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {updating ? "Modification..." : "Changer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup de succès/erreur */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[380px] rounded-3xl bg-white dark:bg-zinc-900 p-8 shadow-2xl text-center animate-in zoom-in duration-300">
            {/* Icône */}
            <div
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${
                popupType === "success"
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
              }`}
            >
              {popupType === "success" ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <X className="h-8 w-8 text-red-600" />
              )}
            </div>

            {/* Titre */}
            <h3
              className={`text-xl font-bold ${
                popupType === "success"
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-700 dark:text-red-400"
              }`}
            >
              {popupType === "success" ? "Modification réussie" : "Modification impossible"}
            </h3>

            {/* Message */}
            <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
              {popupMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}