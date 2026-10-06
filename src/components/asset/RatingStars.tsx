"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBrowserClient, supabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  assetId: string;
  assetSlug: string;
  authorId: string;
  rating: number;
  ratingCount: number;
}

function StarIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-5 w-5", className)}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 17.3-5.6 3.2 1.5-6.3L3 9.8l6.4-.6L12 3.3l2.6 5.9 6.4.6-4.9 4.4 1.5 6.3z" />
    </svg>
  );
}

export function RatingStars({ assetId, assetSlug, authorId, rating, ratingCount }: RatingStarsProps) {
  const [summary, setSummary] = useState({ rating, ratingCount });
  const [myRating, setMyRating] = useState<number | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const signedIn = uid !== null;
  const ownsAsset = signedIn && uid === authorId;
  const interactive = signedIn && !ownsAsset;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!supabaseConfigured) {
        setReady(true);
        return;
      }
      try {
        const { data } = await getBrowserClient().auth.getSession();
        const session = data.session;
        if (cancelled || !session) return;
        setUid(session.user.id);
        const res = await fetch(`/api/assets/${assetId}/rating`, {
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          const json = (await res.json()) as {
            rating: number;
            rating_count: number;
            my_rating: number | null;
          };
          if (cancelled) return;
          setSummary({ rating: json.rating, ratingCount: json.rating_count });
          setMyRating(json.my_rating);
        }
      } catch {
        /* rating stays read-only */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [assetId]);

  async function authHeader(): Promise<Record<string, string>> {
    try {
      const { data } = await getBrowserClient().auth.getSession();
      const token = data.session?.access_token;
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
      return {};
    }
  }

  async function submit(stars: number) {
    if (busy || !interactive) return;
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch(`/api/assets/${assetId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeader()) },
        body: JSON.stringify({ stars }),
      });
      const json = (await res.json().catch(() => null)) as {
        error?: { message?: string };
        rating?: number;
        rating_count?: number;
        my_rating?: number | null;
      } | null;
      if (!res.ok) {
        setNote(json?.error?.message ?? "Could not save your rating.");
        return;
      }
      setSummary({ rating: Number(json?.rating ?? 0), ratingCount: Number(json?.rating_count ?? 0) });
      setMyRating(json?.my_rating ?? stars);
      setNote("Thanks for rating!");
    } catch {
      setNote("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  const displayStars = hover ?? myRating ?? 0;
  const avgFilled = Math.round((summary.rating / 5) * 100);

  return (
    <section className="rounded-2xl border border-line bg-panel p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-title">Rating</h2>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-2xl font-bold text-title">
          {summary.ratingCount > 0 ? summary.rating.toFixed(1) : "—"}
        </span>
        <div className="min-w-0">
          <div className="relative inline-flex" aria-label={`Average ${summary.rating} out of 5`}>
            <span className="flex gap-0.5 text-line">
              {[1, 2, 3, 4, 5].map((n) => (
                <StarIcon key={n} filled={false} className="h-4 w-4" />
              ))}
            </span>
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${summary.ratingCount > 0 ? avgFilled : 0}%` }}
            >
              <span className="flex gap-0.5 text-accent">
                {[1, 2, 3, 4, 5].map((n) => (
                  <StarIcon key={n} filled className="h-4 w-4" />
                ))}
              </span>
            </span>
          </div>
          <p className="text-xs text-muted">
            {summary.ratingCount} {summary.ratingCount === 1 ? "rating" : "ratings"}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-line pt-4">
        {interactive ? (
          <>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
              {myRating ? "Your rating" : "Rate this asset"}
            </p>
            <div
              className="mt-2 flex items-center gap-1"
              onMouseLeave={() => setHover(null)}
              role="radiogroup"
              aria-label="Rate this asset"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={myRating === n}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  disabled={busy}
                  onMouseEnter={() => setHover(n)}
                  onFocus={() => setHover(n)}
                  onBlur={() => setHover(null)}
                  onClick={() => submit(n)}
                  className={cn(
                    "text-line transition hover:scale-110 disabled:opacity-50",
                    n <= displayStars && "text-accent",
                  )}
                >
                  <StarIcon filled={n <= displayStars} />
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">
            {ownsAsset ? (
              "This is your asset — you cannot rate it."
            ) : ready && !signedIn ? (
              <>
                <Link href={`/login?next=/asset/${assetSlug}`} className="font-medium text-accent-light hover:underline">
                  Sign in
                </Link>{" "}
                to rate this asset.
              </>
            ) : (
              "Sign in to rate this asset."
            )}
          </p>
        )}
        {note ? <p className="mt-2 text-xs font-medium text-accent-light">{note}</p> : null}
      </div>
    </section>
  );
}
