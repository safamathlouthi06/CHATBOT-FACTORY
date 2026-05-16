"use client";

import {
  BarChart3,
  MessageSquare,
  Bot,
  TrendingUp,
  Users,
} from "lucide-react";

export default function StatsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Statistiques</h1>
        <p className="text-gray-500 mt-2">
          Vue globale des performances de vos chatbot
        </p>
      </div>

      {/* GLOBAL STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard
          title="chatbot"
          value="3"
          icon={<Bot className="w-6 h-6 text-blue-500" />}
        />
        <StatCard
          title="Conversations"
          value="1,247"
          icon={<MessageSquare className="w-6 h-6 text-green-500" />}
        />
        <StatCard
          title="Messages"
          value="8,240"
          icon={<TrendingUp className="w-6 h-6 text-purple-500" />}
        />
        <StatCard
          title="Utilisateurs"
          value="342"
          icon={<Users className="w-6 h-6 text-orange-500" />}
        />
      </div>

      {/* DETAILS */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* CHATBOT USAGE */}
        <div className="p-6 border rounded-2xl bg-white dark:bg-gray-900">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Utilisation des chatbot
          </h2>

          <div className="space-y-4">
            <ProgressRow name="Conseiller Commercial" value={80} />
            <ProgressRow name="Assistant Client Pro" value={65} />
            <ProgressRow name="Recruteur RH" value={45} />
          </div>
        </div>

        {/* MESSAGES DISTRIBUTION */}
        <div className="p-6 border rounded-2xl bg-white dark:bg-gray-900">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-500" />
            Répartition des messages
          </h2>

          <div className="space-y-4">
            <ProgressRow name="Support Client" value={70} />
            <ProgressRow name="Commercial" value={50} />
            <ProgressRow name="RH" value={30} />
          </div>
        </div>

      </div>
    </div>
  );
}

/* ========================= */
/* STAT CARD */
/* ========================= */

function StatCard({ title, value, icon }: any) {
  return (
    <div className="p-5 rounded-xl border bg-white dark:bg-gray-900 hover:shadow-md transition">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}

/* ========================= */
/* PROGRESS ROW */
/* ========================= */

function ProgressRow({ name, value }: any) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{name}</span>
        <span>{value}%</span>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}