import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import type { StoreQuery } from "@/lib/url";
import { storePath } from "@/lib/url";
import { cn } from "@/lib/utils";

const PRICE_OPTIONS = [
  { value: "all", label: "All prices" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

export function StoreSidebar({
  basePath,
  current,
  counts,
}: {
  basePath: string;
  current: StoreQuery;
  counts?: Record<string, number>;
}) {  const activeCategory = current.category ?? "";

  return (
    <aside className="flex flex-col gap-6">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white">
            Category
          </h2>
          {activeCategory ? (
            <Link
              href={storePath(basePath, { category: "" }, current)}
              className="text-[11px] text-accent-light hover:underline"
            >
              Clear
            </Link>
          ) : null}
        </div>
        <ul className="space-y-1">
          <li>
            <Link
              href={storePath(basePath, { category: "", page: 1 }, current)}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition",
                !activeCategory
                  ? "bg-accent-soft text-accent-light"
                  : "text-muted hover:bg-panel2 hover:text-white",
              )}
            >
              <span>All assets</span>
            </Link>
          </li>
          {CATEGORIES.map((category) => {
            const active = activeCategory === category;
            return (
              <li key={category}>
                <Link
                  href={storePath(basePath, { category, page: 1 }, current)}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition",
                    active
                      ? "bg-accent-soft text-accent-light"
                      : "text-muted hover:bg-panel2 hover:text-white",
                  )}
                >
                  <span className="truncate">{category}</span>
                  {counts?.[category] !== undefined ? (
                    <span className="text-[11px] text-muted/70">{counts[category]}</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white">Price</h2>
        <div className="space-y-1">
          {PRICE_OPTIONS.map((option) => {
            const active = (current.price ?? "all") === option.value;
            return (
              <Link
                key={option.value}
                href={storePath(basePath, { price: option.value, page: 1 }, current)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition",
                  active ? "bg-accent-soft text-accent-light" : "text-muted hover:bg-panel2 hover:text-white",
                )}
              >
                <span
                  className={cn(
                    "h-3 w-3 rounded-full border",
                    active ? "border-accent bg-accent" : "border-line bg-panel2",
                  )}
                />
                {option.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="panel bg-gradient-to-b from-panel2 to-panel p-4">
        <h3 className="text-sm font-semibold text-white">Publish your work</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted">
          Ship models, audio or editor plugins to thousands of Lumo developers.
        </p>
        <Link
          href="/dashboard/publish"
          className="mt-3 inline-flex text-xs font-medium text-accent-light hover:underline"
        >
          Open the publisher dashboard →
        </Link>
      </div>
    </aside>
  );
}
