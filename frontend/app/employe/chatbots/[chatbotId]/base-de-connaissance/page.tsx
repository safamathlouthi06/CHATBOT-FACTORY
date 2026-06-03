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
  Trash2,
  Edit2,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Doc = { id: string; titre: string; contenu_extrait: string };
type Faq = { id: string; question: string; reponse: string };
type Mode = "doc-file" | "doc-text" | "faq" | "edit-faq" | null;

// ─── Notification ─────────────────────────────────────────────────────────────
function useNotif() {
  const [notif, setNotif] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const show = (type: "success" | "error", msg: string) => {
    setNotif({ type, msg });
    setTimeout(() => setNotif(null), 3500);
  };
  return { notif, show };
}

// ─── Popup de confirmation ────────────────────────────────────────────────────
function ConfirmPopup({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = "Supprimer",
  cancelText = "Annuler"
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string;
  confirmText?: string;
  cancelText?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BaseConnaissancePage() {
  const { chatbotId } = useParams();
  const router = useRouter();
  const { notif, show } = useNotif();

  const [data, setData] = useState<{ documents: Doc[]; faq: Faq[] } | null>(null);
  const [modalType, setModalType] = useState<Mode>(null);
  const [loading, setLoading] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  
  // États pour la popup de confirmation
  const [confirmPopup, setConfirmPopup] = useState<{
    isOpen: boolean;
    type: "document" | "faq";
    id: string;
    title: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: "document",
    id: "",
    title: "",
    onConfirm: () => {},
  });

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
    setEditingFaq(null);
    setModalType(null);
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

  // ─── Supprimer un document ────────────────────────────────────────────────────
  const deleteDocument = async (docId: string, docTitre: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/documents/${docId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erreur lors de la suppression");

      await fetchData();
      show("success", `Document "${docTitre}" supprimé avec succès ✅`);
    } catch (e: any) {
      show("error", e.message ?? "Erreur lors de la suppression");
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

  // ─── Modifier FAQ ────────────────────────────────────────────────────────────
  const editFaq = async () => {
    if (!faqQ.trim() || !faqR.trim())
      return show("error", "Question et réponse sont obligatoires");
    if (!editingFaq) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/faq/${editingFaq.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: faqQ.trim(),
          reponse: faqR.trim(),
        }),
      });

      if (!res.ok) throw new Error((await res.json()).detail ?? "Erreur");

      resetAll();
      await fetchData();
      show("success", "FAQ modifiée avec succès ✅");
    } catch (e: any) {
      show("error", e.message ?? "Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  // ─── Supprimer FAQ ────────────────────────────────────────────────────────────
  const deleteFaq = async (faqId: string, question: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/faq/${faqId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erreur lors de la suppression");

      await fetchData();
      show("success", "FAQ supprimée avec succès ✅");
    } catch (e: any) {
      show("error", e.message ?? "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  // ─── Ouvrir modal d'édition FAQ ──────────────────────────────────────────────
  const openEditFaqModal = (faq: Faq) => {
    setEditingFaq(faq);
    setFaqQ(faq.question);
    setFaqR(faq.reponse);
    setModalType("edit-faq");
  };

  // ─── Ouvrir popup de confirmation pour suppression ────────────────────────────
  const openConfirmDelete = (type: "document" | "faq", id: string, title: string) => {
    setConfirmPopup({
      isOpen: true,
      type,
      id,
      title,
      onConfirm: () => {
        if (type === "document") {
          deleteDocument(id, title);
        } else {
          deleteFaq(id, title);
        }
      },
    });
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

  const openModal = (type: Mode) => {
    resetAll();
    setModalType(type);
  };

  const closeModal = () => {
    resetAll();
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

      {/* ── Popup de confirmation ── */}
      <ConfirmPopup
        isOpen={confirmPopup.isOpen}
        onClose={() => setConfirmPopup({ ...confirmPopup, isOpen: false })}
        onConfirm={confirmPopup.onConfirm}
        title={`Supprimer ${confirmPopup.type === "document" ? "le document" : "la FAQ"}`}
        message={`Voulez-vous vraiment supprimer ${confirmPopup.type === "document" ? "le document" : "la FAQ"} : "${confirmPopup.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
      />

      {/* ── Header avec bouton retour ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#008080] hover:bg-[#D9F3F3] transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#0B3C3C]">Base de connaissances</h1>
          <p className="text-[#2F6F6F] text-sm mt-1">
            Ajoutez des documents ou des FAQ pour alimenter votre chatbot
          </p>
        </div>
      </div>

      {/* Boutons d'ajout */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => openModal("doc-file")}
          className="flex items-center gap-2 px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#005F5F] text-sm font-medium transition"
        >
          <FileUp size={16} /> Fichier PDF / PPTX
        </button>

        <button
          onClick={() => openModal("faq")}
          className="flex items-center gap-2 px-4 py-2 bg-[#005F5F] text-white rounded-lg hover:bg-[#008080] text-sm font-medium transition"
        >
          <HelpCircle size={16} /> FAQ
        </button>
      </div>

      {/* ══ MODAL — Upload fichier PDF / PPTX ══════════════════════════════════ */}
      {modalType === "doc-file" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-bold text-xl text-[#0B3C3C] dark:text-white flex items-center gap-2">
                <FileUp size={20} className="text-[#008080]" />
                Upload PDF / PPTX
              </h2>
              <button 
                onClick={closeModal} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300 mb-1.5">
                  Titre du document <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-[#B8E0E0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] dark:bg-gray-800 dark:text-white"
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
                  ${file ? "border-[#008080] bg-[#D9F3F3] dark:bg-emerald-900/20" : "border-[#B8E0E0] hover:border-[#008080] hover:bg-[#D9F3F3] dark:hover:bg-emerald-900/20"}`}
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
                    <p className="font-medium text-[#0B3C3C] dark:text-white">{file.name}</p>
                    <p className="text-sm text-[#2F6F6F] dark:text-gray-400">
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
                    <p className="text-sm text-[#2F6F6F] dark:text-gray-400">
                      <span className="font-medium text-[#008080]">Cliquez</span> ou
                      glissez-déposez un fichier ici
                    </p>
                    <p className="text-xs text-[#2F6F6F] dark:text-gray-400">PDF et PPTX — max 20 Mo</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={closeModal} 
                className="px-4 py-2.5 border border-[#B8E0E0] rounded-xl text-sm hover:bg-[#D9F3F3] dark:hover:bg-gray-700 transition"
              >
                Annuler
              </button>
              <button
                onClick={submitFile}
                disabled={loading || !file}
                className="flex items-center gap-2 bg-[#008080] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#005F5F] disabled:opacity-50 transition shadow-md"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {loading ? "Indexation en cours…" : "Indexer dans le RAG"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL — Ajout FAQ ════════════════════════════════════════════════════════ */}
      {modalType === "faq" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-bold text-xl text-[#0B3C3C] dark:text-white flex items-center gap-2">
                <HelpCircle size={20} className="text-[#005F5F]" />
                Nouvelle FAQ
              </h2>
              <button 
                onClick={closeModal} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300 mb-1.5">
                  Question <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-[#B8E0E0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F5F] dark:bg-gray-800 dark:text-white"
                  placeholder="Ex : Quels sont vos horaires d'ouverture ?"
                  value={faqQ}
                  onChange={e => setFaqQ(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300 mb-1.5">
                  Réponse <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border border-[#B8E0E0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F5F] resize-none dark:bg-gray-800 dark:text-white"
                  rows={4}
                  placeholder="Ex : Nous sommes ouverts du lundi au vendredi de 9h à 18h."
                  value={faqR}
                  onChange={e => setFaqR(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={closeModal} 
                className="px-4 py-2.5 border border-[#B8E0E0] rounded-xl text-sm hover:bg-[#D9F3F3] dark:hover:bg-gray-700 transition"
              >
                Annuler
              </button>
              <button
                onClick={submitFaq}
                disabled={loading}
                className="flex items-center gap-2 bg-[#005F5F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#008080] disabled:opacity-50 transition shadow-md"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {loading ? "Indexation…" : "Ajouter la FAQ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL — Édition FAQ ════════════════════════════════════════════════════════ */}
      {modalType === "edit-faq" && editingFaq && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-bold text-xl text-[#0B3C3C] dark:text-white flex items-center gap-2">
                <Edit2 size={20} className="text-[#005F5F]" />
                Modifier la FAQ
              </h2>
              <button 
                onClick={closeModal} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300 mb-1.5">
                  Question <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-[#B8E0E0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F5F] dark:bg-gray-800 dark:text-white"
                  placeholder="Ex : Quels sont vos horaires d'ouverture ?"
                  value={faqQ}
                  onChange={e => setFaqQ(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300 mb-1.5">
                  Réponse <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border border-[#B8E0E0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F5F] resize-none dark:bg-gray-800 dark:text-white"
                  rows={4}
                  placeholder="Ex : Nous sommes ouverts du lundi au vendredi de 9h à 18h."
                  value={faqR}
                  onChange={e => setFaqR(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={closeModal} 
                className="px-4 py-2.5 border border-[#B8E0E0] rounded-xl text-sm hover:bg-[#D9F3F3] dark:hover:bg-gray-700 transition"
              >
                Annuler
              </button>
              <button
                onClick={editFaq}
                disabled={loading}
                className="flex items-center gap-2 bg-[#005F5F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#008080] disabled:opacity-50 transition shadow-md"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                {loading ? "Modification…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ LISTES ══════════════════════════════════════════════════════════════ */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Documents */}
        <div className="bg-white dark:bg-gray-900 border border-[#B8E0E0] dark:border-gray-700 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-[#0B3C3C] dark:text-white flex items-center gap-2 mb-4">
            <FileText size={18} className="text-[#008080]" />
            Documents
            <span className="ml-auto text-xs bg-[#D9F3F3] dark:bg-emerald-900/30 text-[#008080] dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
              {data?.documents?.length ?? 0}
            </span>
          </h2>

          {!data?.documents?.length ? (
            <p className="text-sm text-[#2F6F6F] dark:text-gray-400 text-center py-8">Aucun document ajouté</p>
          ) : (
            <div className="space-y-3">
              {data.documents.map(d => (
                <div key={d.id} className="border border-[#B8E0E0] dark:border-gray-700 rounded-xl p-3 bg-[#F7FFFF] dark:bg-gray-800">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-[#0B3C3C] dark:text-white">{d.titre}</p>
                      <p className="text-xs text-[#2F6F6F] dark:text-gray-400 mt-1 line-clamp-2">{d.contenu_extrait}</p>
                    </div>
                    <button
                      onClick={() => openConfirmDelete("document", d.id, d.titre)}
                      disabled={loading}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      title="Supprimer le document"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-gray-900 border border-[#B8E0E0] dark:border-gray-700 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-[#0B3C3C] dark:text-white flex items-center gap-2 mb-4">
            <HelpCircle size={18} className="text-[#005F5F] dark:text-emerald-400" />
            FAQ
            <span className="ml-auto text-xs bg-[#D9F3F3] dark:bg-emerald-900/30 text-[#008080] dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
              {data?.faq?.length ?? 0}
            </span>
          </h2>

          {!data?.faq?.length ? (
            <p className="text-sm text-[#2F6F6F] dark:text-gray-400 text-center py-8">Aucune FAQ ajoutée</p>
          ) : (
            <div className="space-y-3">
              {data.faq.map(f => (
                <div key={f.id} className="border border-[#B8E0E0] dark:border-gray-700 rounded-xl p-3 bg-[#F7FFFF] dark:bg-gray-800">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-[#005F5F] dark:text-emerald-400">Q : {f.question}</p>
                      <p className="text-xs text-[#2F6F6F] dark:text-gray-400 mt-1">R : {f.reponse}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditFaqModal(f)}
                        disabled={loading}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                        title="Modifier la FAQ"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => openConfirmDelete("faq", f.id, f.question)}
                        disabled={loading}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        title="Supprimer la FAQ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}