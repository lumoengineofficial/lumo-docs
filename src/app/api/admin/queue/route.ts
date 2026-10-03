import type { NextRequest } from "next/server";
import { ApiError, jsonOk, requireAdmin, requireConfigured, withApi } from "@/lib/api";
import { listAssetsForModeration } from "@/lib/queries";
import { publicAsset } from "@/lib/serialize";
import type { AssetStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID = new Set(["pending", "approved", "rejected", "draft", "all"]);

/**
 * GET /api/admin/queue?status=pending  (Bearer JWT of an admin, or X-API-Key)
 * Moderation queue — submissions awaiting review.
 */
export const GET = withApi(async (req: NextRequest) => {
  requireConfigured();
  await requireAdmin(req);

  const status = req.nextUrl.searchParams.get("status") ?? "pending";
  if (!VALID.has(status)) {
    throw new ApiError(400, "invalid_status", "status must be pending|approved|rejected|draft|all.");
  }

  const assets = await listAssetsForModeration(status as AssetStatus | "all");
  return jsonOk({
    items: assets.map(publicAsset),
    total: assets.length,
    status,
  });
});

import { corsOptions } from "@/lib/api";

export const OPTIONS = corsOptions;
