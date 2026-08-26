"use client";

import { useEffect, useState } from "react";
import { Counter, Reveal } from "./primitives";

const QUOTES = [
  {
    name: "Sophie Martin",
    role: "Customer Success, TechCorp",
    content: "Nos délais de réponse ont baissé de 85 % en six semaines.",
  },
  {
    name: "Thomas Bernard",
    role: "CTO, InnovateAI",
    content: "Intégré en une matinée. L'API a tenu notre pic de Black Friday sans broncher.",
  },
  {
    name: "Julie Dubois",
    role: "Head of Product, EcoSolutions",
    content: "L'agent qualifie les visiteurs mieux que notre ancien formulaire.",
  },
];

const STATS = [
  { to: 10, suffix: "k+", label: "Chatbots déployés" },
  { to: 50, suffix: "M+", label: "Messages / mois" },
  { to: 98, suffix: "%", label: "Satisfaction" },
];

const ROTATE_MS = 6500;

/**
 * One proof band instead of three thin sections (testimonials, stats, about).
 * The quote carries the section; the figures sit under it as a quiet footer.
 */
export default function Proof() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((prev) => (prev + 1) % QUOTES.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [paused, index]);

  const active = QUOTES[index];

  return (
    <section className="border-t border-line px-6 py-28">
      <div
        className="mx-auto max-w-6xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <Reveal>
          {/* key forces a remount so the fade replays on each rotation */}
          <div key={index} className="animate-fade-in min-h-[11rem] max-w-3xl">
            <blockquote className="font-display text-3xl leading-[1.25] text-ink md:text-4xl">
              “{active.content}”
            </blockquote>
            <div className="mt-7 text-sm text-ink-muted">
              {active.name} · {active.role}
            </div>
          </div>
        </Reveal>

        <div className="mt-8 flex gap-1.5">
          {QUOTES.map((quote, i) => (
            <button
              key={quote.name}
              onClick={() => setIndex(i)}
              aria-label={`Témoignage de ${quote.name}`}
              aria-current={i === index}
              className={`h-px w-10 transition-colors ${
                i === index ? "bg-ink" : "bg-line hover:bg-ink-subtle"
              }`}
            />
          ))}
        </div>

        <div className="mt-20 grid grid-cols-3 gap-6 border-t border-line pt-10">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80}>
              <div>
                <div className="font-display text-3xl tabular-nums text-ink md:text-4xl">
                  <Counter to={stat.to} suffix={stat.suffix} />
                </div>
                <div className="mt-1.5 text-sm text-ink-muted">{stat.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
