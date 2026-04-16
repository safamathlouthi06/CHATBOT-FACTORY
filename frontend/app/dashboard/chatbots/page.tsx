"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  MoreVertical,
  Bot,
  Pencil,
  Play,
} from "lucide-react";

export default function ChatbotListPage() {
  const [search, setSearch] = useState("");

  const chatbots = [
    {
      id: 1,
      name: "Conseiller Commercial",
      desc: "Assistant pour la conversion et les ventes",
      status: "brouillon",
      tags: ["Commercial", "Formel"],
      date: "19 février 2026",
    },
    {
      id: 2,
      name: "Assistant Client Pro",
      desc: "Support client disponible 24/7",
      status: "actif",
      tags: ["Support Client", "Professionnel"],
      date: "18 février 2026",
    },
    {
      id: 3,
      name: "Recruteur RH",
      desc: "Assistant pour les candidats et employés",
      status: "actif",
      tags: ["RH", "Amical"],
      date: "10 février 2026",
    },
  ];

  const filtered = chatbots.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Mes Chatbots</h1>
          <p className="text-zinc-500">
            Gérez tous vos assistants conversationnels
          </p>
        </div>

        <Link
          href="/dashboard/chatbots/create"
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Nouveau Chatbot
        </Link>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
        <input
          className="w-full pl-10 pr-4 py-2 rounded-lg border bg-zinc-100 dark:bg-zinc-800"
          placeholder="Rechercher un chatbot..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* LIST */}
      <div className="grid md:grid-cols-3 gap-4">

        {filtered.map((bot) => (
          <div
            key={bot.id}
            className="border rounded-xl p-4 bg-white dark:bg-zinc-950 hover:shadow-md transition"
          >

            {/* HEADER CARD */}
            <div className="flex justify-between">
              <div>
                <h2 className="font-semibold">{bot.name}</h2>
                <p className="text-sm text-zinc-500">{bot.desc}</p>
              </div>

              <button>
                <MoreVertical className="w-5 h-5 text-zinc-500" />
              </button>
            </div>

            {/* STATUS */}
            <div className="mt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                bot.status === "actif"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}>
                {bot.status}
              </span>
            </div>

            {/* TAGS */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {bot.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs border px-2 py-1 rounded-lg"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* DATE */}
            <p className="text-xs text-zinc-400 mt-2">
              Modifié le {bot.date}
            </p>

            {/* ACTIONS */}
            <div className="flex gap-2 mt-4">

              <button className="flex-1 flex items-center justify-center gap-2 border rounded-lg py-2 hover:bg-zinc-100">
                <Play className="w-4 h-4" />
                Tester
              </button>

              <button className="flex-1 flex items-center justify-center gap-2 bg-black text-white rounded-lg py-2">
                <Pencil className="w-4 h-4" />
                Éditer
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}