"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, readApiError } from "@/lib/client-auth";
import type { Asset } from "@/lib/types";
import { formatNumber, placeholderImage, priceLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export function FeaturedPanel({ assets }: { assets: Asset[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");

  async function toggle(asset: Asset) {
    setBusyId(asset.id);
    setMessage("");
    const response = await apiFetch(`/api/admin/assets/${asset.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: asset.featured ? "unfeature" : "feature" }),
    });
    setBusyId("");
    if (!response.ok) {
      setMessage(await readApiError(response));
      return;
    }
    router.refresh();
  }

  if (assets.length === 0) {
    return (
      <div className="panel px-6 py-16 text-center">
        <p className="text-lg font-semibold text-title">Nothing approved yet</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Approve assets in the moderation queue first — only approved assets can be featured on
          the homepage.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {message}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <article
            key={asset.id}
            className={`panel overflow-hidden transition ${
              asset.featured ? "border-accent/60 shadow-glow/30" : ""
            }`}
          >
            <div className="relative aspect-[16/10] bg-ink">
              <Image
                src={asset.thumbnail_url || placeholderImage(asset.slug, 640, 400)}
                alt={asset.title}
                fill
                sizes="(max-width: 640px) 100vw, 300px"
                className="object-cover"
              />
              {asset.featured ? (
                <span className="absolute left-3 top-3 rounded-md border border-accent/50 bg-accent/80 px-2 py-0.5 text-[11px] font-semibold text-title backdrop-blur">
                  Featured
                </span>
              ) : null}
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-title">{asset.title}</h3>
                  <p className="truncate text-xs text-muted">
                    {asset.author?.username ?? "Unknown"} · {formatNumber(asset.downloads)}{" "}
                    downloads
                  </p>
                </div>
                <Badge tone={asset.featured ? "accent" : "default"}>
                  {priceLabel(asset.price)}
                </Badge>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
                <Link
                  href={`/asset/${asset.slug}`}
                  className="text-xs text-accent-light hover:underline"
                >
                  View page →
                </Link>
                <button
                  type="button"
                  disabled={busyId === asset.id}
                  onClick={() => toggle(asset)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                    asset.featured
                      ? "border border-line bg-panel2 text-muted hover:text-title"
                      : "bg-accent text-title hover:bg-accent-hover"
                  }`}
                >
                  {busyId === asset.id
                    ? "…"
                    : asset.featured
                      ? "Remove from home"
                      : "Feature on home"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
