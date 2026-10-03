"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseConfigured } from "@/lib/supabase";
import type { Asset } from "@/lib/types";
import { priceLabel } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

async function hasSession(): Promise<boolean> {
  if (!supabaseConfigured) return false;
  const { getBrowserClient } = await import("@/lib/supabase");
  const { data } = await getBrowserClient().auth.getSession();
  return Boolean(data.session);
}

export function DownloadButton({ asset }: { asset: Asset }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const free = Number(asset.price ?? 0) === 0;

  async function download() {
    setBusy(true);
    setError("");
    try {
      if (!free && !(await hasSession())) {
        router.push(`/login?next=/asset/${asset.slug}`);
        return;
      }
      const response = await fetch(`/api/assets/${asset.id}/download`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      });

      if (response.status === 401 || response.status === 402) {
        router.push(`/login?next=/asset/${asset.slug}`);
        return;
      }

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error?.message ?? "Download failed. Please try again.");
        return;
      }

      const data = await response.json();
      if (data?.url) window.location.href = data.url;
      router.refresh();
    } catch {
      setError("Download failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Button
        onClick={download}
        disabled={busy}
        size="lg"
        className="w-full"
        aria-label={`Download ${asset.title}`}
      >
        {busy ? (
          "Preparing…"
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path
                d="M12 4v10m0 0 4-4m-4 4-4-4M5 17v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {free ? "Download asset" : `Download · ${priceLabel(asset.price)}`}
          </>
        )}
      </Button>

      {!free ? (
        <p className="mt-2 text-center text-[11px] text-muted">
          Paid assets are free to download for signed-in users in v1 — checkout is not enabled.
        </p>
      ) : null}

      {error ? (
        <p className="mt-2 text-center text-xs text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
