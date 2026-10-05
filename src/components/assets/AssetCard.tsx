import Image from "next/image";
import Link from "next/link";
import type { Asset } from "@/lib/types";
import { formatNumber, placeholderImage, priceLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { AdminBadge } from "@/components/ui/AdminBadge";
import { LinkedProfileBadge } from "@/components/ui/LinkedProfileBadge";

export function AssetCard({ asset }: { asset: Asset }) {
  const thumb = asset.thumbnail_url || placeholderImage(asset.slug, 800, 500);
  const free = Number(asset.price ?? 0) === 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-panel transition duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card">
      <div className="relative aspect-[16/10] overflow-hidden bg-panel2">
        <Image
          src={thumb}
          alt={asset.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
        <div className="absolute left-3 top-3">
          <Badge tone="default" className="border-white/10 bg-black/50 text-white/90 backdrop-blur">
            {asset.category}
          </Badge>
        </div>
        <div className="absolute right-3 top-3">
          {free ? (
            <span className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 backdrop-blur">
              Free
            </span>
          ) : (
            <span className="rounded-md border border-accent/50 bg-accent/20 px-2 py-0.5 text-[11px] font-semibold text-title backdrop-blur">
              {priceLabel(asset.price)}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[15px] font-semibold leading-snug text-title transition group-hover:text-accent-light">
          <Link href={`/asset/${asset.slug}`} className="after:absolute after:inset-0">
            {asset.title}
          </Link>
        </h3>

        <div className="mt-1.5 flex items-center justify-between text-xs">
          <span className="relative z-10 flex items-center gap-1.5">
            <Link
              href={asset.author ? `/author/${asset.author.handle}` : "#"}
              className="font-medium text-muted transition hover:text-accent-light"
            >
              {asset.author?.username ?? "Unknown"}
            </Link>
            {asset.author?.role === "admin" ? (
              <>
                <AdminBadge size={13} label="Lumo team" />
                <LinkedProfileBadge size={16} />
              </>
            ) : null}
          </span>
          <span className="text-muted">↓ {formatNumber(asset.downloads)}</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line/70 pt-3">
          <span className="text-[11px] text-muted">{asset.license}</span>
          <span className="text-[11px] text-muted/50">·</span>
          <span className="text-[11px] text-muted">v{asset.version}</span>
          {asset.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded bg-panel2 px-1.5 py-0.5 text-[10px] text-muted/80"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
