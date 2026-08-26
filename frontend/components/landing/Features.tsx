"use client";

import { useState } from "react";
import { Eyebrow, Reveal } from "./primitives";

const FEATURES = [
  {
    n: "01",
    title: "Rapide",
    body: "Réponse médiane sous 100 ms, partout dans le monde.",
    detail: "99,9 % uptime",
  },
  {
    n: "02",
    title: "Souverain",
    body: "Données hébergées en Europe. Jamais utilisées pour entraîner un modèle.",
    detail: "RGPD · ISO 27001",
  },
  {
    n: "03",
    title: "Polyvalent",
    body: "GPT-4o, Claude, Llama. Changez de modèle sans refaire votre configuration.",
    detail: "50+ modèles",
  },
  {
    n: "04",
    title: "Multilingue",
    body: "95 langues, sans configuration supplémentaire.",
    detail: "95 langues",
  },
];

/**
 * Sticky heading on the left, feature list on the right.
 *
 * Rows are a list rather than cards — the hairline and the sliding accent do
 * the separating, so there is no box chrome to compete with the type.
 */
export default function Features() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="features" className="border-t border-line px-6 py-28">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <Eyebrow>Capacités</Eyebrow>
            <h2 className="font-display mt-5 text-3xl text-ink md:text-4xl">
              Ce qui compte,
              <br />
              et rien d&apos;autre.
            </h2>
          </Reveal>
        </div>

        <div>
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.n} delay={i * 70}>
              <div
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="relative border-t border-line py-7"
              >
                {/* Accent hairline that slides across on hover */}
                <span
                  aria-hidden
                  className="absolute -top-px left-0 h-px bg-brand-600 transition-all duration-500 ease-out"
                  style={{ width: hovered === i ? "100%" : "0%" }}
                />

                <div className="flex items-baseline gap-6">
                  <span className="text-xs tabular-nums text-ink-subtle">{feature.n}</span>

                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-lg font-medium text-ink">{feature.title}</h3>
                      <span className="shrink-0 text-xs text-ink-subtle">{feature.detail}</span>
                    </div>
                    <p className="mt-2 max-w-md text-ink-muted">{feature.body}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
          <div className="border-t border-line" />
        </div>
      </div>
    </section>
  );
}
