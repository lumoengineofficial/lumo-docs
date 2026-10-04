import { requireAdmin } from "@/lib/auth";
import { listAssetsForModeration } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { FeaturedPanel } from "@/components/admin/FeaturedPanel";

export const dynamic = "force-dynamic";

export const metadata = pageMeta({
  title: "Featured assets",
  description: "Choose which assets appear in the homepage carousel.",
  path: "/admin/featured",
});

export default async function AdminFeaturedPage() {
  await requireAdmin();
  const assets = await listAssetsForModeration("approved");
  const sorted = [...assets].sort((a, b) => Number(b.featured) - Number(a.featured));
  const featuredCount = sorted.filter((a) => a.featured).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-title">Homepage features</h2>
        <p className="mt-1 text-sm text-muted">
          {featuredCount} of {sorted.length} approved assets currently appear in the featured
          carousel.
        </p>
      </div>

      <FeaturedPanel assets={sorted} />
    </div>
  );
}
