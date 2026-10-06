export const SITE = {
  name: "Lumo Asset Store",
  shortName: "Lumo",
  tagline: "The official asset store for Lumo Engine",
  description:
    "Lumo Asset Store is the official marketplace for the open-source Lumo 3D game engine. Download 3D models, textures, sprites, audio, plugins and project templates — or publish your own.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://lumoassets.vercel.app",
  accent: "#cf6dfc",
  engineZip:
    "https://github.com/lumoengineofficial/lumo/releases/download/v1.0.0/LumoEngine-v1.0.0-win-x64.zip",
  releases: "https://github.com/lumoengineofficial/lumo/releases",
  repo: "https://github.com/lumoengineofficial/lumo",
  issues: "https://github.com/lumoengineofficial/lumo/issues",
} as const;

export const CATEGORIES = [
  "3D Models",
  "Textures & Materials",
  "Sprites & 2D",
  "Audio",
  "Plugins",
  "Templates",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_META: Record<
  string,
  { slug: string; blurb: string; icon: string }
> = {
  "3D Models": {
    slug: "3d-models",
    blurb: "Characters, props and environments ready to drop into a scene.",
    icon: "box",
  },
  "Textures & Materials": {
    slug: "textures-materials",
    blurb: "PBR texture sets and smart materials for any surface.",
    icon: "layers",
  },
  "Sprites & 2D": {
    slug: "sprites-2d",
    blurb: "UI kits, particle sprites and hand-drawn 2D art.",
    icon: "image",
  },
  Audio: {
    slug: "audio",
    blurb: "SFX loops, ambient beds and royalty-free music tracks.",
    icon: "wave",
  },
  Plugins: {
    slug: "plugins",
    blurb: "Editor extensions that add tools, panels and pipelines.",
    icon: "plug",
  },
  Templates: {
    slug: "templates",
    blurb: "Starter projects with gameplay loops wired up.",
    icon: "layout",
  },
};

export const LICENSES = [
  "MIT",
  "CC0 1.0",
  "CC BY 4.0",
  "Lumo Asset License",
  "Proprietary",
] as const;

export const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most downloaded" },
  { value: "rating", label: "Top rated" },
];

export const NAV_LINKS = [
  { href: "/store", label: "Store" },
  { href: "/plugins", label: "Plugins" },
  { href: "/docs", label: "Docs" },
  { href: "/api-docs", label: "API" },
] as const;

export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

export const PAGE_SIZE = 12;

/**
 * Assignable profile badges. Admins can grant any of these to any account
 * from /admin/users; the value is stored in `users.badges` (text[]).
 */
export const BADGES = {
  verified: { src: "/verified-badge.png", label: "Verified" },
  admin: { src: "/badge-admin.png", label: "Admin" },
  partner: { src: "/badge-partner.png", label: "Partner" },
  new: { src: "/user-badge.jpg", label: "New user", chip: true },
} as const;

export type BadgeKey = keyof typeof BADGES;

export const BADGE_KEYS = Object.keys(BADGES) as BadgeKey[];

export function isBadgeKey(value: unknown): value is BadgeKey {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(BADGES, value);
}

/** Assigned badges, falling back to role-based defaults before migration 0003. */
export function badgesFor(entity: {
  badges?: string[] | null;
  role?: string | null;
}): BadgeKey[] {
  const assigned = (Array.isArray(entity.badges) ? entity.badges : []).filter(isBadgeKey);
  if (assigned.length > 0) return assigned;
  return entity.role === "admin" ? ["verified", "admin"] : ["new"];
}
