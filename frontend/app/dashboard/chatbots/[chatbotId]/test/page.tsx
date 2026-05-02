"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Send,
  Loader2,
  RefreshCw,
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

  // ✅ ✅ LOAD HISTORIQUE
  useEffect(() => {
    const fetchHistory = async () => {
      if (!chatbotId) return;
      console.log("chatbotId:", chatbotId);

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
          text: "Erreur serveur",
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

  return (
    <div className="flex flex-col h-screen">

      {/* HEADER */}
      <div className="flex justify-between p-4 border-b">
        <h1 className="font-bold">Test Chatbot</h1>

        <button
          onClick={async () => {
            await fetch(
              `http://localhost:8000/conversations/${chatbotId}`,
              { method: "DELETE" }
            );
            setMessages([]);
          }}
          className="border px-3 py-2 rounded"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">

        {messages.length === 0 && (
          <p className="text-center text-gray-400">
            Aucune conversation
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-3 rounded-xl max-w-[70%] ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2">
            <Loader2
              className="animate-spin"
              size={16}
            />
            <span className="text-sm text-gray-500">
              Le bot répond...
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 border-t flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Votre message..."
          className="flex-1 border px-4 py-2 rounded"
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 rounded"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}