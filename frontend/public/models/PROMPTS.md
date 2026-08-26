# 3D AI Agent — Generation Guide

Drop the generated files in **this folder** (`frontend/public/models/`).
Until they land, a procedural three.js robot renders in the hero instead.

---

## STEP 1 — Generate the source image

Use Midjourney / Flux / DALL·E / Ideogram. **Generate 4 variants and pick the
cleanest silhouette** — the image quality caps the mesh quality, so this step
matters more than the conversion settings.

### Prompt (copy-paste)

```
3D product render of a friendly AI assistant robot head, chunky rounded
helmet-shaped skull with soft bevelled edges, wide glossy dark visor
covering the eye area in deep teal-black, two glowing horizontal
capsule-shaped eyes in bright cyan-teal, smooth matte off-white ceramic
shell, a thick teal accent band wrapping the back of the head, short
solid cylindrical neck resting on a rounded chest bust that stops at the
shoulders, small teal glowing core disc in the centre of the chest,
symmetrical, no arms.

Colours: off-white shell #F4F7F7, teal accents #008080, glowing eyes
#00A8A8, dark visor #0B3C3C.

Presentation: single isolated object centred in frame, filling about 85%
of the image, complete object fully visible with generous margin on all
sides, three-quarter front view, camera at eye level, 100mm telephoto
lens with flat perspective, pure solid white background, soft even
three-point studio softbox lighting, uniform illumination with no harsh
shadows and no cast shadow on the ground, matte finish, everything in
sharp focus.

--no text, letters, logos, watermark, chrome, mirror finish, glass,
transparency, thin antennae, thin wires, cables, arms, hands, depth of
field, blur, dramatic shadows, dark background, gradient background,
multiple objects, cropping
```

### Reject a variant if it has

- Any part of the head touching or cropped by the frame edge
- Thin antennae, wires or whiskers — image-to-3D reconstruction breaks on these
- Mirror-chrome or transparent glass — the mesh comes out warped and blobby
- A strong cast shadow merging the object into the ground plane
- Asymmetry between left and right

---

## STEP 2 — Convert to 3D with Hi3D

Upload the chosen image.

| Setting | Value | Why |
|---|---|---|
| Background removal | **On** | Needs a clean alpha cutout |
| Symmetry | **On** | The head is symmetrical; halves the artefacts |
| Texture | **On**, highest available | The teal has to be baked in |
| Polygon budget | **~50k–100k** | Enough detail, still loads fast on the web |
| Export format | **GLB** (OBJ also works) | One file, real PBR materials, far smaller |

---

## STEP 3 — Drop the files in

### Preferred: GLB

One file, texture embedded, nothing to keep in sync.

```
frontend/public/models/
  agent.glb
```

```ts
// components/hero3d/agentConfig.ts
export const modelSource = {
  format: "glb",   // was "none"
  ...
};
```

### Alternative: OBJ + MTL + texture

Put **all three** in `frontend/public/models/`, keeping the texture filename
exactly as exported — the `.mtl` references it by name, so renaming the texture
silently drops the material to grey.

```
frontend/public/models/
  agent.obj      <- rename the exported .obj to this
  agent.mtl      <- rename the exported .mtl to this
  <texture>.jpg  <- LEAVE THIS NAME ALONE
```

```ts
export const modelSource = { format: "obj", ... };
```

> If you rename the `.mtl`, open the `.obj` in a text editor and update the
> `mtllib` line at the top to match. If you rename the texture, update the
> `map_Kd` line in the `.mtl` the same way.

Note that OBJ/MTL carries only a diffuse map, so the loader has to guess
roughness and metalness. A GLB brings its real surface properties and reacts
properly to the hero's teal rim light.

In **development** the hero probes for these files and picks them up on refresh
even before you flip the flag. The flag is what makes it work in **production**,
so set it before deploying.

---

## STEP 4 — If the model sits wrong

The hero auto-centres the model and scales it to a fixed height, so it will
always be in frame. What it cannot guess is orientation. Tune in
`agentConfig.ts` rather than re-exporting:

- `baseRotation` — `[0, Math.PI, 0]` if the export faces away from camera
- `scale` — 1 is the auto-fitted size; nudge to 1.1 / 0.9 to taste
- `yOffset` — vertical nudge if the head should sit higher in the panel
- `headNodeName` — set to the head mesh's node name if the export is split into
  parts, and only the head will track the cursor
- `maxYaw` / `maxPitch` — how far it turns toward the cursor

Inspect node names by dragging the file into https://gltf-viewer.donmccurdy.com

---

## Optional — keep the file small

Image-to-3D exports are often 20 MB+, which is slow on a landing page. Convert
to a Draco-compressed GLB:

```bash
# from frontend/public/models/
npx obj2gltf -i agent.obj -o agent.glb
npx gltf-transform optimize agent.glb agent.glb --texture-size 1024 --compress draco
```

Then set `format: "glb"` instead. Aim for under ~5 MB.
