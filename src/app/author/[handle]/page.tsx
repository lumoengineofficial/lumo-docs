import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuthorAssets, getProfileByHandle } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { formatDate, formatNumber } from "@/lib/utils";
import { AssetGrid } from "@/components/assets/AssetGrid";
import { Badge } from "@/components/ui/Badge";
import { AdminBadge } from "@/components/ui/AdminBadge";

export const dynamic = "force-dynamic";

interface AuthorPageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) return pageMeta({ title: "Creator not found", description: "Missing creator.", path: `/author/${handle}` });
  return pageMeta({
    title: profile.username,
    description: `Browse every Lumo Engine asset published by ${profile.username} (@${profile.handle}).`,
    path: `/author/${profile.handle}`,
    image: profile.avatar_url ?? undefined,
  });
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) notFound();

  const assets = await getAuthorAssets(profile.id);
  const totalDownloads = assets.reduce((sum, asset) => sum + Number(asset.downloads ?? 0), 0);

  const stats: [string, string][] = [
    ["Assets", formatNumber(assets.length)],
    ["Downloads", formatNumber(totalDownloads)],
    ["Joined", formatDate(profile.created_at)],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="relative overflow-hidden rounded-3xl border border-line bg-panel">
        <div className="absolute inset-0 surface-grid opacity-50" />
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-accent/25 blur-[90px]" />
        <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:p-8">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="h-24 w-24 rounded-2xl border border-line object-cover shadow-card"
            />
          ) : (
            <div className="accent-gradient flex h-24 w-24 items-center justify-center rounded-2xl border border-line text-3xl font-bold text-title shadow-card">
              {(profile.username || "?").slice(0, 1).toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-title">{profile.username}</h1>
              {profile.role === "admin" ? (
                <>
                  <AdminBadge size={22} label="Lumo team" />
                  <Badge tone="accent">Lumo team</Badge>
                </>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted">@{profile.handle}</p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist/80">
              {profile.bio || "Creator on the Lumo Asset Store."}
            </p>
          </div>

          <dl className="flex gap-6 sm:gap-8">
            {stats.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
                  {label}
                </dt>
                <dd className="mt-1 text-2xl font-bold text-title">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <section className="mt-10">
        <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
          <h2 className="text-xl font-bold tracking-tight text-title">
            Assets by {profile.username}
          </h2>
          <span className="text-sm text-muted">{assets.length} published</span>
        </div>

        <AssetGrid
          assets={assets}
          columns={3}
          emptyTitle="Nothing published yet"
          emptyHint="This creator has no approved assets in the store."
        />
      </section>
    </div>
  );
}
