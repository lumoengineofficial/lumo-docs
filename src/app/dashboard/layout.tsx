import Link from "next/link";
import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

const NAV = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: (
      <path
        d="M4 5.5A1.5 1.5 0 0 1 5.5 4h4A1.5 1.5 0 0 1 11 5.5v4A1.5 1.5 0 0 1 9.5 11h-4A1.5 1.5 0 0 1 4 9.5v-4Zm9 0A1.5 1.5 0 0 1 14.5 4h4A1.5 1.5 0 0 1 20 5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 13 9.5v-4ZM4 14.5A1.5 1.5 0 0 1 5.5 13h4a1.5 1.5 0 0 1 1.5 1.5v4A1.5 1.5 0 0 1 9.5 20h-4A1.5 1.5 0 0 1 4 18.5v-4Zm9 0a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-4Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    ),
  },
  {
    href: "/dashboard/publish",
    label: "Publish asset",
    icon: (
      <path
        d="M12 5v14m0-14 5 5m-5-5-5 5M5 19h14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    ),
  },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireUser();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">
            Publisher dashboard
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Welcome back, {profile.username}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {profile.role === "admin" ? <Badge tone="accent">Admin</Badge> : null}
          <Link
            href={`/author/${profile.handle}`}
            className="rounded-lg border border-line bg-panel px-3.5 py-2 text-sm text-mist transition hover:border-accent/50 hover:text-white"
          >
            View public profile
          </Link>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1 lg:overflow-visible">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  "text-muted hover:bg-panel2 hover:text-white",
                )}
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  {item.icon}
                </svg>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-6 hidden rounded-xl border border-line bg-panel p-4 lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white">
              Review policy
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Submissions are reviewed within 48 hours. You will see admin feedback next to any
              rejected asset.
            </p>
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
