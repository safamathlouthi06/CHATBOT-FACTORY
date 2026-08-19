"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/services/api";

import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Building2,
  Mail,
  Briefcase,
  Phone,
  MapPin,
  Loader2,
  AlertCircle,
  Globe,
  CalendarDays,
  X,
  Trash2,
  ShieldAlert,
  Edit3,
  RefreshCw,
  Clock,
} from "lucide-react";

interface Entreprise {
  id: string;
  nomentreprise: string;
  email: string;
  secteurd_activite?: string;
  statut: string;
  description?: string;
  telephone?: string;
  tel?: string;
  adresse?: string;
  site_web?: string;
  date_creation?: string;
  created_at?: string;
}

export default function AdminDashboard() {
  const router = useRouter();

  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [filteredEntreprises, setFilteredEntreprises] = useState<Entreprise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectedEntreprise, setSelectedEntreprise] = useState<Entreprise | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Status edit modal
  const [statusModalItem, setStatusModalItem] = useState<Entreprise | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");

  // Delete confirmation modal
  const [deleteModalItem, setDeleteModalItem] = useState<Entreprise | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ============================================================
  // AUTHENTIFICATION & CHARGEMENT
  // ============================================================

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "super_admin") {
      router.push("/login");
      return;
    }

    fetchEntreprises(token);
  }, [router]);

  const fetchEntreprises = async (token?: string) => {
    const authToken = token || localStorage.getItem("token");
    if (!authToken) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/admin/entreprises`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        throw new Error("Erreur lors du chargement des entreprises");
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setEntreprises(list);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les entreprises. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FILTRAGE (RECHERCHE + STATUT)
  // ============================================================

  useEffect(() => {
    let result = entreprises;

    if (statusFilter !== "all") {
      result = result.filter((e) => e.statut === statusFilter);
    }

    const value = searchTerm.trim().toLowerCase();
    if (value) {
      result = result.filter((e) => {
        return (
          e.nomentreprise?.toLowerCase().includes(value) ||
          e.email?.toLowerCase().includes(value) ||
          e.secteurd_activite?.toLowerCase().includes(value) ||
          (e.tel || e.telephone)?.toLowerCase().includes(value) ||
          e.adresse?.toLowerCase().includes(value)
        );
      });
    }

    setFilteredEntreprises(result);
  }, [searchTerm, statusFilter, entreprises]);

  // ============================================================
  // MODIFIER LE STATUT
  // ============================================================

  const handleUpdateStatus = async (id: string, statut: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setActionLoading(id);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`${API_URL}/admin/entreprises/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ statut }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Erreur lors de la mise à jour du statut");
      }

      setSuccessMessage(`Statut mis à jour avec succès : ${getStatusLabel(statut)}`);
      setTimeout(() => setSuccessMessage(null), 4000);

      setEntreprises((prev) =>
        prev.map((item) => (item.id === id ? { ...item, statut } : item))
      );

      if (selectedEntreprise && selectedEntreprise.id === id) {
        setSelectedEntreprise((prev) => (prev ? { ...prev, statut } : null));
      }

      setStatusModalItem(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de la modification du statut.");
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // SUPPRIMER L'ENTREPRISE
  // ============================================================

  const handleDeleteEntreprise = async () => {
    if (!deleteModalItem) return;
    const id = deleteModalItem.id;
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setIsDeleting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`${API_URL}/admin/entreprises/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Erreur lors de la suppression");
      }

      setSuccessMessage(`L'entreprise "${deleteModalItem.nomentreprise}" a été supprimée.`);
      setTimeout(() => setSuccessMessage(null), 4000);

      setEntreprises((prev) => prev.filter((item) => item.id !== id));
      if (selectedEntreprise && selectedEntreprise.id === id) {
        setShowDetailsModal(false);
        setSelectedEntreprise(null);
      }
      setDeleteModalItem(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de la suppression de l'entreprise.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ============================================================
  // DÉTAILS
  // ============================================================

  const viewDetails = (entreprise: Entreprise) => {
    setSelectedEntreprise(entreprise);
    setShowDetailsModal(true);
  };

  // ============================================================
  // STATUT COULEURS & LABELS
  // ============================================================

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "approved":
        return {
          label: "Validée",
          bg: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
          dot: "bg-emerald-500",
        };
      case "pending":
        return {
          label: "En attente",
          bg: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
          dot: "bg-amber-500",
        };
      case "rejected":
        return {
          label: "Rejetée",
          bg: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
          dot: "bg-red-500",
        };
      case "inactive":
      case "suspendu":
        return {
          label: "Désactivée",
          bg: "bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
          dot: "bg-gray-400",
        };
      default:
        return {
          label: statut || "Inconnu",
          bg: "bg-gray-50 text-gray-600 border border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20",
          dot: "bg-gray-400",
        };
    }
  };

  const getStatusLabel = (statut: string) => {
    return getStatusBadge(statut).label;
  };

  const stats = {
    total: entreprises.length,
    approved: entreprises.filter((e) => e.statut === "approved").length,
    pending: entreprises.filter((e) => e.statut === "pending").length,
    rejected: entreprises.filter((e) => e.statut === "rejected").length,
    inactive: entreprises.filter((e) => e.statut === "inactive" || e.statut === "suspendu").length,
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#007A80]/10 dark:bg-[#007A80]/20">
            <Loader2 className="h-8 w-8 animate-spin text-[#007A80] dark:text-[#00C7D1]" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Chargement des entreprises...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER PAGE
  // ============================================================

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#007A80] to-[#00B7C2] shadow-lg shadow-[#007A80]/20">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#134E52] dark:text-white">
              Gestion des Entreprises
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Validez, modifiez le statut ou supprimez les entreprises inscrites
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchEntreprises()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-[#0F172A] border border-[#D9E3E5] dark:border-[#1E293B] text-[#134E52] dark:text-zinc-200 rounded-xl hover:bg-[#E8FAFB] dark:hover:bg-[#111827] transition font-medium text-sm shadow-sm"
        >
          <RefreshCw className="w-4 h-4 text-[#007A80]" />
          <span>Actualiser</span>
        </button>
      </div>

      {/* NOTIFICATIONS */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 animate-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="flex-1 font-medium">{error}</span>
          <button
            onClick={() => setError(null)}
            className="rounded-lg p-1 transition hover:bg-red-100 dark:hover:bg-red-500/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 animate-in">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span className="flex-1 font-medium">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="rounded-lg p-1 transition hover:bg-emerald-100 dark:hover:bg-emerald-500/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter("all")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === "all"
              ? "border-[#007A80] bg-[#E8FAFB] dark:bg-[#007A80]/15 ring-2 ring-[#007A80]/20"
              : "border-gray-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] hover:border-[#007A80]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total</span>
            <Building2 className="w-4 h-4 text-[#007A80]" />
          </div>
          <p className="text-2xl font-bold text-[#134E52] dark:text-white mt-2">{stats.total}</p>
        </button>

        <button
          onClick={() => setStatusFilter("approved")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === "approved"
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20"
              : "border-gray-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] hover:border-emerald-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Validées</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-2">{stats.approved}</p>
        </button>

        <button
          onClick={() => setStatusFilter("pending")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === "pending"
              ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 ring-2 ring-amber-500/20"
              : "border-gray-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] hover:border-amber-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">En attente</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-2">{stats.pending}</p>
        </button>

        <button
          onClick={() => setStatusFilter("rejected")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === "rejected"
              ? "border-rose-500 bg-rose-50 dark:bg-rose-950/40 ring-2 ring-rose-500/20"
              : "border-gray-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] hover:border-rose-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Rejetées</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-700 dark:text-rose-300 mt-2">{stats.rejected}</p>
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E293B] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, secteur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-[#1E293B] rounded-xl bg-gray-50 dark:bg-[#111827] text-sm text-[#134E52] dark:text-white outline-none focus:border-[#007A80] transition"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: "all", label: "Toutes" },
            { key: "approved", label: "Validées" },
            { key: "pending", label: "En attente" },
            { key: "rejected", label: "Rejetées" },
            { key: "inactive", label: "Désactivées" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setStatusFilter(t.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === t.key
                  ? "bg-[#007A80] text-white shadow-sm"
                  : "bg-gray-100 dark:bg-[#1E293B] text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#1E293B] bg-gray-50/80 dark:bg-[#111827]/80">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Entreprise
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Contact
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Secteur
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Statut
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-[#1E293B]">
              {filteredEntreprises.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-[#1E293B]">
                        <Building2 className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="mt-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {searchTerm || statusFilter !== "all"
                          ? "Aucune entreprise ne correspond à vos critères"
                          : "Aucune entreprise inscrite"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEntreprises.map((e) => {
                  const badge = getStatusBadge(e.statut);
                  const isActionBusy = actionLoading === e.id;

                  return (
                    <tr
                      key={e.id}
                      className="transition-colors hover:bg-gray-50/70 dark:hover:bg-[#111827]/60"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#007A80]/15 to-[#00B7C2]/20 text-[#007A80] dark:text-[#00C7D1] font-bold">
                            {e.nomentreprise?.charAt(0)?.toUpperCase() || "E"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              {e.nomentreprise}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate font-mono">
                              ID: {e.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">{e.email}</span>
                          </div>
                          {(e.tel || e.telephone) && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <Phone className="h-3 w-3 text-gray-400 shrink-0" />
                              <span>{e.tel || e.telephone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span>{e.secteurd_activite || "Non renseigné"}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setStatusModalItem(e);
                            setNewStatus(e.statut);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition hover:opacity-85 ${badge.bg}`}
                          title="Cliquer pour modifier le statut"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <span>{badge.label}</span>
                          <Edit3 className="w-3 h-3 opacity-60 ml-0.5" />
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedEntreprise(e);
                              setShowDetailsModal(true);
                            }}
                            className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#111827] px-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-[#E8FAFB] dark:hover:bg-[#1E293B] hover:text-[#007A80] transition"
                            title="Voir les détails"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Détails</span>
                          </button>

                          {e.statut !== "approved" && (
                            <button
                              onClick={() => handleUpdateStatus(e.id, "approved")}
                              disabled={isActionBusy}
                              className="flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                              title="Valider l'entreprise"
                            >
                              {isActionBusy ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3.5 w-3.5" />
                              )}
                              <span>Valider</span>
                            </button>
                          )}

                          <button
                            onClick={() => setDeleteModalItem(e)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                            title="Supprimer l'entreprise"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredEntreprises.length > 0 && (
          <div className="border-t border-gray-200 dark:border-[#1E293B] bg-gray-50/50 dark:bg-[#111827]/50 px-6 py-3 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>
              {filteredEntreprises.length} entreprise{filteredEntreprises.length > 1 ? "s" : ""} affichée{filteredEntreprises.length > 1 ? "s" : ""} sur {entreprises.length}
            </span>
          </div>
        )}
      </div>

      {/* MODAL MODIFIER STATUT */}
      {statusModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setStatusModalItem(null);
          }}
        >
          <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-2xl border border-gray-200 dark:border-[#1E293B] shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#007A80]/10 flex items-center justify-center text-[#007A80]">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    Modifier le statut
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[240px]">
                    {statusModalItem.nomentreprise}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStatusModalItem(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Sélectionnez un statut :
              </label>

              {[
                {
                  value: "approved",
                  label: "Validée (Actif)",
                  desc: "L'entreprise et ses employés peuvent se connecter et utiliser la plateforme.",
                  badgeBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                },
                {
                  value: "pending",
                  label: "En attente",
                  desc: "Compte en cours de vérification, accès restreint.",
                  badgeBg: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
                },
                {
                  value: "rejected",
                  label: "Rejetée",
                  desc: "Inscription refusée par l'administrateur.",
                  badgeBg: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
                },
                {
                  value: "inactive",
                  label: "Désactivée (Suspendue)",
                  desc: "Compte temporairement bloqué, connexion impossible.",
                  badgeBg: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                },
              ].map((opt) => (
                <label
                  key={opt.value}
                  onClick={() => setNewStatus(opt.value)}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    newStatus === opt.value
                      ? "border-[#007A80] bg-[#E8FAFB] dark:bg-[#007A80]/15 ring-2 ring-[#007A80]/20"
                      : "border-gray-200 dark:border-[#1E293B] hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-[#111827]"
                  }`}
                >
                  <input
                    type="radio"
                    name="status_choice"
                    value={opt.value}
                    checked={newStatus === opt.value}
                    onChange={() => setNewStatus(opt.value)}
                    className="mt-1 text-[#007A80] focus:ring-[#007A80]"
                  />
                  <div className="flex-1">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md ${opt.badgeBg}`}>
                      {opt.label}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {opt.desc}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-[#1E293B]">
              <button
                type="button"
                onClick={() => setStatusModalItem(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1E293B] text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(statusModalItem.id, newStatus)}
                disabled={actionLoading === statusModalItem.id || newStatus === statusModalItem.statut}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#007A80] to-[#00B7C2] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[#007A80]/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === statusModalItem.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUPPRESSION */}
      {deleteModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isDeleting) setDeleteModalItem(null);
          }}
        >
          <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-2xl border border-red-200 dark:border-red-900/40 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  Supprimer l'entreprise ?
                </h3>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Cette action est irréversible
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-xs leading-relaxed text-red-800 dark:text-red-300">
              Vous êtes sur le point de supprimer définitivement :
              <p className="font-bold text-sm text-red-900 dark:text-red-200 my-1">
                {deleteModalItem.nomentreprise} ({deleteModalItem.email})
              </p>
              Tous ses chatbots, documents, FAQ, historiques de conversations et comptes employés associés seront définitivement supprimés.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalItem(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1E293B] text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteEntreprise}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-red-600/20"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Suppression...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAILS */}
      {showDetailsModal && selectedEntreprise && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowDetailsModal(false);
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E293B] shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-200 dark:border-[#1E293B] px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#007A80] to-[#00B7C2] text-white font-bold text-lg shadow-md shadow-[#007A80]/20">
                  {selectedEntreprise.nomentreprise?.charAt(0)?.toUpperCase() || "E"}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedEntreprise.nomentreprise}
                  </h2>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getStatusBadge(selectedEntreprise.statut).bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusBadge(selectedEntreprise.statut).dot}`} />
                      {getStatusBadge(selectedEntreprise.statut).label}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#1E293B] dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-[#1E293B] bg-gray-50/70 dark:bg-[#111827] p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 text-[#007A80] dark:text-[#00C7D1]" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Email</p>
                      <p className="mt-1 break-all text-sm font-medium text-gray-800 dark:text-gray-200">
                        {selectedEntreprise.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-[#1E293B] bg-gray-50/70 dark:bg-[#111827] p-4">
                  <div className="flex items-start gap-3">
                    <Briefcase className="mt-0.5 h-5 w-5 text-[#007A80] dark:text-[#00C7D1]" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Secteur</p>
                      <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                        {selectedEntreprise.secteurd_activite || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-[#1E293B] bg-gray-50/70 dark:bg-[#111827] p-4">
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-5 w-5 text-[#007A80] dark:text-[#00C7D1]" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Téléphone</p>
                      <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                        {selectedEntreprise.tel || selectedEntreprise.telephone || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-[#1E293B] bg-gray-50/70 dark:bg-[#111827] p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-[#007A80] dark:text-[#00C7D1]" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Adresse</p>
                      <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                        {selectedEntreprise.adresse || "Non renseignée"}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedEntreprise.site_web && (
                  <div className="rounded-xl border border-gray-200 dark:border-[#1E293B] bg-gray-50/70 dark:bg-[#111827] p-4 md:col-span-2">
                    <div className="flex items-start gap-3">
                      <Globe className="mt-0.5 h-5 w-5 text-[#007A80] dark:text-[#00C7D1]" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Site Web</p>
                        <a
                          href={selectedEntreprise.site_web.startsWith("http") ? selectedEntreprise.site_web : `https://${selectedEntreprise.site_web}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 block break-all text-sm font-medium text-teal-600 dark:text-teal-400 hover:underline"
                        >
                          {selectedEntreprise.site_web}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* QUICK CHANGE STATUS */}
              <div className="rounded-2xl border border-gray-200 dark:border-[#1E293B] p-4 bg-gray-50/50 dark:bg-[#111827]/40 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Changer le statut directement :
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { val: "approved", label: "Valider (Actif)", color: "bg-emerald-600 hover:bg-emerald-700 text-white" },
                    { val: "pending", label: "Mettre en attente", color: "bg-amber-600 hover:bg-amber-700 text-white" },
                    { val: "rejected", label: "Rejeter", color: "bg-rose-600 hover:bg-rose-700 text-white" },
                    { val: "inactive", label: "Désactiver", color: "bg-gray-600 hover:bg-gray-700 text-white" },
                  ].map((btn) => (
                    <button
                      key={btn.val}
                      onClick={() => handleUpdateStatus(selectedEntreprise.id, btn.val)}
                      disabled={actionLoading === selectedEntreprise.id || selectedEntreprise.statut === btn.val}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${btn.color}`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 dark:border-[#1E293B] bg-gray-50/50 dark:bg-[#111827]/50 p-4">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalItem(selectedEntreprise);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/40 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer cette entreprise</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-[#1E293B] text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}