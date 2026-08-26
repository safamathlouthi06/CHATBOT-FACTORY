"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { agentConfig, stateProfile, type AgentState } from "./agentConfig";

/**
 * Every loaded model is normalised to this height, whatever it exported at.
 * The camera sees roughly 3.1 units at the origin, so this leaves margin for
 * the idle float without clipping the bust against the canvas edge.
 */
const TARGET_HEIGHT = 2.35;

/**
 * Takes any loaded Object3D and makes it behave like the hero agent: centred,
 * scaled to a predictable size, gently floating, and turning to follow the
 * cursor.
 *
 * Both the GLB and the OBJ paths funnel through here, so the two exports
 * behave identically on screen.
 */
export default function TrackedModel({
  object,
  pointer,
  state,
}: {
  object: THREE.Object3D;
  pointer: React.RefObject<{ x: number; y: number }>;
  state: AgentState;
}) {
  const root = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);

  const profile = stateProfile[state];

  // Clone so repeated mounts (theme change, route re-entry) never mutate the
  // instance sitting in the loader's global cache.
  const model = useMemo(() => {
    const clone = object.clone(true);

    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const fit = size.y > 0.0001 ? TARGET_HEIGHT / size.y : 1;
    clone.position.sub(center);

    clone.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      // Photogrammetry-style exports frequently ship inverted or missing
      // normals; recomputing keeps the lighting from going blotchy.
      if (mesh.geometry && !mesh.geometry.attributes.normal) {
        mesh.geometry.computeVertexNormals();
      }
    });

    const wrapper = new THREE.Group();
    wrapper.add(clone);
    wrapper.scale.setScalar(fit * agentConfig.scale);
    wrapper.position.y = agentConfig.yOffset;
    wrapper.rotation.fromArray(agentConfig.baseRotation);
    return wrapper;
  }, [object]);

  // If the export is split into parts, only the named head node follows the
  // cursor and the body stays put.
  const headNode = useMemo(() => {
    if (!agentConfig.headNodeName) return null;
    return model.getObjectByName(agentConfig.headNodeName) ?? null;
  }, [model]);

  useEffect(() => {
    if (agentConfig.headNodeName && !headNode) {
      console.warn(
        `[hero3d] headNodeName "${agentConfig.headNodeName}" was not found in the model. ` +
          `Rotating the whole model instead.`
      );
    }
  }, [headNode]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const t = performance.now() / 1000;
    const p = pointer.current ?? { x: 0, y: 0 };

    if (root.current) {
      root.current.position.y =
        Math.sin(t * agentConfig.floatSpeed) * agentConfig.floatAmplitude;
    }

    const target = headNode ?? spin.current;
    if (target) {
      const sway = Math.sin(t * 2.1) * 0.02 * profile.sway;
      target.rotation.y = THREE.MathUtils.damp(
        target.rotation.y,
        p.x * agentConfig.maxYaw + sway,
        agentConfig.followDamping,
        delta
      );
      // Not negated: pointer.y is -1 at the top of the viewport, and a positive
      // rotation.x pitches the face downward. Negating it made the agent look
      // down when the cursor went up.
      target.rotation.x = THREE.MathUtils.damp(
        target.rotation.x,
        p.y * agentConfig.maxPitch,
        agentConfig.followDamping,
        delta
      );
    }
  });

  return (
    <group ref={root}>
      <group ref={spin}>
        <primitive object={model} />
      </group>
    </group>
  );
}
