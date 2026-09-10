
"use client";

import { useState, useEffect } from "react";
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
  Bell,
  Send,
  Loader2,
  X,
} from "lucide-react";
import { API_URL } from "@/services/api";

export default function DeploymentPage() {
  const router = useRouter();
  const params = useParams();
  const chatbotId = params.chatbotId as string;

  const [chatbot, setChatbot] = useState<{
    id: string;
    nom: string;
    statut: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"widget" | "api">("widget");
  const [isActive, setIsActive] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activateError, setActivateError] = useState("");
  const [deploySuccessMessage, setDeploySuccessMessage] = useState("");

  // =========================================================
  // MODAL POUR NOTIFIER MANUELLEMENT L'ENTREPRISE
  // =========================================================
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [customNotifyNote, setCustomNotifyNote] = useState("");
  const [sendingNotify, setSendingNotify] = useState(false);

  const [notifyFeedback, setNotifyFeedback] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // =========================================================
  // POPUP CENTRAL DE SUCCÈS
  // =========================================================
  const [successPopupOpen, setSuccessPopupOpen] = useState(false);

  // =========================================================
  // CHARGER LE CHATBOT
  // =========================================================
  useEffect(() => {
    if (!chatbotId) return;

    const fetchChatbot = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/chatbot/${chatbotId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();

          setChatbot(data);
          setIsActive(data.statut === "actif");
        }
      } catch (err) {
        console.error(
          "Erreur chargement statut chatbot:",
          err
        );
      }
    };

    fetchChatbot();
  }, [chatbotId]);

  // =========================================================
  // CODE DU WIDGET
  // =========================================================
  const widgetSnippet = `<!-- Chatbot Factory - Widget -->
<script src="${API_URL}/widget/${chatbotId}.js"></script>`;

  // =========================================================
  // CODE API
  // =========================================================
  const apiSnippet = `// Chatbot Factory - API REST
// Exemple d'appel API avec JavaScript

const response = await fetch('${API_URL}/chat/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    chatbot_id: '${chatbotId}',
    question: 'Bonjour !'
  })
});

const data = await response.json();
console.log(data.answer);`;

  const currentCode =
    activeTab === "widget" ? widgetSnippet : apiSnippet;

  // =========================================================
  // COPIER LE CODE
  // =========================================================
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // =========================================================
  // ACTIVER ET DÉPLOYER LE CHATBOT
  // =========================================================
  const handleActivate = async () => {
    setActivating(true);
    setActivateError("");
    setDeploySuccessMessage("");

    try {
      const token = localStorage.getItem("token");

      // -------------------------------------------------------
      // 1. ACTIVER LE CHATBOT
      // -------------------------------------------------------
      const res = await fetch(`${API_URL}/chatbot/${chatbotId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          statut: "actif",
        }),
      });

      if (!res.ok) {
        throw new Error("Échec de l'activation");
      }

      setIsActive(true);

      // -------------------------------------------------------
      // 2. NOTIFIER AUTOMATIQUEMENT L'ENTREPRISE
      // -------------------------------------------------------
      try {
        await fetch(`${API_URL}/notifications/deploiement`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            chatbot_id: chatbotId,
            message: `Le chatbot « ${
              chatbot?.nom || "Chatbot"
            } » a été déployé avec succès et est désormais actif.`,
          }),
        });

        setDeploySuccessMessage(
          "Chatbot activé et déployé avec succès ! Votre entreprise a été notifiée."
        );
      } catch (notifyErr) {
        console.error(
          "Erreur notification entreprise:",
          notifyErr
        );

        setDeploySuccessMessage(
          "Chatbot activé avec succès !"
        );
      }
    } catch (error) {
      console.error("Erreur activation:", error);

      setActivateError(
        "Impossible d'activer le chatbot. Réessayez."
      );
    } finally {
      setActivating(false);
    }
  };

  // =========================================================
  // ENVOYER UNE NOTIFICATION MANUELLE
  // =========================================================
  const handleSendManualNotification = async () => {
    setSendingNotify(true);
    setNotifyFeedback(null);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/notifications/deploiement`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            chatbot_id: chatbotId,
            message:
              customNotifyNote.trim() || undefined,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.detail ||
            "Échec de l'envoi de la notification"
        );
      }

      // -------------------------------------------------------
      // FERMER LE MODAL
      // -------------------------------------------------------
      setNotifyModalOpen(false);

      // Nettoyer le message personnalisé
      setCustomNotifyNote("");

      // Supprimer l'ancien feedback
      setNotifyFeedback(null);

      // -------------------------------------------------------
      // AFFICHER LE POPUP CENTRAL DE SUCCÈS
      // -------------------------------------------------------
      setSuccessPopupOpen(true);

      // Fermer automatiquement après 3 secondes
      setTimeout(() => {
        setSuccessPopupOpen(false);
      }, 3000);
    } catch (err: any) {
      console.error(
        "Erreur notification entreprise:",
        err
      );

      setNotifyFeedback({
        type: "error",
        text:
          err?.message ||
          "Erreur lors de la notification de l'entreprise.",
      });
    } finally {
      setSendingNotify(false);
    }
  };

  // =========================================================
  // FERMER LE POPUP AVEC ESCAPE
  // =========================================================
  useEffect(() => {
    if (!successPopupOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSuccessPopupOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [successPopupOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D9F3F3] via-white to-[#E8FFFF] dark:from-[#0B1120] dark:via-[#0B1120] dark:to-[#0B1120]">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ===================================================
            HEADER
            =================================================== */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#008080] hover:text-[#005F5F] transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />

            <span className="text-sm">
              Retour
            </span>
          </button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#008080] to-[#00A8A8] flex items-center justify-center shadow-lg">
                <Rocket className="w-6 h-6 text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-[#0B3C3C] dark:text-white">
                  {chatbot?.nom
                    ? `Déploiement • ${chatbot.nom}`
                    : "Déploiement"}
                </h1>

                <p className="text-sm text-[#2F6F6F] dark:text-zinc-400 mt-0.5">
                  Activez et intégrez votre chatbot sur votre
                  site web ou notifiez votre entreprise
                </p>
              </div>
            </div>

            {/* BOUTON NOTIFIER L'ENTREPRISE */}
            {isActive && (
              <button
                onClick={() => {
                  setNotifyFeedback(null);
                  setNotifyModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#008080] to-[#00A8A8] hover:from-[#006A6A] hover:to-[#008C8C] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                title="Notifier votre entreprise que ce chatbot est déployé"
              >
                <Bell className="w-4 h-4" />

                <span>
                  Notifier l'entreprise
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ===================================================
            BANNIÈRE SUCCÈS DÉPLOIEMENT
            =================================================== */}
        {deploySuccessMessage && (
          <div className="mb-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />

            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                {deploySuccessMessage}
              </p>
            </div>
          </div>
        )}

        {/* ===================================================
            STATUT CHATBOT
            =================================================== */}
        {!isActive ? (
          <div className="mb-6 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>

              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                  Chatbot non actif (brouillon)
                </h3>

                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Activez votre chatbot pour le déployer et
                  notifier automatiquement votre entreprise.
                </p>

                {activateError && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {activateError}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleActivate}
              disabled={activating}
              className="px-5 py-2.5 bg-[#008080] text-white font-bold text-sm rounded-xl hover:bg-[#005F5F] transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shrink-0 shadow-md"
            >
              {activating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />

                  <span>
                    Déploiement en cours...
                  </span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />

                  <span>
                    Déployer & Notifier l'entreprise
                  </span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="mb-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div>
                <h3 className="font-semibold text-emerald-800 dark:text-emerald-300">
                  Chatbot déployé et actif
                </h3>

                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  Votre chatbot est en ligne et opérationnel.
                  Votre entreprise est informée de sa
                  disponibilité.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setNotifyFeedback(null);
                setNotifyModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-semibold bg-white dark:bg-zinc-800 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-zinc-700 rounded-xl transition flex items-center gap-1.5 shrink-0"
            >
              <Bell className="w-3.5 h-3.5" />

              <span>
                Renvoyer une notification
              </span>
            </button>
          </div>
        )}

        {/* ===================================================
            MAIN CARD
            =================================================== */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-[#B8E0E0] dark:border-zinc-700 p-6 shadow-sm">

          {/* TITLE */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#0B3C3C] dark:text-white">
              Options d'intégration
            </h2>

            <p className="text-sm text-[#2F6F6F] dark:text-zinc-400 mt-1">
              Choisissez la méthode d'intégration qui convient
              le mieux à votre application
            </p>
          </div>

          {/* TABS */}
          <div className="flex gap-2 border-b border-[#B8E0E0] dark:border-zinc-700 mb-6">
            <button
              onClick={() => setActiveTab("widget")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-xl transition ${
                activeTab === "widget"
                  ? "text-[#008080] border-b-2 border-[#008080] font-bold"
                  : "text-[#2F6F6F] dark:text-zinc-400 hover:text-[#008080]"
              }`}
            >
              <Globe className="w-4 h-4" />
              Widget Web (script)
            </button>

            <button
              onClick={() => setActiveTab("api")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-xl transition ${
                activeTab === "api"
                  ? "text-[#008080] border-b-2 border-[#008080] font-bold"
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
                {activeTab === "widget" &&
                  "Widget de chat flottant"}

                {activeTab === "api" && "API REST"}
              </h3>

              <p className="text-sm text-[#2F6F6F] dark:text-zinc-400 mt-1">
                {activeTab === "widget" &&
                  "Une bulle de chat flottante s'affiche en bas à droite de votre site. Un seul script à copier."}

                {activeTab === "api" &&
                  "Utilisez l'API REST pour dialoguer directement avec votre assistant."}
              </p>
            </div>

            {/* CODE BLOCK */}
            <div className="relative">
              <div className="bg-gray-900 rounded-xl overflow-hidden shadow-md">
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />

                    <span className="text-xs text-gray-400 ml-2">
                      {activeTab === "widget" &&
                        "widget.js"}

                      {activeTab === "api" &&
                        "api-exemple.js"}
                    </span>
                  </div>

                  <button
                    onClick={copyCode}
                    className="flex items-center gap-2 px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition"
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

                <pre className="overflow-x-auto p-4 text-sm text-gray-200 font-mono">
                  <code>{currentCode}</code>
                </pre>
              </div>
            </div>

            {/* INSTALLATION GUIDE */}
            <div className="mt-6 bg-[#D9F3F3] dark:bg-zinc-800 rounded-xl p-4">
              <h4 className="font-semibold text-[#0B3C3C] dark:text-white mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#008080]" />
                Instructions de mise en place
              </h4>

              <ol className="space-y-2 text-sm text-[#2F6F6F] dark:text-zinc-400 list-decimal pl-5">
                <li>
                  Déployez votre chatbot ci-dessus (votre
                  entreprise sera automatiquement informée)
                </li>

                <li>
                  Copiez l'extrait de code ci-dessus
                </li>

                <li>
                  Collez-le juste avant la balise{" "}
                  <code className="bg-white dark:bg-zinc-900 dark:text-zinc-200 px-1 py-0.5 rounded text-xs">
                    &lt;/body&gt;
                  </code>{" "}
                  de votre site web
                </li>

                <li>
                  Sauvegardez : votre assistant est
                  immédiatement opérationnel pour vos
                  visiteurs !
                </li>
              </ol>
            </div>

            {/* LIEN WIDGET */}
            <div className="mt-6 flex gap-4">
              <a
                href={`${API_URL}/widget/${chatbotId}.js`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[#008080] hover:text-[#005F5F] transition font-medium"
              >
                <ExternalLink className="w-4 h-4" />

                Tester le script du widget dans le navigateur
              </a>
            </div>
          </div>
        </div>

        {/* ===================================================
            MODAL NOTIFIER L'ENTREPRISE
            =================================================== */}
        {notifyModalOpen && (
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => {
              if (!sendingNotify) {
                setNotifyModalOpen(false);
              }
            }}
          >
            <div
              className="w-full max-w-lg bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative w-11 h-11 rounded-2xl bg-[#008080]/10 dark:bg-[#00B7C2]/15 flex items-center justify-center shrink-0 ring-1 ring-[#008080]/10 dark:ring-[#00B7C2]/20">
            <Rocket className="w-5 h-5 text-[#008080] dark:text-[#00C7D1]" />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              Notifier l'entreprise
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Signaler que le chatbot est déployé et opérationnel
            </p>
          </div>
        </div>

        <button
          onClick={() => setNotifyModalOpen(false)}
          disabled={sendingNotify}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 shrink-0"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

              {/* BODY */}
              <div className="p-6 space-y-4">

                {/* ERREUR UNIQUEMENT */}
                {notifyFeedback?.type === "error" && (
                  <div className="p-3 rounded-xl text-xs font-medium bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200 border border-red-300">
                    {notifyFeedback.text}
                  </div>
                )}

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  L'entreprise recevra une notification dans
                  son tableau de bord l'informant que le chatbot{" "}
                  <strong>
                    « {chatbot?.nom || "Chatbot"} »
                  </strong>{" "}
                  a été déployé avec succès.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Message facultatif pour l'entreprise :
                  </label>

                  <textarea
                    value={customNotifyNote}
                    onChange={(e) =>
                      setCustomNotifyNote(e.target.value)
                    }
                    rows={3}
                    placeholder={`Ex : Le chatbot « ${
                      chatbot?.nom || "Chatbot"
                    } » est déployé sur le site principal et prêt pour les tests finaux.`}
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>
              </div>

              {/* FOOTER */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0B1120]/70 flex items-center justify-end gap-2.5">
                <button
                  onClick={() =>
                    setNotifyModalOpen(false)
                  }
                  disabled={sendingNotify}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                >
                  Annuler
                </button>

                <button
                  onClick={handleSendManualNotification}
                  disabled={sendingNotify}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#008080] hover:bg-[#005F5F] rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {sendingNotify ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />

                      <span>
                        Envoi en cours...
                      </span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />

                      <span>
                        Envoyer la notification
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            POPUP CENTRAL DE SUCCÈS
            =================================================== */}
  {/* ===================================================
    POPUP CENTRAL DE SUCCÈS
    =================================================== */}
{successPopupOpen && (
  <div
    className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    onClick={() => setSuccessPopupOpen(false)}
  >
    <div
      className="relative w-full max-w-sm bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-7 text-center animate-in zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* BOUTON FERMER */}
      <button
        onClick={() => setSuccessPopupOpen(false)}
        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Fermer"
      >
        <X className="w-4 h-4" />
      </button>

      {/* ICÔNE — teal du thème */}
      <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-[#008080]/10 dark:bg-[#00B7C2]/15 flex items-center justify-center">
        <CheckCircle className="w-9 h-9 text-[#008080] dark:text-[#00C7D1]" />
      </div>

      {/* TITRE — teal du thème */}
      <h3 className="text-lg font-bold text-[#008080] dark:text-[#00C7D1] mb-2">
        Déploiement réussi
      </h3>

      {/* MESSAGE */}
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
        Votre chatbot a été activé et votre entreprise a été notifiée avec succès.
      </p>

      {/* BOUTON OK — teal du thème */}
      <button
        onClick={() => setSuccessPopupOpen(false)}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#008080] hover:bg-[#005F5F] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
      >
        <Check className="w-4 h-4" />
        <span>OK</span>
      </button>
    </div>
  </div>
)}
      </div>
    </div>
  );
}