"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { API_URL } from "@/services/api";
import { Reveal } from "./primitives";

const CONTACT_EMAIL = "contact@insomea.ai";

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");

  const validate = () => {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Indiquez votre nom.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) next.email = "Adresse email invalide.";
    if (form.message.trim().length < 10) next.message = "Votre message est un peu court.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("sending");
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Le serveur a répondu ${res.status}`);
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      // The backend has no /contact route yet — surface that honestly and give
      // the visitor a route that does work, rather than a fake confirmation.
      console.error("Envoi du formulaire de contact échoué :", err);
      setStatus("error");
    }
  };

  const field = (name: keyof typeof form) =>
    `w-full border-b bg-transparent py-3 text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-ink ${
      errors[name] ? "border-red-400" : "border-line"
    }`;

  return (
    <section id="contact" className="border-t border-line px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2">
        <Reveal>
          <div>
            <h2 className="font-display text-3xl text-ink md:text-4xl">
              Votre premier agent est à
              <br />
              cinq minutes d&apos;ici.
            </h2>
            <p className="mt-5 max-w-sm text-ink-muted">
              Créez un compte, ou réservez une démo de 20 minutes avec un ingénieur.
            </p>

            <Link
              href="/register"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-surface transition-opacity hover:opacity-90"
            >
              Créer un compte
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <div className="mt-10 space-y-1 text-sm">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="block text-ink transition-colors hover:text-brand-700"
              >
                {CONTACT_EMAIL}
              </a>
              <a
                href="tel:+33123456789"
                className="block text-ink-muted transition-colors hover:text-brand-700"
              >
                +33 1 23 45 67 89
              </a>
              <p className="text-ink-muted">Paris, France</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nom"
                aria-invalid={Boolean(errors.name)}
                className={field("name")}
              />
              {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email"
                aria-invalid={Boolean(errors.email)}
                className={field("email")}
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Message"
                aria-invalid={Boolean(errors.message)}
                className={`${field("message")} resize-none`}
              />
              {errors.message && <p className="mt-1.5 text-xs text-red-500">{errors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {status === "sending" ? "Envoi…" : "Envoyer"}
            </button>

            {status === "sent" && (
              <p role="status" className="text-sm text-brand-700 dark:text-brand-600">
                Message reçu. Réponse sous 24 h.
              </p>
            )}

            {status === "error" && (
              <p role="alert" className="text-sm text-red-500">
                L&apos;envoi a échoué. Écrivez-nous à{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
