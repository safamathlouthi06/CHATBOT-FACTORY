"use client";

import { Eyebrow, Reveal } from "./primitives";

const STEPS = [
  {
    n: "1",
    title: "Connectez vos données",
    body: "PDF, site web, Notion. L'indexation prend quelques secondes.",
  },
  {
    n: "2",
    title: "Façonnez le ton",
    body: "Choisissez le modèle et les limites. Testez en direct, ajustez.",
  },
  {
    n: "3",
    title: "Déployez",
    body: "Un widget à coller, une API à appeler. Le jour même.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="border-t border-line px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <Eyebrow>Mise en route</Eyebrow>
          <h2 className="font-display mt-5 max-w-lg text-3xl text-ink md:text-4xl">
            Trois étapes, une après-midi.
          </h2>
        </Reveal>

        <div className="mt-20 grid gap-14 md:grid-cols-3 md:gap-10">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 90}>
              <div className="group relative">
                {/* Oversized ghost numeral — the one piece of scale in the section */}
                <span
                  aria-hidden
                  className="font-display block text-7xl leading-none text-line transition-colors duration-500 group-hover:text-brand-600/35"
                >
                  {step.n}
                </span>

                <h3 className="mt-6 text-lg font-medium text-ink">{step.title}</h3>
                <p className="mt-2 max-w-xs text-ink-muted">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
