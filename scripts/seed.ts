/**
 * Seeds the Supabase project with demo data:
 *   - 2 users (admin@lumo.dev + publisher@lumo.dev)
 *   - 12 assets across every store category
 *   - ratings, download counters and homepage features
 *
 * Usage:  cp .env.example .env.local  →  npm run seed
 */
import { config as loadEnv } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { makeZip, type ZipEntry } from "./zip";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const SEED_PASSWORD = process.env.SEED_PASSWORD ?? "lumo-demo-2026";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Copy .env.example to .env.local and fill in your Supabase project values first.",
  );
  process.exit(1);
}

const db: SupabaseClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/['"`]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "asset"
  );
}

interface SeedAsset {
  title: string;
  category: string;
  author: "admin" | "publisher";
  price: number;
  downloads: number;
  tags: string[];
  license: string;
  version: string;
  sizeMb: number;
  featured?: boolean;
  rating?: { stars: number; by: "admin" | "publisher" }[];
  description: string;
}

const ASSETS: SeedAsset[] = [
  {
    title: "Forest Ranger Character",
    category: "3D Models",
    author: "publisher",
    price: 12.99,
    downloads: 8421,
    tags: ["character", "humanoid", "ranger", "rigged"],
    license: "CC BY 4.0",
    version: "1.3.0",
    sizeMb: 42,
    featured: true,
    rating: [
      { stars: 5, by: "admin" },
      { stars: 4, by: "publisher" },
    ],
    description:
      "A fully rigged low-poly forest ranger with 14 animations (idle, walk, run, climb, chop, aim), 4K PBR textures and a clean glTF export.\n\nIncludes LOD0-LOD2, a hair card setup that survives skinning and a Unity-free prefab manifest so Lumo can rebuild it instantly.",
  },
  {
    title: "Modular Sci-Fi Corridor Kit",
    category: "3D Models",
    author: "admin",
    price: 0,
    downloads: 15320,
    tags: ["scifi", "modular", "environment", "kitbash"],
    license: "CC0 1.0",
    version: "2.0.1",
    sizeMb: 28,
    featured: true,
    rating: [
      { stars: 5, by: "publisher" },
      { stars: 5, by: "admin" },
    ],
    description:
      "48 modular corridor, door and junction pieces that snap on a 2m grid. Every piece shares one atlas so the whole level fits in 4 draw calls.\n\nShips with emissive trim variants, an airlock door with a ready-made state machine and a sample scene.",
  },
  {
    title: "Low-Poly Village Props",
    category: "3D Models",
    author: "publisher",
    price: 6.5,
    downloads: 3904,
    tags: ["props", "village", "stylized"],
    license: "CC BY 4.0",
    version: "1.1.0",
    sizeMb: 19,
    rating: [{ stars: 4, by: "admin" }],
    description:
      "62 hand-modelled village props: crates, barrels, market stalls, fences, wagons and a well. Vertex counts stay under 900 per prop so they are safe for mobile targets.",
  },
  {
    title: "PBR Surface Pack: Concrete",
    category: "Textures & Materials",
    author: "publisher",
    price: 0,
    downloads: 12044,
    tags: ["pbr", "concrete", "4k", "seamless"],
    license: "CC0 1.0",
    version: "1.0.4",
    sizeMb: 88,
    featured: true,
    rating: [{ stars: 5, by: "admin" }],
    description:
      "20 seamless concrete surfaces in 4K with albedo, normal, roughness, AO and height maps. Includes cracked, polished, tiled and rain-stained variants plus a triplanar shader graph for cliffs and pillars.",
  },
  {
    title: "Stylized Rock Materials",
    category: "Textures & Materials",
    author: "admin",
    price: 4.99,
    downloads: 2711,
    tags: ["stylized", "rock", "hand-painted"],
    license: "Lumo Asset License",
    version: "1.2.0",
    sizeMb: 46,
    rating: [{ stars: 4, by: "publisher" }],
    description:
      "Hand-painted rock and cliff materials with a matching particle decal set. Tuned for the Lumo stylised lit shader — drop them on a terrain and they blend along slope masks automatically.",
  },
  {
    title: "Neon UI Kit — HUD & Menus",
    category: "Sprites & 2D",
    author: "publisher",
    price: 0,
    downloads: 9876,
    tags: ["ui", "hud", "neon", "9-slice"],
    license: "CC BY 4.0",
    version: "3.0.0",
    sizeMb: 12,
    featured: true,
    rating: [
      { stars: 5, by: "admin" },
      { stars: 4, by: "publisher" },
    ],
    description:
      "140 UI sprites: bars, buttons, panels, minimaps, damage numbers and a full settings screen. Every panel is 9-slice ready and the fonts ship as bitmap + vector pairs.",
  },
  {
    title: "2D Platformer Sprite Sheet",
    category: "Sprites & 2D",
    author: "publisher",
    price: 3.99,
    downloads: 5130,
    tags: ["2d", "platformer", "spritesheet", "animation"],
    license: "CC BY 4.0",
    version: "1.4.2",
    sizeMb: 9,
    rating: [{ stars: 4, by: "admin" }],
    description:
      "A 96-frame hero sheet (run, jump, fall, attack, hurt, death), 14 enemies and 30 environment tiles. Includes Aseprite sources and a JSON atlas the Lumo importer understands out of the box.",
  },
  {
    title: "Footstep Pack Vol. 1",
    category: "Audio",
    author: "publisher",
    price: 0,
    downloads: 6712,
    tags: ["sfx", "footsteps", "foley"],
    license: "CC0 1.0",
    version: "1.2.0",
    sizeMb: 34,
    rating: [{ stars: 5, by: "admin" }],
    description:
      "180 royalty-free footsteps across 6 surfaces (grass, gravel, wood, metal, snow, concrete) with 5 variations per surface, ready for randomised playback in the Lumo audio graph.",
  },
  {
    title: "Ambient Dungeon Loops",
    category: "Audio",
    author: "admin",
    price: 2.99,
    downloads: 1985,
    tags: ["ambient", "loops", "dungeon", "music"],
    license: "Lumo Asset License",
    version: "1.0.1",
    sizeMb: 64,
    rating: [{ stars: 4, by: "publisher" }],
    description:
      "Eight seamless 2-minute ambient beds — dripping tunnels, distant chains, low wind — plus a stinger set for encounters. Loops are zero-crossing aligned so they never click.",
  },
  {
    title: "Scene Optimizer Plugin",
    category: "Plugins",
    author: "admin",
    price: 0,
    downloads: 4302,
    tags: ["editor", "optimization", "profiler"],
    license: "MIT",
    version: "2.1.0",
    sizeMb: 2,
    featured: true,
    rating: [
      { stars: 5, by: "publisher" },
      { stars: 5, by: "admin" },
    ],
    description:
      "An editor panel that batches static meshes, strips unused materials and reports overdraw per camera. One click applies every safe fix and writes a report you can diff in CI.",
  },
  {
    title: "Build Pipeline CI Plugin",
    category: "Plugins",
    author: "publisher",
    price: 8,
    downloads: 1240,
    tags: ["ci", "build", "automation", "cli"],
    license: "MIT",
    version: "1.5.0",
    sizeMb: 3,
    rating: [{ stars: 4, by: "admin" }],
    description:
      "Headless build orchestration for GitHub Actions and GitLab CI: matrix builds, artefact signing, itch.io upload and a YAML config that mirrors your local build settings exactly.",
  },
  {
    title: "Third-Person Starter Template",
    category: "Templates",
    author: "admin",
    price: 0,
    downloads: 7455,
    tags: ["template", "third-person", "starter", "controller"],
    license: "MIT",
    version: "1.0.0",
    sizeMb: 24,
    featured: true,
    rating: [
      { stars: 5, by: "publisher" },
      { stars: 4, by: "admin" },
    ],
    description:
      "A complete project scaffold: third-person controller with camera collision, an inventory system, save/load, a settings menu and a sample level that runs at 120fps on a mid-range GPU.",
  },
];

const PROFILES = {
  admin: {
    email: "admin@lumo.dev",
    username: "Lumo Team",
    handle: "lumoteam",
    role: "admin" as const,
    bio: "Core maintainer of Lumo Engine. Shipping the engine, the editor and this store.",
    website: "https://github.com/lumoengineofficial/lumo",
  },
  publisher: {
    email: "publisher@lumo.dev",
    username: "Riley Park",
    handle: "rileypark",
    role: "user" as const,
    bio: "Environment artist and toolmaker. Modular kits, PBR packs and editor plugins for Lumo.",
    website: "https://rileypark.dev",
  },
};

function buildZip(title: string, slug: string, asset: SeedAsset): Buffer {
  const manifest = {
    name: title,
    slug,
    version: asset.version,
    category: asset.category,
    license: asset.license,
    lumo: { minVersion: "1.0.0", import: "folder" },
    tags: asset.tags,
  };

  const readme = `# ${title}

Thanks for downloading this demo pack from the Lumo Asset Store.

Version:  ${asset.version}
License:  ${asset.license}
Category: ${asset.category}

## Install
1. Unzip this file into your project's Assets/ folder
2. Open the Lumo editor → Assets → Import
3. The pack appears in the asset browser

Docs: https://<your-deployment>/docs
Issues: https://github.com/lumoengineofficial/lumo/issues
`;

  const entries: ZipEntry[] = [
    { name: `${slug}/README.md`, content: readme },
    { name: `${slug}/manifest.json`, content: JSON.stringify(manifest, null, 2) },
    {
      name: `${slug}/placeholder.txt`,
      content: "Demo seed asset — replace with real content before publishing.\n",
    },
  ];
  return makeZip(entries);
}

async function ensureUser(key: "admin" | "publisher"): Promise<string> {
  const profile = PROFILES[key];

  const { data: list } = await db.auth.admin.listUsers({ perPage: 200 });
  let user = list?.users.find((u) => u.email === profile.email);

  if (!user) {
    const { data, error } = await db.auth.admin.createUser({
      email: profile.email,
      password: SEED_PASSWORD,
      email_confirm: true,
      user_metadata: { username: profile.username, handle: profile.handle },
    });
    if (error) throw new Error(`Could not create ${profile.email}: ${error.message}`);
    user = data.user;
    console.log(`  + created ${profile.email} (password: ${SEED_PASSWORD})`);
  } else {
    console.log(`  = ${profile.email} already exists`);
  }

  const { error: upsertError } = await db.from("users").upsert({
    id: user.id,
    email: profile.email,
    username: profile.username,
    handle: profile.handle,
    role: profile.role,
    bio: profile.bio,
    website: profile.website,
    avatar_url: `https://picsum.photos/seed/${profile.handle}/240/240`,
  });
  if (upsertError) console.warn(`  ! profile upsert (${profile.email}):`, upsertError.message);

  return user.id;
}

async function uploadZip(userId: string, slug: string, buffer: Buffer): Promise<string | null> {
  const path = `${userId}/${slug}.zip`;
  const { error } = await db.storage.from("assets").upload(path, buffer, {
    contentType: "application/zip",
    upsert: true,
  });
  if (error) {
    console.warn(`  ! storage upload failed for ${slug}: ${error.message}`);
    return null;
  }
  return db.storage.from("assets").getPublicUrl(path).data.publicUrl;
}

async function main() {
  console.log("Seeding Lumo Asset Store…");

  const ids = {
    admin: await ensureUser("admin"),
    publisher: await ensureUser("publisher"),
  };

  let uploaded = 0;
  let seeded = 0;

  for (const asset of ASSETS) {
    const slug = slugify(asset.title);
    const authorId = ids[asset.author];
    const thumbnail = `https://picsum.photos/seed/${slug}/1200/750`;
    const zip = buildZip(asset.title, slug, asset);
    let fileUrl = await uploadZip(authorId, slug, zip);
    if (fileUrl) uploaded += 1;
    else
      fileUrl =
        "https://github.com/lumoengineofficial/lumo/releases/download/v1.0.0/LumoEngine-v1.0.0-win-x64.zip";

    const { error } = await db.from("assets").upsert(
      {
        author_id: authorId,
        title: asset.title,
        slug,
        description: asset.description,
        category: asset.category,
        tags: asset.tags,
        price: asset.price,
        license: asset.license,
        version: asset.version,
        file_url: fileUrl,
        thumbnail_url: thumbnail,
        file_size: Math.round(asset.sizeMb * 1024 * 1024),
        downloads: asset.downloads,
        status: "approved",
        featured: Boolean(asset.featured),
        review_note: null,
      },
      { onConflict: "slug" },
    );

    if (error) {
      console.warn(`  ! asset ${slug}:`, error.message);
      continue;
    }
    seeded += 1;

    const { data: row } = await db.from("assets").select("id").eq("slug", slug).single();
    if (row && asset.rating) {
      for (const rating of asset.rating) {
        await db.from("ratings").upsert(
          {
            asset_id: row.id,
            user_id: ids[rating.by],
            stars: rating.stars,
          },
          { onConflict: "asset_id,user_id" },
        );
      }
    }
  }

  const { count } = await db.from("assets").select("id", { count: "exact", head: true });

  console.log("\nDone.");
  console.log(`  assets:   ${seeded} seeded (${count ?? 0} total in project)`);
  console.log(`  zips:     ${uploaded}/${ASSETS.length} uploaded to storage`);
  console.log("  users:    admin@lumo.dev (admin), publisher@lumo.dev (publisher)");
  console.log(`  password: ${SEED_PASSWORD}`);
}

main().catch((error) => {
  console.error("\nSeed failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
