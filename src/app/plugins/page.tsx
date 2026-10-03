import { getCategoryCounts, listAssets } from "@/lib/queries";
import { parseStoreQuery } from "@/lib/url";
import { pageMeta } from "@/lib/seo";
import { StoreBrowser } from "@/components/store/StoreBrowser";

export const dynamic = "force-dynamic";

const CATEGORY = "Plugins";

interface PluginsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: PluginsPageProps) {
  const query = parseStoreQuery(await searchParams);
  return pageMeta({
    title: query.q ? `Plugins “${query.q}”` : "Editor Plugins",
    description:
      "Editor plugins for Lumo Engine — exporters, level-design tools, shader previews and CI hooks.",
    path: "/plugins",
  });
}

export default async function PluginsPage({ searchParams }: PluginsPageProps) {
  const sp = await searchParams;
  const query = parseStoreQuery(sp);

  const [results, counts] = await Promise.all([
    listAssets({
      q: query.q,
      category: CATEGORY,
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
          Editor extensions
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Plugins
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Extend the Lumo editor with exporters, inspectors, automation and tooling. Install by
          unzipping into your project&apos;s{" "}
          <code className="rounded bg-panel2 px-1.5 py-0.5 text-accent-light">Plugins/</code>{" "}
          folder.
        </p>
      </header>

      <StoreBrowser
        basePath="/plugins"
        sidebarBasePath="/store"
        current={{ ...query, category: CATEGORY }}
        results={results}
        counts={counts}
        emptyTitle={query.q ? `No plugins for “${query.q}”` : "No plugins yet"}
        emptyHint="Plugins appear here once they pass review. Publish yours from the dashboard."
      />
    </div>
  );
}
