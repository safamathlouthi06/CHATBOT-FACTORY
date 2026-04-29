"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Plus,
  FileText,
  HelpCircle,
  X,
  Trash2,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function BaseConnaissancePage() {
  const { chatbotId } = useParams();

  const [data, setData] = useState<any>(null);
  const [mode, setMode] = useState<"doc" | "faq" | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [doc, setDoc] = useState({
    titre: "",
    contenu: ""
  });

  const [faq, setFaq] = useState({
    question: "",
    reponse: ""
  });

  /* ============================
     NOTIFICATION
  ============================ */
  const showNotification = (
    type: "success" | "error",
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  /* ============================
     FETCH DATA (documents + faq)
  ============================ */
  const fetchData = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/base/${chatbotId}`
      );
      const json = await res.json();
      setData(json);
    } catch {
      showNotification("error", "Erreur de chargement");
    }
  };

  useEffect(() => {
    chatbotId && fetchData();
  }, [chatbotId]);

  /* ============================
     ADD DOCUMENT → CHUNKING → RAG
  ============================ */
  const addDocument = async () => {
    if (!doc.titre.trim() || !doc.contenu.trim()) {
      showNotification("error", "Titre et contenu obligatoires");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:8000/documents/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatbot_id: chatbotId,
            titre: doc.titre,
            contenu_extrait: doc.contenu
          })
        }
      );

      if (!res.ok) throw new Error();

      setDoc({ titre: "", contenu: "" });
      setMode(null);
      fetchData();
      showNotification(
        "success",
        "Document ajouté et indexé dans le RAG ✅"
      );
    } catch {
      showNotification("error", "Erreur ajout document");
    } finally {
      setLoading(false);
    }
  };

  /* ============================
     ADD FAQ → RAG
  ============================ */
  const addFaq = async () => {
    if (!faq.question.trim() || !faq.reponse.trim()) {
      showNotification("error", "Question et réponse obligatoires");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:8000/faq/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatbot_id: chatbotId,
            question: faq.question,
            reponse: faq.reponse
          })
        }
      );

      if (!res.ok) throw new Error();

      setFaq({ question: "", reponse: "" });
      setMode(null);
      fetchData();
      showNotification(
        "success",
        "FAQ ajoutée et indexée dans le RAG ✅"
      );
    } catch {
      showNotification("error", "Erreur ajout FAQ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded-lg text-white shadow-lg ${
            notification.type === "success"
              ? "bg-green-600"
              : "bg-red-600"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">
        Base de connaissances
      </h1>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setMode("doc")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          + Document
        </button>
        <button
          onClick={() => setMode("faq")}
          className="px-4 py-2 bg-purple-600 text-white rounded-md"
        >
          + FAQ
        </button>
      </div>

      {/* FORM DOCUMENT */}
      {mode === "doc" && (
        <div className="bg-white border p-4 rounded mb-6 space-y-3">
          <input
            className="w-full border p-2 rounded"
            placeholder="Titre"
            value={doc.titre}
            onChange={(e) =>
              setDoc({ ...doc, titre: e.target.value })
            }
          />
          <textarea
            className="w-full border p-2 rounded"
            placeholder="Contenu"
            rows={4}
            value={doc.contenu}
            onChange={(e) =>
              setDoc({ ...doc, contenu: e.target.value })
            }
          />
          <div className="flex gap-2">
            <button
              onClick={addDocument}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Enregistrer
            </button>
            <button
              onClick={() => setMode(null)}
              className="border px-4 py-2 rounded"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* FORM FAQ */}
      {mode === "faq" && (
        <div className="bg-white border p-4 rounded mb-6 space-y-3">
          <input
            className="w-full border p-2 rounded"
            placeholder="Question"
            value={faq.question}
            onChange={(e) =>
              setFaq({ ...faq, question: e.target.value })
            }
          />
          <textarea
            className="w-full border p-2 rounded"
            placeholder="Réponse"
            rows={3}
            value={faq.reponse}
            onChange={(e) =>
              setFaq({ ...faq, reponse: e.target.value })
            }
          />
          <div className="flex gap-2">
            <button
              onClick={addFaq}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              Enregistrer
            </button>
            <button
              onClick={() => setMode(null)}
              className="border px-4 py-2 rounded"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* LISTES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded p-4">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <FileText size={18} /> Documents
          </h2>
          {data?.documents?.map((d: any) => (
            <div key={d.id} className="border-b py-2">
              <p className="font-medium">{d.titre}</p>
              <p className="text-sm text-gray-500">
                {d.contenu_extrait}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white border rounded p-4">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <HelpCircle size={18} /> FAQ
          </h2>
          {data?.faq?.map((f: any) => (
            <div key={f.id} className="border-b py-2">
              <p className="font-medium text-purple-700">
                Q: {f.question}
              </p>
              <p className="text-sm">R: {f.reponse}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}