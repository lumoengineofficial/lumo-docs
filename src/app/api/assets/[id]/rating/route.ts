import type { NextRequest } from "next/server";
import { ApiError, corsOptions, getPrincipal, jsonOk, requireConfigured, withApi } from "@/lib/api";
import { getSessionProfile } from "@/lib/auth";
import {
  getAssetByIdOrSlug,
  getRatingSummary,
  getUserRating,
  setUserRating,
} from "@/lib/queries";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export const OPTIONS = corsOptions;

interface Ctx {
  params: Promise<{ id: string }>;
}

async function resolveProfile(req: NextRequest): Promise<Profile | null> {
  const principal = await getPrincipal(req).catch(() => ({ type: "anonymous" as const }));
  if (principal.type === "user") return principal.profile;
  if (principal.type === "machine") return null;
  return await getSessionProfile();
}

/**
 * GET /api/assets/[id]/rating
 * Aggregated rating plus the caller's own stars (null when anonymous).
 */
export const GET = withApi(async (req: NextRequest, ctx: Ctx) => {
  requireConfigured();
  const { id } = await ctx.params;
  const asset = await getAssetByIdOrSlug(decodeURIComponent(id));
  if (!asset) throw new ApiError(404, "not_found", "Asset not found.");

  const profile = await resolveProfile(req);
  const summary = await getRatingSummary(asset.id);
  const myRating = profile ? await getUserRating(asset.id, profile.id) : null;
  return jsonOk({ ...summary, my_rating: myRating });
});

/**
 * POST /api/assets/[id]/rating { stars: 1..5 }
 * Upserts the caller's rating. Requires a signed-in, unbanned user who does
 * not own the asset.
 */
export const POST = withApi(async (req: NextRequest, ctx: Ctx) => {
  requireConfigured();

  const profile = await resolveProfile(req);
  if (!profile) throw new ApiError(401, "login_required", "Sign in to rate this asset.");
  if (profile.banned) throw new ApiError(403, "forbidden", "Your account is suspended.");

  const body = (await req.json().catch(() => null)) as { stars?: unknown } | null;
  const stars = Number(body?.stars);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    throw new ApiError(400, "invalid_rating", "Rating must be a whole number from 1 to 5.");
  }

  const { id } = await ctx.params;
  const asset = await getAssetByIdOrSlug(decodeURIComponent(id));
  if (!asset) throw new ApiError(404, "not_found", "Asset not found.");
  if (asset.author_id === profile.id) {
    throw new ApiError(403, "own_asset", "You cannot rate your own asset.");
  }

  await setUserRating(asset.id, profile.id, stars);

  const summary = await getRatingSummary(asset.id);
  const myRating = await getUserRating(asset.id, profile.id);
  return jsonOk({ ...summary, my_rating: myRating });
});
