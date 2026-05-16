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
    <div className="p-6 space-y-6">
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

      {/* Boutons d'ajout */}
      {!mode && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setMode("doc-file")}
            className="flex items-center gap-2 px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#005F5F] text-sm font-medium transition"
          >
            <FileUp size={16} /> Fichier PDF / PPTX
          </button>
          <button
            onClick={() => setMode("doc-text")}
            className="flex items-center gap-2 px-4 py-2 bg-[#00A8A8] text-white rounded-lg hover:bg-[#008080] text-sm font-medium transition"
          >
            <FileText size={16} /> Texte libre
          </button>
          <button
            onClick={() => setMode("faq")}
            className="flex items-center gap-2 px-4 py-2 bg-[#005F5F] text-white rounded-lg hover:bg-[#008080] text-sm font-medium transition"
          >
            <HelpCircle size={16} /> FAQ
          </button>
        </div>
      )}

      {/* ══ FORMULAIRE — Upload fichier PDF / PPTX ══════════════════════════════ */}
      {mode === "doc-file" && (
        <div className="bg-white border border-[#B8E0E0] rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-[#0B3C3C] flex items-center gap-2">
              <FileUp size={18} className="text-[#008080]" /> Upload PDF / PPTX
            </h2>
            <button onClick={resetAll} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B3C3C] mb-1">
              Titre du document <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border border-[#B8E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
              placeholder="Ex : Manuel utilisateur v2"
              value={fileTitre}
              onChange={e => setFileTitre(e.target.value)}
            />
          </div>

          {/* Zone de dépôt */}
          <div
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition
              ${file ? "border-[#008080] bg-[#D9F3F3]" : "border-[#B8E0E0] hover:border-[#008080] hover:bg-[#D9F3F3]"}`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.pptx"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile(f);
                  if (!fileTitre) setFileTitre(f.name.replace(/\.[^.]+$/, ""));
                }
              }}
            />

            {file ? (
              <div className="space-y-2">
                <div className="flex justify-center">
                  {file.name.endsWith(".pdf")
                    ? <FileText size={36} className="text-[#008080]" />
                    : <Presentation size={36} className="text-[#005F5F]" />
                  }
                </div>
                <p className="font-medium text-[#0B3C3C]">{file.name}</p>
                <p className="text-sm text-[#2F6F6F]">
                  {(file.size / 1024).toFixed(1)} Ko
                </p>
                <button
                  onClick={e => { e.stopPropagation(); setFile(null); }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Supprimer
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload size={32} className="mx-auto text-[#00A8A8]" />
                <p className="text-sm text-[#2F6F6F]">
                  <span className="font-medium text-[#008080]">Cliquez</span> ou
                  glissez-déposez un fichier ici
                </p>
                <p className="text-xs text-[#2F6F6F]">PDF et PPTX — max 20 Mo</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={submitFile}
              disabled={loading || !file}
              className="flex items-center gap-2 bg-[#008080] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#005F5F] disabled:opacity-50 transition"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {loading ? "Indexation en cours…" : "Indexer dans le RAG"}
            </button>
            <button onClick={resetAll} className="px-4 py-2 border border-[#B8E0E0] rounded-lg text-sm hover:bg-[#D9F3F3] transition">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* ══ FORMULAIRE — Texte libre ════════════════════════════════════════════ */}
      {mode === "doc-text" && (
        <div className="bg-white border border-[#B8E0E0] rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-[#0B3C3C] flex items-center gap-2">
              <FileText size={18} className="text-[#00A8A8]" /> Ajouter un texte
            </h2>
            <button onClick={resetAll} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B3C3C] mb-1">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border border-[#B8E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8A8]"
              placeholder="Ex : Politique de retour"
              value={docTitre}
              onChange={e => setDocTitre(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B3C3C] mb-1">
              Contenu <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full border border-[#B8E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8A8] resize-none"
              rows={8}
              placeholder="Collez ou tapez votre contenu ici…"
              value={docContenu}
              onChange={e => setDocContenu(e.target.value)}
            />
            <p className="text-xs text-[#2F6F6F] mt-1">{docContenu.length} caractères</p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={submitText}
              disabled={loading}
              className="flex items-center gap-2 bg-[#00A8A8] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#008080] disabled:opacity-50 transition"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {loading ? "Indexation…" : "Ajouter et indexer"}
            </button>
            <button onClick={resetAll} className="px-4 py-2 border border-[#B8E0E0] rounded-lg text-sm hover:bg-[#D9F3F3] transition">Annuler</button>
          </div>
        </div>
      )}

      {/* ══ FORMULAIRE — FAQ ════════════════════════════════════════════════════ */}
      {mode === "faq" && (
        <div className="bg-white border border-[#B8E0E0] rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-[#0B3C3C] flex items-center gap-2">
              <HelpCircle size={18} className="text-[#005F5F]" /> Nouvelle FAQ
            </h2>
            <button onClick={resetAll} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B3C3C] mb-1">
              Question <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border border-[#B8E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F5F]"
              placeholder="Ex : Quels sont vos horaires d'ouverture ?"
              value={faqQ}
              onChange={e => setFaqQ(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B3C3C] mb-1">
              Réponse <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full border border-[#B8E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F5F] resize-none"
              rows={4}
              placeholder="Ex : Nous sommes ouverts du lundi au vendredi de 9h à 18h."
              value={faqR}
              onChange={e => setFaqR(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={submitFaq}
              disabled={loading}
              className="flex items-center gap-2 bg-[#005F5F] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#008080] disabled:opacity-50 transition"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {loading ? "Indexation…" : "Ajouter la FAQ"}
            </button>
            <button onClick={resetAll} className="px-4 py-2 border border-[#B8E0E0] rounded-lg text-sm hover:bg-[#D9F3F3] transition">Annuler</button>
          </div>
        </div>
      )}

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