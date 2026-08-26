"use client";

import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import TrackedModel from "./TrackedModel";
import { modelSource, type AgentState } from "./agentConfig";

/**
 * Loads the OBJ + MTL + texture trio that Hi3D and most image-to-3D tools
 * export.
 *
 * MTLLoader produces MeshPhongMaterial, which ignores the scene's environment
 * map and reads flat next to the rest of the page. Every material is converted
 * to MeshStandardMaterial here so the export picks up the same studio lighting
 * the procedural agent uses.
 */
export default function OBJAgent({
  pointer,
  state,
}: {
  pointer: React.RefObject<{ x: number; y: number }>;
  state: AgentState;
}) {
  const materials = useLoader(MTLLoader, modelSource.mtl);

  const obj = useLoader(OBJLoader, modelSource.obj, (loader) => {
    materials.preload();
    (loader as OBJLoader).setMaterials(materials);
  });

  const converted = useMemo(() => {
    const clone = obj.clone(true);

    clone.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;

      const source = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

      mesh.material = source.map((mat) => {
        const phong = mat as THREE.MeshPhongMaterial;
        const std = new THREE.MeshStandardMaterial({
          map: phong.map ?? null,
          color: phong.color ? phong.color.clone() : new THREE.Color("#ffffff"),
          normalMap: phong.normalMap ?? null,
          roughness: 0.55,
          metalness: 0.05,
          side: THREE.FrontSide,
        });

        // Baked textures arrive already in sRGB; tagging them keeps the teal
        // from washing out under tone mapping.
        if (std.map) std.map.colorSpace = THREE.SRGBColorSpace;

        return std;
      });

      // Unwrap the single-element array so downstream code sees a plain material.
      if (Array.isArray(mesh.material) && mesh.material.length === 1) {
        mesh.material = mesh.material[0];
      }
    });

    return clone;
  }, [obj]);

  return <TrackedModel object={converted} pointer={pointer} state={state} />;
}
