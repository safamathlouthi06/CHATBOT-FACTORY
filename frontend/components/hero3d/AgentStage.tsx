"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { useTheme } from "@/context/ThemeContext";
import AgentLoader from "./AgentLoader";
import type { AgentState } from "./agentConfig";

// three.js touches `window` at import time, so the whole scene is client-only
// and kept out of the initial bundle.
const AgentScene = dynamic(() => import("./AgentScene"), {
  ssr: false,
  loading: () => <StageSkeleton />,
});

const STATE_LABEL: Record<AgentState, string> = {
  idle: "en veille",
  listening: "écoute",
  thinking: "réflexion",
  speaking: "réponse",
};

/**
 * The 3D agent and nothing else.
 *
 * No glass panel, no orbiting capability chips, no backdrop blur — those cost
 * real frames (a full-size backdrop-filter is one of the most expensive things
 * a browser can composite) and they were the part that read as decoration
 * rather than product.
 */
export default function AgentStage({ state }: { state: AgentState }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const hostRef = useRef<HTMLDivElement>(null);
  const [canRender3D, setCanRender3D] = useState<boolean | null>(null);
  const [inView, setInView] = useState(true);

  // Decide once whether 3D is appropriate for this visitor.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCanRender3D(false);
      return;
    }
    try {
      const probe = document.createElement("canvas");
      const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
      setCanRender3D(Boolean(gl));
    } catch {
      setCanRender3D(false);
    }
  }, []);

  // Stop rendering frames once the hero scrolls away — the single biggest
  // battery win on a long landing page.
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "100px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="mx-auto w-full max-w-[520px]">
      <div ref={hostRef} className="relative aspect-square w-full">
      {/* A single soft pool of light behind the agent. One cheap radial
          gradient instead of a stack of blurred elements. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(circle at 50% 48%, rgba(0,168,168,0.20), transparent 62%)"
            : "radial-gradient(circle at 50% 48%, rgba(0,168,168,0.14), transparent 62%)",
        }}
      />

      {canRender3D === null && <StageSkeleton />}

      {canRender3D === true && (
        <SceneBoundary fallback={<StaticAgent />}>
          <AgentScene state={state} isDark={isDark} active={inView} />
          <AgentLoader />
        </SceneBoundary>
      )}

        {canRender3D === false && <StaticAgent />}
      </div>

      {/* State readout sits below the canvas in normal flow. Overlaid on the
          model it was unreadable — low-contrast type on a white robot. */}
      <div className="mt-2 flex items-center justify-center gap-2 text-xs text-ink-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
        {STATE_LABEL[state]}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function StageSkeleton() {
  return (
    <div className="grid h-full w-full place-items-center">
      <div className="h-28 w-28 rounded-full border border-line" />
    </div>
  );
}

/**
 * Pure-CSS agent shown when WebGL is unavailable or motion is reduced.
 * Same silhouette and palette, no canvas.
 */
function StaticAgent() {
  return (
    <div className="grid h-full w-full place-items-center p-10">
      <div className="relative">
        <div className="relative h-36 w-40 rounded-[2.25rem] border border-line bg-surface shadow-sm">
          <div className="absolute left-1/2 top-8 h-14 w-28 -translate-x-1/2 rounded-2xl bg-brand-900 dark:bg-black">
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-3.5">
              <span className="h-2 w-6 rounded-full bg-brand-600" />
              <span className="h-2 w-6 rounded-full bg-brand-600" />
            </div>
          </div>
          <span className="absolute -left-2.5 top-14 h-7 w-2.5 rounded-full bg-brand-700" />
          <span className="absolute -right-2.5 top-14 h-7 w-2.5 rounded-full bg-brand-700" />
        </div>
        <div className="relative mx-auto mt-2 h-14 w-48 rounded-[1.75rem] border border-line bg-surface shadow-sm">
          <span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand-700 bg-brand-600" />
        </div>
      </div>
    </div>
  );
}

/**
 * A driver crash or a corrupt model should degrade to the static agent, never
 * take the homepage down with it.
 */
class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[hero3d] scene failed, falling back to the static agent:", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
