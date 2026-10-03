import Link from "next/link";
import { SITE } from "@/lib/constants";
import { LumoMark } from "@/components/ui/LumoMark";

const columns = [
  {
    title: "Store",
    links: [
      { href: "/store", label: "Browse assets" },
      { href: "/plugins", label: "Plugins" },
      { href: "/store?category=Templates", label: "Templates" },
      { href: "/store?price=free", label: "Free assets" },
      { href: "/dashboard", label: "Publish an asset" },
    ],
  },
  {
    title: "Engine",
    links: [
      { href: SITE.engineZip, label: "Download v1.0.0" },
      { href: SITE.releases, label: "All releases" },
      { href: SITE.repo, label: "GitHub repository" },
      { href: SITE.issues, label: "Report an issue" },
    ],
  },
  {
    title: "Developers",
    links: [
      { href: "/docs", label: "Documentation" },
      { href: "/docs/asset-store-api", label: "Asset Store API" },
      { href: "/api-docs", label: "API reference" },
      { href: "/signup", label: "Create an account" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-[#080b12]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <LumoMark className="h-8 w-8" />
              <span className="flex flex-col leading-tight">
                <span className="text-[15px] font-bold tracking-tight text-white">Lumo</span>
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent-light">
                  Asset Store
                </span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              The official asset store for {SITE.shortName} Engine — an open source 3D game
              engine. Drop assets into your project and start building.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition hover:text-accent-light"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Lumo Engine. Asset Store is free software.
          </p>
          <p className="text-xs text-muted">
            Built with Next.js + Supabase ·{" "}
            <Link href="/api-docs" className="text-accent-light hover:underline">
              v1 REST API
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
