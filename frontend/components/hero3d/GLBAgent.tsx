"use client";

import { useGLTF } from "@react-three/drei";
import TrackedModel from "./TrackedModel";
import { modelSource, type AgentState } from "./agentConfig";

/**
 * Loads a GLB/GLTF export. Draco-compressed files work — drei's loader wires
 * the decoder up for us.
 */
export default function GLBAgent({
  pointer,
  state,
}: {
  pointer: React.RefObject<{ x: number; y: number }>;
  state: AgentState;
}) {
  const { scene } = useGLTF(modelSource.glb);
  return <TrackedModel object={scene} pointer={pointer} state={state} />;
}
