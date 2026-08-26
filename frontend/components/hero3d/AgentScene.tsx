"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { modelSource, type AgentState } from "./agentConfig";

// Kept out of the main bundle: the loader for whichever format is configured
// is the only one that ships.
const GLBAgent = lazy(() => import("./GLBAgent"));
const OBJAgent = lazy(() => import("./OBJAgent"));

type Pointer = { x: number; y: number };

/**
 * The hero canvas.
 *
 * Performance notes, since this runs behind a whole landing page:
 *  - No shadow map. A cast-shadow pass re-renders the scene every frame; on a
 *    single floating object it buys almost nothing visually.
 *  - Lighting comes from Lightformers rather than an HDRI preset, so nothing is
 *    fetched from a CDN and the env map is tiny and rendered once.
 *  - Device pixel ratio is capped, then walked down further by
 *    PerformanceMonitor if the frame rate sags on a weak GPU.
 *  - The render loop stops entirely when the hero scrolls out of view.
 */
export default function AgentScene({
  state,
  isDark,
  active,
}: {
  state: AgentState;
  isDark: boolean;
  /** False when the hero is scrolled out of view — pauses the render loop. */
  active: boolean;
}) {
  // Written by a listener rather than React state: the pointer changes far too
  // often to re-render on, and the frame loop reads it directly.
  const pointer = useRef<Pointer>({ x: 0, y: 0 });
  const [dpr, setDpr] = useState(1.5);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      // Normalised to roughly -1..1 across the viewport.
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onLeave = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={dpr}
      camera={{ position: [0, 0.1, 5.2], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = isDark ? 1.1 : 1.0;
      }}
      style={{ background: "transparent" }}
    >
      {/* Walk resolution down on weak GPUs rather than dropping frames. */}
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} flipflops={2} />

      <ambientLight intensity={isDark ? 0.6 : 0.95} />

      {/* Key light, upper front-left */}
      <directionalLight position={[3.2, 4, 4.5]} intensity={isDark ? 1.4 : 2} />

      {/* Teal rim from behind-right — this is what sells the brand colour */}
      <directionalLight position={[-4, 1.4, -3]} intensity={isDark ? 3.2 : 2} color="#00A8A8" />

      {/* Soft fill from below so the chin never goes black */}
      <pointLight position={[0, -2.6, 2.4]} intensity={isDark ? 1.6 : 1.1} color="#008080" />

      {/* Studio reflections generated in-engine. 64px is plenty for a matte
          surface and costs a fraction of a full-size env map. */}
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={isDark ? 1.3 : 2} position={[0, 3, 3]} scale={[8, 4, 1]} />
        <Lightformer
          form="rect"
          intensity={isDark ? 2.8 : 1.5}
          color="#00A8A8"
          position={[-4, 1, -2]}
          scale={[6, 6, 1]}
        />
        <Lightformer
          form="circle"
          intensity={1.1}
          color="#D9F3F3"
          position={[3, -1, 2]}
          scale={[3, 3, 1]}
        />
      </Environment>

      {/* No 3D fallback: while the model streams, AgentStage shows a DOM
          progress readout over the canvas. */}
      <Suspense fallback={null}>
        {modelSource.format === "glb" && <GLBAgent pointer={pointer} state={state} />}
        {modelSource.format === "obj" && <OBJAgent pointer={pointer} state={state} />}
      </Suspense>
    </Canvas>
  );
}
