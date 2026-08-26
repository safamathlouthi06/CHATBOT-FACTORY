"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/* ------------------------------------------------------------------ *
 * useInView — fires once, then disconnects.
 * ------------------------------------------------------------------ */

/**
 * Defaults to threshold 0 on purpose: a ratio-based threshold can never be met
 * by an element taller than the viewport, which would leave that content stuck
 * at opacity 0. The negative bottom rootMargin is what delays the trigger until
 * the element is properly on screen.
 */
export function useInView<T extends HTMLElement>(threshold = 0) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Never leave content hidden: if the browser cannot observe, or the visitor
    // asked for reduced motion, show it immediately.
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setSeen(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, seen };
}

/* ------------------------------------------------------------------ *
 * Reveal
 * ------------------------------------------------------------------ */

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  /** Stagger in milliseconds. */
  delay?: number;
  className?: string;
}) {
  const { ref, seen } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`reveal ${seen ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Counter — counts up the first time it is scrolled into view.
 * ------------------------------------------------------------------ */

export function Counter({
  to,
  suffix = "",
  decimals = 0,
  duration = 1400,
}: {
  to: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
}) {
  const { ref, seen } = useInView<HTMLSpanElement>(0.25);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(to);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t); // easeOutExpo
      setValue(to * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [seen, to, duration]);

  return (
    <span ref={ref}>
      {value.toLocaleString("fr-FR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Eyebrow — the small all-caps label that opens a section.
 * Replaces the icon-in-a-pill badge.
 * ------------------------------------------------------------------ */

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}
