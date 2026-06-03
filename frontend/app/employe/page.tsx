"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bot, Plus, MessageSquare, Activity, Play,
  Database, Rocket, LogOut, User, Settings,
  ChevronDown, Menu, X, Zap, BarChart3,
} from "lucide-react";

type Chatbot = {
  id: string; nom: string; domaine: string;
  statut: string; created_at: string;
};

type Me = {
  nom: string; prenom: string; email: string;
  entreprise_id: string;
};

const API = "http://127.0.0.1:8000";

export default function EmployeDashboard() {
  const router = useRouter();
  const [me, setMe] = useState<Me|null>(null);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [stats, setStats] = useState({ chatbots: 0, messages: 0, actifs: 0 });
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const tk = () => localStorage.getItem("token") ?? "";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("token");
        const role  = localStorage.getItem("role");
        if (!token || role !== "employe") { router.push("/login"); return; }

        // Charger le profil
        const meRes = await fetch(`${API}/meEmploye`, { headers: { Authorization: `Bearer ${token}` } });
        if (!meRes.ok) { router.push("/login"); return; }
        const meData = await meRes.json();
        setMe(meData);

        // Charger le dashboard
        const dashRes = await fetch(`${API}/dashboard/`, { headers: { Authorization: `Bearer ${token}` } });
        const dashData = await dashRes.json();
        const bots = dashData.chatbots || [];
        setChatbots(bots);
        setStats(dashData.stats || { chatbots: bots.length, messages: 0, actifs: 0 });
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  

  return (
    <div className="min-h-screen bg-[#F5F7F8] dark:bg-[#0B1120]">

    

      {/* ── Contenu ── */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Accueil personnalisé */}
        <div className="bg-gradient-to-r from-[#005F5F] to-[#00A8A8] rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <p className="text-white/70 text-sm mb-1">Bienvenue,</p>
            <h1 className="text-3xl font-black mb-2">
              {me ? `${me.prenom} ${me.nom}` : "..."}
            </h1>
            <p className="text-white/80 text-sm mb-6">
              Gérez vos chatbots et construisez votre base de connaissances.
            </p>
            <Link
              href="/employe/chatbots/create"
              className="inline-flex items-center gap-2 bg-white text-[#008080] px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition"
            >
              <Plus className="w-4 h-4" />Créer un chatbot
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Mes chatbots", value: stats.chatbots, icon: Bot, color: "text-[#008080]", bg: "bg-[#D9F3F3]" },
            { label: "Actifs",       value: stats.actifs,   icon: Zap, color: "text-green-600", bg: "bg-green-100" },
            { label: "Messages",     value: stats.messages, icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-100" },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-900 border border-[#B8E0E0] rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-black text-[#0B3C3C] dark:text-white">{s.value}</p>
              <p className="text-xs text-[#2F6F6F] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Mes chatbots */}
        <div className="bg-white dark:bg-gray-900 border border-[#B8E0E0] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg text-[#0B3C3C] dark:text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#008080]" />Mes chatbots
            </h2>
            <Link href="/employe/chatbots" className="text-sm text-[#008080] hover:underline font-medium">
              Voir tous
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-[#008080] border-t-transparent rounded-full animate-spin" /></div>
          ) : chatbots.length === 0 ? (
            <div className="text-center py-10">
              <Bot className="w-12 h-12 mx-auto text-[#00A8A8] mb-3" />
              <p className="text-[#2F6F6F] text-sm mb-3">Aucun chatbot encore</p>
              <Link href="/employe/chatbots/create" className="inline-flex items-center gap-2 bg-[#008080] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#005F5F] transition">
                <Plus className="w-4 h-4" />Créer mon premier chatbot
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {chatbots.slice(0, 5).map(bot => (
                <div key={bot.id} className="flex items-center justify-between p-4 border border-[#B8E0E0] rounded-xl hover:bg-[#F7FFFF] dark:hover:bg-gray-800 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#D9F3F3] flex items-center justify-center">
                      <Bot className="w-5 h-5 text-[#008080]" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#0B3C3C] dark:text-white">{bot.nom}</p>
                      <p className="text-xs text-[#2F6F6F]">{bot.domaine}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${bot.statut === "actif" ? "bg-[#D9F3F3] text-[#008080]" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                      {bot.statut}
                    </span>
                    <div className="flex gap-1">
                      <Link href={`/employe/chatbots/${bot.id}/base-de-connaissance`} className="p-1.5 rounded-lg hover:bg-[#D9F3F3] text-[#008080] transition" title="Base de connaissances">
                        <Database size={14} />
                      </Link>
                      <Link href={`/employe/chatbots/${bot.id}/test`} className="p-1.5 rounded-lg hover:bg-[#D9F3F3] text-[#008080] transition" title="Tester">
                        <Play size={14} />
                      </Link>
                      <Link href={`/employe/chatbots/${bot.id}/deployment`} className="p-1.5 rounded-lg hover:bg-[#D9F3F3] text-[#008080] transition" title="Déployer">
                        <Rocket size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )} 
        </div>

        {/* Actions rapides */}
        <div className="bg-white dark:bg-gray-900 border border-[#B8E0E0] rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-[#0B3C3C] dark:text-white flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-[#008080]" />Actions rapides
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { href: "/employe/chatbots/create", icon: Plus, label: "Créer un chatbot", desc: "Nouveau projet" },
              { href: "/employe/chatbots", icon: Bot, label: "Mes chatbots", desc: "Gérer les existants" },
              { href: "/employe/stats", icon: BarChart3, label: "Statistiques", desc: "Performances" },
            ].map(a => (
              <Link key={a.href} href={a.href} className="flex items-center gap-3 p-4 border border-[#B8E0E0] rounded-xl hover:bg-[#D9F3F3] dark:hover:bg-gray-800 transition group">
                <div className="w-9 h-9 rounded-xl bg-[#D9F3F3] dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-gray-700 flex items-center justify-center transition">
                  <a.icon className="w-4 h-4 text-[#008080]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0B3C3C] dark:text-white">{a.label}</p>
                  <p className="text-xs text-[#2F6F6F]">{a.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}