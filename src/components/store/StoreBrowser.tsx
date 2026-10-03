import type { PagedAssets } from "@/lib/types";
import type { StoreQuery } from "@/lib/url";
import { AssetGrid } from "@/components/assets/AssetGrid";
import { Pagination } from "@/components/store/Pagination";
import { StoreSidebar } from "@/components/store/StoreSidebar";
import { StoreToolbar } from "@/components/store/StoreToolbar";

export function StoreBrowser({
  basePath,
  current,
  results,
  counts,
  showSidebar = true,
  sidebarBasePath,
  emptyTitle,
  emptyHint,
}: {
  basePath: string;
  current: StoreQuery;
  results: PagedAssets;
  counts?: Record<string, number>;
  showSidebar?: boolean;
  sidebarBasePath?: string;
  emptyTitle?: string;
  emptyHint?: string;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      {showSidebar ? (
        <StoreSidebar
          basePath={sidebarBasePath ?? basePath}
          current={current}
          counts={counts}
        />
      ) : null}
      <div>
        <StoreToolbar current={current} total={results.total} />
        <AssetGrid assets={results.items} emptyTitle={emptyTitle} emptyHint={emptyHint} />
        <Pagination
          basePath={basePath}
          current={current}
          page={results.page}
          pageCount={results.pageCount}
        />
      </div>
    </div>
  );
}
