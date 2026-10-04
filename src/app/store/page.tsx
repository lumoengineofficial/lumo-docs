import { listAssets, getCategoryCounts } from "@/lib/queries";
import { parseStoreQuery } from "@/lib/url";
import { CATEGORIES } from "@/lib/constants";
import { pageMeta } from "@/lib/seo";
import { StoreBrowser } from "@/components/store/StoreBrowser";

export const dynamic = "force-dynamic";

interface StorePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: StorePageProps) {
  const query = parseStoreQuery(await searchParams);
  const title = query.q
    ? `“${query.q}” in the Store`
    : query.category
      ? query.category
      : "Browse Assets";
  const description = query.category
    ? `Download ${query.category} for Lumo Engine — free and premium packs, ready to import in the editor.`
    : "Browse 3D models, textures, sprites, audio, plugins and templates for Lumo Engine.";
  return pageMeta({ title, description, path: "/store" });
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const sp = await searchParams;
  const query = parseStoreQuery(sp);

  const category = query.category && CATEGORIES.includes(query.category as never)
    ? query.category
    : "";

  const [results, counts] = await Promise.all([
    listAssets({
      q: query.q,
      category: category || undefined,
      price: (query.price as "free" | "paid" | undefined) ?? undefined,
      sort: query.sort as "newest" | "popular" | "rating",
      page: query.page,
    }),
    getCategoryCounts(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 border-b border-line pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">
          Asset store
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-title sm:text-4xl">
          {category || "All assets"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {category
            ? `Production-ready ${category.toLowerCase()} for Lumo Engine. Download, unzip into Assets/ and import.`
            : "Every pack is tested in the Lumo editor. Free assets download instantly; paid assets unlock after signing in."}
        </p>
      </header>

      <StoreBrowser
        basePath="/store"
        current={{ ...query, category }}
        results={results}
        counts={counts}
        emptyTitle={
          query.q ? `No results for “${query.q}”` : "No assets in this filter yet"
        }
        emptyHint={
          query.q
            ? "Check the spelling, or clear the category and price filters."
            : "Publish the first pack in this category — the store is open."
        }
      />
    </div>
  );
}
