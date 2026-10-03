import Link from "next/link";
import { loadDocs } from "@/lib/markdown";
import { pageMeta } from "@/lib/seo";
import { DocsShell } from "@/components/docs/DocsShell";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-static";

export const metadata = pageMeta({
  title: "Documentation",
  description:
    "Learn how to install Lumo Engine, import glTF models, build and export games and consume the Asset Store API.",
  path: "/docs",
});

const highlights = [
  {
    slug: "getting-started",
    label: "Install the engine in 5 minutes",
    icon: (
      <path
        d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    slug: "importing-gltf-models",
    label: "Import glTF models",
    icon: (
      <path
        d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Zm0 0L12 12m0 0 9-4.5M12 12v9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    ),
  },
  {
    slug: "building-exporting-games",
    label: "Build & export games",
    icon: (
      <path
        d="m8 8-4 4 4 4m8-8 4 4-4 4M14 5l-4 14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export default async function DocsIndexPage() {
  const docs = await loadDocs();

  return (
    <DocsShell
      docs={docs}
      title="Lumo Engine documentation"
      description="Everything about the engine, the editor and the Asset Store — written by the team that builds Lumo."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {highlights.map((item) => (
          <Link
            key={item.slug}
            href={`/docs/${item.slug}`}
            className="group rounded-xl border border-line bg-panel p-4 transition hover:-translate-y-0.5 hover:border-accent/50"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-accent/30 bg-accent-soft text-accent-light transition group-hover:bg-accent group-hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden="true">
                {item.icon}
              </svg>
            </div>
            <p className="text-sm font-semibold text-white transition group-hover:text-accent-light">
              {item.label}
            </p>
          </Link>
        ))}
      </div>

      <h2 id="all-guides" className="mt-10 border-b border-line pb-2 text-xl font-semibold text-white">
        All guides
      </h2>
      <ul className="mt-4 space-y-3">
        {docs.map((doc) => (
          <li key={doc.slug}>
            <Link
              href={`/docs/${doc.slug}`}
              className="group flex items-start justify-between gap-4 rounded-xl border border-line bg-panel px-4 py-3.5 transition hover:border-accent/50"
            >
              <span>
                <span className="block text-[15px] font-medium text-white transition group-hover:text-accent-light">
                  {doc.title}
                </span>
                <span className="mt-0.5 block text-sm text-muted">{doc.description}</span>
              </span>
              <span className="mt-1 shrink-0 text-muted transition group-hover:text-accent-light">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-xl border border-accent/30 bg-accent-soft p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Integrating with the store?</h3>
            <p className="mt-1 text-sm text-muted">
              The editor&apos;s Asset Store tab talks to a public REST API.
            </p>
          </div>
          <Link
            href="/api-docs"
            className="rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            API reference
          </Link>
        </div>
        <div className="mt-3">
          <Badge tone="accent">GET /api/assets</Badge>
        </div>
      </div>
    </DocsShell>
  );
}
