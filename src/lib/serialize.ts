import type { Asset } from "@/lib/types";
import type { Profile } from "@/lib/types";

/** Public JSON shape returned by GET /api/assets and GET /api/assets/[id]. */
export interface PublicAsset {
  id: string;
  title: string;
  slug: string;
  description: string;
  author: {
    id: string;
    username: string;
    handle: string;
    avatar: string | null;
  } | null;
  collaborators: {
    id: string;
    username: string;
    handle: string;
    avatar: string | null;
  }[];
  category: string;
  tags: string[];
  price: number;
  downloads: number;
  thumbnail: string;
  version: string;
  file: string;
  license: string;
  fileSize: number;
  rating: number;
  featured: boolean;
  status: string;
  createdAt: string;
}

export function publicAsset(asset: Asset): PublicAsset {
  const author: Profile | null = asset.author ?? null;
  return {
    id: asset.id,
    title: asset.title,
    slug: asset.slug,
    description: asset.description,
    author: author
      ? {
          id: author.id,
          username: author.username,
          handle: author.handle,
          avatar: author.avatar_url ?? null,
        }
      : null,
    collaborators: (asset.collaborators ?? []).map((person) => ({
      id: person.id,
      username: person.username,
      handle: person.handle,
      avatar: person.avatar_url ?? null,
    })),
    category: asset.category,
    tags: Array.isArray(asset.tags) ? asset.tags : [],
    price: Number(asset.price ?? 0),
    downloads: Number(asset.downloads ?? 0),
    thumbnail: asset.thumbnail_url,
    version: asset.version,
    file: asset.file_url,
    license: asset.license,
    fileSize: Number(asset.file_size ?? 0),
    rating: Number(asset.rating ?? 0),
    featured: Boolean(asset.featured),
    status: asset.status,
    createdAt: asset.created_at,
  };
}

export function publicUser(profile: Profile) {
  return {
    id: profile.id,
    email: profile.email,
    username: profile.username,
    handle: profile.handle,
    avatar: profile.avatar_url ?? null,
    role: profile.role,
    banned: Boolean(profile.banned),
    badges: profile.badges ?? null,
    createdAt: profile.created_at,
  };
}
