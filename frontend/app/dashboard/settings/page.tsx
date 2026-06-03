"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Bell,
  Globe,
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
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState("Jean Dupont");
  const [email, setEmail] = useState("jean.dupont@entreprise.com");
  const [notifications, setNotifications] = useState({
    email: true,
    marketing: false,
    updates: true,
  });
  const [language, setLanguage] = useState("fr");
  const [theme, setTheme] = useState("light");
  const [twoFactor, setTwoFactor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* HEADER */}
      <div>
        <div className="flex items-center gap-2 text-sm text-[#008080] font-medium mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Préférences</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0B3C3C]">Paramètres</h1>
        <p className="text-sm text-[#2F6F6F] mt-1">
          Gérez vos préférences et la sécurité de votre compte
        </p>
      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-700">Paramètres enregistrés avec succès !</p>
        </div>
      )}

      {/* SETTINGS GRID */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* PROFIL */}
        <div className="bg-white rounded-xl border border-[#B8E0E0] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#B8E0E0]">
            <div className="p-1.5 bg-[#D9F3F3] rounded-lg">
              <User className="w-4 h-4 text-[#008080]" />
            </div>
            <h2 className="font-semibold text-base text-[#0B3C3C]">Profil</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#0B3C3C] mb-1">Nom</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 text-sm border border-[#B8E0E0] rounded-lg bg-white text-[#0B3C3C] focus:outline-none focus:ring-2 focus:ring-[#008080]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#0B3C3C] mb-1">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 text-sm border border-[#B8E0E0] rounded-lg bg-white text-[#0B3C3C] focus:outline-none focus:ring-2 focus:ring-[#008080]"
              />
            </div>
          </div>
        </div>

        {/* SÉCURITÉ */}
        <div className="bg-white rounded-xl border border-[#B8E0E0] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#B8E0E0]">
            <div className="p-1.5 bg-[#D9F3F3] rounded-lg">
              <Shield className="w-4 h-4 text-[#008080]" />
            </div>
            <h2 className="font-semibold text-base text-[#0B3C3C]">Sécurité</h2>
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 border border-[#B8E0E0] rounded-lg hover:bg-[#D9F3F3] transition group">
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-[#008080]" />
                <span className="text-sm text-[#0B3C3C]">Changer le mot de passe</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#2F6F6F] group-hover:translate-x-1 transition" />
            </button>

            <div className="flex items-center justify-between p-3 border border-[#B8E0E0] rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#008080]" />
                <div>
                  <p className="text-sm text-[#0B3C3C]">Authentification à deux facteurs</p>
                  <p className="text-xs text-[#2F6F6F]">Sécurisez votre compte</p>
                </div>
              </div>
              <button
                onClick={() => setTwoFactor(!twoFactor)}
                className={`relative w-10 h-5 rounded-full transition ${
                  twoFactor ? "bg-[#008080]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${
                    twoFactor ? "right-0.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-3 border border-red-200 rounded-lg hover:bg-red-50 transition group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">Déconnexion</span>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="bg-white rounded-xl border border-[#B8E0E0] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#B8E0E0]">
            <div className="p-1.5 bg-[#D9F3F3] rounded-lg">
              <Bell className="w-4 h-4 text-[#008080]" />
            </div>
            <h2 className="font-semibold text-base text-[#0B3C3C]">Notifications</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-[#B8E0E0] rounded-lg">
              <div>
                <p className="text-sm text-[#0B3C3C]">Notifications email</p>
                <p className="text-xs text-[#2F6F6F]">Recevez des alertes par email</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                className={`relative w-10 h-5 rounded-full transition ${
                  notifications.email ? "bg-[#008080]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${
                    notifications.email ? "right-0.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 border border-[#B8E0E0] rounded-lg">
              <div>
                <p className="text-sm text-[#0B3C3C]">Offres et nouveautés</p>
                <p className="text-xs text-[#2F6F6F]">Recevez nos actualités</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, marketing: !notifications.marketing })}
                className={`relative w-10 h-5 rounded-full transition ${
                  notifications.marketing ? "bg-[#008080]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${
                    notifications.marketing ? "right-0.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 border border-[#B8E0E0] rounded-lg">
              <div>
                <p className="text-sm text-[#0B3C3C]">Mises à jour produit</p>
                <p className="text-xs text-[#2F6F6F]">Nouveautés fonctionnalités</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, updates: !notifications.updates })}
                className={`relative w-10 h-5 rounded-full transition ${
                  notifications.updates ? "bg-[#008080]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${
                    notifications.updates ? "right-0.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* PRÉFÉRENCES */}
        <div className="bg-white rounded-xl border border-[#B8E0E0] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#B8E0E0]">
            <div className="p-1.5 bg-[#D9F3F3] rounded-lg">
              <Globe className="w-4 h-4 text-[#008080]" />
            </div>
            <h2 className="font-semibold text-base text-[#0B3C3C]">Préférences</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#0B3C3C] mb-1">Langue</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 text-sm border border-[#B8E0E0] rounded-lg bg-white text-[#0B3C3C] focus:outline-none focus:ring-2 focus:ring-[#008080]"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#0B3C3C] mb-1">Thème</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex-1 flex items-center justify-center gap-2 p-2 text-sm border rounded-lg transition ${
                    theme === "light"
                      ? "border-[#008080] bg-[#D9F3F3] text-[#008080]"
                      : "border-[#B8E0E0] text-[#2F6F6F]"
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  Clair
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex-1 flex items-center justify-center gap-2 p-2 text-sm border rounded-lg transition ${
                    theme === "dark"
                      ? "border-[#008080] bg-[#D9F3F3] text-[#008080]"
                      : "border-[#B8E0E0] text-[#2F6F6F]"
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Sombre
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ABONNEMENT */}
        <div className="bg-white rounded-xl border border-[#B8E0E0] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#B8E0E0]">
            <div className="p-1.5 bg-[#D9F3F3] rounded-lg">
              <CreditCard className="w-4 h-4 text-[#008080]" />
            </div>
            <h2 className="font-semibold text-base text-[#0B3C3C]">Abonnement</h2>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-[#D9F3F3] rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-[#0B3C3C]">Plan actuel</span>
                <span className="text-xs bg-[#008080] text-white px-2 py-0.5 rounded-full">Pro</span>
              </div>
              <p className="text-2xl font-bold text-[#008080]">49€<span className="text-sm text-[#2F6F6F]">/mois</span></p>
              <p className="text-xs text-[#2F6F6F] mt-1">Facturé mensuellement</p>
            </div>

            <button className="w-full p-2 text-sm border border-[#008080] text-[#008080] rounded-lg hover:bg-[#D9F3F3] transition">
              Gérer mon abonnement
            </button>

            <div className="flex items-center gap-2 p-2 text-xs text-[#2F6F6F]">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Prochain renouvellement le 15/03/2025</span>
            </div>
          </div>
        </div>

        {/* DONNÉES */}
        <div className="bg-white rounded-xl border border-[#B8E0E0] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#B8E0E0]">
            <div className="p-1.5 bg-[#D9F3F3] rounded-lg">
              <Database className="w-4 h-4 text-[#008080]" />
            </div>
            <h2 className="font-semibold text-base text-[#0B3C3C]">Données et confidentialité</h2>
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 border border-[#B8E0E0] rounded-lg hover:bg-[#D9F3F3] transition group">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-[#008080]" />
                <span className="text-sm text-[#0B3C3C]">Exporter mes données</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#2F6F6F] group-hover:translate-x-1 transition" />
            </button>
            <button className="w-full flex items-center justify-between p-3 border border-red-200 rounded-lg hover:bg-red-50 transition group">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">Supprimer mon compte</span>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#008080] to-[#00A8A8] text-white rounded-lg text-sm font-medium hover:shadow-md transition disabled:opacity-50"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Enregistrer
        </button>
      </div>

    </div>
  );
}