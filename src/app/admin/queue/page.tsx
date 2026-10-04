import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listAssetsForModeration } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { QueueList } from "@/components/admin/QueueList";
import type { AssetStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = pageMeta({
  title: "Moderation queue",
  description: "Review pending asset submissions for the Lumo Asset Store.",
  path: "/admin/queue",
});

const TABS: { key: string; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "draft", label: "Drafts" },
  { key: "all", label: "All" },
];

interface QueuePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminQueuePage({ searchParams }: QueuePageProps) {
  await requireAdmin();
  const sp = await searchParams;
  const raw = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const status = TABS.some((t) => t.key === raw) ? (raw as string) : "pending";

  const items = await listAssetsForModeration(status as AssetStatus | "all");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-title">Moderation queue</h2>
          <p className="mt-1 text-sm text-muted">
            Approve to publish instantly, or reject with a comment the author will see on their
            dashboard.
          </p>
        </div>
        <Link href="/admin" className="text-sm text-accent-light hover:underline">
          ← Site stats
        </Link>
      </div>

      <nav className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/queue?status=${tab.key}`}
            className={cn(
              "rounded-lg border px-3.5 py-2 text-sm transition",
              status === tab.key
                ? "border-accent bg-accent-soft text-accent-light"
                : "border-line bg-panel text-muted hover:border-accent/40 hover:text-title",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <QueueList items={items} />
    </div>
  );
}
