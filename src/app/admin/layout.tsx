import Link from "next/link";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";

const TABS = [
  { href: "/admin", label: "Site stats" },
  { href: "/admin/queue", label: "Moderation queue" },
  { href: "/admin/featured", label: "Featured" },
  { href: "/admin/users", label: "Users" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireAdmin();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 border-b border-line pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">
              Admin panel
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-title sm:text-3xl">
              Store administration
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone="accent">role: admin</Badge>
            <span className="text-sm text-muted">{profile.email}</span>
          </div>
        </div>

        <nav className="mt-5 flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="rounded-lg border border-line bg-panel px-3.5 py-2 text-sm text-muted transition hover:border-accent/50 hover:text-title"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </header>

      <div>{children}</div>
    </div>
  );
}
