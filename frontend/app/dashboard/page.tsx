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

/* =========================
   MOCK CHATBOTS (à remplacer plus tard par API)
========================= */
const recentChatbots = [
  {
    id: "chatbot-1",
    name: "Conseiller Commercial",
    desc: "Assistant pour la conversion et les ventes",
    status: "draft",
    lastEdited: "Il y a 2 heures",
  },
  {
    id: "chatbot-2",
    name: "Assistant Client Pro",
    desc: "Assistant de support client disponible 24/7",
    status: "active",
    lastEdited: "Il y a 5 heures",
  },
  {
    id: "chatbot-3",
    name: "Recruteur RH",
    desc: "Assistant pour les candidats et employés",
    status: "active",
    lastEdited: "Hier",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* TITLE */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-3xl" />
        <div className="relative">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Tableau de bord
          </h1>
          <p className="text-gray-500 mt-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Bienvenue sur votre plateforme de création de chatbots intelligents
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard title="Chatbots actifs" value="2" total="3" icon={<Bot />} />
        <StatCard title="Conversations" value="1,247" icon={<MessageSquare />} />
        <StatCard title="Messages" value="8.2k" icon={<TrendingUp />} />
        <StatCard title="Utilisateurs" value="342" icon={<Users />} />
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white border rounded-2xl p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-500" />
          Actions rapides
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <ActionCard
            title="Nouveau Chatbot"
            desc="Créer un nouvel assistant"
            icon={<Plus />}
            href="/dashboard/chatbots/create"
          />
          <ActionCard
            title="Gérer les chatbots"
            desc="Voir tous vos assistants"
            icon={<Bot />}
            href="/dashboard/chatbots"
          />
          <ActionCard
            title="Statistiques"
            desc="Analyser les performances"
            icon={<BarChart3 />}
            href="/dashboard/stats"
          />
        </div>
      </div>

      {/* RECENT CHATBOTS */}
      <div className="bg-white border rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Chatbots récents</h2>
          <Link
            href="/dashboard/chatbots"
            className="text-sm flex items-center gap-2"
          >
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentChatbots.map((bot) => (
            <ChatbotRow
              key={bot.id}
              chatbotId={bot.id}
              name={bot.name}
              desc={bot.desc}
              status={bot.status}
              lastEdited={bot.lastEdited}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================
   COMPONENTS
========================= */

function StatCard({ title, value, total, icon }: any) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold">
        {value} {total && <span className="text-sm">/ {total}</span>}
      </p>
      <div className="mt-2 text-gray-400">{icon}</div>
    </div>
  );
}

function ActionCard({ title, desc, icon, href }: any) {
  return (
    <Link href={href}>
      <div className="bg-gray-50 border rounded-xl p-5 hover:shadow cursor-pointer">
        <div className="mb-2">{icon}</div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
    </Link>
  );
}

function ChatbotRow({
  chatbotId,
  name,
  desc,
  status,
  lastEdited,
}: any) {
  return (
    <div className="flex justify-between items-center border rounded-xl p-4 hover:shadow">
      <div className="flex gap-4">
        <Bot className="w-6 h-6 text-gray-500" />
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-gray-500">{desc}</p>
          <p className="text-xs text-gray-400">
            Modifié {lastEdited}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/chatbots/${chatbotId}/base-de-connaissance`}
          className="text-sm flex items-center gap-1 text-blue-600 hover:underline"
        >
          <Database className="w-4 h-4" />
          Base de connaissance
        </Link>

        <StatusBadge status={status} />

        <MoreHorizontal className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
}

function StatusBadge({ status }: any) {
  if (status === "active") {
    return (
      <span className="flex items-center gap-1 text-green-600 text-xs">
        <CheckCircle2 className="w-4 h-4" />
        Actif
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-yellow-600 text-xs">
      <Clock className="w-4 h-4" />
      Brouillon
    </span>
  );
}