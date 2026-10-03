import Link from "next/link";
import type { StoreQuery } from "@/lib/url";
import { storePath } from "@/lib/url";
import { cn } from "@/lib/utils";

function pageWindow(page: number, pageCount: number): number[] {
  const pages = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  if (page <= 3) [2, 3, 4, 5].forEach((p) => pages.add(p));
  if (page >= pageCount - 2)
    [pageCount - 1, pageCount - 2, pageCount - 3, pageCount - 4].forEach((p) => pages.add(p));
  return Array.from(pages)
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b);
}

export function Pagination({
  basePath,
  current,
  page,
  pageCount,
}: {
  basePath: string;
  current: StoreQuery;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;
  const pages = pageWindow(page, pageCount);

  const pageHref = (target: number) => storePath(basePath, { page: target }, current);

  return (
    <nav className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-sm text-muted">
        Page <span className="text-white">{page}</span> of {pageCount}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        {page > 1 ? (
          <Link
            href={pageHref(page - 1)}
            className="rounded-lg border border-line bg-panel px-3 py-2 text-sm text-mist transition hover:border-accent/50 hover:text-white"
          >
            ← Prev
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-lg border border-line bg-panel px-3 py-2 text-sm text-muted/50">
            ← Prev
          </span>
        )}

        {pages.map((p, index) => (
          <span key={p} className="flex items-center">
            {index > 0 && p - pages[index - 1] > 1 ? (
              <span className="px-1 text-muted">…</span>
            ) : null}
            <Link
              href={pageHref(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "min-w-9 rounded-lg border px-3 py-2 text-center text-sm transition",
                p === page
                  ? "border-accent bg-accent text-white"
                  : "border-line bg-panel text-mist hover:border-accent/50 hover:text-white",
              )}
            >
              {p}
            </Link>
          </span>
        ))}

        {page < pageCount ? (
          <Link
            href={pageHref(page + 1)}
            className="rounded-lg border border-line bg-panel px-3 py-2 text-sm text-mist transition hover:border-accent/50 hover:text-white"
          >
            Next →
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-lg border border-line bg-panel px-3 py-2 text-sm text-muted/50">
            Next →
          </span>
        )}
      </div>
    </nav>
  );
}
