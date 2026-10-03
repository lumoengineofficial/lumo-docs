---
title: Building & exporting games
description: Package your Lumo project for Windows, the web and mobile, with CI-friendly CLI builds.
order: 3
---

## Build targets

| Target | Extension | Notes |
| --- | --- | --- |
| Windows | `.exe` | x64, Vulkan / DirectX 11 |
| Web | `.zip` | WASM + WebGL2, deployable to any static host |
| Linux | binary | x64, experimental |
| Android | `.apk` | arm64, requires the Android SDK |

## Editor build

Open **Project → Build**:

1. Select the target platform.
2. Choose a scene list (the first scene is the entry point).
3. Press **Build**.

Output lands in `Build/<platform>/`.

## Headless builds

The editor ships a CLI so you can build from a terminal or CI job:

```bash
LumoEditor.exe --project ./my-game --build windows --out ./dist
```

Useful flags:

```text
--project      path to the project folder
--build        windows | web | linux | android
--out          output directory
--release      strip debug symbols and enable minification
--quiet        only print errors
```

### GitHub Actions example

```yaml
- name: Build Lumo game
  run: |
    ./LumoEditor.exe --project . --build web --out ./dist --release --quiet
- uses: actions/upload-artifact@v4
  with:
    name: web-build
    path: dist/
```

## Optimisation checklist

- **Textures** — set streaming on any texture larger than 1024px.
- **Audio** — export music as OGG (streamed) and SFX as WAV (memory).
- **Meshes** — enable mesh compression for props over 10k triangles.
- **Scenes** — mark heavy scenes as *async load* so the first frame stays fast.

## Publishing builds

Web builds are a folder of static files — drop them on Vercel, Netlify or any static server.
Windows builds are a single folder; zip it and ship it on itch.io or your own site.
