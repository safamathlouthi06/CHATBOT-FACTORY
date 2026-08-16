"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  UserCheck,
  UserX,
  Search,
  RefreshCw,
  Mail,
} from "lucide-react";
import { API_URL } from "@/services/api";

type Employe = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  email_personnel: string;
  statut: "actif" | "inactif";
  created_at: string;
};

export default function EmployesPage() {
  const router = useRouter();

  const [employes, setEmployes] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // ================================
  // POPUP SUCCESS / ERROR
  // ================================
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // ================================
  // DELETE
  // ================================
  const [deleteTarget, setDeleteTarget] = useState<Employe | null>(null);

  // ================================
  // RESEND
  // ================================
  const [resendTarget, setResendTarget] = useState<string | null>(null);

  // ================================
  // FORM
  // ================================
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [emailP, setEmailP] = useState("");
  const [preview, setPreview] = useState("");

  const [emailError, setEmailError] = useState<string>("");

  // ================================
  // TOKEN
  // ================================
  const tk = () => localStorage.getItem("token") ?? "";

  // ================================
  // POPUP
  // ================================
  const toast_ = (
    type: "success" | "error",
    msg: string
  ) => {
    console.log("🔥 TOAST:", msg);

    setToast({
      type,
      msg,
    });
  };

  // ================================
  // CLOSE POPUP
  // ================================
  const closeToast = () => {
    setToast(null);
  };

  // ================================
  // ERROR MESSAGE
  // ================================
  const getErrorMessage = (detail: any): string => {
    if (!detail) {
      return "Erreur inconnue";
    }

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map(
          (e) =>
            e.msg ||
            e.message ||
            JSON.stringify(e)
        )
        .join(", ");
    }

    if (typeof detail === "object") {
      return (
        detail.detail ||
        detail.msg ||
        detail.message ||
        JSON.stringify(detail)
      );
    }

    return "Erreur inconnue";
  };

  // ================================
  // GET EMPLOYES
  // ================================
  const fetchEmployes = async () => {
    try {
      setLoading(true);

      const r = await fetch(
        `${API_URL}/employes/`,
        {
          headers: {
            Authorization: `Bearer ${tk()}`,
          },
        }
      );

      if (r.status === 403) {
        router.push("/dashboard");
        return;
      }

      const d = await r.json();

      setEmployes(
        Array.isArray(d)
          ? d
          : []
      );
    } catch {
      toast_(
        "error",
        "Impossible de charger les employés"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // LOAD
  // ================================
  useEffect(() => {
    fetchEmployes();
  }, []);

  // ================================
  // PREVIEW EMAIL
  // ================================
  useEffect(() => {
    if (!prenom && !nom) {
      setPreview("");
      return;
    }

    const sl = (t: string) =>
      t
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, ".");

    const company = (
      localStorage.getItem(
        "nomentreprise"
      ) || "entreprise"
    )
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    const p = sl(prenom.trim());
    const n = sl(nom.trim());

    setPreview(
      p && n
        ? `${p}.${n}@${company}.com`
        : ""
    );
  }, [prenom, nom]);

  // ================================
  // RESET EMAIL ERROR
  // ================================
  useEffect(() => {
    setEmailError("");
  }, [emailP]);

  // ================================
  // CREATE EMPLOYE
  // ================================
  const handleCreate = async () => {
    if (
      !nom.trim() ||
      !prenom.trim() ||
      !emailP.trim()
    ) {
      toast_(
        "error",
        "Tous les champs sont obligatoires"
      );
      return;
    }

    setSaving(true);
    setEmailError("");

    try {
      const response = await fetch(
        `${API_URL}/employes/`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${tk()}`,
          },
          body: JSON.stringify({
            nom: nom.trim(),
            prenom: prenom.trim(),
            email_personnel:
              emailP.trim(),
          }),
        }
      );

      const text =
        await response.text();

      let data: any = {};

      try {
        data = JSON.parse(text);
      } catch {
        data = {
          detail: text,
        };
      }

      // ================================
      // ERROR
      // ================================
      if (!response.ok) {
        const errorMsg =
          getErrorMessage(
            data?.detail || data
          );

        // EMAIL EXISTANT
        if (
          errorMsg
            .toLowerCase()
            .includes("email") &&
          errorMsg
            .toLowerCase()
            .includes("exist")
        ) {
          setEmailError(
            "Cet email personnel est déjà utilisé par un autre employé"
          );

          toast_(
            "error",
            "Cet email personnel est déjà utilisé par un autre employé"
          );
        } else {
          toast_(
            "error",
            errorMsg
          );
        }

        return;
      }

      // ================================
      // SUCCESS
      // ================================
      toast_(
        "success",
        `Employé créé — identifiants envoyés à ${emailP}`
      );

      // RESET FORM
      setShowForm(false);
      setNom("");
      setPrenom("");
      setEmailP("");
      setEmailError("");
      setPreview("");

      // REFRESH
      fetchEmployes();
    } catch (err) {
      console.log(err);

      toast_(
        "error",
        "Erreur réseau"
      );
    } finally {
      setSaving(false);
    }
  };

  // ================================
  // TOGGLE STATUS
  // ================================
  const handleToggle = async (
    emp: Employe
  ) => {
    try {
      const r = await fetch(
        `${API_URL}/employes/${emp.id}/statut`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${tk()}`,
          },
        }
      );

      const d = await r.json();

      if (!r.ok) {
        toast_(
          "error",
          getErrorMessage(d?.detail || d)
        );
        return;
      }

      toast_(
        "success",
        `Compte ${
          d.statut === "actif"
            ? "activé"
            : "désactivé"
        }`
      );

      fetchEmployes();
    } catch {
      toast_(
        "error",
        "Erreur lors de la modification du statut"
      );
    }
  };

  // ================================
  // DELETE
  // ================================
  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      const r = await fetch(
        `${API_URL}/employes/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${tk()}`,
          },
        }
      );

      if (!r.ok) {
        const d = await r.json();

        toast_(
          "error",
          getErrorMessage(
            d?.detail || d
          )
        );

        return;
      }

      toast_(
        "success",
        "Employé supprimé"
      );

      setDeleteTarget(null);

      fetchEmployes();
    } catch {
      toast_(
        "error",
        "Erreur lors de la suppression"
      );
    }
  };

  // ================================
  // RESEND EMAIL
  // ================================
  const handleResend = async (
    id: string
  ) => {
    setResendTarget(id);

    try {
      const r = await fetch(
        `${API_URL}/employes/${id}/resend`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tk()}`,
          },
        }
      );

      const d = await r.json();

      if (!r.ok) {
        toast_(
          "error",
          getErrorMessage(
            d?.detail || d
          )
        );

        return;
      }

      toast_(
        "success",
        "Nouveaux identifiants envoyés"
      );
    } catch {
      toast_(
        "error",
        "Erreur lors de l'envoi des identifiants"
      );
    } finally {
      setResendTarget(null);
    }
  };

  // ================================
  // RESET FORM
  // ================================
  const resetForm = () => {
    setNom("");
    setPrenom("");
    setEmailP("");
    setPreview("");
    setEmailError("");
  };

  // ================================
  // CLOSE FORM
  // ================================
  const closeModal = () => {
    setShowForm(false);
    resetForm();
  };

  // ================================
  // FILTER
  // ================================
  const filtered =
    employes.filter((e) =>
      `${e.nom} ${e.prenom} ${e.email} ${e.email_personnel}`
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <>
      {/* ======================================================
          POPUP SUCCESS / ERROR
      ====================================================== */}
      {toast && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div
            className={`relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-2xl p-6 animate-in fade-in zoom-in duration-200 border ${
              toast.type === "success"
                ? "border-[#9ADADA]"
                : "border-red-200 dark:border-red-800"
            }`}
          >
            {/* BOUTON X */}
            <button
              onClick={closeToast}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>

            {/* ICON */}
            <div className="flex justify-center mb-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  toast.type === "success"
                    ? "bg-[#D9F3F3]"
                    : "bg-red-100 dark:bg-red-900/30"
                }`}
              >
                {toast.type ===
                "success" ? (
                  <CheckCircle
                    className="w-9 h-9 text-[#008080]"
                  />
                ) : (
                  <AlertCircle
                    className="w-9 h-9 text-red-500"
                  />
                )}
              </div>
            </div>

            {/* TITLE */}
            <h3
              className={`text-center text-xl font-bold mb-3 ${
                toast.type === "success"
                  ? "text-[#0B3C3C] dark:text-white"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {toast.type ===
              "success"
                ? "Succès"
                : "Erreur"}
            </h3>

            {/* MESSAGE */}
            <p className="text-center text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {String(toast.msg)}
            </p>

            {/* BUTTON */}
            <div className="flex justify-center mt-6">
              <button
                onClick={closeToast}
                className={`px-7 py-2.5 rounded-xl text-sm font-semibold text-white transition shadow-md ${
                  toast.type ===
                  "success"
                    ? "bg-[#008080] hover:bg-[#005F5F]"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          PAGE
      ====================================================== */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0B3C3C] dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-[#008080]" />
              Gestion des employés
            </h1>

            <p className="text-sm text-[#2F6F6F] mt-1">
              {employes.length} employé
              {employes.length > 1
                ? "s"
                : ""}{" "}
              — les accès sont envoyés
              automatiquement par email
            </p>
          </div>

          <button
            onClick={() =>
              setShowForm(true)
            }
            className="flex items-center gap-2 bg-[#008080] hover:bg-[#005F5F] text-white px-4 py-2.5 rounded-xl transition text-sm font-semibold shadow-md"
          >
            <Plus size={16} />
            Ajouter un employé
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00A8A8]" />

          <input
            className="w-full pl-10 pr-4 py-2.5 border border-[#B8E0E0] rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-[#008080] text-sm"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2
              className="animate-spin text-[#008080]"
              size={36}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-[#B8E0E0] rounded-2xl bg-white dark:bg-gray-900">
            <Users className="w-14 h-14 mx-auto text-[#00A8A8] mb-4" />

            <p className="font-semibold text-[#0B3C3C] dark:text-white mb-1">
              {search
                ? "Aucun résultat"
                : "Aucun employé encore"}
            </p>

            {!search && (
              <p className="text-sm text-[#2F6F6F]">
                Ajoutez votre premier
                employé pour lui donner
                accès à la plateforme.
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-[#B8E0E0] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#D9F3F3] dark:bg-gray-800">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#005F5F] uppercase tracking-wide">
                      Employé
                    </th>

                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#005F5F] uppercase tracking-wide hidden sm:table-cell">
                      Email connexion
                    </th>

                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#005F5F] uppercase tracking-wide hidden md:table-cell">
                      Email personnel
                    </th>

                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#005F5F] uppercase tracking-wide">
                      Statut
                    </th>

                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#005F5F] uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E8F7F7] dark:divide-gray-800">
                  {filtered.map(
                    (emp) => (
                      <tr
                        key={emp.id}
                        className="hover:bg-[#F7FFFF] dark:hover:bg-gray-800 transition"
                      >
                        {/* EMPLOYE */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#008080] to-[#00A8A8] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {emp.prenom[0]?.toUpperCase()}
                              {emp.nom[0]?.toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold text-sm text-[#0B3C3C] dark:text-white">
                                {emp.prenom}{" "}
                                {emp.nom}
                              </p>

                              <p className="text-xs text-[#2F6F6F]">
                                Ajouté le{" "}
                                {new Date(
                                  emp.created_at
                                ).toLocaleDateString(
                                  "fr-FR"
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* EMAIL CONNEXION */}
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <span className="font-mono text-xs text-[#005F5F] bg-[#D9F3F3] px-2 py-1 rounded-lg">
                            {emp.email}
                          </span>
                        </td>

                        {/* EMAIL PERSONNEL */}
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className="text-sm text-[#2F6F6F] dark:text-gray-400">
                            {emp.email_personnel}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                              emp.statut ===
                              "actif"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                emp.statut ===
                                "actif"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            />

                            {emp.statut ===
                            "actif"
                              ? "Actif"
                              : "Inactif"}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            {/* RESEND */}
                            <button
                              onClick={() =>
                                handleResend(
                                  emp.id
                                )
                              }
                              disabled={
                                resendTarget ===
                                emp.id
                              }
                              className="p-2 rounded-lg hover:bg-[#D9F3F3] text-[#008080] transition"
                              title="Renvoyer les identifiants"
                            >
                              {resendTarget ===
                              emp.id ? (
                                <Loader2
                                  size={15}
                                  className="animate-spin"
                                />
                              ) : (
                                <RefreshCw
                                  size={15}
                                />
                              )}
                            </button>

                            {/* TOGGLE */}
                            <button
                              onClick={() =>
                                handleToggle(
                                  emp
                                )
                              }
                              className={`p-2 rounded-lg transition ${
                                emp.statut ===
                                "actif"
                                  ? "hover:bg-red-50 text-red-500"
                                  : "hover:bg-green-50 text-green-500"
                              }`}
                              title={
                                emp.statut ===
                                "actif"
                                  ? "Désactiver"
                                  : "Activer"
                              }
                            >
                              {emp.statut ===
                              "actif" ? (
                                <UserX
                                  size={15}
                                />
                              ) : (
                                <UserCheck
                                  size={15}
                                />
                              )}
                            </button>

                            {/* DELETE */}
                            <button
                              onClick={() =>
                                setDeleteTarget(
                                  emp
                                )
                              }
                              className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition"
                              title="Supprimer"
                            >
                              <Trash2
                                size={15}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ====================================================
            MODAL AJOUT EMPLOYE
        ==================================================== */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">

              {/* HEADER */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-bold text-xl text-[#0B3C3C] dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#008080]" />
                  Nouvel employé
                </h2>

                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              {/* FORM */}
              <div className="p-6 space-y-5">

                {/* PRENOM / NOM */}
                <div className="grid grid-cols-2 gap-4">

                  {/* PRENOM */}
                  <div>
                    <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300 mb-1.5">
                      Prénom{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      className="w-full border border-[#B8E0E0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] dark:bg-gray-800 dark:text-white"
                      placeholder="Marie"
                      value={prenom}
                      onChange={(e) =>
                        setPrenom(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {/* NOM */}
                  <div>
                    <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300 mb-1.5">
                      Nom{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      className="w-full border border-[#B8E0E0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] dark:bg-gray-800 dark:text-white"
                      placeholder="Dupont"
                      value={nom}
                      onChange={(e) =>
                        setNom(
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300 mb-1.5">
                    Email personnel{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="email"
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] dark:bg-gray-800 dark:text-white ${
                      emailError
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-[#B8E0E0]"
                    }`}
                    placeholder="marie.dupont@gmail.com"
                    value={emailP}
                    onChange={(e) =>
                      setEmailP(
                        e.target.value
                      )
                    }
                  />

                  {/* EMAIL ERROR */}
                  {emailError && (
                    <div className="mt-2 flex items-center gap-1.5 text-red-600 text-xs">
                      <AlertCircle size={12} />
                      <span>
                        {emailError}
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-[#2F6F6F] mt-1.5">
                    Les identifiants de
                    connexion seront envoyés
                    à cette adresse.
                  </p>

                  {/* PREVIEW */}
                 
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">

                <button
                  onClick={closeModal}
                  className="px-4 py-2.5 border border-[#B8E0E0] rounded-xl text-sm hover:bg-[#D9F3F3] transition"
                >
                  Annuler
                </button>

                <button
                  onClick={handleCreate}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#008080] hover:bg-[#005F5F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition shadow-md"
                >
                  {saving ? (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <Mail size={15} />
                  )}

                  {saving
                    ? "Création en cours..."
                    : "Créer et envoyer les accès"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            MODAL SUPPRESSION
        ==================================================== */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">

              {/* HEADER */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>

                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Supprimer l'employé
                </h2>
              </div>

              {/* MESSAGE */}
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Voulez-vous supprimer{" "}
                <strong>
                  {deleteTarget.prenom}{" "}
                  {deleteTarget.nom}
                </strong>{" "}
                ? Son accès à la plateforme
                sera révoqué.
              </p>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 pt-2">

                <button
                  onClick={() =>
                    setDeleteTarget(null)
                  }
                  className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition"
                >
                  Annuler
                </button>

                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold flex items-center gap-2 transition"
                >
                  <Trash2 size={14} />
                  Supprimer
                </button>

              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}