import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { loadDocs } from "@/lib/markdown";
import { listAssets } from "@/lib/queries";

export const revalidate = 3600;

const base = SITE.url.replace(/\/$/, "");

type ChangeFrequency = MetadataRoute.Sitemap[number]["changeFrequency"];

const STATIC_PATHS: { path: string; priority: number; changeFrequency: ChangeFrequency }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/store", priority: 0.9, changeFrequency: "daily" },
  { path: "/plugins", priority: 0.7, changeFrequency: "weekly" },
  { path: "/docs", priority: 0.7, changeFrequency: "weekly" },
  { path: "/api-docs", priority: 0.6, changeFrequency: "monthly" },
  { path: "/login", priority: 0.3, changeFrequency: "yearly" },
  { path: "/signup", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [assets, docs] = await Promise.all([
    listAssets({ status: "approved", perPage: 100, sort: "newest" }),
    loadDocs(),
  ]);

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map(({ path, priority, changeFrequency }) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  for (const doc of docs) {
    entries.push({
      url: `${base}/docs/${doc.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  const handles = new Set<string>();

  for (const asset of assets.items) {
    entries.push({
      url: `${base}/asset/${asset.slug}`,
      lastModified: new Date(asset.created_at),
      changeFrequency: "weekly",
      priority: 0.8,
    });
    if (asset.author?.handle) handles.add(asset.author.handle);
  }

  for (const handle of handles) {
    entries.push({
      url: `${base}/author/${handle}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  return entries;
}
