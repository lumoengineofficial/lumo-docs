import { PAGE_SIZE } from "@/lib/constants";
import { getServerClient, supabaseConfigured } from "@/lib/supabase";
import { slugify } from "@/lib/utils";
import type {
  Asset,
  AssetFilters,
  AssetStatus,
  PagedAssets,
  Profile,
  StoreStats,
} from "@/lib/types";

const ASSET_VIEW = "assets_public";
const ASSET_TABLE = "assets";

const ASSET_COLUMNS = "*";

function emptyPage(page = 1, perPage = PAGE_SIZE): PagedAssets {
  return { items: [], total: 0, page, perPage, pageCount: 0 };
}

function safeSanitize(q: string): string {
  return q.replace(/[,%()'"]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

async function hydrateAuthors(items: Asset[]): Promise<Asset[]> {
  if (items.length === 0) return [];
  const client = getServerClient();

  const collabByAsset = new Map<string, string[]>();
  try {
    const { data } = await client
      .from("asset_collaborators")
      .select("asset_id, user_id")
      .in("asset_id", items.map((a) => a.id));
    for (const row of data ?? []) {
      const list = collabByAsset.get(row.asset_id) ?? [];
      list.push(row.user_id);
      collabByAsset.set(row.asset_id, list);
    }
  } catch {
    // migration 0004 not applied yet - assets simply have no collaborators
  }

  const ids = Array.from(
    new Set([...items.map((a) => a.author_id), ...Array.from(collabByAsset.values()).flat()]),
  );
  const { data } = await client.from("users").select("*").in("id", ids);
  const map = new Map<string, Profile>((data ?? []).map((u) => [u.id, u as Profile]));

  return items.map((a) => ({
    ...a,
    author: map.get(a.author_id) ?? null,
    collaborators: (collabByAsset.get(a.id) ?? [])
      .map((id) => map.get(id))
      .filter((profile): profile is Profile => Boolean(profile)),
  }));
}

/** Owned + co-authored asset ids for a profile (used by author pages). */
async function ownedAndCollaboratedIds(authorId: string): Promise<string[]> {
  const client = getServerClient();
  const { data: owned } = await client
    .from(ASSET_TABLE)
    .select("id")
    .eq("author_id", authorId);
  const ids = (owned ?? []).map((row) => String(row.id));
  try {
    const { data: collab } = await client
      .from("asset_collaborators")
      .select("asset_id")
      .eq("user_id", authorId);
    for (const row of collab ?? []) {
      if (!ids.includes(row.asset_id)) ids.push(row.asset_id);
    }
  } catch {
    // migration 0004 not applied yet
  }
  return ids;
}

/** Picker search for the publish form: active accounts matching a name/handle. */
export async function searchProfiles(q: string, excludeId?: string): Promise<Profile[]> {
  if (!supabaseConfigured) return [];
  const term = q.replace(/[,%()'"]/g, " ").replace(/\s+/g, " ").trim().slice(0, 40);
  if (!term) return [];
  const client = getServerClient();
  const { data } = await client
    .from("users")
    .select("*")
    .eq("banned", false)
    .or(`username.ilike.%${term}%,handle.ilike.%${term}%`)
    .limit(8);
  return ((data ?? []) as unknown as Profile[]).filter((profile) => profile.id !== excludeId);
}

/**
 * Public asset listing with search, filters, sorting and pagination.
 * Falls back to the base table if the ratings view is unavailable.
 */
export async function listAssets(filters: AssetFilters = {}): Promise<PagedAssets> {
  if (!supabaseConfigured) return emptyPage(filters.page, filters.perPage);

  const page = Math.max(1, filters.page ?? 1);
  const perPage = Math.max(1, Math.min(48, filters.perPage ?? PAGE_SIZE));
  const from = (page - 1) * perPage;
  const sort = filters.sort ?? "newest";

  // Owned + co-authored assets so collaborators show up on shared profiles.
  let authorAssetIds: string[] | null = null;
  if (filters.authorId) {
    authorAssetIds = await ownedAndCollaboratedIds(filters.authorId);
    if (authorAssetIds.length === 0) return emptyPage(page, perPage);
  }

  const run = async (source: string): Promise<PagedAssets | null> => {
    const client = getServerClient();
    let query = client
      .from(source)
      .select(ASSET_COLUMNS, { count: "exact" });

    if (authorAssetIds) query = query.in("id", authorAssetIds);
    if (filters.featured) query = query.eq("featured", true);
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status as AssetStatus);
    } else if (!filters.authorId && !filters.status) {
      query = query.eq("status", "approved");
    }

    if (filters.category) query = query.eq("category", filters.category);

    if (filters.price === "free") query = query.eq("price", 0);
    if (filters.price === "paid") query = query.gt("price", 0);

    const q = filters.q ? safeSanitize(filters.q) : "";
    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);

    if (sort === "popular") query = query.order("downloads", { ascending: false });
    else if (sort === "rating" && source === ASSET_VIEW)
      query = query.order("rating", { ascending: false }).order("downloads", { ascending: false });
    else if (sort === "rating") query = query.order("downloads", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    query = query.range(from, from + perPage - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    const items = await hydrateAuthors((data ?? []) as unknown as Asset[]);
    const total = count ?? items.length;
    return {
      items,
      total,
      page,
      perPage,
      pageCount: Math.max(1, Math.ceil(total / perPage)),
    };
  };

  try {
    return (await run(ASSET_VIEW)) ?? emptyPage(page, perPage);
  } catch {
    try {
      return (await run(ASSET_TABLE)) ?? emptyPage(page, perPage);
    } catch {
      return emptyPage(page, perPage);
    }
  }
}

export async function getAssetBySlug(slug: string): Promise<Asset | null> {
  if (!supabaseConfigured) return null;
  try {
    const client = getServerClient();
    const { data, error } = await client
      .from(ASSET_VIEW)
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) throw error ?? new Error("not found");
    const [asset] = await hydrateAuthors([data as unknown as Asset]);
    return asset ?? null;
  } catch {
    const client = getServerClient();
    const { data } = await client
      .from(ASSET_TABLE)
      .select("*")
      .eq("slug", slug)
      .eq("status", "approved")
      .maybeSingle();
    if (!data) return null;
    const [asset] = await hydrateAuthors([data as unknown as Asset]);
    return asset ?? null;
  }
}

export async function getAssetById(
  id: string,
  opts: { anyStatus?: boolean } = {},
): Promise<Asset | null> {
  if (!supabaseConfigured) return null;
  const client = getServerClient();
  let query = client.from(ASSET_TABLE).select("*").eq("id", id);
  if (!opts.anyStatus) query = query.eq("status", "approved");
  const { data } = await query.maybeSingle();
  if (!data) return null;
  const [asset] = await hydrateAuthors([data as unknown as Asset]);
  return asset ?? null;
}

/** Loads an asset by id or slug — used by the public API. */
export async function getAssetByIdOrSlug(
  key: string,
  opts: { anyStatus?: boolean } = {},
): Promise<Asset | null> {
  if (!supabaseConfigured || !key) return null;
  const client = getServerClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key);
  let query = client.from(ASSET_TABLE).select("*");
  query = isUuid ? query.eq("id", key) : query.eq("slug", key);
  if (!opts.anyStatus) query = query.eq("status", "approved");
  const { data } = await query.maybeSingle();
  if (!data) return null;
  const [asset] = await hydrateAuthors([data as unknown as Asset]);
  return asset ?? null;
}

export async function getFeaturedAssets(limit = 8): Promise<Asset[]> {
  if (!supabaseConfigured) return [];
  const { items } = await listAssets({ featured: true, perPage: limit, sort: "newest" });
  if (items.length >= limit) return items;
  const extra = await listAssets({ perPage: limit, sort: "popular" });
  const seen = new Set(items.map((a) => a.id));
  return [...items, ...extra.items.filter((a) => !seen.has(a.id))].slice(0, limit);
}

export async function getRelatedAssets(asset: Asset, limit = 4): Promise<Asset[]> {
  const sameCategory = await listAssets({ category: asset.category, perPage: limit + 1 });
  const filtered = sameCategory.items.filter((a) => a.id !== asset.id);
  if (filtered.length >= limit) return filtered.slice(0, limit);
  const popular = await listAssets({ perPage: limit, sort: "popular" });
  const seen = new Set([asset.id, ...filtered.map((a) => a.id)]);
  return [...filtered, ...popular.items.filter((a) => !seen.has(a.id))].slice(0, limit);
}

/** Number of approved assets per category (single query, counted in JS). */
export async function getCategoryCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  if (!supabaseConfigured) return counts;
  try {
    const client = getServerClient();
    const { data } = await client
      .from(ASSET_TABLE)
      .select("category")
      .eq("status", "approved")
      .limit(10_000);
    for (const row of data ?? []) {
      const key = String(row.category ?? "");
      counts[key] = (counts[key] ?? 0) + 1;
    }
  } catch {
    return counts;
  }
  return counts;
}

export async function getStoreStats(): Promise<StoreStats> {  if (!supabaseConfigured) return { assets: 0, downloads: 0, creators: 0 };
  const client = getServerClient();
  const [assets, creators, downloads] = await Promise.all([
    client
      .from(ASSET_TABLE)
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),
    client.from("users").select("id", { count: "exact", head: true }),
    client
      .from(ASSET_TABLE)
      .select("downloads")
      .eq("status", "approved")
      .limit(5000),
  ]);
  const downloadTotal = (downloads.data ?? []).reduce(
    (sum, row) => sum + Number(row.downloads ?? 0),
    0,
  );
  return {
    assets: assets.count ?? 0,
    creators: creators.count ?? 0,
    downloads: downloadTotal,
  };
}

export async function getProfileById(id: string): Promise<Profile | null> {
  if (!supabaseConfigured || !id) return null;
  const client = getServerClient();
  const { data } = await client.from("users").select("*").eq("id", id).maybeSingle();
  return (data as unknown as Profile) ?? null;
}

export async function getProfileByHandle(handle: string): Promise<Profile | null> {
  if (!supabaseConfigured) return null;
  const client = getServerClient();
  const { data } = await client
    .from("users")
    .select("*")
    .ilike("handle", handle)
    .maybeSingle();
  return (data as unknown as Profile) ?? null;
}

export async function getAuthorAssets(authorId: string): Promise<Asset[]> {
  const { items } = await listAssets({
    authorId,
    status: "approved",
    perPage: 48,
    sort: "newest",
  });
  return items;
}

export async function listMyAssets(authorId: string): Promise<Asset[]> {
  if (!supabaseConfigured) return [];
  const client = getServerClient();
  const { data } = await client
    .from(ASSET_TABLE)
    .select("*")
    .eq("author_id", authorId)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as Asset[];
}

/** Admin/moderation listing — sees every status, no RLS restrictions. */
export async function listAssetsForModeration(
  status: AssetStatus | "all" = "pending",
): Promise<Asset[]> {
  if (!supabaseConfigured) return [];
  const client = getServerClient();
  let query = client
    .from(ASSET_TABLE)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) return [];
  return hydrateAuthors((data ?? []) as unknown as Asset[]);
}

export async function listUsers(): Promise<Profile[]> {
  if (!supabaseConfigured) return [];
  const client = getServerClient();
  const { data } = await client
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as Profile[];
}

export interface AdminStats {
  totalAssets: number;
  approved: number;
  pending: number;
  rejected: number;
  totalUsers: number;
  totalDownloads: number;
  featured: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const zero: AdminStats = {
    totalAssets: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalUsers: 0,
    totalDownloads: 0,
    featured: 0,
  };
  if (!supabaseConfigured) return zero;
  const client = getServerClient();
  const [all, approved, pending, rejected, users, featured, downloads] = await Promise.all([
    client.from(ASSET_TABLE).select("id", { count: "exact", head: true }),
    client.from(ASSET_TABLE).select("id", { count: "exact", head: true }).eq("status", "approved"),
    client.from(ASSET_TABLE).select("id", { count: "exact", head: true }).eq("status", "pending"),
    client.from(ASSET_TABLE).select("id", { count: "exact", head: true }).eq("status", "rejected"),
    client.from("users").select("id", { count: "exact", head: true }),
    client.from(ASSET_TABLE).select("id", { count: "exact", head: true }).eq("featured", true),
    client.from(ASSET_TABLE).select("downloads").eq("status", "approved").limit(5000),
  ]);
  return {
    totalAssets: all.count ?? 0,
    approved: approved.count ?? 0,
    pending: pending.count ?? 0,
    rejected: rejected.count ?? 0,
    totalUsers: users.count ?? 0,
    featured: featured.count ?? 0,
    totalDownloads: (downloads.data ?? []).reduce(
      (sum, r) => sum + Number(r.downloads ?? 0),
      0,
    ),
  };
}

export interface CreateAssetInput {
  author_id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  license: string;
  version: string;
  file_url: string;
  thumbnail_url: string;
  file_size: number;
  status?: AssetStatus;
}

export async function createAsset(input: CreateAssetInput): Promise<Asset> {
  const client = getServerClient();
  let slug = slugify(input.title);
  const { data: clash } = await client
    .from(ASSET_TABLE)
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();
  if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const { data, error } = await client
    .from(ASSET_TABLE)
    .insert({ ...input, slug, status: input.status ?? "pending" })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as Asset;
}

export async function updateAsset(
  id: string,
  patch: Partial<Record<string, unknown>>,
): Promise<Asset> {
  const client = getServerClient();
  const { data, error } = await client
    .from(ASSET_TABLE)
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as Asset;
}

export async function bumpDownloads(id: string): Promise<void> {
  if (!supabaseConfigured) return;
  const client = getServerClient();
  try {
    const { error } = await client.rpc("increment_downloads", { p_id: id });
    if (error) throw error;
  } catch {
    const { data } = await client.from(ASSET_TABLE).select("downloads").eq("id", id).maybeSingle();
    if (data) {
      await client
        .from(ASSET_TABLE)
        .update({ downloads: Number(data.downloads ?? 0) + 1 })
        .eq("id", id);
    }
  }
}

export interface RatingSummary {
  rating: number;
  rating_count: number;
}

/** Aggregated rating from the assets_public view (falls back to raw rows). */
export async function getRatingSummary(assetId: string): Promise<RatingSummary> {
  if (!supabaseConfigured) return { rating: 0, rating_count: 0 };
  const client = getServerClient();
  const { data, error } = await client
    .from(ASSET_VIEW)
    .select("rating, rating_count")
    .eq("id", assetId)
    .maybeSingle();
  if (!error && data) {
    return { rating: Number(data.rating ?? 0), rating_count: Number(data.rating_count ?? 0) };
  }
  const { data: rows, error: rowsError } = await client
    .from("ratings")
    .select("stars")
    .eq("asset_id", assetId);
  if (rowsError || !rows || rows.length === 0) return { rating: 0, rating_count: 0 };
  const total = rows.reduce((sum, row) => sum + Number(row.stars ?? 0), 0);
  return { rating: Math.round((total / rows.length) * 10) / 10, rating_count: rows.length };
}

/** The stars a given user gave an asset, or null when they have not rated. */
export async function getUserRating(assetId: string, userId: string): Promise<number | null> {
  if (!supabaseConfigured) return null;
  const client = getServerClient();
  const { data } = await client
    .from("ratings")
    .select("stars")
    .eq("asset_id", assetId)
    .eq("user_id", userId)
    .maybeSingle();
  return data ? Number(data.stars) : null;
}

/** Inserts or replaces the user's rating (one row per user + asset). */
export async function setUserRating(assetId: string, userId: string, stars: number): Promise<void> {
  if (!supabaseConfigured) return;
  const client = getServerClient();
  const { error } = await client
    .from("ratings")
    .upsert({ asset_id: assetId, user_id: userId, stars }, { onConflict: "asset_id,user_id" });
  if (error) throw new Error(error.message);
}
