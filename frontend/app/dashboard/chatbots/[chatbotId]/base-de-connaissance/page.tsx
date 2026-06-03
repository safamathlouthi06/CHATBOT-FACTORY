"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  Plus,
  Loader2,
  FileUp,
  Presentation,
  ArrowLeft,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Doc = { id: string; titre: string; contenu_extrait: string };
type Faq = { id: string; question: string; reponse: string };
type Mode = "doc-file" | "doc-text" | "faq" | null;

// ─── Notification ─────────────────────────────────────────────────────────────
function useNotif() {
  const [notif, setNotif] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const show = (type: "success" | "error", msg: string) => {
    setNotif({ type, msg });
    setTimeout(() => setNotif(null), 3500);
  };
  return { notif, show };
}

export default function BaseConnaissancePage() {
  const { chatbotId } = useParams();
  const router = useRouter();
  const { notif, show } = useNotif();

  const [data, setData] = useState<{ documents: Doc[]; faq: Faq[] } | null>(null);
  const [mode, setMode] = useState<Mode>(null);
  const [loading, setLoading] = useState(false);

  // ── Doc via fichier (PDF / PPTX) ──
  const [file, setFile] = useState<File | null>(null);
  const [fileTitre, setFileTitre] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Doc via texte ──
  const [docTitre, setDocTitre] = useState("");
  const [docContenu, setDocContenu] = useState("");

  // ── FAQ ──
  const [faqQ, setFaqQ] = useState("");
  const [faqR, setFaqR] = useState("");

  // ─── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const res = await fetch(`http://localhost:8000/base/${chatbotId}`);
      const json = await res.json();
      setData(json);
    } catch {
      show("error", "Impossible de charger la base de connaissances");
    }
  };

  useEffect(() => { chatbotId && fetchData(); }, [chatbotId]);

  // ─── Reset forms ────────────────────────────────────────────────────────────
  const resetAll = () => {
    setFile(null); setFileTitre("");
    setDocTitre(""); setDocContenu("");
    setFaqQ(""); setFaqR("");
    setMode(null);
  };

  // ─── Upload fichier PDF / PPTX ──────────────────────────────────────────────
  const submitFile = async () => {
    if (!file) return show("error", "Veuillez sélectionner un fichier");
    if (!fileTitre.trim()) return show("error", "Le titre est obligatoire");

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "pptx"].includes(ext ?? ""))
      return show("error", "Seuls les fichiers PDF et PPTX sont acceptés");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("chatbot_id", chatbotId as string);
      formData.append("titre", fileTitre.trim());
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/documents/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? "Erreur serveur");
      }

      resetAll();
      await fetchData();
      show("success", `Fichier "${file.name}" indexé dans le RAG ✅`);
    } catch (e: any) {
      show("error", e.message ?? "Erreur lors de l'upload");
    } finally {
      setLoading(false);
    }
  };

  // ─── Upload texte ──────────────────────────────────────────────────────────
  const submitText = async () => {
    if (!docTitre.trim() || !docContenu.trim())
      return show("error", "Titre et contenu sont obligatoires");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const blob = new Blob([docContenu], { type: "text/plain" });
      const txtFile = new File([blob], `${docTitre}.txt`, { type: "text/plain" });

      const formData = new FormData();
      formData.append("chatbot_id", chatbotId as string);
      formData.append("titre", docTitre.trim());
      formData.append("file", txtFile);

      const res = await fetch("http://localhost:8000/documents/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error((await res.json()).detail ?? "Erreur");

      resetAll();
      await fetchData();
      show("success", "Document texte ajouté et indexé ✅");
    } catch (e: any) {
      show("error", e.message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  };

  // ─── FAQ ────────────────────────────────────────────────────────────────────
  const submitFaq = async () => {
    if (!faqQ.trim() || !faqR.trim())
      return show("error", "Question et réponse sont obligatoires");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/faq/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatbot_id: chatbotId,
          question: faqQ.trim(),
          reponse: faqR.trim(),
        }),
      });

      if (!res.ok) throw new Error((await res.json()).detail ?? "Erreur");

      resetAll();
      await fetchData();
      show("success", "FAQ ajoutée et indexée dans le RAG ✅");
    } catch (e: any) {
      show("error", e.message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  };

  // ─── Drag & Drop ────────────────────────────────────────────────────────────
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
      if (!fileTitre) setFileTitre(dropped.name.replace(/\.[^.]+$/, ""));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* ── Toast notification ── */}
      {notif && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm animate-in
            ${notif.type === "success" ? "bg-[#008080]" : "bg-red-600"}`}
        >
          {notif.type === "success"
            ? <CheckCircle size={18} />
            : <AlertCircle size={18} />}
          {notif.msg}
        </div>
      )}

      {/* ── Header avec bouton retour ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#008080] hover:bg-[#D9F3F3] transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#0B3C3C]">Base de connaissances</h1>
          <p className="text-[#2F6F6F] text-sm mt-1">
            Ajoutez des documents ou des FAQ pour alimenter votre chatbot
          </p>
        </div>
      </div>


      {/* ══ LISTES ══════════════════════════════════════════════════════════════ */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Documents */}
        <div className="bg-white border border-[#B8E0E0] rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-[#0B3C3C] flex items-center gap-2 mb-4">
            <FileText size={18} className="text-[#008080]" />
            Documents
            <span className="ml-auto text-xs bg-[#D9F3F3] text-[#008080] px-2 py-0.5 rounded-full font-medium">
              {data?.documents?.length ?? 0}
            </span>
          </h2>

          {!data?.documents?.length ? (
            <p className="text-sm text-[#2F6F6F] text-center py-8">Aucun document ajouté</p>
          ) : (
            <div className="space-y-3">
              {data.documents.map(d => (
                <div key={d.id} className="border border-[#B8E0E0] rounded-xl p-3 bg-[#F7FFFF]">
                  <p className="font-medium text-sm text-[#0B3C3C]">{d.titre}</p>
                  <p className="text-xs text-[#2F6F6F] mt-1 line-clamp-2">{d.contenu_extrait}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FAQ */}
        <div className="bg-white border border-[#B8E0E0] rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-[#0B3C3C] flex items-center gap-2 mb-4">
            <HelpCircle size={18} className="text-[#005F5F]" />
            FAQ
            <span className="ml-auto text-xs bg-[#D9F3F3] text-[#008080] px-2 py-0.5 rounded-full font-medium">
              {data?.faq?.length ?? 0}
            </span>
          </h2>

          {!data?.faq?.length ? (
            <p className="text-sm text-[#2F6F6F] text-center py-8">Aucune FAQ ajoutée</p>
          ) : (
            <div className="space-y-3">
              {data.faq.map(f => (
                <div key={f.id} className="border border-[#B8E0E0] rounded-xl p-3 bg-[#F7FFFF]">
                  <p className="font-medium text-sm text-[#005F5F]">Q : {f.question}</p>
                  <p className="text-xs text-[#2F6F6F] mt-1">R : {f.reponse}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}