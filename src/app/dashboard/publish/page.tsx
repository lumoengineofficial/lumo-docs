import { pageMeta } from "@/lib/seo";
import { PublishForm } from "@/components/dashboard/PublishForm";

export const dynamic = "force-dynamic";

export const metadata = pageMeta({
  title: "Publish an asset",
  description: "Upload a new asset pack to the Lumo Asset Store.",
  path: "/dashboard/publish",
});

export default function PublishPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-title">Publish a new asset</h2>
        <p className="mt-1.5 text-sm text-muted">
          Fill in the metadata, attach the zip and submit. Every submission is reviewed before it
          appears in the store.
        </p>
      </div>

      <ol className="flex flex-wrap gap-3 text-xs text-muted">
        <li className="rounded-lg border border-line bg-panel px-3 py-2">
          1 · Fill metadata
        </li>
        <li className="rounded-lg border border-line bg-panel px-3 py-2">2 · Upload zip</li>
        <li className="rounded-lg border border-accent/40 bg-accent-soft px-3 py-2 text-accent-light">
          3 · Moderation (48h)
        </li>
        <li className="rounded-lg border border-line bg-panel px-3 py-2">4 · Live in store</li>
      </ol>

      <PublishForm />
    </div>
  );
}
