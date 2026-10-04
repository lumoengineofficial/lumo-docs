import Link from "next/link";
import { getFeaturedAssets, getStoreStats, listAssets } from "@/lib/queries";
import { loadDocs } from "@/lib/markdown";
import { pageMeta } from "@/lib/seo";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { DocsTeaser, PluginsTeaser, SupportCta } from "@/components/home/Promos";
import { StatsBar } from "@/components/home/StatsBar";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const dynamic = "force-dynamic";

export const metadata = pageMeta({
  title: "Assets for Lumo Engine",
  description:
    "Download free and premium 3D models, textures, sprites, audio, plugins and project templates for Lumo Engine — the open-source 3D game engine.",
  path: "/",
});

export default async function HomePage() {
  const [featured, stats, plugins, docs] = await Promise.all([
    getFeaturedAssets(8),
    getStoreStats(),
    listAssets({ category: "Plugins", sort: "popular", perPage: 3 }),
    loadDocs(),
  ]);

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Featured"
          title="Hand-picked for this week"
          description="Curated by the Lumo team — high quality, engine-ready and tested in the editor."
          actions={
            <Link
              href="/store"
              className="text-sm font-medium text-accent-light transition hover:text-title"
            >
              View all assets →
            </Link>
          }
        />
        <FeaturedCarousel assets={featured} />
      </section>

      <HowItWorks />
      <StatsBar stats={stats} />
      <PluginsTeaser plugins={plugins.items} />
      <DocsTeaser docs={docs} />
      <SupportCta />
    </>
  );
}
