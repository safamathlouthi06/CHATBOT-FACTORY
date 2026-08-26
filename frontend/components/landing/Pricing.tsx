"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Reveal } from "./primitives";

type Plan = {
  name: string;
  monthly: number | null;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
};

/** Annual billing takes 20 % off the monthly rate. */
const ANNUAL_DISCOUNT = 0.2;

const PLANS: Plan[] = [
  {
    name: "Starter",
    monthly: 0,
    cta: "Commencer",
    href: "/register",
    features: ["1 agent", "1 000 messages / mois", "Widget web"],
  },
  {
    name: "Scale",
    monthly: 89,
    cta: "Essayer 14 jours",
    href: "/register",
    featured: true,
    features: [
      "5 agents",
      "50 000 messages / mois",
      "Tous les modèles",
      "Slack, WhatsApp, API",
      "Support sous 4 h",
    ],
  },
  {
    name: "Enterprise",
    monthly: null,
    cta: "Nous contacter",
    href: "#contact",
    features: ["Agents illimités", "Hébergement dédié", "SSO et audit log", "SLA 99,99 %"],
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(true);

  const priceFor = (plan: Plan) => {
    if (plan.monthly === null) return null;
    if (plan.monthly === 0) return 0;
    return annual ? Math.round(plan.monthly * (1 - ANNUAL_DISCOUNT)) : plan.monthly;
  };

  return (
    <section id="pricing" className="border-t border-line px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <h2 className="font-display text-3xl text-ink md:text-4xl">Tarifs</h2>
          </Reveal>

          <Reveal delay={60}>
            <div className="flex items-center gap-1 rounded-full border border-line p-0.5 text-sm">
              {[
                { key: false, label: "Mensuel" },
                { key: true, label: "Annuel −20 %" },
              ].map((option) => (
                <button
                  key={String(option.key)}
                  onClick={() => setAnnual(option.key)}
                  aria-pressed={annual === option.key}
                  className={`rounded-full px-4 py-1.5 transition-colors ${
                    annual === option.key
                      ? "bg-ink text-surface"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {PLANS.map((plan, i) => {
            const price = priceFor(plan);

            return (
              <Reveal key={plan.name} delay={i * 80}>
                <div
                  className={`flex h-full flex-col p-8 ${
                    plan.featured ? "bg-surface-sunken" : "bg-surface"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-medium text-ink">{plan.name}</h3>
                    {plan.featured && (
                      <span className="text-xs text-brand-600">Recommandé</span>
                    )}
                  </div>

                  <div className="mt-5 flex items-baseline gap-1.5">
                    {price === null ? (
                      <span className="font-display text-3xl text-ink">Sur mesure</span>
                    ) : (
                      <>
                        <span className="font-display text-4xl tabular-nums text-ink">
                          {price} €
                        </span>
                        <span className="text-sm text-ink-subtle">/ mois</span>
                      </>
                    )}
                  </div>

                  <ul className="mt-7 flex-1 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-ink-muted">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={`mt-8 rounded-full px-5 py-2.5 text-center text-sm font-medium transition-opacity hover:opacity-90 ${
                      plan.featured
                        ? "bg-ink text-surface"
                        : "border border-line text-ink hover:border-ink-muted"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
