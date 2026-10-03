"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, readApiError } from "@/lib/client-auth";
import type { Asset } from "@/lib/types";

export function AssetActions({ asset }: { asset: Asset }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function setStatus(status: "draft" | "pending") {
    setBusy(true);
    setMessage("");
    const response = await apiFetch(`/api/assets/${asset.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    if (!response.ok) {
      setMessage(await readApiError(response));
      return;
    }
    setMessage(status === "draft" ? "Unpublished." : "Submitted for review.");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {asset.status === "approved" ? (
        <Link
          href={`/asset/${asset.slug}`}
          className="rounded-md border border-line bg-panel2 px-2.5 py-1.5 text-xs text-mist transition hover:border-accent/50 hover:text-white"
        >
          View
        </Link>
      ) : null}

      <Link
        href={`/dashboard/edit/${asset.id}`}
        className="rounded-md border border-line bg-panel2 px-2.5 py-1.5 text-xs text-mist transition hover:border-accent/50 hover:text-white"
      >
        Edit
      </Link>

      {asset.status === "approved" ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => setStatus("draft")}
          className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-300 transition hover:bg-amber-500/20 disabled:opacity-50"
        >
          {busy ? "…" : "Unpublish"}
        </button>
      ) : null}

      {asset.status === "draft" || asset.status === "rejected" ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => setStatus("pending")}
          className="rounded-md border border-accent/40 bg-accent-soft px-2.5 py-1.5 text-xs text-accent-light transition hover:bg-accent/20 disabled:opacity-50"
        >
          {busy ? "…" : "Submit for review"}
        </button>
      ) : null}

      {message ? <span className="text-xs text-muted">{message}</span> : null}
    </div>
  );
}
