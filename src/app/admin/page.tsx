import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAdminStats, listAssetsForModeration, listUsers } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { formatDate, formatNumber } from "@/lib/utils";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export const metadata = pageMeta({
  title: "Admin panel",
  description: "Moderation, users and site statistics for the Lumo Asset Store.",
  path: "/admin",
});

export default async function AdminHomePage() {
  await requireAdmin();
  const [stats, recent, users] = await Promise.all([
    getAdminStats(),
    listAssetsForModeration("all"),
    listUsers(),
  ]);

  const cards = [
    { label: "Total assets", value: stats.totalAssets, hint: `${stats.approved} live` },
    { label: "Pending review", value: stats.pending, hint: "moderation queue" },
    { label: "Downloads", value: stats.totalDownloads, hint: "all time" },
    { label: "Users", value: stats.totalUsers, hint: `${stats.featured} featured assets` },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="panel p-5">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-title">
              {formatNumber(card.value)}
            </p>
            <p className="mt-1 text-xs text-muted">{card.hint}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-base font-semibold text-title">Latest submissions</h2>
            <Link href="/admin/queue" className="text-xs text-accent-light hover:underline">
              Open queue →
            </Link>
          </div>
          <ul className="divide-y divide-line/70">
            {recent.slice(0, 6).map((asset) => (
              <li key={asset.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-title">{asset.title}</p>
                  <p className="truncate text-xs text-muted">
                    {asset.author?.username ?? "Unknown"} · {asset.category}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-muted">{formatDate(asset.created_at)}</span>
                  <StatusBadge status={asset.status} />
                </div>
              </li>
            ))}
            {recent.length === 0 ? (
              <li className="px-5 py-8 text-center text-sm text-muted">No submissions yet.</li>
            ) : null}
          </ul>
        </div>

        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-base font-semibold text-title">Newest users</h2>
            <Link href="/admin/users" className="text-xs text-accent-light hover:underline">
              Manage →
            </Link>
          </div>
          <ul className="divide-y divide-line/70">
            {users.slice(0, 6).map((user) => (
              <li key={user.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-title">{user.username}</p>
                  <p className="truncate text-xs text-muted">{user.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {user.banned ? <Badge tone="danger">Banned</Badge> : null}
                  {user.role === "admin" ? <Badge tone="accent">Admin</Badge> : null}
                  <span className="text-xs text-muted">{formatDate(user.created_at)}</span>
                </div>
              </li>
            ))}
            {users.length === 0 ? (
              <li className="px-5 py-8 text-center text-sm text-muted">No users yet.</li>
            ) : null}
          </ul>
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <ButtonLink href="/admin/queue" size="lg">
          Review {stats.pending} pending {stats.pending === 1 ? "asset" : "assets"}
        </ButtonLink>
        <ButtonLink href="/admin/featured" variant="secondary" size="lg">
          Manage featured assets
        </ButtonLink>
        <ButtonLink href="/store" variant="ghost" size="lg">
          View store →
        </ButtonLink>
      </section>
    </div>
  );
}
