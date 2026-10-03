import Link from "next/link";
import { formatNumber } from "@/lib/utils";
import type { StoreStats } from "@/lib/types";

const items = (stats: StoreStats) => [
  { label: "Assets published", value: stats.assets, href: "/store" },
  { label: "Total downloads", value: stats.downloads, href: "/store?sort=popular" },
  { label: "Creators", value: stats.creators, href: "/signup" },
];

export function StatsBar({ stats }: { stats: StoreStats }) {
  return (
    <section className="border-y border-line bg-panel/50">
      <div className="mx-auto grid max-w-7xl gap-px overflow-hidden bg-line sm:grid-cols-3">
        {items(stats).map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group flex flex-col items-center bg-ink px-6 py-10 text-center transition hover:bg-panel"
          >
            <span className="text-4xl font-extrabold tracking-tight text-white transition group-hover:text-accent-light sm:text-5xl">
              {formatNumber(item.value)}
            </span>
            <span className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
