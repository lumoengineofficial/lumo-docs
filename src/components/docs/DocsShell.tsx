import Link from "next/link";
import type { ReactNode } from "react";
import type { DocMeta, TocItem } from "@/lib/markdown";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export function DocsShell({
  docs,
  activeSlug,
  toc,
  title,
  description,
  children,
  sidebarExtra,
  sidebarTitle = "Documentation",
  docsHrefPrefix = "/docs/",
}: {
  docs: DocMeta[];
  activeSlug?: string;
  toc?: TocItem[];
  title: string;
  description?: string;
  children: ReactNode;
  sidebarExtra?: ReactNode;
  sidebarTitle?: string;
  docsHrefPrefix?: string;
}) {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[240px_1fr_210px] lg:px-8">
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white">
          {sidebarTitle}
        </p>
        <nav className="flex flex-col gap-1">
          {docs.map((doc) => {
            const active = doc.slug === activeSlug;
            return (
              <Link
                key={doc.slug}
                href={`${docsHrefPrefix}${doc.slug}`}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-accent-soft font-medium text-accent-light"
                    : "text-muted hover:bg-panel2 hover:text-white",
                )}
              >
                {doc.title}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 space-y-1 border-t border-line pt-6">
          <Link
            href="/api-docs"
            className="block rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-panel2 hover:text-white"
          >
            REST API reference
          </Link>
          <Link
            href="/store"
            className="block rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-panel2 hover:text-white"
          >
            Browse the store
          </Link>
        </div>

        {sidebarExtra ? <div className="mt-6">{sidebarExtra}</div> : null}
      </aside>

      <article className="min-w-0">
        <div className="mb-6 border-b border-line pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
          {description ? (
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{description}</p>
          ) : null}
        </div>
        <div className="markdown" id="doc-content">
          {children}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-panel px-5 py-4">
          <div>
            <p className="text-sm font-medium text-white">Was this page helpful?</p>
            <p className="text-xs text-muted">Tell the Lumo team what is missing.</p>
          </div>
          <Link
            href="https://github.com/lumoengineofficial/lumo/issues"
            className="rounded-lg border border-accent/50 bg-accent-soft px-3.5 py-2 text-sm font-medium text-accent-light transition hover:bg-accent hover:text-white"
          >
            Open an issue
          </Link>
        </div>
      </article>

      <nav className="hidden lg:sticky lg:top-24 lg:block lg:h-fit">
        {toc && toc.length > 0 ? (
          <>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              On this page
            </p>
            <ul className="space-y-1.5 border-l border-line">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={cn(
                      "-ml-px block border-l border-transparent py-0.5 text-[13px] text-muted transition hover:border-accent hover:text-accent-light",
                      item.level === 3 && "pl-6",
                      item.level === 2 && "pl-3",
                    )}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <div className="mt-8 flex items-center gap-2">
          <Badge tone="accent">v1.0.0</Badge>
          <Badge>Docs</Badge>
        </div>
      </nav>
    </div>
  );
}
