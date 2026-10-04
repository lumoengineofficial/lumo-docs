import Link from "next/link";
import type { ReactNode } from "react";
import type { Asset } from "@/lib/types";
import type { DocMeta } from "@/lib/markdown";
import { SITE } from "@/lib/constants";
import { AssetCard } from "@/components/assets/AssetCard";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function PluginsTeaser({ plugins }: { plugins: Asset[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Editor extensions"
        title="Plugins that extend the editor"
        description="Add exporters, level-design tools, shader previews and CI hooks — installed with one drop into /Plugins."
        actions={
          <ButtonLink href="/plugins" variant="outline">
            Browse all plugins →
          </ButtonLink>
        }
      />

      {plugins.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plugins.map((plugin) => (
            <AssetCard key={plugin.id} asset={plugin} />
          ))}
        </div>
      ) : (
        <div className="panel flex items-center justify-between gap-4 p-6">
          <p className="text-sm text-muted">
            No plugins published yet — be the first to ship one.
          </p>
          <ButtonLink href="/dashboard/publish" size="sm">
            Publish a plugin
          </ButtonLink>
        </div>
      )}
    </section>
  );
}

const docIcons: Record<string, ReactNode> = {
  "getting-started": (
    <path d="M12 6v6l4 2M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  ),
  "importing-gltf-models": (
    <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Zm0 0L12 12m0 0 9-4.5M12 12v9" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  ),
  "building-exporting-games": (
    <path d="m8 8-4 4 4 4m8-8 4 4-4 4M14 5l-4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  "asset-store-api": (
    <path d="M8 9H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-3M8 9l2-4h4l2 4M8 9v3h8V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  ),
};

export function DocsTeaser({ docs }: { docs: DocMeta[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Documentation"
        title="Everything you need to ship"
        description="Guides written by the engine team, from first scene to store upload."
        actions={
          <ButtonLink href="/docs" variant="secondary">
            Open the docs →
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {docs.slice(0, 4).map((doc) => (
          <Link
            key={doc.slug}
            href={`/docs/${doc.slug}`}
            className="group rounded-2xl border border-line bg-panel p-5 transition hover:-translate-y-0.5 hover:border-accent/50"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-panel2 text-accent-light transition group-hover:border-accent/40 group-hover:bg-accent group-hover:text-title">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                {docIcons[doc.slug] ?? docIcons["getting-started"]}
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-title transition group-hover:text-accent-light">
              {doc.title}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
              {doc.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function SupportCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-panel via-panel2 to-panel2 p-8 sm:p-12">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/30 blur-[100px]" />
        <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">
              Community support
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-title sm:text-3xl">
              Found a bug, or need an asset that doesn&apos;t exist yet?
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Lumo Engine is developed in the open. File an issue, open a discussion or request a
              feature — the team reads everything.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <ButtonLink href={SITE.issues} size="lg">
              Report an issue
            </ButtonLink>
            <ButtonLink href={SITE.repo} variant="secondary" size="lg">
              Star on GitHub ★
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
