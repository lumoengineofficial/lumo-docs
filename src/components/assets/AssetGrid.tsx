import type { Asset } from "@/lib/types";
import { AssetCard } from "@/components/assets/AssetCard";

export function AssetGrid({
  assets,
  emptyTitle = "No assets found",
  emptyHint = "Try clearing a filter or searching for something else.",
  columns = 3,
}: {
  assets: Asset[];
  emptyTitle?: string;
  emptyHint?: string;
  columns?: 3 | 4;
}) {
  if (assets.length === 0) {
    return (
      <div className="panel flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-panel2 text-accent-light">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
            <path
              d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="m3 7.5 9 4.5 9-4.5M12 12v9" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-title">{emptyTitle}</h3>
        <p className="mt-1.5 max-w-sm text-sm text-muted">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
        columns === 4 ? "lg:grid-cols-3 xl:grid-cols-4" : "lg:grid-cols-3"
      }`}
    >
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  );
}
