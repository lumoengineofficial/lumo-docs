import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAssetBySlug, getRelatedAssets } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import type { Asset } from "@/lib/types";
import { formatBytes, formatDate, formatNumber, placeholderImage, priceLabel } from "@/lib/utils";
import { AssetGrid } from "@/components/assets/AssetGrid";
import { DownloadButton } from "@/components/asset/DownloadButton";
import { Gallery } from "@/components/asset/Gallery";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { AdminBadge } from "@/components/ui/AdminBadge";
import { LinkedProfileBadge } from "@/components/ui/LinkedProfileBadge";

export const dynamic = "force-dynamic";

function galleryFor(asset: Asset): string[] {
  const thumb = asset.thumbnail_url || placeholderImage(asset.slug, 1200, 750);
  const seed = /picsum\.photos\/seed\/([^/]+)/.exec(thumb);
  if (!seed) return [thumb];
  return [
    thumb,
    `https://picsum.photos/seed/${seed[1]}-b/1200/750`,
    `https://picsum.photos/seed/${seed[1]}-c/1200/750`,
    `https://picsum.photos/seed/${seed[1]}-d/1200/750`,
  ];
}

interface AssetPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AssetPageProps): Promise<Metadata> {
  const { slug } = await params;
  const asset = await getAssetBySlug(slug);
  if (!asset) return pageMeta({ title: "Asset not found", description: "Missing asset.", path: `/asset/${slug}` });
  const description = asset.description.replace(/\s+/g, " ").slice(0, 180);
  return pageMeta({
    title: `${asset.title} — ${asset.category}`,
    description,
    path: `/asset/${asset.slug}`,
    image: asset.thumbnail_url || undefined,
    type: "article",
  });
}

const INSTALL_STEPS = [
  {
    title: "Download the pack",
    body: "Press the download button above. You will get a single .zip with the asset folder inside.",
  },
  {
    title: "Unzip into Assets/",
    body: "Extract the folder into your project's Assets/ directory — e.g. Assets/forest-ranger/. Keep the folder structure intact.",
  },
  {
    title: "Import in the editor",
    body: "Open Lumo, select Assets → Import. The pack appears in the asset browser with materials, animations and audio already mapped.",
  },
];

export default async function AssetDetailPage({ params }: AssetPageProps) {
  const { slug } = await params;
  const asset = await getAssetBySlug(slug);
  if (!asset) notFound();

  const related = await getRelatedAssets(asset);
  const free = Number(asset.price ?? 0) === 0;

  const specs: [string, string][] = [
    ["Version", asset.version],
    ["File size", formatBytes(asset.file_size)],
    ["License", asset.license],
    ["Category", asset.category],
    ["Downloads", formatNumber(asset.downloads)],
    ["Updated", formatDate(asset.created_at)],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/store" className="transition hover:text-accent-light">
          Store
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`/store?category=${encodeURIComponent(asset.category)}`} className="transition hover:text-accent-light">
          {asset.category}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-mist">{asset.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <Gallery images={galleryFor(asset)} alt={asset.title} />

          <div className="mt-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">{asset.category}</Badge>
              <Badge tone={free ? "success" : "warning"}>
                {free ? "Free" : priceLabel(asset.price)}
              </Badge>
              <Badge>v{asset.version}</Badge>
              <Badge>{asset.license}</Badge>
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-title sm:text-4xl">
              {asset.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted">
              {asset.author ? (
                <>
                  <Link
                    href={`/author/${asset.author.handle}`}
                    className="flex items-center gap-2 transition hover:text-accent-light"
                  >
                    <Avatar
                      src={asset.author.avatar_url}
                      name={asset.author.username}
                      size="sm"
                    />
                    {asset.author.username}
                    {asset.author.role === "admin" ? (
                      <AdminBadge size={15} label="Lumo team" />
                    ) : null}
                  </Link>
                  {asset.author.role === "admin" ? (
                    <LinkedProfileBadge size={22} />
                  ) : null}
                </>
              ) : null}
              <span>↓ {formatNumber(asset.downloads)} downloads</span>
              <span>Published {formatDate(asset.created_at)}</span>
            </div>

            <div className="mt-6 rounded-2xl border border-line bg-panel p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-title">
                About this asset
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-mist/80">
                {asset.description || "No description provided."}
              </p>

              {asset.tags.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                  {asset.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/store?q=${encodeURIComponent(tag)}`}
                      className="rounded-md border border-line bg-panel2 px-2.5 py-1 text-xs text-muted transition hover:border-accent/40 hover:text-accent-light"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-6 rounded-2xl border border-line bg-gradient-to-b from-panel2 to-panel p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-title">
                Install in Lumo Engine
              </h2>
              <ol className="mt-4 space-y-4">
                {INSTALL_STEPS.map((step, index) => (
                  <li key={step.title} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-accent/40 bg-accent-soft text-xs font-bold text-accent-light">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-title">{step.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-4 rounded-lg border border-line bg-ink px-3 py-2.5 font-mono text-xs text-accent-light">
                /Assets/{asset.slug}/
              </p>
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-line bg-panel p-5">
            <DownloadButton asset={asset} />

            <dl className="mt-5 space-y-2.5 border-t border-line pt-4">
              {specs.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 text-sm">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-right font-medium text-mist">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {asset.author ? (
            <div className="mt-4 rounded-2xl border border-line bg-panel p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Published by
              </p>
              <Link
                href={`/author/${asset.author.handle}`}
                className="mt-3 flex items-center gap-3 transition hover:text-accent-light"
              >
                <Avatar
                  src={asset.author.avatar_url}
                  name={asset.author.username}
                  size="md"
                />
                <span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-title">
                    {asset.author.username}
                    {asset.author.role === "admin" ? (
                      <AdminBadge size={15} label="Lumo team" />
                    ) : null}
                  </span>
                  <span className="block text-xs text-muted">@{asset.author.handle}</span>
                </span>
              </Link>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                {asset.author.bio || "Lumo Engine creator publishing assets for the community."}
              </p>
              <Link
                href={`/author/${asset.author.handle}`}
                className="mt-3 inline-block text-xs font-medium text-accent-light hover:underline"
              >
                View all assets →
              </Link>
            </div>
          ) : null}
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mt-16 border-t border-line pt-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-title">Related assets</h2>
            <Link
              href={`/store?category=${encodeURIComponent(asset.category)}`}
              className="text-sm font-medium text-accent-light transition hover:text-title"
            >
              More in {asset.category} →
            </Link>
          </div>
          <AssetGrid assets={related} columns={3} />
        </section>
      ) : null}
    </div>
  );
}
