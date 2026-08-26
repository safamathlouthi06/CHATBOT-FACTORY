"use client";

import { useProgress } from "@react-three/drei";

/**
 * Shown while the GLB streams in.
 *
 * Rendered as plain DOM over the canvas rather than as 3D geometry — a loading
 * state should not itself need the renderer to be warm.
 */
export default function AgentLoader() {
  const { progress, active } = useProgress();

  if (!active && progress >= 100) return null;

  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      <div className="flex w-40 flex-col items-center gap-3">
        <div className="h-px w-full overflow-hidden bg-line">
          <div
            className="h-full bg-brand-600 transition-[width] duration-300 ease-out"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <span className="text-xs tabular-nums text-ink-subtle">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}
