"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: any) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password, // 🔐 IMPORTANT
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Login error:", data);
        alert(data.detail || "Erreur login");
        return;
      }

      // 💾 stocker token JWT
      localStorage.setItem("token", data.access_token);

      alert("Login réussi !");
      router.push("/dashboard");

    } catch (error) {
      console.error("ERREUR COMPLETE:", error);
      alert("Erreur serveur");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-80 flex flex-col gap-4"
      >
        <h2 className="text-xl font-bold text-center">Login</h2>

        <input
          type="email"
          placeholder="Email entreprise"
          className="border p-2 rounded"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* 🔐 PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-blue-600 text-white p-2 rounded">
          Se connecter
        </button>
      </form>
    </div>
  );
}