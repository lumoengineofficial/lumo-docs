import { CATEGORIES, LICENSES } from "@/lib/constants";
import { ApiError, readString } from "@/lib/api";
import { parseTags } from "@/lib/utils";

export interface AssetDraft {
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  license: string;
  version: string;
}

type Source = FormData | Record<string, unknown>;

function hasKey(source: Source, key: string): boolean {
  return source instanceof FormData ? source.has(key) : key in source;
}

function readList(source: Source, key: string): string[] {
  if (source instanceof FormData) {
    const values = source.getAll(key).filter((v): v is string => typeof v === "string");
    if (values.length > 0) return values;
    return parseTags(readString(source, key));
  }
  const raw = (source as Record<string, unknown>)[key];
  if (Array.isArray(raw)) return raw.map((v) => String(v));
  return parseTags(String(raw ?? ""));
}

/**
 * Validates asset fields. Missing keys fall back to `current` so PATCH requests
 * can send a partial payload.
 */
export function parseAssetFields(source: Source, current?: Partial<AssetDraft>): AssetDraft {
  const title = (readString(source, "title") || current?.title || "").slice(0, 120);
  if (!title) throw new ApiError(400, "invalid_title", "Title is required.");

  const category = readString(source, "category") || current?.category || "";
  if (!(CATEGORIES as readonly string[]).includes(category)) {
    throw new ApiError(
      400,
      "invalid_category",
      `Category must be one of: ${CATEGORIES.join(", ")}.`,
    );
  }

  let price = current?.price ?? 0;
  if (hasKey(source, "price")) {
    const raw = readString(source, "price") || "0";
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100_000) {
      throw new ApiError(400, "invalid_price", "Price must be a positive USD amount.");
    }
    price = Math.round(parsed * 100) / 100;
  }

  const license = readString(source, "license") || current?.license || "Lumo Asset License";
  if (!(LICENSES as readonly string[]).includes(license)) {
    throw new ApiError(400, "invalid_license", `License must be one of: ${LICENSES.join(", ")}.`);
  }

  const description = hasKey(source, "description")
    ? readString(source, "description").slice(0, 5000)
    : (current?.description ?? "");

  const version = (readString(source, "version") || current?.version || "1.0.0").slice(0, 24);

  const tags = hasKey(source, "tags")
    ? readList(source, "tags").slice(0, 12)
    : (current?.tags ?? []);

  return { title, description, category, tags, price, license, version };
}

export function pickFile(source: Source, key: string): File | null {
  if (source instanceof FormData) {
    const value = source.get(key);
    if (value instanceof File && value.size > 0) return value;
    return null;
  }
  return null;
}
