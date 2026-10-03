---
title: Getting Started
description: Install Lumo Engine, create a project and run your first scene in a few minutes.
order: 1
---

## Install the engine

Download the Windows x64 build from the latest release, or grab it directly from the button on
the home page.

```text
https://github.com/lumoengineofficial/lumo/releases/download/v1.0.0/LumoEngine-v1.0.0-win-x64.zip
```

Unzip the archive anywhere on your machine and run `LumoEditor.exe`. The engine is portable —
nothing is written to the registry.

> Looking for another platform or an older build? Every published version lives on the
> [releases page](https://github.com/lumoengineofficial/lumo/releases).

## Create a project

1. Open the editor and choose **New project**.
2. Pick a template (empty, 3D third-person, or 2D platformer).
3. Choose a folder — this becomes your project root.

Your project folder looks like this:

```text
my-game/
├── Assets/          <- every asset pack lives here
├── Scenes/          <- .lumo scene files
├── Project.lumo     <- project manifest
└── Build/           <- output of exported builds
```

## Download your first asset

Head to the [store](/store) and download a pack. Free assets download instantly; paid assets
require an account.

Extract the zip so the pack folder sits inside `Assets/`:

```text
my-game/Assets/forest-ranger/
├── model.gltf
├── textures/
└── manifest.json
```

## Import in the editor

With the project open, choose **Assets → Import**. The asset browser refreshes automatically
and the pack appears with thumbnails, materials and animations already bound.

That is the whole workflow: **download → drop folder → import**.

## What to read next

- [Importing glTF models](/docs/importing-gltf-models) — mesh, material and animation details.
- [Building & exporting games](/docs/building-exporting-games) — ship to Windows, Web and mobile.
- [Asset Store API](/docs/asset-store-api) — query the catalogue from your own tools.
