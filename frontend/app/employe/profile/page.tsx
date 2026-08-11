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

  const [profile, setProfile] = useState<EmployeProfile| null>(null);
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

  // ─── Chargement du profil ──────────────────────────────────────────────────
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }



        const res = await fetch(`${API_URL}/employes/me`, {
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
      setEmail(data.email);
    } catch (e: any) {
      show("error", e.message ?? "Erreur de chargement");
    } finally {
      setLoading(false);
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
      const res = await fetch(`${API_URL}/employes/me`, {
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
    if (!currentPassword) {
      show("error", "Le mot de passe actuel est requis");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      show("error", "Le nouveau mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (newPassword !== confirmPassword) {
      show("error", "Les mots de passe ne correspondent pas");
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? "Erreur");
      }

      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      show("success", "Mot de passe modifié avec succès ✅");
    } catch (e: any) {
      show("error", e.message ?? "Erreur lors du changement");
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F9F9] to-white dark:from-[#0B1120] dark:to-[#0B1120]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#008080] mx-auto mb-4" />
          <p className="text-[#2F6F6F] dark:text-zinc-400">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9F9] to-white dark:from-[#0B1120] dark:to-[#0B1120] py-8 px-4">
      {/* Notification */}
      {notif && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm animate-in slide-in-from-top-2
            ${notif.type === "success" ? "bg-[#008080]" : "bg-red-600"}`}
        >
          {notif.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {notif.msg}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#008080] hover:bg-[#D9F3F3] dark:hover:bg-zinc-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#0B3C3C] dark:text-white">Mon profil</h1>
            <p className="text-[#2F6F6F] dark:text-zinc-400 text-sm mt-1">
              Gérez vos informations personnelles et votre sécurité
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar - Informations rapides */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-[#B8E0E0] dark:border-zinc-700 p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-[#008080] to-[#00A8A8] rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-[#0B3C3C] dark:text-white">{profile?.prenom} {profile?.nom}</h2>

                <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-[#D9F3F3] dark:bg-zinc-800 rounded-full text-xs text-[#008080] dark:text-teal-300">
                  <Shield size={12} />
                  {profile?.email_verified ? "Email vérifié" : "Email non vérifié"}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#E5F5F5] dark:border-zinc-700">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#2F6F6F] dark:text-zinc-300 hover:bg-[#D9F3F3] dark:hover:bg-zinc-800 rounded-lg transition"
                >
                  <Lock size={16} className="text-[#008080]" />
                  Changer le mot de passe
                </button>
                <button
                  onClick={() => router.push("/subscription")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#2F6F6F] dark:text-zinc-300 hover:bg-[#D9F3F3] dark:hover:bg-zinc-800 rounded-lg transition"
                >
                  <CreditCard size={16} className="text-[#008080]" />
                  Abonnement
                </button>
                <button
                  onClick={() => router.push("/history")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#2F6F6F] dark:text-zinc-300 hover:bg-[#D9F3F3] dark:hover:bg-zinc-800 rounded-lg transition"
                >
                  <History size={16} className="text-[#008080]" />
                  Historique
                </button>
                <button
                  onClick={() => router.push("/notifications")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#2F6F6F] dark:text-zinc-300 hover:bg-[#D9F3F3] dark:hover:bg-zinc-800 rounded-lg transition"
                >
                  <Bell size={16} className="text-[#008080]" />
                  Notifications
                </button>
              </div>

              <button
                onClick={logout}
                className="w-full mt-6 px-4 py-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition"
              >
                Se déconnecter
              </button>
            </div>
          </div>

          {/* Main content - Formulaire profil */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-[#B8E0E0] dark:border-zinc-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-[#0B3C3C] dark:text-white">Informations personnelles</h3>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="text-sm text-[#008080] hover:underline"
                  >
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
                      className="text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={updateProfile}
                      disabled={updating}
                      className="flex items-center gap-1 text-sm text-[#008080] hover:underline disabled:opacity-50"
                    >
                      {updating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Sauvegarder
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-[#0B3C3C] dark:text-zinc-200 mb-2">
                    <User size={14} className="inline mr-1" />
                    Nom
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      className="w-full border border-[#B8E0E0] dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] bg-white dark:bg-zinc-900 text-[#0B3C3C] dark:text-zinc-100"
                      placeholder="Votre nom"
                    />
                  ) : (
                    <p className="text-gray-700 dark:text-zinc-300 py-2.5 px-4 bg-[#F7FFFF] dark:bg-zinc-800 rounded-xl border border-[#E5F5F5] dark:border-zinc-700">
                      {profile?.nom || "-"}
                    </p>
                  )}
                </div>
                {/* Préom */}
                <div>
                  <label className="block text-sm font-medium text-[#0B3C3C] dark:text-zinc-200 mb-2">
                    <User size={14} className="inline mr-1" />
                    Prénom
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={prenom}
                      onChange={(e) => setNom(e.target.value)}
                      className="w-full border border-[#B8E0E0] dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] bg-white dark:bg-zinc-900 text-[#0B3C3C] dark:text-zinc-100"
                      placeholder="Votre prénom"
                    />
                  ) : (
                    <p className="text-gray-700 dark:text-zinc-300 py-2.5 px-4 bg-[#F7FFFF] dark:bg-zinc-800 rounded-xl border border-[#E5F5F5] dark:border-zinc-700">
                      {profile?.prenom || "-"}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-[#0B3C3C] dark:text-zinc-200 mb-2">
                    <Mail size={14} className="inline mr-1" />
                    Adresse email personnelle
                  </label>
                  {editMode ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-[#B8E0E0] dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] bg-white dark:bg-zinc-900 text-[#0B3C3C] dark:text-zinc-100"
                      placeholder="votre@email.com"
                    />
                  ) : (
                    <p className="text-gray-700 dark:text-zinc-300 py-2.5 px-4 bg-[#F7FFFF] dark:bg-zinc-800 rounded-xl border border-[#E5F5F5] dark:border-zinc-700">
                      {profile?.email || "-"}
                    </p>
                  )}
                </div>



                {/* Date d'inscription */}
                <div>
                  <label className="block text-sm font-medium text-[#0B3C3C] dark:text-zinc-200 mb-2">
                    Membre depuis
                  </label>
                  <p className="text-gray-700 dark:text-zinc-300 py-2.5 px-4 bg-[#F7FFFF] dark:bg-zinc-800 rounded-xl border border-[#E5F5F5] dark:border-zinc-700">
                    {profile?.created_at ? formatDate(profile.created_at) : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-[#B8E0E0] dark:border-zinc-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#2F6F6F] dark:text-zinc-400">Chatbots</span>
                  <span className="text-2xl font-bold text-[#008080]">3</span>
                </div>
                <p className="text-xs text-gray-400 dark:text-zinc-500">Chatbots actifs</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-[#B8E0E0] dark:border-zinc-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#2F6F6F] dark:text-zinc-400">Documents</span>
                  <span className="text-2xl font-bold text-[#008080]">12</span>
                </div>
                <p className="text-xs text-gray-400 dark:text-zinc-500">Documents indexés</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal - Changement de mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-700">
              <h2 className="font-bold text-xl text-[#0B3C3C] dark:text-white flex items-center gap-2">
                <Lock size={20} className="text-[#008080]" />
                Changer le mot de passe
              </h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition"
              >
                ✕
              </button>
            </div>

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
                    className="w-full border border-[#B8E0E0] dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] pr-10 bg-white dark:bg-zinc-900 text-[#0B3C3C] dark:text-zinc-100"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
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
                    className="w-full border border-[#B8E0E0] dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] pr-10 bg-white dark:bg-zinc-900 text-[#0B3C3C] dark:text-zinc-100"
                    placeholder="•••••••• (min. 6 caractères)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
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
                    className="w-full border border-[#B8E0E0] dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] pr-10 bg-white dark:bg-zinc-900 text-[#0B3C3C] dark:text-zinc-100"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-zinc-700">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 border border-[#B8E0E0] dark:border-zinc-700 rounded-xl text-sm text-[#0B3C3C] dark:text-zinc-200 hover:bg-[#D9F3F3] dark:hover:bg-zinc-800 transition"
              >
                Annuler
              </button>
              <button
                onClick={changePassword}
                disabled={updating}
                className="flex items-center gap-2 bg-[#008080] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#005F5F] disabled:opacity-50 transition"
              >
                {updating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Changer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}