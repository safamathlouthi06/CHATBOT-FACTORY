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
  Smartphone,
  Monitor,
} from "lucide-react";

export default function DeploymentPage() {
  const router = useRouter();
  const params = useParams();
  const chatbotId = params.chatbotId;
  
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"floating" | "embedded" | "api">("floating");
  const [isActive, setIsActive] = useState(false);

  const embedCodes = {
    floating: `<!-- ChatbotStudio - Widget Flottant -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://cdn.chatbotstudio.com/widget.js';
    script.setAttribute('data-id', '${chatbotId}');
    script.setAttribute('data-position', 'bottom-right');
    document.body.appendChild(script);
  })();
</script>
<div id="chatbot-widget-${chatbotId}"></div>`,
    
    embedded: `<!-- ChatbotStudio - Widget Intégré -->
<div id="chatbot-container-${chatbotId}" style="width: 100%; height: 600px;"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://cdn.chatbotstudio.com/widget.js';
    script.setAttribute('data-id', '${chatbotId}');
    script.setAttribute('data-mode', 'embedded');
    script.setAttribute('data-container', 'chatbot-container-${chatbotId}');
    document.body.appendChild(script);
  })();
</script>`,
    
    api: `// ChatbotStudio - API REST
// Exemple d'appel API avec JavaScript

const response = await fetch('https://api.chatbotstudio.com/v1/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer VOTRE_TOKEN_API'
  },
  body: JSON.stringify({
    chatbot_id: '${chatbotId}',
    message: 'Bonjour !',
    session_id: 'user_session_123'
  })
});

const data = await response.json();
console.log(data.answer);`
  };

  const currentCode = embedCodes[activeTab];

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
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://127.0.0.1:8000/chatbot/${chatbotId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ statut: "actif" }),
      });
      setIsActive(true);
    } catch (error) {
      console.error("Erreur activation:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D9F3F3] via-white to-[#E8FFFF]">
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
              <h1 className="text-2xl font-bold text-[#0B3C3C]">Déploiement</h1>
              <p className="text-sm text-[#2F6F6F] mt-0.5">
                Intégrez votre chatbot sur votre site web
              </p>
            </div>
          </div>
        </div>

        {/* ALERT - Statut du chatbot */}
        {!isActive ? (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800">Chatbot non actif</h3>
                <p className="text-sm text-amber-700">
                  Votre chatbot est en mode brouillon. Activez-le pour le rendre accessible.
                </p>
              </div>
            </div>
            <button
              onClick={handleActivate}
              className="px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#005F5F] transition flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Activer le chatbot
            </button>
          </div>
        ) : (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">Chatbot actif</h3>
              <p className="text-sm text-green-700">
                Votre chatbot est en ligne et accessible aux utilisateurs.
              </p>
            </div>
          </div>
        )}

        {/* MAIN CARD */}
        <div className="bg-white rounded-xl border border-[#B8E0E0] p-6 shadow-sm">
          
          {/* Title */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#0B3C3C]">
              Options de déploiement
            </h2>
            <p className="text-sm text-[#2F6F6F] mt-1">
              Choisissez la méthode d'intégration qui convient le mieux à votre site
            </p>
          </div>

          {/* TABS */}
          <div className="flex gap-2 border-b border-[#B8E0E0] mb-6">
            <button
              onClick={() => setActiveTab("floating")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                activeTab === "floating"
                  ? "text-[#008080] border-b-2 border-[#008080]"
                  : "text-[#2F6F6F] hover:text-[#008080]"
              }`}
            >
              <Monitor className="w-4 h-4" />
              Widget Flottant
            </button>
            <button
              onClick={() => setActiveTab("embedded")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                activeTab === "embedded"
                  ? "text-[#008080] border-b-2 border-[#008080]"
                  : "text-[#2F6F6F] hover:text-[#008080]"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Widget Intégré
            </button>
            <button
              onClick={() => setActiveTab("api")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                activeTab === "api"
                  ? "text-[#008080] border-b-2 border-[#008080]"
                  : "text-[#2F6F6F] hover:text-[#008080]"
              }`}
            >
              <Code2 className="w-4 h-4" />
              API REST
            </button>
          </div>

          {/* TAB CONTENT */}
          <div>
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-[#0B3C3C]">
                {activeTab === "floating" && "Widget flottant"}
                {activeTab === "embedded" && "Widget intégré"}
                {activeTab === "api" && "API REST"}
              </h3>
              <p className="text-sm text-[#2F6F6F] mt-1">
                {activeTab === "floating" && "Affichez votre chatbot sous forme de bulle flottante dans le coin de votre site."}
                {activeTab === "embedded" && "Intégrez le chatbot directement dans une zone spécifique de votre page."}
                {activeTab === "api" && "Utilisez notre API REST pour une intégration personnalisée."}
              </p>
            </div>

            {/* Preview */}
            {activeTab !== "api" && (
              <div className="mb-6 p-4 bg-[#D9F3F3] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-[#008080]" />
                  <span className="text-sm font-medium text-[#0B3C3C]">Aperçu</span>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#008080] flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#0B3C3C]">Assistant IA</p>
                        <p className="text-xs text-[#2F6F6F]">En ligne</p>
                      </div>
                    </div>
                    {activeTab === "floating" && (
                      <div className="w-12 h-12 rounded-full bg-[#008080] shadow-lg flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                    )}
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
                      {activeTab === "floating" && "widget-flottant.js"}
                      {activeTab === "embedded" && "widget-integre.js"}
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
            <div className="mt-6 bg-[#D9F3F3] rounded-lg p-4">
              <h4 className="font-semibold text-[#0B3C3C] mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#008080]" />
                Installation
              </h4>
              <ol className="space-y-2 text-sm text-[#2F6F6F] list-decimal pl-5">
                <li>Copiez le code ci-dessus</li>
                <li>Collez-le juste avant la balise <code className="bg-white px-1 rounded">&lt;/body&gt;</code> de votre site</li>
                <li>Sauvegardez et publiez votre site</li>
                <li>Votre chatbot apparaîtra automatiquement</li>
              </ol>
            </div>

            {/* LIENS UTILES */}
            <div className="mt-6 flex gap-4">
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-[#008080] hover:text-[#005F5F] transition"
              >
                <ExternalLink className="w-4 h-4" />
                Documentation complète
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-[#008080] hover:text-[#005F5F] transition"
              >
                <Settings className="w-4 h-4" />
                Personnaliser le widget
              </a>
            </div>
          </div>
        </div>

        {/* PREVIEW CARD (pour API) */}
        {activeTab === "api" && (
          <div className="mt-6 bg-white rounded-xl border border-[#B8E0E0] p-6 shadow-sm">
            <h3 className="font-semibold text-[#0B3C3C] mb-4">Exemple de requête cURL</h3>
            <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg text-xs overflow-x-auto">
              <code>{`curl -X POST https://api.chatbotstudio.com/v1/chat \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer VOTRE_TOKEN_API" \\
  -d '{
    "chatbot_id": "${chatbotId}",
    "message": "Bonjour !",
    "session_id": "user_123"
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