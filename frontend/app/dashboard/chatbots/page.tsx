"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  MoreVertical,
  Pencil,
  Play,
  Database,
} from "lucide-react";

// ✅ TYPE
type Chatbot = {
  id: string;
  nom: string;
  domaine: string;
  statut: string;
  entreprise_id: string;
};

export default function ChatbotListPage() {
  const [search, setSearch] = useState("");
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH API
  useEffect(() => {
    const fetchChatbots = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        const res = await fetch("http://127.0.0.1:8000/chatbot/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setChatbots(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erreur API:", error);
        setChatbots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChatbots();
  }, []);

  // ✅ SEARCH
  const filtered = chatbots.filter((c) =>
    (c.nom || "").toLowerCase().includes(search.toLowerCase())
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
          className="w-full pl-10 pr-4 py-2 rounded-lg border bg-zinc-100"
          placeholder="Rechercher un chatbot..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* LOADING */}
      {loading && <p className="text-zinc-500">Chargement...</p>}

      {/* EMPTY */}
      {!loading && chatbots.length === 0 && (
        <p className="text-zinc-500">Aucun chatbot trouvé</p>
      )}

      {/* LIST */}
      <div className="grid md:grid-cols-3 gap-4">

        {filtered.map((bot) => (
          <div
            key={bot.id}
            className="border rounded-xl p-4 bg-white hover:shadow-md transition"
          >
            {/* HEADER */}
            <div className="flex justify-between">
              <div>
                <h2 className="font-semibold">{bot.nom}</h2>
                <p className="text-sm text-zinc-500">{bot.domaine}</p>
              </div>

              <MoreVertical className="w-5 h-5 text-zinc-500" />
            </div>

            {/* STATUS */}
            <div className="mt-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  bot.statut === "actif"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {bot.statut}
              </span>
            </div>

            {/* ✅ ACTIONS */}
            <div className="flex gap-2 mt-4">

              {/* ✅ Base de connaissance */}
              <Link
                href={`/dashboard/chatbots/${bot.id}/base-de-connaissance`}
                className="flex-1 flex items-center justify-center gap-2 border rounded-lg py-2 text-blue-600 hover:bg-blue-50 text-sm"
              >
                <Database className="w-4 h-4" />
                Base
              </Link>

              {/* ✅ Tester */}
              <Link
            
                href={`/dashboard/chatbots/${bot.id}/test`}
                className="flex-1 flex items-center justify-center gap-2 border rounded-lg py-2 hover:bg-zinc-100 text-sm"
              >
                <Play className="w-4 h-4" />
                Tester
              </Link>

              {/* ✅ Editer */}
              <Link
                href={`/dashboard/chatbots/${bot.id}/edit`}
                
                className="flex-1 flex items-center justify-center gap-2 bg-black text-white rounded-lg py-2 text-sm"
              >
                <Pencil className="w-4 h-4" />
                Éditer
              </Link>

            </div>
          </div>
        ))}

      </div>
    </div>
  );
}