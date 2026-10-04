"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SORT_OPTIONS } from "@/lib/constants";
import type { StoreQuery } from "@/lib/url";

export function StoreToolbar({
  current,
  total,
}: {
  current: StoreQuery;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(current.q ?? "");

  useEffect(() => {
    setQuery(current.q ?? "");
  }, [current.q]);

  function replaceParam(patch: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    replaceParam({ q: query.trim(), page: "1" });
  }

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <form onSubmit={submitSearch} className="relative w-full sm:max-w-md">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${total.toLocaleString()} assets…`}
          className="input-base pl-9 pr-20"
          aria-label="Search assets"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md bg-panel2 px-2.5 py-1.5 text-xs font-medium text-mist transition hover:bg-accent hover:text-title"
        >
          Search
        </button>
      </form>

      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted sm:inline">
          {total.toLocaleString()} result{total === 1 ? "" : "s"}
        </span>
        <label className="flex items-center gap-2 text-sm text-muted">
          <span className="whitespace-nowrap">Sort by</span>
          <select
            value={current.sort ?? "newest"}
            onChange={(e) => replaceParam({ sort: e.target.value, page: "1" })}
            className="input-base w-auto cursor-pointer py-2 pr-8 text-mist"
            aria-label="Sort assets"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-panel">
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
