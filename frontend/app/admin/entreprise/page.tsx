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
} from "lucide-react";

interface Entreprise {
  id: string;
  nomentreprise: string;
  email: string;
  secteurd_activite: string;
  statut: string;
  description?: string;
  telephone?: string;
  adresse?: string;
  site_web?: string;
  date_creation?: string;
}

export default function AdminDashboard() {
  const router = useRouter();

  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [filteredEntreprises, setFilteredEntreprises] = useState<
    Entreprise[]
  >([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntreprise, setSelectedEntreprise] =
    useState<Entreprise | null>(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // AUTHENTIFICATION
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

  // ============================================================
  // RECHERCHE
  // ============================================================

  useEffect(() => {
    const value = searchTerm.trim().toLowerCase();

    if (!value) {
      setFilteredEntreprises(entreprises);
      return;
    }

    const filtered = entreprises.filter((e) => {
      return (
        e.nomentreprise?.toLowerCase().includes(value) ||
        e.email?.toLowerCase().includes(value) ||
        e.secteurd_activite?.toLowerCase().includes(value)
      );
    });

    setFilteredEntreprises(filtered);
  }, [searchTerm, entreprises]);

  // ============================================================
  // CHARGER LES ENTREPRISES
  // ============================================================

  const fetchEntreprises = async (token: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/admin/entreprises`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Erreur lors du chargement des entreprises");
      }

      const data = await res.json();

      setEntreprises(Array.isArray(data) ? data : []);
      setFilteredEntreprises(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);

      setError(
        "Impossible de charger les entreprises. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // VALIDER ENTREPRISE
  // ============================================================

  const validateEntreprise = async (id: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setActionLoading(id);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/admin/validate/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la validation");
      }

      await fetchEntreprises(token);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la validation de l'entreprise.");
    } finally {
      setActionLoading(null);
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
  // LOGOUT
  // ============================================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    router.push("/login");
  };

  // ============================================================
  // STATUT
  // ============================================================

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";

      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";

      case "rejected":
        return "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";

      default:
        return "bg-gray-50 text-gray-600 border border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20";
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case "approved":
        return "Validée";

      case "pending":
        return "En attente";

      case "rejected":
        return "Rejetée";

      default:
        return statut || "Inconnu";
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7F9] dark:bg-[#0B1120] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#134E52]/10 dark:bg-[#134E52]/20">
            <Loader2 className="h-8 w-8 animate-spin text-[#134E52] dark:text-[#00B7C2]" />
          </div>

          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Chargement des entreprises...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ======================================================
          HEADER
      ====================================================== */}

     

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <main className="mx-auto max-w-[1500px] px-6 py-8">
        {/* TITLE */}

           <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#007A80] to-[#00B7C2] shadow-sm">
              <Building2 className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-[#134E52] dark:text-white">
                Gestion des entreprises
              </h1>

              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Administration des entreprises inscrites
              </p>
            </div>
          </div>

         
        </div>
        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />

            <span>{error}</span>

            <button
              onClick={() => setError(null)}
              className="ml-auto rounded-md p-1 transition hover:bg-red-100 dark:hover:bg-red-500/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ====================================================
            SEARCH
        ==================================================== */}

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-[#1E293B] dark:bg-[#0F172A]">
          <div className="relative max-w-lg">
            <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Rechercher par nom, email ou secteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#007A80] focus:bg-white focus:ring-2 focus:ring-[#007A80]/10 dark:border-[#334155] dark:bg-[#111827] dark:text-white dark:placeholder:text-gray-500 dark:focus:bg-[#111827]"
            />
          </div>
        </div>

        {/* ====================================================
            TABLE
        ==================================================== */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[#1E293B] dark:bg-[#0F172A]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              {/* TABLE HEADER */}

              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 dark:border-[#1E293B] dark:bg-[#111827]">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Entreprise
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Email
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

              {/* TABLE BODY */}

              <tbody>
                {filteredEntreprises.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-[#1E293B]">
                          <Building2 className="h-6 w-6 text-gray-400" />
                        </div>

                        <p className="mt-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {searchTerm
                            ? "Aucune entreprise trouvée"
                            : "Aucune entreprise inscrite"}
                        </p>

                        {searchTerm && (
                          <p className="mt-1 text-xs text-gray-400">
                            Essayez avec un autre terme de recherche.
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEntreprises.map((e) => (
                    <tr
                      key={e.id}
                      className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50/70 dark:border-[#1E293B] dark:hover:bg-[#111827]"
                    >
                      {/* ENTREPRISE */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#007A80]/10 dark:bg-[#00B7C2]/10">
                            <Building2 className="h-5 w-5 text-[#007A80] dark:text-[#00B7C2]" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-800 dark:text-white">
                              {e.nomentreprise}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-400">
                              Entreprise
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* EMAIL */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />

                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {e.email}
                          </span>
                        </div>
                      </td>

                      {/* SECTEUR */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 flex-shrink-0 text-gray-400" />

                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {e.secteurd_activite || "Non renseigné"}
                          </span>
                        </div>
                      </td>

                      {/* STATUT */}

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                            e.statut
                          )}`}
                        >
                          {e.statut === "approved" && (
                            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          )}

                          {e.statut === "pending" && (
                            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
                          )}

                          {e.statut === "rejected" && (
                            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                          )}

                          {getStatusLabel(e.statut)}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* VOIR */}

                          <button
                            onClick={() => viewDetails(e)}
                            className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-[#334155] dark:bg-[#111827] dark:text-gray-300 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                            Voir
                          </button>

                          {/* VALIDER */}

                          {e.statut !== "approved" && (
                            <button
                              onClick={() => validateEntreprise(e.id)}
                              disabled={actionLoading === e.id}
                              className="flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Valider l'entreprise"
                            >
                              {actionLoading === e.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}

                              Valider
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}

          {filteredEntreprises.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50/50 px-6 py-3.5 dark:border-[#1E293B] dark:bg-[#111827]/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {filteredEntreprises.length} résultat
                {filteredEntreprises.length > 1 ? "s" : ""}
                {searchTerm && " correspondant à votre recherche"}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* ======================================================
          DETAILS MODAL
      ====================================================== */}

      {showDetailsModal && selectedEntreprise && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowDetailsModal(false);
            }
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#0F172A]">
            {/* MODAL HEADER */}

            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5 dark:border-[#1E293B]">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#007A80] to-[#00B7C2]">
                  <Building2 className="h-6 w-6 text-white" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedEntreprise.nomentreprise}
                  </h2>

                  <div className="mt-1.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(
                        selectedEntreprise.statut
                      )}`}
                    >
                      {getStatusLabel(selectedEntreprise.statut)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#1E293B] dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* MODAL CONTENT */}

            <div className="overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* EMAIL */}

                <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-[#1E293B] dark:bg-[#111827]">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 text-[#007A80] dark:text-[#00B7C2]" />

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Email
                      </p>

                      <p className="mt-1 break-all text-sm font-medium text-gray-800 dark:text-gray-200">
                        {selectedEntreprise.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SECTEUR */}

                <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-[#1E293B] dark:bg-[#111827]">
                  <div className="flex items-start gap-3">
                    <Briefcase className="mt-0.5 h-5 w-5 text-[#007A80] dark:text-[#00B7C2]" />

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Secteur d'activité
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                        {selectedEntreprise.secteurd_activite ||
                          "Non renseigné"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* TELEPHONE */}

                {selectedEntreprise.telephone && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-[#1E293B] dark:bg-[#111827]">
                    <div className="flex items-start gap-3">
                      <Phone className="mt-0.5 h-5 w-5 text-[#007A80] dark:text-[#00B7C2]" />

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Téléphone
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {selectedEntreprise.telephone}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ADRESSE */}

                {selectedEntreprise.adresse && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-[#1E293B] dark:bg-[#111827]">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 text-[#007A80] dark:text-[#00B7C2]" />

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Adresse
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {selectedEntreprise.adresse}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SITE WEB */}

                {selectedEntreprise.site_web && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-[#1E293B] dark:bg-[#111827]">
                    <div className="flex items-start gap-3">
                      <Globe className="mt-0.5 h-5 w-5 text-[#007A80] dark:text-[#00B7C2]" />

                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Site web
                        </p>

                        <a
                          href={selectedEntreprise.site_web}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 block break-all text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {selectedEntreprise.site_web}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* DATE */}

                {selectedEntreprise.date_creation && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-[#1E293B] dark:bg-[#111827]">
                    <div className="flex items-start gap-3">
                      <CalendarDays className="mt-0.5 h-5 w-5 text-[#007A80] dark:text-[#00B7C2]" />

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Date d'inscription
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {new Date(
                            selectedEntreprise.date_creation
                          ).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* DESCRIPTION */}

              {selectedEntreprise.description && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-[#1E293B] dark:bg-[#111827]">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Description
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                    {selectedEntreprise.description}
                  </p>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}

            <div className="flex gap-3 border-t border-gray-200 bg-gray-50/50 p-5 dark:border-[#1E293B] dark:bg-[#111827]/50">
              {selectedEntreprise.statut !== "approved" && (
                <button
                  onClick={() => {
                    validateEntreprise(selectedEntreprise.id);
                    setShowDetailsModal(false);
                  }}
                  disabled={actionLoading === selectedEntreprise.id}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading === selectedEntreprise.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}

                  Valider l'entreprise
                </button>
              )}

              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 dark:border-[#334155] dark:bg-[#0F172A] dark:text-gray-300 dark:hover:bg-[#1E293B]"
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