"use client";

import {
  Bot,
  MessageSquare,
  Users,
  Plus,
  ArrowRight,
  Zap,
  BarChart3,
  Database,
  Settings,
  Activity,
  ChevronRight,
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8000/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setChatbots(data.chatbots || []);
        setStats(data.stats || {});
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3C3C] dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-[#2F6F6F] dark:text-gray-400 mt-1">
            Gérez vos assistants IA
          </p>
        </div>
        <Link href="/dashboard/chatbots/create">
          <button className="inline-flex items-center gap-2 bg-[#008080] hover:bg-[#005F5F] text-white px-4 py-2 rounded-lg transition">
            <Plus className="w-4 h-4" />
            Nouveau Chatbot
          </button>
        </Link>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Chatbots" value={stats.chatbots} icon={Bot} />
        <StatCard title="Conversations" value={stats.conversations} icon={MessageSquare} />
        <StatCard title="Messages" value={stats.messages} icon={Activity} />
        <StatCard title="Utilisateurs" value={stats.users} icon={Users} />
      </div>

      {/* QUICK ACTIONS */}
      <div className="border border-[#B8E0E0] dark:border-gray-700 rounded-lg p-5 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-[#008080]" />
          <h2 className="font-semibold text-[#0B3C3C] dark:text-white">Actions rapides</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <ActionCard
            title="Créer un chatbot"
            icon={Plus}
            href="/dashboard/chatbots/create"
          />
          <ActionCard
            title="Gérer les chatbots"
            icon={Settings}
            href="/dashboard/chatbots"
          />
          <ActionCard
            title="Voir les analytics"
            icon={BarChart3}
            href="/dashboard/stats"
          />
        </div>
      </div>

      {/* CHATBOTS LIST */}
      <div className="border border-[#B8E0E0] dark:border-gray-700 rounded-lg p-5 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#008080]" />
            <h2 className="font-semibold text-[#0B3C3C] dark:text-white">
              Vos chatbots
            </h2>
            <span className="px-2 py-0.5 text-xs bg-[#D9F3F3] dark:bg-gray-800 text-[#008080] rounded-full">
              {chatbots.length}
            </span>
          </div>
          <Link href="/dashboard/chatbots" className="text-sm text-[#008080] hover:underline">
            Voir tous
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className=" flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#D9F3F3] dark:bg-gray-800" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-[#D9F3F3] dark:bg-gray-800 rounded" />
                  <div className="h-3 w-48 bg-[#E8FFFF] dark:bg-gray-800 rounded mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : chatbots.length === 0 ? (
          <div className="text-center py-10">
            <Bot className="w-12 h-12 mx-auto text-[#00A8A8] mb-3" />
            <p className="text-[#2F6F6F] dark:text-gray-400 text-sm mb-3">
              Aucun chatbot
            </p>
            <Link href="/dashboard/chatbots/create" className="text-sm text-[#008080] hover:underline">
              Créer votre premier chatbot
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {chatbots.map((bot: any) => (
              <ChatbotRow key={bot.id} bot={bot} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card
function StatCard({ title, value, icon: Icon }: any) {
  return (
    <div className="border border-[#B8E0E0] dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
      <Icon className="w-5 h-5 text-[#008080] mb-3" />
      <div className="text-2xl font-bold text-[#0B3C3C] dark:text-white">{value}</div>
      <div className="text-xs text-[#2F6F6F] dark:text-gray-400 mt-1">{title}</div>
    </div>
  );
}

// Action Card
function ActionCard({ title, icon: Icon, href }: any) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-2 p-3 border border-[#B8E0E0] dark:border-gray-700 rounded-lg hover:bg-[#D9F3F3] dark:hover:bg-gray-800 transition">
        <Icon className="w-4 h-4 text-[#008080]" />
        <span className="text-sm text-[#0B3C3C] dark:text-white">{title}</span>
      </div>
    </Link>
  );
}

// Chatbot Row
function ChatbotRow({ bot }: any) {
  return (
    <div className="flex items-center justify-between p-3 border border-[#B8E0E0] dark:border-gray-700 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#D9F3F3] dark:bg-gray-800 flex items-center justify-center">
          <Bot className="w-5 h-5 text-[#008080]" />
        </div>
        <div>
          <p className="font-medium text-[#0B3C3C] dark:text-white">{bot.nom}</p>
          <p className="text-xs text-[#2F6F6F] dark:text-gray-400">
            {bot.description || "Aucune description"}
          </p>
        </div>
      </div>
      <Link href={`/dashboard/chatbots/${bot.id}`}>
        <button className="text-sm text-[#008080] hover:underline">
          Gérer
        </button>
      </Link>
    </div>
  );
}