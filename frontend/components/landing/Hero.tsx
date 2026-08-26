"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import AgentStage from "@/components/hero3d/AgentStage";
import { API_URL } from "@/services/api";
import { Reveal } from "./primitives";
import { useAgentScript } from "./useAgentScript";

export default function Hero() {
  const router = useRouter();
  const { state, askText, replyText } = useAgentScript();

  const handleStart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_URL}/protected`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        localStorage.removeItem("token");
        router.push("/login");
      }
    } catch (error) {
      console.error("Erreur :", error);
      router.push("/login");
    }
  };

  return (
    <section id="hero" className="px-6 pb-24 pt-20 md:pt-28">
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1fr_0.9fr] lg:gap-12">
        {/* ---------------- Copy ---------------- */}
        <div>
          <Reveal>
            <h1 className="font-display text-5xl leading-[1.04] text-ink md:text-6xl">
              L&apos;agent IA de
              <br />
              votre entreprise.
            </h1>
          </Reveal>

          <Reveal delay={80}>
            <p className="mt-6 max-w-md text-lg text-ink-muted">
              Connectez vos données. Déployez en une après-midi.
            </p>
          </Reveal>

          <Reveal delay={150}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <button
                onClick={handleStart}
                className="group flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-surface transition-opacity hover:opacity-90"
              >
                Commencer
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <a
                href="#how"
                className="rounded-full border border-line px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-ink-muted"
              >
                Voir comment
              </a>
            </div>
          </Reveal>

          <Reveal delay={220}>
            <p className="mt-6 text-sm text-ink-subtle">
              Essai 14 jours · Sans carte bancaire
            </p>
          </Reveal>
        </div>

        {/* ---------------- 3D agent ----------------
            Deliberately after the copy in DOM order: on mobile the headline
            should own the first screen, and on desktop the two-column grid
            still places the agent on the right. */}
        <Reveal delay={120}>
          <AgentStage state={state} />
        </Reveal>
      </div>

      {/* ---------------- Live conversation ---------------- */}
      <Reveal delay={180}>
        <div className="mx-auto mt-12 max-w-2xl border-t border-line pt-8">
          <div className="space-y-3">
            {/* Visitor turn */}
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-surface-sunken px-4 py-2.5 text-sm text-ink">
                {askText}
                {(askText.length > 0 || replyText.length === 0) && (
                  <span className="animate-caret ml-0.5 inline-block h-3.5 w-px translate-y-0.5 bg-ink-muted" />
                )}
              </div>
            </div>

            {/* Agent turn */}
            <div className="flex">
              <div className="min-h-[2.6rem] max-w-[85%] rounded-2xl rounded-bl-sm bg-brand-700 px-4 py-2.5 text-sm text-white">
                {state === "thinking" ? (
                  <span className="flex items-center gap-1 py-1.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="animate-dot inline-block h-1 w-1 rounded-full bg-white"
                        style={{ animationDelay: `${i * 0.16}s` }}
                      />
                    ))}
                  </span>
                ) : (
                  <>
                    {replyText || <span className="opacity-40">…</span>}
                    {state === "speaking" && (
                      <span className="animate-caret ml-0.5 inline-block h-3.5 w-px translate-y-0.5 bg-white" />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
