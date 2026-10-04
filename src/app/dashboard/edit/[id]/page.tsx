import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getAssetById } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { PublishForm } from "@/components/dashboard/PublishForm";

export const dynamic = "force-dynamic";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditPageProps) {
  const { id } = await params;
  return pageMeta({
    title: "Edit asset",
    description: "Update your Lumo Asset Store submission.",
    path: `/dashboard/edit/${id}`,
  });
}

export default async function EditAssetPage({ params }: EditPageProps) {
  const { profile } = await requireUser();
  const { id } = await params;

  const asset = await getAssetById(id, { anyStatus: true });
  if (!asset) notFound();
  if (asset.author_id !== profile.id && profile.role !== "admin") notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-title">{asset.title}</h2>
            <StatusBadge status={asset.status} />
          </div>
          <p className="mt-1.5 text-sm text-muted">
            Editing sends the asset back through review if it was rejected.
          </p>
        </div>
      </div>

      {asset.status === "rejected" && asset.review_note ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <span className="font-semibold">Admin feedback:</span> {asset.review_note}
        </p>
      ) : null}

      <PublishForm asset={asset} />
    </div>
  );
}
