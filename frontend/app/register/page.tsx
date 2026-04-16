"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [nomentreprise, setNomEntreprise] = useState("");
  const [secteurd_activite, setSecteur] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: any) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nomentreprise,
          secteurd_activite,
          email,
          password, // ✅ maintenant inclus
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Backend error:", data);
        alert(data.detail || "Erreur register");
        return;
      }

      alert("Entreprise créée !");
      router.push("/login");

    } catch (error) {
      console.error("ERREUR COMPLETE:", error);
      alert("Erreur serveur (backend ou réseau)");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-xl shadow-md w-80 flex flex-col gap-4"
      >
        <h2 className="text-xl font-bold text-center">
          Register Entreprise
        </h2>

        <input
          type="text"
          placeholder="Nom entreprise"
          className="border p-2 rounded"
          onChange={(e) => setNomEntreprise(e.target.value)}
        />

        <input
          type="text"
          placeholder="Secteur d'activité"
          className="border p-2 rounded"
          onChange={(e) => setSecteur(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* 🔐 PASSWORD INPUT */}
        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-green-600 text-white p-2 rounded">
          S’inscrire
        </button>
      </form>
    </div>
  );
}