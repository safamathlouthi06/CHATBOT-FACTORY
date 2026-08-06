"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/services/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [entreprises, setEntreprises] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "super_admin") {
      router.push("/login");
    } else {
      fetchEntreprises(token);
    }
  }, []);

  const fetchEntreprises = async (token: string) => {
    const res = await fetch(`${API_URL}/admin/entreprises`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setEntreprises(data);
  };

  const validateEntreprise = async (id: string) => {
    const token = localStorage.getItem("token");

    await fetch(`${API_URL}/admin/validate/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // refresh list
    fetchEntreprises(token!);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0B1120] p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#134E52] dark:text-white">Liste des entreprise</h1>


      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-[#0F172A] shadow rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-200 dark:bg-[#111827]">
            <tr>
              <th className="p-3 text-[#134E52] dark:text-zinc-200">Nom</th>
              <th className="p-3 text-[#134E52] dark:text-zinc-200">Email</th>
              <th className="p-3 text-[#134E52] dark:text-zinc-200">Secteur</th>
              <th className="p-3 text-[#134E52] dark:text-zinc-200">Statut</th>
              <th className="p-3 text-[#134E52] dark:text-zinc-200">Action</th>
            </tr>
          </thead>

          <tbody>
            {entreprises.map((e: any) => (
              <tr key={e.id} className="border-b border-gray-200 dark:border-[#1E293B]">
                <td className="p-3 text-[#0B3C3C] dark:text-zinc-300">{e.nomentreprise}</td>
                <td className="p-3 text-[#0B3C3C] dark:text-zinc-300">{e.email}</td>
                <td className="p-3 text-[#0B3C3C] dark:text-zinc-300">{e.secteurd_activite}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      e.statut === "approved"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {e.statut}
                  </span>
                </td>

                <td className="p-3">
                  {e.statut !== "approved" && (
                    <button
                      onClick={() => validateEntreprise(e.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Valider
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}