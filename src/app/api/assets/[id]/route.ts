import type { NextRequest } from "next/server";
import {
  ApiError,
  getPrincipal,
  jsonOk,
  readString,
  requireConfigured,
  requireUser,
  withApi,
} from "@/lib/api";
import { getAssetByIdOrSlug, updateAsset } from "@/lib/queries";
import { collaboratorsReady, parseCollaboratorIds, setAssetCollaborators } from "@/lib/collab";
import { publicAsset } from "@/lib/serialize";
import { storageAvailable, uploadToBucket } from "@/lib/storage";
import { parseAssetFields, pickFile } from "@/lib/validate";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/assets/[id]
 * Accepts a UUID or a slug. Returns JSON with id, title, slug, author, category,
 * tags, price, downloads, thumbnail, version and file.
 */
export const GET = withApi(async (req: NextRequest, ctx: Ctx) => {
  requireConfigured();
  const { id } = await ctx.params;
  const asset = await getAssetByIdOrSlug(decodeURIComponent(id), { anyStatus: true });
  if (!asset) throw new ApiError(404, "not_found", "Asset not found.");

  if (asset.status !== "approved") {
    const principal = await getPrincipal(req).catch(() => ({ type: "anonymous" as const }));
    const isOwner =
      principal.type === "user" && principal.profile.id === asset.author_id;
    const isAdmin = principal.type === "user" && principal.profile.role === "admin";
    if (principal.type !== "machine" && !isOwner && !isAdmin) {
      throw new ApiError(404, "not_found", "Asset not found.");
    }
  }

  return jsonOk(
    { asset: publicAsset(asset) },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
});

/**
 * PATCH /api/assets/[id]  (Bearer JWT of the owner, admin, or X-API-Key)
 * JSON metadata patch, or multipart/form-data to also replace the zip / thumbnail.
 * Owners may move their asset to "draft" (unpublish) or back to "pending".
 */
export const PATCH = withApi(async (req: NextRequest, ctx: Ctx) => {
  requireConfigured();
  const principal = await requireUser(req);
  const { id } = await ctx.params;

  const asset = await getAssetByIdOrSlug(decodeURIComponent(id), { anyStatus: true });
  if (!asset) throw new ApiError(404, "not_found", "Asset not found.");

  const isOwner = principal.type === "user" && principal.profile.id === asset.author_id;
  const isAdmin = principal.type === "user" && principal.profile.role === "admin";
  if (principal.type !== "machine" && !isOwner && !isAdmin) {
    throw new ApiError(403, "forbidden", "You can only edit your own assets.");
  }

  const contentType = req.headers.get("content-type") ?? "";
  const isMultipart = contentType.includes("multipart/form-data");

  const source: FormData | Record<string, unknown> = isMultipart
    ? await req.formData()
    : ((await req.json().catch(() => null)) ?? null);

  if (!source) throw new ApiError(400, "invalid_body", "Expected a JSON or form body.");

  const fields = parseAssetFields(source, {
    title: asset.title,
    description: asset.description,
    category: asset.category,
    tags: asset.tags ?? [],
    price: Number(asset.price ?? 0),
    license: asset.license,
    version: asset.version,
  });
  const patch: Record<string, unknown> = {
    title: fields.title,
    description: fields.description,
    category: fields.category,
    tags: fields.tags,
    price: fields.price,
    license: fields.license,
    version: fields.version,
  };

  if (isMultipart) {
    const form = source as FormData;
    const zipFile = pickFile(form, "file");
    const thumbFile = pickFile(form, "thumbnail");
    if (zipFile || thumbFile) {
      if (!storageAvailable()) {
        throw new ApiError(
          503,
          "storage_unavailable",
          "SUPABASE_SERVICE_ROLE_KEY is required to upload files.",
        );
      }
      const owner = asset.author_id;
      if (zipFile) {
        const uploaded = await uploadToBucket("assets", zipFile, owner);
        patch.file_url = uploaded.url;
        patch.file_size = uploaded.size;
      }
      if (thumbFile) {
        const uploaded = await uploadToBucket("covers", thumbFile, owner);
        patch.thumbnail_url = uploaded.url;
      }
    }
  }

  const requestedStatus = readString(source, "status");
  if (requestedStatus === "draft" || requestedStatus === "pending") {
    if (principal.type === "machine" || isOwner || isAdmin) patch.status = requestedStatus;
  }

  const collabPresent =
    source instanceof FormData
      ? source.has("collaborator_ids")
      : "collaborator_ids" in source;
  let collaboratorIds: string[] | null = null;
  if (collabPresent) {
    collaboratorIds = await parseCollaboratorIds(
      readString(source, "collaborator_ids"),
      asset.author_id,
    );
    if (collaboratorIds.length > 0 && !(await collaboratorsReady())) {
      throw new ApiError(
        503,
        "collaborators_unavailable",
        "Run supabase/migrations/0004_asset_collaborators.sql in the Supabase SQL editor first.",
      );
    }
  }

  if (asset.status === "rejected" && !patch.status) patch.status = "pending";

  const updated = await updateAsset(asset.id, patch);

  if (collaboratorIds) {
    const problem = await setAssetCollaborators(asset.id, collaboratorIds);
    if (problem) throw new ApiError(503, "collaborators_unavailable", problem);
  }

  const fresh = (await getAssetByIdOrSlug(asset.id, { anyStatus: true })) ?? updated;
  return jsonOk({ asset: publicAsset(fresh) });
});

import { corsOptions } from "@/lib/api";

export const OPTIONS = corsOptions;
