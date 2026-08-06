"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Rocket,
  Search,
  CheckCircle,
  AlertCircle,
  Code2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { API_URL } from "@/services/api";

interface Chatbot {
  id: string;
  nom: string;
  domaine: string | null;
  statut: string;
  entreprise?: { nomentreprise: string } | null;
}

const WIDGET_SCRIPT_ID = "admin-widget-preview-script";

export default function WidgetPreviewPage() {
  const router = useRouter();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [widgetKey, setWidgetKey] = useState(0);
  const [widgetLoaded, setWidgetLoaded] = useState<"idle" | "loading" | "ok" | "error">("idle");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "super_admin") {
      router.push("/login");
      return;
    }

    fetchChatbots(token);
  }, []);

  const fetchChatbots = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/chatbot/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setChatbots(Array.isArray(data) ? data : []);
    } catch {
      setChatbots([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = chatbots.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.nom?.toLowerCase().includes(q) ||
      c.entreprise?.nomentreprise?.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  });

  const selected = chatbots.find((c) => c.id === selectedId) || null;

  // Injecte le vrai widget.js servi par le backend, exactement comme le ferait
  // le site d'un client qui a colle le snippet d'integration.
  useEffect(() => {
    // Nettoyage de l'instance precedente
    const oldScript = document.getElementById(WIDGET_SCRIPT_ID);
    if (oldScript) oldScript.remove();
    document.querySelectorAll("[data-widget-preview]").forEach((el) => el.remove());

    if (!selectedId) {
      setWidgetLoaded("idle");
      return;
    }

    setWidgetLoaded("loading");

    const script = document.createElement("script");
    script.id = WIDGET_SCRIPT_ID;
    script.src = `${API_URL}/widget/${selectedId}.js`;
    script.setAttribute("data-widget-preview", "true");
    script.onload = () => setWidgetLoaded("ok");
    script.onerror = () => setWidgetLoaded("error");
    document.body.appendChild(script);

    return () => {
      script.remove();
      document.querySelectorAll("[data-widget-preview]").forEach((el) => el.remove());
    };
  }, [selectedId, widgetKey]);

  const embedSnippet = selectedId
    ? `<script src="${API_URL}/widget/${selectedId}.js"></script>`
    : "";

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#007A80] to-[#00C7D1] flex items-center justify-center shadow-lg">
          <Rocket className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#134E52] dark:text-white">
            Test de déploiement
          </h1>
          <p className="text-sm text-[#6CAFB4] dark:text-zinc-400">
            Vérifiez qu'un chatbot déployé fonctionne réellement, en conditions réelles.
          </p>
        </div>
      </div>

      {/* SEARCH + PICKER */}
      <div className="bg-white dark:bg-[#0F172A] border border-[#D9E3E5] dark:border-[#1E293B] rounded-2xl p-5 mb-6">
        <label className="block text-sm font-semibold text-[#134E52] dark:text-zinc-200 mb-2">
          Choisir un chatbot à tester
        </label>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6CAFB4]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom de chatbot, entreprise, ou ID..."
            className="w-full pl-10 pr-4 py-2.5 border border-[#D9E3E5] dark:border-[#1E293B] rounded-xl bg-white dark:bg-[#111827] text-[#134E52] dark:text-white text-sm outline-none focus:border-[#007A80] transition-colors"
          />
        </div>

        {loading ? (
          <p className="text-sm text-[#6CAFB4] dark:text-zinc-400">Chargement des chatbots...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-[#6CAFB4] dark:text-zinc-400">Aucun chatbot trouvé.</p>
        ) : (
          <div className="max-h-64 overflow-y-auto border border-[#D9E3E5] dark:border-[#1E293B] rounded-xl divide-y divide-[#D9E3E5] dark:divide-[#1E293B]">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedId(c.id);
                  setWidgetKey((k) => k + 1);
                }}
                className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                  selectedId === c.id
                    ? "bg-[#E8FAFB] dark:bg-[#111827]"
                    : "hover:bg-[#F5F7F8] dark:hover:bg-[#111827]/50"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-[#134E52] dark:text-white">
                    {c.nom}{" "}
                    <span className="font-normal text-[#6CAFB4] dark:text-zinc-400">
                      · {c.entreprise?.nomentreprise || "—"}
                    </span>
                  </p>
                  <p className="text-xs text-[#6CAFB4] dark:text-zinc-500">{c.id}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    c.statut === "actif"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}
                >
                  {c.statut}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* STATUS + SNIPPET */}
      {selected && (
        <div className="bg-white dark:bg-[#0F172A] border border-[#D9E3E5] dark:border-[#1E293B] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#134E52] dark:text-zinc-200">
              Statut du widget — {selected.nom}
            </h2>
            <button
              onClick={() => setWidgetKey((k) => k + 1)}
              className="flex items-center gap-1.5 text-xs text-[#007A80] hover:text-[#005C61] transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Recharger
            </button>
          </div>

          {widgetLoaded === "loading" && (
            <div className="flex items-center gap-2 text-sm text-[#6CAFB4] dark:text-zinc-400">
              <div className="w-4 h-4 border-2 border-[#007A80] border-t-transparent rounded-full animate-spin" />
              Chargement du script widget...
            </div>
          )}

          {widgetLoaded === "ok" && (
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              Le widget est chargé et actif — la bulle de chat en bas à droite de cette page
              est le vrai widget déployé. Cliquez dessus et posez une question pour tester
              la réponse réelle (RAG + Azure OpenAI).
            </div>
          )}

          {widgetLoaded === "error" && (
            <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              Échec du chargement du script widget. Vérifiez que le backend est démarré et
              accessible à {API_URL}.
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-[#134E52] dark:text-zinc-300 mb-2 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" />
              Snippet réellement utilisé pour ce test
            </p>
            <pre className="bg-gray-900 text-gray-300 p-3 rounded-lg text-xs overflow-x-auto">
              <code>{embedSnippet}</code>
            </pre>
          </div>

          <a
            href={`${API_URL}/widget/${selected.id}.js`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#007A80] hover:text-[#005C61] transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Voir le script brut
          </a>
        </div>
      )}
    </div>
  );
}
