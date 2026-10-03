import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listMyAssets } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { formatBytes, formatNumber, priceLabel } from "@/lib/utils";
import { AssetActions } from "@/components/dashboard/AssetActions";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ButtonLink } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export const metadata = pageMeta({
  title: "Publisher dashboard",
  description: "Manage your Lumo Asset Store submissions, downloads and reviews.",
  path: "/dashboard",
});

export default async function DashboardPage() {
  const { profile } = await requireUser();
  const assets = await listMyAssets(profile.id);

  const totalDownloads = assets.reduce((sum, a) => sum + Number(a.downloads ?? 0), 0);
  const pending = assets.filter((a) => a.status === "pending").length;
  const approved = assets.filter((a) => a.status === "approved").length;
  const rejected = assets.filter((a) => a.status === "rejected").length;
  const totalSize = assets.reduce((sum, a) => sum + Number(a.file_size ?? 0), 0);

  const stats: { label: string; value: string; hint: string }[] = [
    { label: "My assets", value: formatNumber(assets.length), hint: `${approved} approved` },
    { label: "Total downloads", value: formatNumber(totalDownloads), hint: "all time" },
    { label: "Pending reviews", value: formatNumber(pending), hint: pending ? "in queue" : "all clear" },
    { label: "Storage used", value: formatBytes(totalSize), hint: "uploaded zips" },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="panel p-5">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white">{stat.value}</p>
            <p className="mt-1 text-xs text-muted">{stat.hint}</p>
          </div>
        ))}
      </section>

      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">My assets</h2>
            <p className="text-xs text-muted">
              {rejected > 0
                ? `${rejected} rejected — open the asset to read admin feedback.`
                : "Edit, unpublish or resubmit your packs."}
            </p>
          </div>
          <ButtonLink href="/dashboard/publish" size="sm">
            + Publish new asset
          </ButtonLink>
        </div>

        {assets.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-sm font-medium text-white">No assets yet</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
              Upload your first pack — models, textures, audio or an editor plugin — and it lands
              in the moderation queue.
            </p>
            <div className="mt-5">
              <ButtonLink href="/dashboard/publish">Publish your first asset</ButtonLink>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="bg-panel2/60 text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 font-medium">Asset</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Price</th>
                  <th className="px-3 py-3 font-medium">Downloads</th>
                  <th className="px-3 py-3 font-medium">Size</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id} className="border-t border-line/70">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/asset/${asset.slug}`}
                        className="font-medium text-white transition hover:text-accent-light"
                      >
                        {asset.title}
                      </Link>
                      <span className="block text-xs text-muted">{asset.category}</span>
                      {asset.status === "rejected" && asset.review_note ? (
                        <span className="mt-1 block max-w-xs text-xs text-red-300">
                          Admin: {asset.review_note}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="px-3 py-3.5 text-mist">{priceLabel(asset.price)}</td>
                    <td className="px-3 py-3.5 text-mist">{formatNumber(asset.downloads)}</td>
                    <td className="px-3 py-3.5 text-muted">{formatBytes(asset.file_size)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end">
                        <AssetActions asset={asset} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
