"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Send,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Bot,
} from "lucide-react";

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

export default function TestPage() {

  const params = useParams();
  const router = useRouter();
  const chatbotId = params.chatbotId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ LOAD HISTORIQUE
  useEffect(() => {
    const fetchHistory = async () => {
      if (!chatbotId) return;

      try {
        const res = await fetch(
          `http://localhost:8000/conversations/${chatbotId}`
        );

        const data = await res.json();

        const formatted = data.map((m: any) => ({
          role: m.role,
          text: m.message,
          ts: new Date(m.created_at).toLocaleTimeString(),
        }));

        setMessages(formatted);
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

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8000/chat/", {
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

      setMessages(prev => [...prev, botMsg]);

    } catch {
      setMessages(prev => [
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
      await fetch(`http://localhost:8000/conversations/${chatbotId}`, {
        method: "DELETE",
      });
      setMessages([]);
    } catch (err) {
      console.error("Erreur clear:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#D9F3F3] max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-[#B8E0E0] bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-[#008080] hover:bg-[#D9F3F3] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#008080] flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-[#0B3C3C]">Test Chatbot</h1>
              <p className="text-xs text-[#2F6F6F]">ID: {chatbotId}</p>
            </div>
          </div>
        </div>

        <button
          onClick={clearHistory}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#008080] border border-[#B8E0E0] hover:bg-[#D9F3F3] transition-colors"
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
            <div className="w-16 h-16 rounded-2xl bg-[#D9F3F3] flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-[#008080]" />
            </div>
            <p className="text-[#2F6F6F] text-sm">
              Aucune conversation
            </p>
            <p className="text-xs text-[#2F6F6F] mt-1">
              Envoyez un message pour commencer à tester votre chatbot
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                msg.role === "user"
                  ? "bg-[#008080] text-white rounded-br-sm"
                  : "bg-white border border-[#B8E0E0] text-[#0B3C3C] rounded-bl-sm shadow-sm"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <span className={`text-[10px] mt-1 block ${msg.role === "user" ? "text-white/70" : "text-[#2F6F6F]"}`}>
                {msg.ts}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 justify-start">
            <div className="bg-white border border-[#B8E0E0] rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin text-[#008080]" size={16} />
                <span className="text-sm text-[#2F6F6F]">
                  Le chatbot réfléchit...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 border-t border-[#B8E0E0] bg-white">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Tapez votre message..."
            className="flex-1 border border-[#B8E0E0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all"
            disabled={loading}
          />

          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-[#008080] hover:bg-[#005F5F] disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 rounded-xl transition-colors flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}