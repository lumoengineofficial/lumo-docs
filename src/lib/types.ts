export type Role = "user" | "admin";

export type AssetStatus = "draft" | "pending" | "approved" | "rejected";

export type SortKey = "newest" | "popular" | "rating";

export interface Profile {
  id: string;
  email: string | null;
  username: string;
  handle: string;
  avatar_url: string | null;
  role: Role;
  banned: boolean;
  badges?: string[] | null;
  bio: string | null;
  website: string | null;
  created_at: string;
}

export interface Asset {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  license: string;
  version: string;
  file_url: string;
  thumbnail_url: string;
  file_size: number;
  downloads: number;
  status: AssetStatus;
  featured: boolean;
  review_note: string | null;
  created_at: string;
  rating?: number;
  rating_count?: number;
  author?: Profile | null;
  collaborators?: Profile[] | null;
}

export interface AssetFilters {
  q?: string;
  category?: string;
  price?: "all" | "free" | "paid";
  sort?: SortKey;
  page?: number;
  perPage?: number;
  status?: AssetStatus | "all";
  authorId?: string;
  featured?: boolean;
}

export interface PagedAssets {
  items: Asset[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
}

export interface StoreStats {
  assets: number;
  downloads: number;
  creators: number;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}
