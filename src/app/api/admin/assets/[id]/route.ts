import type { NextRequest } from "next/server";
import { ApiError, jsonOk, readString, requireAdmin, requireConfigured, withApi } from "@/lib/api";
import { getAssetById, updateAsset } from "@/lib/queries";
import { publicAsset } from "@/lib/serialize";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/assets/[id]  { action: "approve" | "reject" | "feature" | "unfeature", comment? }
 * Requires an admin Bearer JWT or the X-API-Key machine credential.
 */
export const PATCH = withApi(async (req: NextRequest, ctx: Ctx) => {
  requireConfigured();
  await requireAdmin(req);
  const { id } = await ctx.params;

  const contentType = req.headers.get("content-type") ?? "";
  const body = contentType.includes("multipart")
    ? Object.fromEntries((await req.formData()).entries())
    : await req.json().catch(() => null);

  if (!body) throw new ApiError(400, "invalid_body", "Expected a JSON body.");

  const action = readString(body as Record<string, unknown>, "action").toLowerCase();
  const comment = readString(body as Record<string, unknown>, "comment").slice(0, 1000);

  const asset = await getAssetById(decodeURIComponent(id), { anyStatus: true });
  if (!asset) throw new ApiError(404, "not_found", "Asset not found.");

  const patch: Record<string, unknown> = {};

  switch (action) {
    case "approve":
      patch.status = "approved";
      patch.review_note = comment || null;
      patch.featured = asset.featured ?? false;
      break;
    case "reject":
      if (!comment) {
        throw new ApiError(400, "missing_comment", "A rejection comment is required.");
      }
      patch.status = "rejected";
      patch.review_note = comment;
      patch.featured = false;
      break;
    case "feature":
      if (asset.status !== "approved") {
        throw new ApiError(409, "not_approved", "Only approved assets can be featured.");
      }
      patch.featured = true;
      break;
    case "unfeature":
      patch.featured = false;
      break;
    default:
      throw new ApiError(
        400,
        "invalid_action",
        "action must be approve, reject, feature or unfeature.",
      );
  }

  const updated = await updateAsset(asset.id, patch);
  return jsonOk({ asset: publicAsset(updated), action });
});

import { corsOptions } from "@/lib/api";

export const OPTIONS = corsOptions;
