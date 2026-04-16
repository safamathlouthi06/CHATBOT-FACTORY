"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateChatbotPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    tone: "professionnel",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      // 👉 API backend (FastAPI plus tard)
      const res = await fetch("http://localhost:8000/chatbots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        alert("Erreur création chatbot");
        return;
      }

      alert("Chatbot créé avec succès 🚀");
      router.push("/chatbot");

    } catch (err) {
      console.error(err);
      alert("Erreur serveur");
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">

      <div>
        <h1 className="text-2xl font-bold">Créer un Chatbot</h1>
        <p className="text-zinc-500">
          Configure ton assistant intelligent
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 border p-6 rounded-xl bg-white dark:bg-zinc-950"
      >

        <div>
          <label className="text-sm">Nom</label>
          <input
            name="name"
            className="w-full border p-2 rounded-lg"
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="text-sm">Description</label>
          <input
            name="description"
            className="w-full border p-2 rounded-lg"
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="text-sm">Ton</label>
          <select
            name="tone"
            className="w-full border p-2 rounded-lg"
            onChange={handleChange}
          >
            <option value="professionnel">Professionnel</option>
            <option value="amical">Amical</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-lg"
        >
          Créer le chatbot
        </button>

      </form>

    </div>
  );
}