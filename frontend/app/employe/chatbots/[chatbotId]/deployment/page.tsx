"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Rocket,
  Copy,
  Check,
  Globe,
  Code2,
  Zap,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Settings,
} from "lucide-react";
import { API_URL } from "@/services/api";

export default function DeploymentPage() {
  const router = useRouter();
  const params = useParams();
  const chatbotId = params.chatbotId;

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"widget" | "api">("widget");
  const [isActive, setIsActive] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activateError, setActivateError] = useState("");

  const widgetSnippet = `<!-- Chatbot Factory - Widget -->\n<script src="${API_URL}/widget/${chatbotId}.js"></script>`;

  const apiSnippet = `// Chatbot Factory - API REST\n// Exemple d'appel API avec JavaScript\n\nconst response = await fetch('${API_URL}/chat/', {\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({\n    chatbot_id: '${chatbotId}',\n    question: 'Bonjour !'\n  })\n});\n\nconst data = await response.json();\nconsole.log(data.answer);`;

  const currentCode = activeTab === "widget" ? widgetSnippet : apiSnippet;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleActivate = async () => {
    setActivating(true);
    setActivateError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/chatbot/${chatbotId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ statut: "actif" }),
      });

      if (!res.ok) {
        throw new Error("Échec de l'activation");
      }

      setIsActive(true);
    } catch (error) {
      console.error("Erreur activation:", error);
      setActivateError("Impossible d'activer le chatbot. Réessayez.");
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D9F3F3] via-white to-[#E8FFFF] dark:from-[#0B1120] dark:via-[#0B1120] dark:to-[#0B1120]">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#008080] hover:text-[#005F5F] transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Retour</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#008080] to-[#00A8A8] flex items-center justify-center shadow-lg">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0B3C3C] dark:text-white">Déploiement</h1>
              <p className="text-sm text-[#2F6F6F] dark:text-zinc-400 mt-0.5">
                Intégrez votre chatbot sur votre site web
              </p>
            </div>
          </div>
        </div>

        {/* ALERT - Statut du chatbot */}
        {!isActive ? (
          <div className="mb-6 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-300">Chatbot non actif</h3>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Votre chatbot est en mode brouillon. Activez-le pour le rendre accessible.
                </p>
                {activateError && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{activateError}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleActivate}
              disabled={activating}
              className="px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#005F5F] transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
            >
              <Zap className="w-4 h-4" />
              {activating ? "Activation..." : "Activer le chatbot"}
            </button>
          </div>
        ) : (
          <div className="mb-6 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-300">Chatbot actif</h3>
              <p className="text-sm text-green-700 dark:text-green-400">
                Votre chatbot est en ligne et accessible aux utilisateurs.
              </p>
            </div>
          </div>
        )}

        {/* MAIN CARD */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-[#B8E0E0] dark:border-zinc-700 p-6 shadow-sm">

          {/* Title */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#0B3C3C] dark:text-white">
              Options de déploiement
            </h2>
            <p className="text-sm text-[#2F6F6F] dark:text-zinc-400 mt-1">
              Choisissez la méthode d'intégration qui convient le mieux à votre site
            </p>
          </div>

          {/* TABS */}
          <div className="flex gap-2 border-b border-[#B8E0E0] dark:border-zinc-700 mb-6">
            <button
              onClick={() => setActiveTab("widget")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                activeTab === "widget"
                  ? "text-[#008080] border-b-2 border-[#008080]"
                  : "text-[#2F6F6F] dark:text-zinc-400 hover:text-[#008080]"
              }`}
            >
              <Globe className="w-4 h-4" />
              Widget de chat
            </button>
            <button
              onClick={() => setActiveTab("api")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                activeTab === "api"
                  ? "text-[#008080] border-b-2 border-[#008080]"
                  : "text-[#2F6F6F] dark:text-zinc-400 hover:text-[#008080]"
              }`}
            >
              <Code2 className="w-4 h-4" />
              API REST
            </button>
          </div>

          {/* TAB CONTENT */}
          <div>
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-[#0B3C3C] dark:text-white">
                {activeTab === "widget" && "Widget de chat flottant"}
                {activeTab === "api" && "API REST"}
              </h3>
              <p className="text-sm text-[#2F6F6F] dark:text-zinc-400 mt-1">
                {activeTab === "widget" &&
                  "Une bulle de chat flottante s'affiche en bas à droite de votre site. Un seul script à coller."}
                {activeTab === "api" && "Utilisez notre API REST pour une intégration personnalisée."}
              </p>
            </div>

            {/* Preview */}
            {activeTab === "widget" && (
              <div className="mb-6 p-4 bg-[#D9F3F3] dark:bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-[#008080]" />
                  <span className="text-sm font-medium text-[#0B3C3C] dark:text-white">Aperçu</span>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#008080] flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#0B3C3C] dark:text-white">Assistant IA</p>
                        <p className="text-xs text-[#2F6F6F] dark:text-zinc-400">En ligne</p>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#008080] shadow-lg flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CODE BLOCK */}
            <div className="relative">
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs text-gray-400 ml-2">
                      {activeTab === "widget" && "widget.js"}
                      {activeTab === "api" && "api-exemple.js"}
                    </span>
                  </div>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-2 px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-green-400" />
                        Copié
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copier
                      </>
                    )}
                  </button>
                </div>
                <pre className="overflow-x-auto p-4 text-sm text-gray-300 font-mono">
                  <code>{currentCode}</code>
                </pre>
              </div>
            </div>

            {/* INSTALLATION GUIDE */}
            <div className="mt-6 bg-[#D9F3F3] dark:bg-zinc-800 rounded-lg p-4">
              <h4 className="font-semibold text-[#0B3C3C] dark:text-white mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#008080]" />
                Installation
              </h4>
              <ol className="space-y-2 text-sm text-[#2F6F6F] dark:text-zinc-400 list-decimal pl-5">
                <li>Activez votre chatbot ci-dessus</li>
                <li>Copiez le code ci-dessus</li>
                <li>Collez-le juste avant la balise <code className="bg-white dark:bg-zinc-900 dark:text-zinc-200 px-1 rounded">&lt;/body&gt;</code> de votre site</li>
                <li>Sauvegardez et publiez votre site — le chatbot apparaîtra automatiquement</li>
              </ol>
            </div>

            {/* LIEN UTILE */}
            <div className="mt-6 flex gap-4">
              <a
                href={`${API_URL}/widget/${chatbotId}.js`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[#008080] hover:text-[#005F5F] transition"
              >
                <ExternalLink className="w-4 h-4" />
                Voir le script du widget
              </a>
            </div>
          </div>
        </div>

        {/* PREVIEW CARD (pour API) */}
        {activeTab === "api" && (
          <div className="mt-6 bg-white dark:bg-zinc-900 rounded-xl border border-[#B8E0E0] dark:border-zinc-700 p-6 shadow-sm">
            <h3 className="font-semibold text-[#0B3C3C] dark:text-white mb-4">Exemple de requête cURL</h3>
            <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg text-xs overflow-x-auto">
              <code>{`curl -X POST ${API_URL}/chat/ \\
  -H "Content-Type: application/json" \\
  -d '{
    "chatbot_id": "${chatbotId}",
    "question": "Bonjour !"
  }'`}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// Composants manquants
function Bot(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

function MessageSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
