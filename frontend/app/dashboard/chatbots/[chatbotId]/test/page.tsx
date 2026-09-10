"use client";
import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Send,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Bot,
  ThumbsDown,
  AlertTriangle,
  Check,
  X,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { API_URL } from "@/services/api";

// ✅ TYPES
type Role = "user" | "bot";
type Message = {
  role: Role;
  text: string;
  ts: string;
};

const timestamp = () =>
  new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const PRESET_MOTIFS = [
  "Résultat insatisfaisant lors du test.",
  "Réponse inexacte ou fausse.",
  "Information manquante ou incomplète.",
  "Chatbot hors sujet / incompréhension.",
  "Formulation ou ton inadapté.",
];

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.chatbotId as string;

  const [chatbot, setChatbot] = useState<{ id: string; nom: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Signalement d'insatisfaction
  const [reportedIndices, setReportedIndices] = useState<Set<number>>(new Set());
  const [reportModal, setReportModal] = useState<{
    isOpen: boolean;
    index: number | null;
    question: string;
    reponse: string;
  }>({
    isOpen: false,
    index: null,
    question: "",
    reponse: "",
  });
  const [motif, setMotif] = useState("Résultat insatisfaisant lors du test.");
  const [sendingReport, setSendingReport] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // ✅ AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ LOAD CHATBOT INFOS
  useEffect(() => {
    if (!chatbotId) return;
    const fetchChatbot = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/chatbot/${chatbotId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setChatbot(data);
        }
      } catch (err) {
        console.error("Erreur chatbot:", err);
      }
    };
    fetchChatbot();
  }, [chatbotId]);

  // ✅ LOAD HISTORIQUE + MESSAGE D'ACCUEIL
  useEffect(() => {
    const fetchHistory = async () => {
      if (!chatbotId) return;
      try {
        const res = await fetch(`${API_URL}/conversations/${chatbotId}`);
        const data = await res.json();
        const history = Array.isArray(data) ? data : data.messages || [];
        const welcomeMessage = Array.isArray(data) ? null : data.welcome_message;
        const formatted = history.map(
          (m: { role: string; message: string; created_at?: string }) => ({
            role: m.role as Role,
            text: m.message,
            ts: m.created_at
              ? new Date(m.created_at).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : timestamp(),
          })
        );
        if (formatted.length > 0) {
          setMessages(formatted);
        } else if (welcomeMessage) {
          setMessages([
            {
              role: "bot",
              text: welcomeMessage,
              ts: timestamp(),
            },
          ]);
        }
      } catch (err) {
        console.error("Erreur history:", err);
      }
    };
    fetchHistory();
  }, [chatbotId]);

  // ✅ SEND MESSAGE
  const sendMessage = async () => {
    const question = input.trim();
    if (!question || loading) return;
    const userMsg: Message = {
      role: "user",
      text: question,
      ts: timestamp(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatbot_id: chatbotId,
          question: question,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const botMsg: Message = {
        role: "bot",
        text:
          data?.answer ||
          "Je n'ai pas assez d'informations pour répondre.",
        ts: timestamp(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Erreur serveur. Veuillez réessayer.",
          ts: timestamp(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/conversations/${chatbotId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setReportedIndices(new Set());
        const convRes = await fetch(`${API_URL}/conversations/${chatbotId}`);
        const data = await convRes.json();
        const welcomeMessage = Array.isArray(data) ? null : data.welcome_message;
        if (welcomeMessage) {
          setMessages([
            {
              role: "bot",
              text: welcomeMessage,
              ts: timestamp(),
            },
          ]);
        } else {
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Erreur clear:", err);
    }
  };

  // ✅ OUVRIR LE MODAL DE SIGNALEMENT
  const openReportModal = (index: number, botText: string) => {
    let question = "";
    for (let j = index - 1; j >= 0; j--) {
      if (messages[j].role === "user") {
        question = messages[j].text;
        break;
      }
    }
    setReportModal({
      isOpen: true,
      index,
      question,
      reponse: botText,
    });
    setMotif("Résultat insatisfaisant lors du test.");
  };

  // ✅ ENVOYER LE SIGNALEMENT À L'EMPLOYÉ
  const handleSendReport = async () => {
    if (!chatbotId) return;
    setSendingReport(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/notifications/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatbot_id: chatbotId,
          question: reportModal.question,
          reponse: reportModal.reponse,
          motif: motif.trim() || "Résultat insatisfaisant lors du test.",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || "Erreur lors de l'envoi de la notification.");
      }

      if (reportModal.index !== null) {
        setReportedIndices((prev) => new Set(prev).add(reportModal.index!));
      }
      setReportModal((prev) => ({ ...prev, isOpen: false }));
      setToastMessage({
        type: "success",
        text: "Notification envoyée à l'employé avec succès ! Il a été alerté pour corriger la base de connaissances.",
      });
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err: any) {
      setToastMessage({
        type: "error",
        text: err?.message || "Une erreur est survenue lors de l'envoi du signalement.",
      });
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setSendingReport(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#D9F3F3] dark:bg-[#0B1120] max-w-7xl mx-auto px-4 py-8 space-y-6 relative">
{/* TOAST ALERTE */}
{toastMessage && (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
    <div
      className={`relative w-full max-w-md rounded-3xl shadow-2xl border-2 p-6 animate-in zoom-in-95 duration-200 ${
        toastMessage.type === "success"
          ? "bg-white dark:bg-[#0F172A] border-[#007A80]/40 dark:border-[#00B7C2]/50"
          : "bg-white dark:bg-[#0F172A] border-red-400 dark:border-red-600"
      }`}
    >
      {/* Bouton fermer */}
      <button
        onClick={() => setToastMessage(null)}
        className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Icône */}
      <div className="flex justify-center mb-5">
        {toastMessage.type === "success" ? (
          <div className="w-16 h-16 rounded-full bg-[#007A80]/10 dark:bg-[#00B7C2]/15 flex items-center justify-center">
            <div className="w-11 h-11 rounded-full bg-[#007A80] dark:bg-[#00B7C2] flex items-center justify-center shadow-lg">
              <Check
                className="w-6 h-6 text-white"
                strokeWidth={3}
              />
            </div>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
            <div className="w-11 h-11 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
              <AlertTriangle
                className="w-6 h-6 text-white"
                strokeWidth={2.5}
              />
            </div>
          </div>
        )}
      </div>

      {/* Titre */}
      <h2
        className={`text-center text-lg font-bold mb-2 ${
          toastMessage.type === "success"
            ? "text-[#007A80] dark:text-[#00C7D1]"
            : "text-red-700 dark:text-red-400"
        }`}
      >
        {toastMessage.type === "success"
          ? "Signalement envoyé"
          : "Erreur"}
      </h2>

      {/* Message */}
      <p className="text-center text-sm leading-relaxed text-slate-600 dark:text-slate-300 px-4">
        {toastMessage.text}
      </p>

      {/* Bouton OK */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setToastMessage(null)}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition ${
            toastMessage.type === "success"
              ? "bg-[#007A80] hover:bg-[#006A6A] dark:bg-[#00B7C2] dark:hover:bg-[#00A5B0]"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          OK
        </button>
      </div>
    </div>
  </div>
)}

      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-[#B8E0E0] dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-[#008080] hover:bg-[#D9F3F3] dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#008080] to-[#00A8A8] flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-[#0B3C3C] dark:text-white">
                {chatbot?.nom ? `Test de « ${chatbot.nom} »` : "Test Chatbot"}
              </h1>
              <p className="text-xs text-[#2F6F6F] dark:text-zinc-400">
                Mode test Entreprise • Signalez les réponses insatisfaisantes à l'employé
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={clearHistory}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#008080] border border-[#B8E0E0] dark:border-zinc-700 hover:bg-[#D9F3F3] dark:hover:bg-zinc-800 transition-colors"
          title="Effacer l'historique"
        >
          <RefreshCw size={16} />
          <span className="text-sm hidden sm:inline">Effacer</span>
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#D9F3F3] dark:bg-zinc-800 flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-[#008080]" />
            </div>
            <p className="text-[#2F6F6F] dark:text-zinc-400 text-sm">
              Chargement de la conversation...
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-3 rounded-2xl max-w-[85%] sm:max-w-[75%] transition-all ${
                msg.role === "user"
                  ? "bg-[#008080] text-white rounded-br-sm shadow-sm"
                  : "bg-white dark:bg-zinc-900 border border-[#B8E0E0] dark:border-zinc-700 text-[#0B3C3C] dark:text-zinc-100 rounded-bl-sm shadow-sm"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>

              {msg.role === "user" ? (
                <span className="text-[10px] mt-1 block text-white/70">
                  {msg.ts}
                </span>
              ) : (
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
                  <span className="text-[10px] text-[#2F6F6F] dark:text-zinc-400">
                    {msg.ts}
                  </span>

                  {/* BOUTON PAS SATISFAIT */}
                  {reportedIndices.has(i) ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <Check className="w-3 h-3" /> Signalé à l'employé
                    </span>
                  ) : (
                    <button
                      onClick={() => openReportModal(i, msg.text)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-700 px-2.5 py-1 rounded-xl transition-all shadow-sm group"
                      title="Cliquer si la réponse n'est pas satisfaisante pour alerter l'employé"
                    >
                      <ThumbsDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                      <span>Pas satisfait ?</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 justify-start">
            <div className="bg-white dark:bg-zinc-900 border border-[#B8E0E0] dark:border-zinc-700 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin text-[#008080]" size={16} />
                <span className="text-sm text-[#2F6F6F] dark:text-zinc-400">
                  Le chatbot réfléchit...
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 border border-[#B8E0E0] dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Tapez votre message de test..."
            className="flex-1 border border-[#B8E0E0] dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all bg-white dark:bg-zinc-900 text-[#0B3C3C] dark:text-zinc-100"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-[#008080] hover:bg-[#005F5F] disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 rounded-xl transition-colors flex items-center justify-center shadow-md"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>

      {/* MODAL DE SIGNALEMENT D'INSATISFACTION */}
      {reportModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-[#0F172A] border-2 border-amber-400 dark:border-amber-500 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* EN-TÊTE DU MODAL */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <ThumbsDown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold">
                    Signaler un résultat insatisfaisant
                  </h2>
                  <p className="text-xs text-amber-100">
                    Une notification sera envoyée à l'employé responsable du chatbot
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setReportModal((prev) => ({ ...prev, isOpen: false }))
                }
                className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CONTENU */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* APERÇU DE L'ÉCHANGE */}
              <div className="space-y-3 p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800">
                {reportModal.question && (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Votre question :
                    </p>
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                      « {reportModal.question} »
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[11px] font-semibold text-red-500 dark:text-red-400">
                    Réponse insatisfaisante reçue :
                  </p>
                  <p className="text-xs text-red-900 dark:text-red-200 italic mt-0.5 line-clamp-3">
                    « {reportModal.reponse} »
                  </p>
                </div>
              </div>

              {/* MOTIFS RAPIDES */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Motif rapide du signalement :
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_MOTIFS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMotif(preset)}
                      className={`text-xs px-2.5 py-1 rounded-xl border transition-all ${
                        motif === preset
                          ? "bg-amber-500 text-white border-amber-500 font-semibold shadow-sm"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* REMARQUE DÉTAILLÉE */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Détail ou instruction pour l'employé :
                </label>
                <textarea
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  rows={3}
                  placeholder="Ex : Préciser que la procédure se fait dans les paramètres du compte..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* PIED DU MODAL */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0B1120]/70 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() =>
                  setReportModal((prev) => ({ ...prev, isOpen: false }))
                }
                disabled={sendingReport}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleSendReport}
                disabled={sendingReport || !motif.trim()}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md transition disabled:opacity-50"
              >
                {sendingReport ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Envoi de la notification...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer la notification</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
