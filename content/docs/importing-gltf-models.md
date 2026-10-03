---
title: Importing glTF models
description: How Lumo reads glTF 2.0 / GLB files, materials, animations and how to troubleshoot imports.
order: 2
---

## Why glTF

Lumo uses **glTF 2.0** as its interchange format. It is the closest thing to a native format for
real-time engines: compact binary buffers, PBR materials and a well-defined animation model.

Store packs that contain `.gltf` or `.glb` files import without conversion.

## Folder layout

A model pack should be self-contained:

```text
Assets/my-prop/
├── scene.glb          <- mesh + materials + animations
├── textures/
│   ├── albedo.png
│   ├── normal.png
│   └── metallic-roughness.png
└── manifest.json      <- optional metadata for the asset browser
```

Textures are resolved relative to the glTF file, so keep the folder structure intact when you
unzip a pack.

## Materials

Lumo maps the standard glTF metallic-roughness workflow:

| glTF channel | Lumo input |
| --- | --- |
| `baseColorTexture` | Albedo |
| `metallicRoughnessTexture` | Metallic / roughness |
| `normalTexture` | Normal |
| `occlusionTexture` | Ambient occlusion |
| `emissiveTexture` | Emission |

Unlit materials (`KHR_materials_unlit`) import as `Unlit/Color` shaders, which is ideal for UI
sprites and stylised props.

## Animations

Animation clips defined in the glTF file are imported as separate clips:

1. Select the imported model in the asset browser.
2. Open the **Animation** tab — every clip appears with its duration and loop mode.
3. Drag a clip onto an `Animator` component to build a state machine.

> Name your clips in the DCC tool before export (`Idle`, `Run`, `Jump`) — Lumo keeps the glTF
> clip names verbatim.

## Common issues

### The model imports at the wrong scale

glTF specifies metres. If your DCC tool works in centimetres, enable **Apply unit scale** on
export or set the pack's `scale` field in `manifest.json`:

```json
{ "scale": 0.01 }
```

### Textures are pink or missing

Check that the texture files ship inside the pack folder. Relative paths are required — absolute
paths from your machine are stripped on export.

### Animations do not play

Morph targets are supported, but skinning requires the mesh and skeleton to be exported from the
same glTF file. Re-export with **Include Skinning** enabled.
