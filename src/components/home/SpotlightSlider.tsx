"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Asset } from "@/lib/types";
import { cn } from "@/lib/utils";

function tagline(asset: Asset): string {
  const text = (asset.description || "").replace(/\s+/g, " ").trim();
  if (!text) return asset.category;
  return text.length > 110 ? `${text.slice(0, 110).trimEnd()}…` : text;
}

function chipList(asset: Asset): string[] {
  const fromTags = asset.tags
    .flatMap((tag) => tag.split(","))
    .map((tag) => tag.trim())
    .filter(Boolean);
  return Array.from(new Set([asset.category, ...fromTags])).slice(0, 6);
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="m12 17.3-5.6 3.2 1.5-6.3L3 9.8l6.4-.6L12 3.3l2.6 5.9 6.4.6-4.9 4.4 1.5 6.3z" />
    </svg>
  );
}

export function SpotlightSlider({
  assets,
  interval = 6000,
}: {
  assets: Asset[];
  interval?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = assets.length;

  const chips = useMemo(() => (assets[index] ? chipList(assets[index]) : []), [assets, index]);

  useEffect(() => {
    setIndex(0);
  }, [count]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), interval);
    return () => clearInterval(id);
  }, [count, paused, interval]);

  if (count === 0) return null;
  const active = assets[Math.min(index, count - 1)];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-3xl border border-line bg-panel shadow-card">
        <div className="grid lg:grid-cols-[1fr_360px]">
          <div className="relative h-64 overflow-hidden bg-ink sm:h-80 lg:h-[430px]">
            {assets.map((asset, i) => (
              <div
                key={asset.id}
                aria-hidden={i !== index}
                className={cn(
                  "absolute inset-0 transition-opacity duration-700 ease-out",
                  i === index ? "opacity-100" : "pointer-events-none opacity-0",
                )}
              >
                {asset.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.thumbnail_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="accent-gradient h-full w-full opacity-40" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
                  <h3 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                    {asset.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 max-w-xl text-sm text-white/70 sm:text-base">
                    {tagline(asset)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col border-t border-line p-6 sm:p-7 lg:border-l lg:border-t-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="truncate text-xl font-bold text-title">{active.title}</h4>
                <p className="mt-1 truncate text-sm text-muted">
                  by{" "}
                  <span className="font-medium text-mist">
                    {active.author?.username ?? "Unknown"}
                  </span>
                </p>
              </div>
              <Link
                href={`/asset/${active.slug}`}
                className="shrink-0 rounded-lg border border-line bg-panel2 px-3 py-1.5 text-xs font-medium text-mist transition hover:border-accent/50 hover:text-title"
              >
                View
              </Link>
            </div>

            <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-mist/80">
              {active.description || "No description provided."}
            </p>

            <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex items-center gap-2">
                <dt className="text-muted">Rating:</dt>
                <dd className="flex items-center gap-1.5 font-semibold text-title">
                  {typeof active.rating === "number" && active.rating > 0 ? (
                    <>
                      <span className="text-accent">
                        <StarIcon />
                      </span>
                      {active.rating.toFixed(1)}
                      {active.rating_count ? (
                        <span className="font-normal text-muted">({active.rating_count})</span>
                      ) : null}
                    </>
                  ) : (
                    <span className="font-medium text-muted">Not yet rated</span>
                  )}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="text-muted">License:</dt>
                <dd className="font-semibold text-title">{active.license}</dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-md border border-line bg-panel2 px-2.5 py-1 text-xs font-medium text-mist"
                >
                  {chip}
                </span>
              ))}
            </div>

            <Link
              href={`/asset/${active.slug}`}
              className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 pt-3 text-sm font-semibold text-title transition hover:bg-accent-hover hover:shadow-glow"
            >
              View asset <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {count > 1 ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {assets.map((asset, i) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${asset.title}`}
              aria-current={i === index}
              className={cn(
                "h-2.5 rounded-full transition-all duration-300",
                i === index ? "w-8 bg-accent" : "w-4 bg-line hover:bg-muted",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
