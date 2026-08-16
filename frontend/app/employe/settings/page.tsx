// app/employe/settings/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Mail,
  Phone,
  Lock,
  Key,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Monitor,
  Languages,
  Clock,
  LogOut,
  Trash2,
} from "lucide-react";

import { API_URL } from "@/services/api";

export default function EmployeeSettingsPage() {
  /* =========================================================
     STATES
  ========================================================= */

  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [user, setUser] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    poste: "",
    departement: "",
    avatar: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    theme: "system",
    language: "fr",
    timezone: "Europe/Paris",
    notifications: {
      email: true,
      push: true,
      desktop: false,
      newsletter: false,
    },
    privacy: {
      showOnline: true,
      showEmail: false,
      showPhone: false,
    },
  });

  /* =========================================================
     CHARGEMENT DES DONNÉES
  ========================================================= */

  useEffect(() => {
    fetchUserData();
    // Récupérer le thème actuel
    const darkMode = document.documentElement.classList.contains("dark");
    setIsDarkMode(darkMode);
    setPreferences(prev => ({ ...prev, theme: darkMode ? "dark" : "light" }));
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/meEmploye`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erreur lors du chargement des données");

      const data = await res.json();

      setUser({
        prenom: data?.prenom || "",
        nom: data?.nom || "",
        email: data?.email || "",
        telephone: data?.telephone || "",
        poste: data?.poste || "",
        departement: data?.departement || "",
        avatar: `${data?.prenom?.[0] || ""}${data?.nom?.[0] || ""}`.toUpperCase(),
      });
    } catch (error) {
      console.error("Erreur:", error);
      setErrorMessage("Impossible de charger les données utilisateur");
    }
  };

  /* =========================================================
     GESTIONNAIRES
  ========================================================= */

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (category: string, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const handleToggle = (category: string, key: string) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: !prev[category as keyof typeof prev][key as keyof typeof prev[typeof category]],
      },
    }));
  };

  /* =========================================================
     SAUVEGARDE
  ========================================================= */

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Non authentifié");

      const res = await fetch(`${API_URL}/employe/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prenom: user.prenom,
          nom: user.nom,
          telephone: user.telephone,
          poste: user.poste,
          departement: user.departement,
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de la mise à jour");

      setSuccessMessage("Profil mis à jour avec succès !");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Erreur lors de la mise à jour du profil");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setErrorMessage("Le mot de passe doit contenir au moins 8 caractères");
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Non authentifié");

      const res = await fetch(`${API_URL}/employe/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!res.ok) throw new Error("Mot de passe actuel incorrect");

      setSuccessMessage("Mot de passe changé avec succès !");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Erreur lors du changement de mot de passe");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Non authentifié");

      // Sauvegarder les préférences
      const res = await fetch(`${API_URL}/employe/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });

      if (!res.ok) throw new Error("Erreur lors de la sauvegarde");

      // Appliquer le thème
      if (preferences.theme === "dark") {
        document.documentElement.classList.add("dark");
        setIsDarkMode(true);
      } else if (preferences.theme === "light") {
        document.documentElement.classList.remove("dark");
        setIsDarkMode(false);
      } else {
        // System
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (systemDark) {
          document.documentElement.classList.add("dark");
          setIsDarkMode(true);
        } else {
          document.documentElement.classList.remove("dark");
          setIsDarkMode(false);
        }
      }

      setSuccessMessage("Préférences sauvegardées !");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Erreur lors de la sauvegarde des préférences");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================================================
     TABS
  ========================================================= */

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "security", label: "Sécurité", icon: Shield },
    { id: "preferences", label: "Préférences", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}




      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3C3C] dark:text-white flex items-center gap-2">
            
              Paramètres
          </h1>

          <p className="text-sm text-[#2F6F6F] dark:text-gray-400 mt-1">
            Gérez vos préférences et paramètres de compte
          </p>
        </div>


 </div>
      {/* =====================================================
          TABS
      ===================================================== */}

      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-[#007A80] to-[#00B7C2] text-white shadow-lg shadow-[#007A80]/20"
                  : "bg-white dark:bg-[#0F172A] text-[#134E52] dark:text-zinc-300 hover:bg-[#E8FAFB] dark:hover:bg-[#111827] border border-[#D9E3E5] dark:border-[#1E293B]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =====================================================
          CONTENU
      ===================================================== */}

      <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-[#D9E3E5] dark:border-[#1E293B] p-6 md:p-8">
        {/* Messages de succès/erreur */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* =====================================================
            TAB PROFIL
        ===================================================== */}

        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile}>
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#134E52] dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-[#007A80]" />
                Informations personnelles
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#134E52] dark:text-gray-300 mb-1.5">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    value={user.prenom}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-[#F8FCFD] dark:bg-[#111827] border border-[#D9E3E5] dark:border-[#1E293B] rounded-xl focus:ring-2 focus:ring-[#007A80] focus:border-transparent transition text-[#134E52] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134E52] dark:text-gray-300 mb-1.5">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={user.nom}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-[#F8FCFD] dark:bg-[#111827] border border-[#D9E3E5] dark:border-[#1E293B] rounded-xl focus:ring-2 focus:ring-[#007A80] focus:border-transparent transition text-[#134E52] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134E52] dark:text-gray-300 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-[#D9E3E5] dark:border-[#1E293B] rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134E52] dark:text-gray-300 mb-1.5">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={user.telephone}
                    onChange={handleInputChange}
                    placeholder="+33 6 12 34 56 78"
                    className="w-full px-4 py-2.5 bg-[#F8FCFD] dark:bg-[#111827] border border-[#D9E3E5] dark:border-[#1E293B] rounded-xl focus:ring-2 focus:ring-[#007A80] focus:border-transparent transition text-[#134E52] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134E52] dark:text-gray-300 mb-1.5">
                    Poste
                  </label>
                  <input
                    type="text"
                    name="poste"
                    value={user.poste}
                    onChange={handleInputChange}
                    placeholder="Développeur, Manager, etc."
                    className="w-full px-4 py-2.5 bg-[#F8FCFD] dark:bg-[#111827] border border-[#D9E3E5] dark:border-[#1E293B] rounded-xl focus:ring-2 focus:ring-[#007A80] focus:border-transparent transition text-[#134E52] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134E52] dark:text-gray-300 mb-1.5">
                    Département
                  </label>
                  <input
                    type="text"
                    name="departement"
                    value={user.departement}
                    onChange={handleInputChange}
                    placeholder="IT, Marketing, etc."
                    className="w-full px-4 py-2.5 bg-[#F8FCFD] dark:bg-[#111827] border border-[#D9E3E5] dark:border-[#1E293B] rounded-xl focus:ring-2 focus:ring-[#007A80] focus:border-transparent transition text-[#134E52] dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#D9E3E5] dark:border-[#1E293B]">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#007A80] to-[#00B7C2] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#007A80]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* =====================================================
            TAB SÉCURITÉ
        ===================================================== */}

        {activeTab === "security" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[#134E52] dark:text-white flex items-center gap-2 mb-6">
                <Lock className="w-5 h-5 text-[#007A80]" />
                Changer le mot de passe
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#134E52] dark:text-gray-300 mb-1.5">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 bg-[#F8FCFD] dark:bg-[#111827] border border-[#D9E3E5] dark:border-[#1E293B] rounded-xl focus:ring-2 focus:ring-[#007A80] focus:border-transparent transition text-[#134E52] dark:text-white pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134E52] dark:text-gray-300 mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 bg-[#F8FCFD] dark:bg-[#111827] border border-[#D9E3E5] dark:border-[#1E293B] rounded-xl focus:ring-2 focus:ring-[#007A80] focus:border-transparent transition text-[#134E52] dark:text-white pr-12"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Minimum 8 caractères
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134E52] dark:text-gray-300 mb-1.5">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 bg-[#F8FCFD] dark:bg-[#111827] border border-[#D9E3E5] dark:border-[#1E293B] rounded-xl focus:ring-2 focus:ring-[#007A80] focus:border-transparent transition text-[#134E52] dark:text-white pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#D9E3E5] dark:border-[#1E293B]">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#007A80] to-[#00B7C2] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#007A80]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    {isLoading ? "Changement..." : "Changer le mot de passe"}
                  </button>
                </div>
              </form>
            </div>

            <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800/50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                    Conseil de sécurité
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-500">
                    Utilisez un mot de passe fort et unique. Activez
                    l&apos;authentification à deux facteurs pour une sécurité
                    renforcée.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            TAB PRÉFÉRENCES
        ===================================================== */}

        {activeTab === "preferences" && (
          <div className="space-y-8">
            {/* Thème */}
            <div>
              <h3 className="text-lg font-semibold text-[#134E52] dark:text-white flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-[#007A80]" />
                Apparence
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: "light", label: "Clair", icon: Sun },
                  { value: "dark", label: "Sombre", icon: Moon },
                  { value: "system", label: "Système", icon: Monitor },
                ].map((option) => {
                  const Icon = option.icon;
                  const isSelected = preferences.theme === option.value;

                  return (
                    <button
                      key={option.value}
                      onClick={() => handlePreferenceChange("theme", "", option.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                        isSelected
                          ? "border-[#007A80] bg-[#E8FAFB] dark:bg-[#007A80]/20"
                          : "border-[#D9E3E5] dark:border-[#1E293B] hover:border-[#007A80]/50"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? "text-[#007A80]" : "text-gray-400"}`} />
                      <span className={`font-medium ${isSelected ? "text-[#007A80]" : "text-[#134E52] dark:text-white"}`}>
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Langue et Fuseau horaire */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#134E52] dark:text-gray-300 mb-1.5 flex items-center gap-2">
                  <Languages className="w-4 h-4 text-[#007A80]" />
                  Langue
                </label>
                <select
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange("language", "", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F8FCFD] dark:bg-[#111827] border border-[#D9E3E5] dark:border-[#1E293B] rounded-xl focus:ring-2 focus:ring-[#007A80] focus:border-transparent transition text-[#134E52] dark:text-white"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#134E52] dark:text-gray-300 mb-1.5 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#007A80]" />
                  Fuseau horaire
                </label>
                <select
                  value={preferences.timezone}
                  onChange={(e) => handlePreferenceChange("timezone", "", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F8FCFD] dark:bg-[#111827] border border-[#D9E3E5] dark:border-[#1E293B] rounded-xl focus:ring-2 focus:ring-[#007A80] focus:border-transparent transition text-[#134E52] dark:text-white"
                >
                  <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                  <option value="Europe/London">Europe/London (UTC+0)</option>
                  <option value="America/New_York">America/New_York (UTC-5)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                </select>
              </div>
            </div>

            {/* Vie privée */}
            <div>
              <h3 className="text-lg font-semibold text-[#134E52] dark:text-white flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-[#007A80]" />
                Confidentialité
              </h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.privacy.showOnline}
                    onChange={() => handleToggle("privacy", "showOnline")}
                    className="w-4 h-4 text-[#007A80] rounded border-gray-300 focus:ring-[#007A80]"
                  />
                  <span className="text-sm text-[#134E52] dark:text-gray-300">
                    Afficher mon statut en ligne
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.privacy.showEmail}
                    onChange={() => handleToggle("privacy", "showEmail")}
                    className="w-4 h-4 text-[#007A80] rounded border-gray-300 focus:ring-[#007A80]"
                  />
                  <span className="text-sm text-[#134E52] dark:text-gray-300">
                    Rendre mon email visible
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.privacy.showPhone}
                    onChange={() => handleToggle("privacy", "showPhone")}
                    className="w-4 h-4 text-[#007A80] rounded border-gray-300 focus:ring-[#007A80]"
                  />
                  <span className="text-sm text-[#134E52] dark:text-gray-300">
                    Rendre mon téléphone visible
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#D9E3E5] dark:border-[#1E293B]">
              <button
                onClick={handleSavePreferences}
                disabled={isLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-[#007A80] to-[#00B7C2] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#007A80]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isLoading ? "Sauvegarde..." : "Sauvegarder les préférences"}
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            TAB NOTIFICATIONS
        ===================================================== */}

        {activeTab === "notifications" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#134E52] dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#007A80]" />
              Préférences de notifications
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8FCFD] dark:bg-[#111827] border border-[#D9E3E5] dark:border-[#1E293B]">
                <div>
                  <p className="font-medium text-[#134E52] dark:text-white">
                    Notifications par email
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Recevez des notifications importantes par email
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.email}
                    onChange={() => handleToggle("notifications", "email")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-[#007A80] transition-all duration-300"></div>
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-5"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8FCFD] dark:bg-[#111827] border border-[#D9E3E5] dark:border-[#1E293B]">
                <div>
                  <p className="font-medium text-[#134E52] dark:text-white">
                    Notifications push
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Recevez des notifications dans votre navigateur
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.push}
                    onChange={() => handleToggle("notifications", "push")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-[#007A80] transition-all duration-300"></div>
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-5"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8FCFD] dark:bg-[#111827] border border-[#D9E3E5] dark:border-[#1E293B]">
                <div>
                  <p className="font-medium text-[#134E52] dark:text-white">
                    Notifications de bureau
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Alertes système sur votre ordinateur
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.desktop}
                    onChange={() => handleToggle("notifications", "desktop")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-[#007A80] transition-all duration-300"></div>
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-5"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8FCFD] dark:bg-[#111827] border border-[#D9E3E5] dark:border-[#1E293B]">
                <div>
                  <p className="font-medium text-[#134E52] dark:text-white">
                    Newsletter
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Recevez les actualités et mises à jour
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.newsletter}
                    onChange={() => handleToggle("notifications", "newsletter")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-[#007A80] transition-all duration-300"></div>
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-5"></div>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#D9E3E5] dark:border-[#1E293B]">
              <button
                onClick={handleSavePreferences}
                disabled={isLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-[#007A80] to-[#00B7C2] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#007A80]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isLoading ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          DANGER ZONE
      ===================================================== */}

      <div className="mt-6 p-6 rounded-3xl border-2 border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/20">
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5" />
          Zone de danger
        </h3>
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
          Ces actions sont irréversibles. Veuillez les effectuer avec
          précaution.
        </p>

        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Se déconnecter de tous les appareils
          </button>

          <button className="px-4 py-2 border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium rounded-xl transition-all duration-200 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  );
}