export type QueryValue = string | number | boolean | undefined | null;

export interface StoreQuery {
  q?: string;
  category?: string;
  price?: string;
  sort?: string;
  page?: number;
}

/** Builds an internal path with only the values that differ from their defaults. */
export function buildPath(
  pathname: string,
  params: Record<string, QueryValue>,
  defaults: Record<string, QueryValue> = {},
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    const fallback = defaults[key];
    if (fallback !== undefined && String(fallback) === String(value)) continue;
    sp.set(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export const STORE_DEFAULTS: Record<string, QueryValue> = {
  q: "",
  category: "",
  price: "all",
  sort: "newest",
  page: 1,
};

export function storePath(
  pathname: string,
  patch: Record<string, QueryValue>,
  current: StoreQuery = {},
): string {
  return buildPath(pathname, { ...current, ...patch }, STORE_DEFAULTS);
}

type SearchParamsRecord = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

/** Normalizes Next.js searchParams into a typed store query. */
export function parseStoreQuery(sp: SearchParamsRecord): StoreQuery {
  const price = first(sp.price);
  const sort = first(sp.sort);
  const page = Number(first(sp.page) || "1");
  return {
    q: first(sp.q).slice(0, 80),
    category: first(sp.category),
    price: price === "free" || price === "paid" ? price : "all",
    sort: sort === "popular" || sort === "rating" ? sort : "newest",
    page: Number.isFinite(page) && page > 0 ? Math.min(Math.floor(page), 1000) : 1,
  };
}
