"use client";

import { useRef } from "react";
import type { Asset } from "@/lib/types";
import { AssetCard } from "@/components/assets/AssetCard";

export function FeaturedCarousel({ assets }: { assets: Asset[] }) {
  const scroller = useRef<HTMLDivElement>(null);

  function scrollBy(direction: 1 | -1) {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.round(el.clientWidth * 0.8), behavior: "smooth" });
  }

  if (assets.length === 0) return null;

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Scroll featured assets left"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-panel text-mist transition hover:border-accent/50 hover:text-white"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Scroll featured assets right"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-panel text-mist transition hover:border-accent/50 hover:text-white"
        >
          →
        </button>
      </div>

      <div
        ref={scroller}
        className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2"
      >
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="w-[290px] shrink-0 snap-start sm:w-[320px]"
          >
            <AssetCard asset={asset} />
          </div>
        ))}
      </div>
    </div>
  );
}
