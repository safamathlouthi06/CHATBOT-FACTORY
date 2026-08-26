/**
 * Tuning surface for the hero's 3D agent.
 *
 * Everything the model needs in order to sit correctly in the canvas lives
 * here, so a freshly exported GLB can be dialled in without touching the
 * scene code. See public/models/PROMPTS.md for the export workflow.
 */

/**
 * Which export the hero should load.
 *
 * "none" keeps the procedural agent on screen. Switch to "obj" or "glb" once
 * the generated files are sitting in /public/models. In development the hero
 * also probes for those files and picks them up on refresh regardless of this
 * setting, so you can iterate on exports without editing code; production
 * trusts this field alone, which keeps a missing model from costing every
 * visitor a failed request.
 */
export const modelSource = {
  format: "glb" as "none" | "obj" | "glb",

  /** Hi3D and most image-to-3D tools export this trio. */
  obj: "/models/agent.obj",
  mtl: "/models/agent.mtl",

  /** Used when format is "glb". */
  glb: "/models/agent.glb",
};

export const agentConfig = {
  /**
   * The GLB is auto-fitted to a fixed height, so this is only a nudge on top
   * of that. 1 = the auto-fitted size.
   */
  scale: 1,

  /** Vertical nudge in scene units, applied after auto-centring. */
  yOffset: 0,

  /** Applied once at load, in radians — use if the export faces the wrong way. */
  baseRotation: [0, 0, 0] as [number, number, number],

  /**
   * If the export is split into named parts, put the head node's name here and
   * only that node will follow the cursor while the body stays put. Leave null
   * to rotate the whole model.
   */
  headNodeName: null as string | null,

  /** How far the agent turns toward the cursor, in radians. */
  maxYaw: 0.42,
  maxPitch: 0.26,

  /** Cursor-follow smoothing — lower is lazier. */
  followDamping: 3.2,

  /** Idle bob. */
  floatAmplitude: 0.09,
  floatSpeed: 1.15,
};

/** Palette for the procedural agent, matched to the Insomea brand. */
export const agentPalette = {
  shell: "#F4F7F7",
  shellDark: "#D8E6E6",
  visor: "#0B3C3C",
  accent: "#008080",
  accentBright: "#00A8A8",
  eye: "#3BF5F0",
  core: "#00D4D4",
};

/** The four states the agent cycles through alongside the chat demo. */
export type AgentState = "idle" | "listening" | "thinking" | "speaking";

/** Per-state visual response — drives eye glow, ring speed and head motion. */
export const stateProfile: Record<
  AgentState,
  { glow: number; ringSpeed: number; sway: number; eyeScaleY: number }
> = {
  idle:      { glow: 1.5, ringSpeed: 0.22, sway: 0.5, eyeScaleY: 1 },
  listening: { glow: 2.6, ringSpeed: 0.55, sway: 1.0, eyeScaleY: 1.18 },
  thinking:  { glow: 2.0, ringSpeed: 1.5,  sway: 0.3, eyeScaleY: 0.55 },
  speaking:  { glow: 3.4, ringSpeed: 0.9,  sway: 1.4, eyeScaleY: 1.05 },
};
