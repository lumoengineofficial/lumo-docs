"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, readApiError } from "@/lib/client-auth";
import type { Asset } from "@/lib/types";
import { formatBytes, formatDate, formatNumber, placeholderImage, priceLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

export function QueueList({ items }: { items: Asset[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [comments, setComments] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});

  async function moderate(asset: Asset, action: "approve" | "reject") {
    const comment = (comments[asset.id] ?? "").trim();
    if (action === "reject" && !comment) {
      setMessages((m) => ({ ...m, [asset.id]: "Add a rejection comment first." }));
      return;
    }
    setBusyId(asset.id);
    setMessages((m) => ({ ...m, [asset.id]: "" }));

    const response = await apiFetch(`/api/admin/assets/${asset.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, comment }),
    });

    setBusyId("");
    if (!response.ok) {
      const errorText = await readApiError(response);
      setMessages((m) => ({ ...m, [asset.id]: errorText }));
      return;
    }
    setMessages((m) => ({
      ...m,
      [asset.id]: action === "approve" ? "Approved and published." : "Rejected with feedback.",
    }));
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="panel px-6 py-16 text-center">
        <p className="text-lg font-semibold text-white">Queue is clear</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Nothing to moderate right now. New submissions appear here as soon as publishers hit
          “Submit for review”.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="label-base" htmlFor="moderation-note">
          Note for publishers (optional)
        </label>
        <input
          id="moderation-note"
          className="input-base"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Extra context attached to approvals…"
        />
      </div>

      {items.map((asset) => (
        <article key={asset.id} className="panel overflow-hidden">
          <div className="grid gap-5 p-5 md:grid-cols-[200px_1fr]">
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-line bg-ink">
              <Image
                src={asset.thumbnail_url || placeholderImage(asset.slug, 640, 400)}
                alt={asset.title}
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{asset.title}</h3>
                  <p className="mt-0.5 text-sm text-muted">
                    by {asset.author?.username ?? "Unknown"} (@{asset.author?.handle ?? "—"}) ·{" "}
                    {formatDate(asset.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={asset.status} />
                  <Badge tone="accent">{asset.category}</Badge>
                  <Badge>{priceLabel(asset.price)}</Badge>
                  <Badge>v{asset.version}</Badge>
                </div>
              </div>

              <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-mist/80">
                {asset.description || "No description provided."}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {asset.tags.map((tag) => (
                  <span key={tag} className="rounded bg-panel2 px-2 py-0.5 text-[11px] text-muted">
                    #{tag}
                  </span>
                ))}
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-line pt-4 text-xs sm:grid-cols-4">
                <div>
                  <dt className="text-muted">File size</dt>
                  <dd className="mt-0.5 text-mist">{formatBytes(asset.file_size)}</dd>
                </div>
                <div>
                  <dt className="text-muted">License</dt>
                  <dd className="mt-0.5 text-mist">{asset.license}</dd>
                </div>
                <div>
                  <dt className="text-muted">Downloads</dt>
                  <dd className="mt-0.5 text-mist">{formatNumber(asset.downloads)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Asset id</dt>
                  <dd className="mt-0.5 truncate font-mono text-mist">{asset.id.slice(0, 8)}…</dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="label-base" htmlFor={`comment-${asset.id}`}>
                    Review comment
                  </label>
                  <textarea
                    id={`comment-${asset.id}`}
                    className="input-base min-h-[70px] resize-y text-sm"
                    value={comments[asset.id] ?? ""}
                    onChange={(e) => setComments((c) => ({ ...c, [asset.id]: e.target.value }))}
                    placeholder="Required when rejecting — tell the author what to fix."
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={`/api/assets/${asset.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-line bg-panel2 px-3.5 py-2.5 text-sm text-mist transition hover:border-accent/50 hover:text-white"
                  >
                    Raw JSON
                  </a>
                  {asset.status !== "approved" ? (
                    <button
                      type="button"
                      disabled={busyId === asset.id}
                      onClick={() => moderate(asset, "approve")}
                      className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {busyId === asset.id ? "…" : "Approve"}
                    </button>
                  ) : null}
                  {asset.status !== "rejected" ? (
                    <button
                      type="button"
                      disabled={busyId === asset.id}
                      onClick={() => moderate(asset, "reject")}
                      className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {busyId === asset.id ? "…" : "Reject"}
                    </button>
                  ) : null}
                </div>
              </div>

              {messages[asset.id] ? (
                <p className="mt-3 text-xs text-accent-light">{messages[asset.id]}</p>
              ) : null}
            </div>
          </div>

          {asset.status === "rejected" && asset.review_note ? (
            <div className="border-t border-line bg-red-500/5 px-5 py-3 text-xs text-red-200">
              Current feedback sent to author: {asset.review_note}
            </div>
          ) : null}
        </article>
      ))}

      <p className="text-xs text-muted">{feedback ? `Note: ${feedback}` : ""}</p>
      <Link href="/admin" className="inline-block text-sm text-accent-light hover:underline">
        ← Back to stats
      </Link>
    </div>
  );
}
