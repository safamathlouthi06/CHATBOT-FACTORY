"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Building,
  Mail,
  Lock,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Calendar,
  Award,
  LogOut,
  Edit3,
  X,
  Users,
  Globe,
  MapPin,
  Briefcase,
  Shield,
} from "lucide-react";

import PhoneNumberField, {
  isPhoneNumberValid,
} from "@/components/PhoneNumberField";

import { API_URL } from "@/services/api";

// ─────────────────────────────────────────────────────────────
// TYPE PROFIL
// ─────────────────────────────────────────────────────────────

type EntrepriseProfile = {
  id: string;
  nomentreprise: string;
  email: string;
  tel?: string | null;
  adresse?: string | null;
  site_web?: string | null;
  secteurd_activite?: string | null;
  avatar?: string | null;
  created_at?: string | null;
  email_verified?: boolean;
  nombre_employes?: number;
};

// ─────────────────────────────────────────────────────────────
// TYPE POPUP
// ─────────────────────────────────────────────────────────────

type PopupType = "success" | "error";

// ─────────────────────────────────────────────────────────────
// NOTIFICATION
// ─────────────────────────────────────────────────────────────

function useNotif() {
  const [notif, setNotif] = useState<{
    type: PopupType;
    msg: string;
  } | null>(null);

  const show = (type: PopupType, msg: string) => {
    setNotif({
      type,
      msg,
    });

    setTimeout(() => {
      setNotif(null);
    }, 3500);
  };

  return {
    notif,
    show,
  };
}

// ─────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────

export default function EntrepriseProfilePage() {
  const router = useRouter();
  const { notif, show } = useNotif();

  // ───────────────────────────────────────────────────────────
  // PROFIL
  // ───────────────────────────────────────────────────────────

  const [profile, setProfile] =
    useState<EntrepriseProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // ───────────────────────────────────────────────────────────
  // MODE EDITION
  // ───────────────────────────────────────────────────────────

  const [editMode, setEditMode] = useState(false);

  const [nomentreprise, setNomentreprise] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [site_web, setSiteWeb] = useState("");
  const [secteurd_activite, setSecteur] = useState("");

  // ───────────────────────────────────────────────────────────
  // PASSWORD
  // ───────────────────────────────────────────────────────────

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // ───────────────────────────────────────────────────────────
  // POPUP
  // ───────────────────────────────────────────────────────────

  const [showSuccessPopup, setShowSuccessPopup] =
    useState(false);

  const [popupType, setPopupType] =
    useState<PopupType>("success");

  const [popupMessage, setPopupMessage] =
    useState("");

  // ───────────────────────────────────────────────────────────
  // STATISTIQUES
  // ───────────────────────────────────────────────────────────

  const [stats, setStats] = useState({
    chatbots: 0,
    documents: 0,
    conversations: 0,
    employes: 0,
  });

  // ───────────────────────────────────────────────────────────
  // INITIALISATION
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  // ───────────────────────────────────────────────────────────
  // AFFICHER POPUP
  // ───────────────────────────────────────────────────────────

  const showPopup = (
    type: PopupType,
    message: string
  ) => {
    setPopupType(type);
    setPopupMessage(message);
    setShowSuccessPopup(true);

    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 3500);
  };

  // ───────────────────────────────────────────────────────────
  // EXTRAIRE MESSAGE BACKEND
  // ───────────────────────────────────────────────────────────

  const getBackendMessage = (
    data: any,
    defaultMessage: string
  ): string => {
    if (!data) {
      return defaultMessage;
    }

    // detail string
    if (typeof data.detail === "string") {
      return data.detail;
    }

    // message string
    if (typeof data.message === "string") {
      return data.message;
    }

    // error string
    if (typeof data.error === "string") {
      return data.error;
    }

    // detail tableau FastAPI / Pydantic
    if (Array.isArray(data.detail)) {
      const messages = data.detail
        .map((err: any) => {
          if (typeof err === "string") {
            return err;
          }

          return (
            err?.msg ||
            err?.message ||
            err?.detail ||
            ""
          );
        })
        .filter(Boolean);

      if (messages.length > 0) {
        return messages.join("\n");
      }
    }

    return defaultMessage;
  };

  // ───────────────────────────────────────────────────────────
  // CHARGER LE PROFIL
  // ───────────────────────────────────────────────────────────

  const fetchProfile = async () => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(
        `${API_URL}/meEntreprise`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      console.log(
        "PROFILE ENTREPRISE :",
        data
      );

      console.log(
        "CREATED_AT :",
        data?.created_at
      );

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        throw new Error(
          getBackendMessage(
            data,
            "Erreur lors du chargement du profil."
          )
        );
      }

      // Backend peut retourner :
      //
      // {
      //   message: "...",
      //   data: {...}
      // }
      //
      // ou directement :
      //
      // {...}

      const entreprise: EntrepriseProfile =
        data?.data ?? data;

      if (!entreprise) {
        throw new Error(
          "Profil entreprise introuvable."
        );
      }

      setProfile(entreprise);

      // ─────────────────────────────────────────────
      // Remplir les champs
      // ─────────────────────────────────────────────

      setNomentreprise(
        entreprise.nomentreprise ?? ""
      );

      setEmail(
        entreprise.email ?? ""
      );

      setTelephone(
        entreprise.tel ?? ""
      );

      setAdresse(
        entreprise.adresse ?? ""
      );

      setSiteWeb(
        entreprise.site_web ?? ""
      );

      setSecteur(
        entreprise.secteurd_activite ?? ""
      );
    } catch (error: any) {
      console.error(
        "Erreur fetchProfile :",
        error
      );

      show(
        "error",
        error?.message ??
          "Erreur lors du chargement du profil."
      );
    } finally {
      setLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────
  // STATISTIQUES
  // ───────────────────────────────────────────────────────────

  const fetchStats = async () => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) return;

      const res = await fetch(
        `${API_URL}/statistiques/overview`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) return;

      const data = await res.json();

      setStats({
        chatbots:
          data?.totals?.nombre_chatbots ?? 0,

        documents:
          data?.totals?.nombre_documents ?? 0,

        conversations:
          data?.totals?.nombre_conversations ?? 0,

        employes:
          data?.totals?.nombre_employes ?? 0,
      });
    } catch (error) {
      console.error(
        "Erreur statistiques :",
        error
      );
    }
  };

  // ───────────────────────────────────────────────────────────
  // ANNULER MODIFICATION
  // ───────────────────────────────────────────────────────────

  const cancelEdit = () => {
    if (!profile) {
      setEditMode(false);
      return;
    }

    setNomentreprise(
      profile.nomentreprise ?? ""
    );

    setEmail(
      profile.email ?? ""
    );

    setTelephone(
      profile.tel ?? ""
    );

    setAdresse(
      profile.adresse ?? ""
    );

    setSiteWeb(
      profile.site_web ?? ""
    );

    setSecteur(
      profile.secteurd_activite ?? ""
    );

    setEditMode(false);
  };

  // ───────────────────────────────────────────────────────────
  // MODIFIER PROFIL
  // ───────────────────────────────────────────────────────────

  const updateProfile = async () => {
    // ─────────────────────────────────────────────
    // Validation nom
    // ─────────────────────────────────────────────

    if (!nomentreprise.trim()) {
      showPopup(
        "error",
        "Le nom de l'entreprise est requis."
      );

      return;
    }

    // ─────────────────────────────────────────────
    // Validation email
    // ─────────────────────────────────────────────

    if (
      !email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email.trim()
      )
    ) {
      showPopup(
        "error",
        "Veuillez saisir une adresse email valide."
      );

      return;
    }

    // ─────────────────────────────────────────────
    // Validation téléphone
    // ─────────────────────────────────────────────

    if (tel.trim() && !isPhoneNumberValid(tel)) {
      showPopup(
        "error",
        "Le numéro de téléphone saisi est invalide."
      );

      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      showPopup(
        "error",
        "Votre session a expiré."
      );

      router.push("/login");

      return;
    }

    setUpdating(true);

    try {
      // ───────────────────────────────────────────
      // Données envoyées au backend
      // ───────────────────────────────────────────

      const body = {
        nomentreprise:
          nomentreprise.trim(),

        email:
          email.trim(),

        tel:
          tel.trim() || null,

        adresse:
          adresse.trim() || null,

        site_web:
          site_web.trim() || null,

        secteurd_activite:
          secteurd_activite.trim() || null,
      };

      console.log(
        "DONNEES ENVOYEES POUR MODIFICATION :",
        body
      );

      const res = await fetch(
        `${API_URL}/meEntreprise`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      console.log(
        "REPONSE MODIFICATION :",
        data
      );

      if (!res.ok) {
        const message =
          getBackendMessage(
            data,
            "Erreur lors de la mise à jour du profil."
          );

        // IMPORTANT :
        // Afficher le message exact du backend
        // dans le popup

        showPopup(
          "error",
          message
        );

        return;
      }

      // ───────────────────────────────────────────
      // Recharger depuis DB
      // ───────────────────────────────────────────

      await fetchProfile();

      setEditMode(false);

      // ───────────────────────────────────────────
      // Message backend si disponible
      // ───────────────────────────────────────────

      const successMessage =
        getBackendMessage(
          data,
          "Profil mis à jour avec succès."
        );

      showPopup(
        "success",
        successMessage
      );
    } catch (error: any) {
      console.error(
        "Erreur updateProfile :",
        error
      );

      showPopup(
        "error",
        error?.message ??
          "Impossible de modifier le profil."
      );
    } finally {
      setUpdating(false);
    }
  };

  // ───────────────────────────────────────────────────────────
  // CHANGEMENT MOT DE PASSE
  // ───────────────────────────────────────────────────────────

  const changePassword = async () => {
    // ─────────────────────────────────────────────
    // Mot de passe actuel
    // ─────────────────────────────────────────────

    if (!currentPassword.trim()) {
      showPopup(
        "error",
        "Veuillez saisir votre mot de passe actuel."
      );

      return;
    }

    // ─────────────────────────────────────────────
    // Nouveau mot de passe
    // ─────────────────────────────────────────────

    if (!newPassword.trim()) {
      showPopup(
        "error",
        "Veuillez saisir un nouveau mot de passe."
      );

      return;
    }

    // ─────────────────────────────────────────────
    // Minimum 6 caractères
    // ─────────────────────────────────────────────

    if (newPassword.length < 6) {
      showPopup(
        "error",
        "Le mot de passe doit contenir au moins 6 caractères."
      );

      return;
    }

    // ─────────────────────────────────────────────
    // Confirmation
    // ─────────────────────────────────────────────

    if (
      newPassword !== confirmPassword
    ) {
      showPopup(
        "error",
        "Les deux mots de passe ne correspondent pas."
      );

      return;
    }

    // ─────────────────────────────────────────────
    // Token
    // ─────────────────────────────────────────────

    const token =
      localStorage.getItem("token");

    if (!token) {
      showPopup(
        "error",
        "Votre session a expiré."
      );

      return;
    }

    setUpdating(true);

    try {
      const response =
        await fetch(
          `${API_URL}/entreprises/change-password`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              current_password:
                currentPassword,

              new_password:
                newPassword,

              confirm_password:
                confirmPassword,
            }),
          }
        );

      const data =
        await response.json();

      console.log(
        "REPONSE CHANGE PASSWORD :",
        data
      );

      // ───────────────────────────────────────────
      // ERREUR BACKEND
      // ───────────────────────────────────────────

      if (!response.ok) {
        const message =
          getBackendMessage(
            data,
            "Une erreur est survenue lors de la modification du mot de passe."
          );

        // Affichage du message EXACT
        // envoyé par FastAPI

        showPopup(
          "error",
          message
        );

        return;
      }

      // ───────────────────────────────────────────
      // SUCCÈS
      // ───────────────────────────────────────────

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowPasswordModal(false);

      const successMessage =
        getBackendMessage(
          data,
          "Mot de passe modifié avec succès."
        );

      showPopup(
        "success",
        successMessage
      );
    } catch (error) {
      console.error(
        "Erreur changement password :",
        error
      );

      showPopup(
        "error",
        "Impossible de contacter le serveur."
      );
    } finally {
      setUpdating(false);
    }
  };

  // ───────────────────────────────────────────────────────────
  // LOGOUT
  // ───────────────────────────────────────────────────────────

  const logout = () => {
    localStorage.removeItem("token");

    router.push("/login");
  };

  // ───────────────────────────────────────────────────────────
  // LOADING
  // ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F9F9] via-white to-[#F0F9F9] dark:from-[#0B1120] dark:via-[#0F1A2A] dark:to-[#0B1120]">
        <div className="text-center">

          <div className="relative w-16 h-16 mx-auto">

            <div className="absolute inset-0 border-4 border-[#D9F3F3] border-t-[#008080] rounded-full animate-spin" />

            <div className="absolute inset-2 border-4 border-[#D9F3F3] border-b-[#008080] rounded-full animate-spin" />

          </div>

          <p className="text-[#2F6F6F] dark:text-zinc-400 mt-4 font-medium">
            Chargement du profil...
          </p>

        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#F0F9F9] via-white to-[#F0F9F9] dark:from-[#0B1120] dark:via-[#0F1A2A] dark:to-[#0B1120] py-8 px-4">

        {/* ─────────────────────────────────────────────── */}
        {/* NOTIFICATION */}
        {/* ─────────────────────────────────────────────── */}

        {notif && (
          <div
            className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm ${
              notif.type === "success"
                ? "bg-gradient-to-r from-[#008080] to-[#00A8A8]"
                : "bg-gradient-to-r from-red-600 to-red-500"
            }`}
          >

            {notif.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}

            <span>
              {notif.msg}
            </span>

          </div>
        )}

        <div className="max-w-5xl mx-auto">

          {/* ─────────────────────────────────────────── */}
          {/* HEADER */}
          {/* ─────────────────────────────────────────── */}

          <div className="flex items-center gap-4 mb-8">

            <button
              onClick={() => router.back()}
              className="p-2.5 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-[#B8E0E0] dark:border-zinc-700 hover:bg-[#D9F3F3] dark:hover:bg-zinc-800 transition-all group"
            >
              <ArrowLeft
                size={18}
                className="text-[#008080] group-hover:-translate-x-0.5 transition-transform"
              />
            </button>

            <div>

              <h1 className="text-3xl font-black text-[#0B3C3C] dark:text-white tracking-tight">
                Profil Entreprise
              </h1>

              <p className="text-[#2F6F6F] dark:text-zinc-400 text-sm mt-1 flex items-center gap-2">

                <span className="w-1.5 h-1.5 bg-[#008080] rounded-full" />

                Gérez les informations de votre entreprise

              </p>

            </div>

          </div>

          <div className="grid lg:grid-cols-4 gap-6">

            {/* ───────────────────────────────────────── */}
            {/* SIDEBAR */}
            {/* ───────────────────────────────────────── */}

            <div className="lg:col-span-1 flex">

              <div className="bg-white/80 backdrop-blur-sm dark:bg-zinc-900/80 rounded-3xl shadow-xl border border-[#B8E0E0]/50 dark:border-zinc-700/50 p-6 w-full flex flex-col">

                {/* Avatar */}

                <div className="text-center mb-6">

                  <div className="relative w-28 h-28 mx-auto mb-4">

                    <div className="absolute inset-0 bg-gradient-to-br from-[#008080] to-[#00A8A8] rounded-full p-1">

                      <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center">

                        <Building className="w-14 h-14 text-[#008080]" />

                      </div>

                    </div>

                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center">

                      <CheckCircle
                        size={14}
                        className="text-white"
                      />

                    </div>

                  </div>

                  <h2 className="text-xl font-bold text-[#0B3C3C] dark:text-white break-words">

                    {profile?.nomentreprise ||
                      "Entreprise"}

                  </h2>

                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-[#D9F3F3] dark:bg-zinc-800 rounded-full text-xs font-medium text-[#008080] dark:text-teal-300">

                    <Shield size={12} />

                    {profile?.email_verified
                      ? "Email vérifié"
                      : "Email non vérifié"}

                  </div>

                </div>

                {/* Navigation */}

                <div className="space-y-2 pt-4 border-t border-[#E5F5F5] dark:border-zinc-700 flex-1">

                  <button
                    onClick={() =>
                      setShowPasswordModal(true)
                    }
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#2F6F6F] dark:text-zinc-300 hover:bg-[#D9F3F3] dark:hover:bg-zinc-800 rounded-xl transition-all group"
                  >

                    <div className="p-1.5 rounded-lg bg-[#D9F3F3]/50 dark:bg-zinc-800 group-hover:bg-[#008080]/20">

                      <Lock
                        size={15}
                        className="text-[#008080]"
                      />

                    </div>

                    Changer le mot de passe

                  </button>

                  <button
                    onClick={() =>
                      router.push(
                        "/dashboard/employes"
                      )
                    }
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#2F6F6F] dark:text-zinc-300 hover:bg-[#D9F3F3] dark:hover:bg-zinc-800 rounded-xl transition-all group"
                  >

                    <div className="p-1.5 rounded-lg bg-[#D9F3F3]/50 dark:bg-zinc-800 group-hover:bg-[#008080]/20">

                      <Users
                        size={15}
                        className="text-[#008080]"
                      />

                    </div>

                    Gérer les employés

                  </button>

                </div>

                {/* Logout */}

                <button
                  onClick={logout}
                  className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium hover:from-red-100 hover:to-red-200 transition-all flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/30"
                >

                  <LogOut size={16} />

                  Se déconnecter

                </button>

              </div>

            </div>

            {/* ───────────────────────────────────────── */}
            {/* MAIN */}
            {/* ───────────────────────────────────────── */}

            <div className="lg:col-span-3 flex">

              <div className="w-full">

                <div className="bg-white/80 backdrop-blur-sm dark:bg-zinc-900/80 rounded-3xl shadow-xl border border-[#B8E0E0]/50 dark:border-zinc-700/50 p-6">

                  {/* Header card */}

                  <div className="flex justify-between items-center mb-6 gap-4">

                    <div>

                      <h3 className="text-lg font-bold text-[#0B3C3C] dark:text-white flex items-center gap-2">

                        <Building
                          size={18}
                          className="text-[#008080]"
                        />

                        Informations de l'entreprise

                      </h3>

                      <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">

                        {editMode
                          ? "Modifiez vos informations"
                          : "Consultez vos informations"}

                      </p>

                    </div>

                    {!editMode ? (
                      <button
                        onClick={() =>
                          setEditMode(true)
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-[#008080]/10 text-[#008080] rounded-xl text-sm font-medium hover:bg-[#008080]/20 transition-all group"
                      >

                        <Edit3
                          size={14}
                          className="group-hover:rotate-12 transition-transform"
                        />

                        Modifier

                      </button>
                    ) : (
                      <div className="flex gap-2">

                        <button
                          onClick={cancelEdit}
                          disabled={updating}
                          className="px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-xl text-sm text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition disabled:opacity-50"
                        >
                          Annuler
                        </button>

                        <button
                          onClick={updateProfile}
                          disabled={updating}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#008080] to-[#00A8A8] text-white rounded-xl text-sm font-medium hover:shadow-lg disabled:opacity-50 transition-all"
                        >

                          {updating ? (
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <Save size={14} />
                          )}

                          {updating
                            ? "Sauvegarde..."
                            : "Sauvegarder"}

                        </button>

                      </div>
                    )}

                  </div>

                  {/* ───────────────────────────────────── */}
                  {/* CHAMPS */}
                  {/* ───────────────────────────────────── */}

                  <div className="space-y-5">

                    {/* NOM */}

                    <ProfileField
                      label="Nom de l'entreprise"
                      icon={
                        <Building size={14} />
                      }
                      editMode={editMode}
                      value={nomentreprise}
                      displayValue={
                        profile?.nomentreprise ||
                        "-"
                      }
                      placeholder="Nom de votre entreprise"
                      onChange={
                        setNomentreprise
                      }
                    />

                    {/* EMAIL */}

                    <ProfileField
                      label="Email de l'entreprise"
                      icon={
                        <Mail size={14} />
                      }
                      type="email"
                      editMode={editMode}
                      value={email}
                      displayValue={
                        profile?.email || "-"
                      }
                      placeholder="contact@entreprise.com"
                      onChange={setEmail}
                    />

                    {/* TELEPHONE */}

                    <PhoneNumberField
                      label="Téléphone"
                      editMode={editMode}
                      value={tel}
                      displayValue={
                        profile?.tel ||
                        "Non renseigné"
                      }
                      onChange={setTelephone}
                      required={false}
                    />

                    {/* ADRESSE */}

                    <ProfileField
                      label="Adresse"
                      icon={
                        <MapPin size={14} />
                      }
                      editMode={editMode}
                      value={adresse}
                      displayValue={
                        profile?.adresse ||
                        "Non renseignée"
                      }
                      placeholder="Adresse de l'entreprise"
                      onChange={setAdresse}
                    />

                    {/* SITE WEB */}

                    <ProfileField
                      label="Site web"
                      icon={
                        <Globe size={14} />
                      }
                      type="url"
                      editMode={editMode}
                      value={site_web}
                      displayValue={
                        profile?.site_web ||
                        "Non renseigné"
                      }
                      placeholder="https://www.entreprise.com"
                      onChange={setSiteWeb}
                    />

                    {/* SECTEUR */}

                    <ProfileField
                      label="Secteur d'activité"
                      icon={
                        <Briefcase size={14} />
                      }
                      editMode={editMode}
                      value={
                        secteurd_activite
                      }
                      displayValue={
                        profile?.secteurd_activite ||
                        "Non renseigné"
                      }
                      placeholder="Technologie, Santé, Éducation..."
                      onChange={
                        setSecteur
                      }
                    />

                    {/* CREATED AT */}

                    <div>

                      <label className="block text-sm font-medium text-[#0B3C3C] dark:text-zinc-200 mb-1.5">

                        <Calendar
                          size={14}
                          className="inline mr-1.5 text-[#008080]"
                        />

                        Membre depuis

                      </label>

                      <p className="text-gray-700 dark:text-zinc-300 py-3 px-4 bg-[#F7FFFF] dark:bg-zinc-800/50 rounded-xl border border-[#E5F5F5] dark:border-zinc-700/50 flex items-center gap-2">

                        <Award
                          size={16}
                          className="text-[#008080]"
                        />

                        {profile?.created_at
                          ? new Date(
                              profile.created_at
                            ).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )
                          : "Date non disponible"}

                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ───────────────────────────────────────────────────── */}
      {/* MODAL PASSWORD */}
      {/* ───────────────────────────────────────────────────── */}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">

          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-md w-full mx-4">

            {/* HEADER */}

            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-700">

              <h2 className="font-bold text-xl text-[#0B3C3C] dark:text-white flex items-center gap-2">

                <div className="p-2 bg-[#D9F3F3] dark:bg-[#123D3D] rounded-xl">

                  <Lock
                    size={18}
                    className="text-[#008080]"
                  />

                </div>

                Changer le mot de passe

              </h2>

              <button
                onClick={() => {
                  setShowPasswordModal(
                    false
                  );

                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl"
              >

                <X
                  size={18}
                  className="text-gray-400"
                />

              </button>

            </div>

            {/* BODY */}

            <div className="p-6 space-y-4">

              {/* CURRENT */}

              <PasswordField
                label="Mot de passe actuel"
                value={currentPassword}
                show={showCurrentPassword}
                onChange={
                  setCurrentPassword
                }
                onToggle={() =>
                  setShowCurrentPassword(
                    !showCurrentPassword
                  )
                }
              />

              {/* NEW */}

              <PasswordField
                label="Nouveau mot de passe"
                value={newPassword}
                show={showNewPassword}
                onChange={
                  setNewPassword
                }
                onToggle={() =>
                  setShowNewPassword(
                    !showNewPassword
                  )
                }
                placeholder="•••••••• (min. 6 caractères)"
              />

              {/* CONFIRM */}

              <PasswordField
                label="Confirmer le nouveau mot de passe"
                value={confirmPassword}
                show={showConfirmPassword}
                onChange={
                  setConfirmPassword
                }
                onToggle={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              />

            </div>

            {/* FOOTER */}

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-zinc-700">

              <button
                onClick={() => {
                  setShowPasswordModal(
                    false
                  );

                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                disabled={updating}
                className="px-5 py-2.5 border-2 border-[#B8E0E0] dark:border-zinc-700 rounded-xl text-sm font-medium text-[#0B3C3C] dark:text-zinc-200 hover:bg-[#D9F3F3] dark:hover:bg-zinc-800 disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                onClick={changePassword}
                disabled={updating}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#008080] to-[#00A8A8] text-white rounded-xl text-sm font-semibold hover:shadow-lg disabled:opacity-50"
              >

                {updating ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={16} />
                )}

                {updating
                  ? "Modification..."
                  : "Changer"}

              </button>

            </div>

          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────── */}
      {/* POPUP MESSAGE BACKEND */}
      {/* ───────────────────────────────────────────────────── */}

      {showSuccessPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">

          <div className="w-full max-w-[420px] rounded-3xl bg-white dark:bg-zinc-900 p-8 shadow-2xl text-center animate-in fade-in zoom-in duration-200">

            {/* ICON */}

            <div
              className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${
                popupType === "success"
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
              }`}
            >

              {popupType === "success" ? (
                <CheckCircle
                  className="h-8 w-8 text-green-600 dark:text-green-400"
                />
              ) : (
                <AlertCircle
                  className="h-8 w-8 text-red-600 dark:text-red-400"
                />
              )}

            </div>

            {/* TITRE */}

            <h3
              className={`text-xl font-bold ${
                popupType === "success"
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-700 dark:text-red-400"
              }`}
            >
              {popupType === "success"
                ? "Opération réussie"
                : "Opération impossible"}
            </h3>

            {/* MESSAGE BACKEND */}

            <div className="mt-3 px-2">

              <p className="text-sm leading-6 text-gray-600 dark:text-zinc-300 whitespace-pre-line break-words">
                {popupMessage}
              </p>

            </div>

            {/* BOUTON */}

            <button
              onClick={() =>
                setShowSuccessPopup(false)
              }
              className={`mt-6 w-full px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition ${
                popupType === "success"
                  ? "bg-gradient-to-r from-[#008080] to-[#00A8A8] hover:shadow-lg"
                  : "bg-gradient-to-r from-red-600 to-red-500 hover:shadow-lg"
              }`}
            >
              Fermer
            </button>

          </div>

        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENT CHAMP PROFIL
// ─────────────────────────────────────────────────────────────

type ProfileFieldProps = {
  label: string;
  icon: React.ReactNode;
  value: string;
  displayValue: string;
  placeholder?: string;
  type?: string;
  editMode: boolean;
  onChange: (value: string) => void;
};

function ProfileField({
  label,
  icon,
  value,
  displayValue,
  placeholder,
  type = "text",
  editMode,
  onChange,
}: ProfileFieldProps) {
  return (
    <div>

      <label className="block text-sm font-medium text-[#0B3C3C] dark:text-zinc-200 mb-1.5">

        <span className="inline-flex mr-1.5 text-[#008080]">
          {icon}
        </span>

        {label}

      </label>

      {editMode ? (
        <input
          type={type}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          className="w-full border-2 border-[#B8E0E0] dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent bg-white dark:bg-zinc-900 text-[#0B3C3C] dark:text-zinc-100 transition-all"
        />
      ) : (
        <p className="text-gray-700 dark:text-zinc-300 py-3 px-4 bg-[#F7FFFF] dark:bg-zinc-800/50 rounded-xl border border-[#E5F5F5] dark:border-zinc-700/50 break-words">

          {type === "url" &&
          displayValue !==
            "Non renseigné" ? (
            <a
              href={displayValue}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#008080] hover:underline"
            >
              {displayValue}
            </a>
          ) : (
            displayValue
          )}

        </p>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENT PASSWORD
// ─────────────────────────────────────────────────────────────

type PasswordFieldProps = {
  label: string;
  value: string;
  show: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
  placeholder?: string;
};

function PasswordField({
  label,
  value,
  show,
  onChange,
  onToggle,
  placeholder = "••••••••",
}: PasswordFieldProps) {
  return (
    <div>

      <label className="block text-sm font-medium text-[#0B3C3C] dark:text-zinc-200 mb-1.5">

        {label}

      </label>

      <div className="relative">

        <input
          type={
            show
              ? "text"
              : "password"
          }
          value={value}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          placeholder={placeholder}
          className="w-full border-2 border-[#B8E0E0] dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent pr-11 bg-white dark:bg-zinc-900 text-[#0B3C3C] dark:text-zinc-100"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
        >

          {show ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}

        </button>

      </div>

    </div>
  );
}