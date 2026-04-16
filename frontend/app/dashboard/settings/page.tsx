"use client";

import { useState } from "react";
import { User, Lock, Bell, Globe, Save } from "lucide-react";

export default function SettingsPage() {
  const [name, setName] = useState("Safa");
  const [email, setEmail] = useState("safa@example.com");
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("fr");

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-gray-500 mt-2">
          Gérez votre compte et vos préférences
        </p>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* PROFILE */}
        <div className="p-6 border rounded-2xl bg-white dark:bg-gray-900 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            Profil
          </h2>

          <div>
            <label className="text-sm text-gray-500">Nom</label>
            <input
              className="w-full mt-1 p-2 border rounded-lg bg-transparent"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Email</label>
            <input
              className="w-full mt-1 p-2 border rounded-lg bg-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* SECURITY */}
        <div className="p-6 border rounded-2xl bg-white dark:bg-gray-900 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-500" />
            Sécurité
          </h2>

          <button className="w-full p-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            Changer le mot de passe
          </button>

          <button className="w-full p-2 border rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
            Déconnexion
          </button>
        </div>

        {/* NOTIFICATIONS */}
        <div className="p-6 border rounded-2xl bg-white dark:bg-gray-900 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-500" />
            Notifications
          </h2>

          <label className="flex items-center justify-between">
            <span className="text-sm">Activer les notifications</span>
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
            />
          </label>
        </div>

        {/* LANGUAGE */}
        <div className="p-6 border rounded-2xl bg-white dark:bg-gray-900 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5 text-green-500" />
            Langue
          </h2>

          <select
            className="w-full p-2 border rounded-lg bg-transparent"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>

      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-lg hover:opacity-90">
          <Save className="w-4 h-4" />
          Enregistrer
        </button>
      </div>

    </div>
  );
}