import { loadApiSections } from "@/lib/markdown";
import { pageMeta } from "@/lib/seo";
import { DocsShell } from "@/components/docs/DocsShell";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-static";

export const metadata = pageMeta({
  title: "REST API Reference",
  description:
    "Full reference for the Lumo Asset Store REST API v1 — assets, auth, admin moderation, machine access via X-API-Key and error formats.",
  path: "/api-docs",
});

const QUICK_LINKS = [
  { method: "GET", path: "/api/assets", note: "List & search assets" },
  { method: "GET", path: "/api/assets/[id]", note: "Asset detail" },
  { method: "POST", path: "/api/auth/login", note: "Get a JWT" },
  { method: "POST", path: "/api/assets", note: "Publish (multipart)" },
  { method: "PATCH", path: "/api/admin/assets/[id]", note: "Approve / reject" },
];

export default async function ApiDocsPage() {
  const sections = await loadApiSections();

  return (
    <DocsShell
      docs={sections}
      docsHrefPrefix="/api-docs#"
      sidebarTitle="API reference"
      title="Asset Store REST API v1"
      description="The same endpoints the Lumo editor's Asset Store tab uses. Public reads need no authentication; publishers authenticate with a Bearer JWT and machine clients can send X-API-Key instead."
      toc={sections.flatMap((section) => section.toc)}
    >
      <div className="mb-8 flex flex-wrap gap-2">
        <Badge tone="accent">Base URL: /api</Badge>
        <Badge>JSON</Badge>
        <Badge>Bearer JWT</Badge>
        <Badge>X-API-Key</Badge>
        <Badge>CORS enabled</Badge>
      </div>

      <div className="mb-8 overflow-hidden rounded-xl border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-panel2">
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-muted">
                Method
              </th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-muted">
                Endpoint
              </th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-muted">
                Purpose
              </th>
            </tr>
          </thead>
          <tbody>
            {QUICK_LINKS.map((row) => (
              <tr key={`${row.method}${row.path}`}>
                <td className="border-t border-line px-3 py-2">
                  <span
                    className={
                      row.method === "GET"
                        ? "text-emerald-300"
                        : row.method === "POST"
                          ? "text-accent-light"
                          : "text-amber-300"
                    }
                  >
                    {row.method}
                  </span>
                </td>
                <td className="border-t border-line px-3 py-2 font-mono text-xs text-mist">
                  {row.path}
                </td>
                <td className="border-t border-line px-3 py-2 text-muted">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sections.map((section) => (
        <section key={section.slug} id={section.slug} className="scroll-mt-24">
          <div dangerouslySetInnerHTML={{ __html: section.html }} />
        </section>
      ))}
    </DocsShell>
  );
}
