import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuthorAssets, getProfileByHandle } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { formatDate, formatNumber } from "@/lib/utils";
import { AssetGrid } from "@/components/assets/AssetGrid";
import { AdminBadge } from "@/components/ui/AdminBadge";
import { LinkedProfileBadge } from "@/components/ui/LinkedProfileBadge";

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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-2 rounded-full border border-line bg-panel2/70 px-4 py-2 backdrop-blur">
      <span className="text-lg font-bold text-title">{value}</span>
      <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">{label}</span>
    </span>
  );
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) notFound();

  const assets = await getAuthorAssets(profile.id);
  const totalDownloads = assets.reduce((sum, asset) => sum + Number(asset.downloads ?? 0), 0);
  const website = profile.website?.trim();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="relative overflow-hidden rounded-3xl border border-line bg-panel shadow-card">
        <div className="relative h-36 sm:h-44">
          <div className="absolute inset-0 accent-gradient" />
          <div className="absolute inset-0 surface-grid opacity-30" />
          <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full bg-white/30 blur-[70px]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-panel via-panel/50 to-transparent" />
          {profile.banned ? (
            <div className="pointer-events-none absolute right-4 top-4 -rotate-12 sm:right-8 sm:top-6">
              <div className="h-20 w-20 overflow-hidden rounded-full bg-white shadow-card ring-2 ring-red-500/50 sm:h-28 sm:w-28">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/suspended-stamp.jpg"
                  alt="Suspended account"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative -mt-14 px-6 pb-8 sm:-mt-16 sm:px-8">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="h-28 w-28 rounded-full border-4 border-panel object-cover shadow-card ring-4 ring-accent/40"
            />
          ) : (
            <div className="accent-gradient flex h-28 w-28 items-center justify-center rounded-full border-4 border-panel text-4xl font-bold text-title shadow-card ring-4 ring-accent/40">
              {(profile.username || "?").slice(0, 1).toUpperCase()}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <h1 className="text-3xl font-bold tracking-tight text-title sm:text-4xl">
              {profile.username}
            </h1>
            {profile.role === "admin" ? (
              <>
                <AdminBadge size={24} label="Lumo team" />
                <LinkedProfileBadge size={34} />
              </>
            ) : null}
          </div>

          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span>@{profile.handle}</span>
            <span className="h-1 w-1 rounded-full bg-line" aria-hidden="true" />
            <span>Joined {formatDate(profile.created_at)}</span>
          </p>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mist/80">
            {profile.bio || "Creator on the Lumo Asset Store."}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Stat label="Assets" value={formatNumber(assets.length)} />
            <Stat label="Downloads" value={formatNumber(totalDownloads)} />
            {website ? (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent-soft px-4 py-2 text-sm font-medium text-accent-light transition hover:border-accent"
              >
                {website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </div>
        </div>
      </header>

      {profile.banned ? (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/suspended-stamp.jpg"
            alt=""
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-red-400">Account suspended</p>
            <p className="text-sm text-muted">
              This creator&apos;s account has been suspended by the Lumo team.
            </p>
          </div>
        </div>
      ) : null}

      <section className="mt-10">
        <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
          <h2 className="text-xl font-bold tracking-tight text-title">Published assets</h2>
          <span className="rounded-full border border-line bg-panel px-3 py-1 text-xs font-medium text-muted">
            {assets.length} {assets.length === 1 ? "asset" : "assets"}
          </span>
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
