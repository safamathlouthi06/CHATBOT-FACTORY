"use client";

import {
  Bot,
  MessageSquare,
  TrendingUp,
  Users,
  Plus,
  ArrowRight,
  Sparkles,
  Zap,
  BarChart3,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Database,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [chatbots, setChatbots] = useState([]);
  const [stats, setStats] = useState({
    chatbots: 0,
    conversations: 0,
    messages: 0,
    users: 0,
  });

  // ✅ Charger données depuis backend
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8000/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);

        setChatbots(data.chatbots || []);
        setStats(data.stats || {});
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-8">
      {/* TITLE */}
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-gray-500 mt-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Bienvenue sur votre plateforme
        </p>
      </div>

      {/* ✅ STATS DYNAMIQUES */}
      <div className="grid md:grid-cols-4 gap-5">
        <StatCard title="Chatbots" value={stats.chatbots} icon={<Bot />} />
        <StatCard title="Conversations" value={stats.conversations} icon={<MessageSquare />} />
        <StatCard title="Messages" value={stats.messages} icon={<TrendingUp />} />
        <StatCard title="Utilisateurs" value={stats.users} icon={<Users />} />
      </div>

      {/* ACTIONS */}
      <div className="bg-white border rounded-2xl p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-500" />
          Actions rapides
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          <ActionCard
            title="Nouveau Chatbot"
            desc="Créer un assistant"
            icon={<Plus />}
            href="/dashboard/chatbots/create"
          />
          <ActionCard
            title="Chatbots"
            desc="Voir vos assistants"
            icon={<Bot />}
            href="/dashboard/chatbots"
          />
          <ActionCard
            title="Statistiques"
            desc="Voir les performances"
            icon={<BarChart3 />}
            href="/dashboard/stats"
          />
        </div>
      </div>

      {/* ✅ CHATBOTS DYNAMIQUES */}
      <div className="bg-white border rounded-2xl p-6">
        <div className="flex justify-between mb-6">
          <h2 className="font-semibold">Chatbots récents</h2>
        </div>

        {chatbots.length === 0 ? (
          <p className="text-gray-400">Aucun chatbot</p>
        ) : (
          <div className="space-y-3">
            {chatbots.map((bot: any) => (
              <ChatbotRow key={bot.id} bot={bot} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
      <div className="mt-2 text-gray-400">{icon}</div>
    </div>
  );
}

function ActionCard({ title, desc, icon, href }: any) {
  return (
    <Link href={href}>
      <div className="bg-gray-50 border rounded-xl p-5 hover:shadow cursor-pointer">
        {icon}
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
    </Link>
  );
}

function ChatbotRow({ bot }: any) {
  return (
    <div className="flex justify-between border rounded-xl p-4">
      <div className="flex gap-4">
        <Bot className="w-6 h-6" />
        <div>
          <p className="font-semibold">{bot.nom}</p>
          <p className="text-sm text-gray-500">{bot.description}</p>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <Link
          href={`/dashboard/chatbots/${bot.id}/base-de-connaissance`}
          className="text-blue-600 text-sm"
        >
          <Database className="w-4 h-4" />
        </Link>

        <StatusBadge status={bot.status} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: any) {
  return status === "active" ? (
    <span className="text-green-600 text-xs flex gap-1">
      <CheckCircle2 className="w-4 h-4" /> Actif
    </span>
  ) : (
    <span className="text-yellow-600 text-xs flex gap-1">
      <Clock className="w-4 h-4" /> Brouillon
    </span>
  );
}