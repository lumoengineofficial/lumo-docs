import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth";
import { ApiError, getPrincipal, requireConfigured, withApi } from "@/lib/api";
import { bumpDownloads, getAssetByIdOrSlug } from "@/lib/queries";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/assets/[id]/download
 * Increments the download counter and returns the file URL.
 * Free assets are open; paid assets require a Bearer JWT, a browser session or X-API-Key.
 * Responds with a 302 redirect for browsers, JSON for API clients.
 */
export const GET = withApi(async (req: NextRequest, ctx: Ctx) => {
  requireConfigured();
  const { id } = await ctx.params;
  const asset = await getAssetByIdOrSlug(decodeURIComponent(id), { anyStatus: true });
  if (!asset || asset.status !== "approved") {
    throw new ApiError(404, "not_found", "Asset not found.");
  }

  const paid = Number(asset.price ?? 0) > 0;
  if (paid) {
    const principal = await getPrincipal(req).catch(() => ({ type: "anonymous" as const }));
    let authorized = principal.type === "machine";
    if (!authorized && principal.type === "user") authorized = true;
    if (!authorized) {
      const sessionProfile: Profile | null = await getSessionProfile();
      authorized = Boolean(sessionProfile);
    }
    if (!authorized) {
      throw new ApiError(
        401,
        "login_required",
        "This asset is paid — sign in (or send a Bearer token) to download it.",
      );
    }
  }

  await bumpDownloads(asset.id);

  const accept = req.headers.get("accept") ?? "";
  const wantsJson =
    accept.includes("application/json") ||
    Boolean(req.headers.get("x-api-key")) ||
    req.nextUrl.searchParams.get("format") === "json";

  if (!wantsJson && !asset.file_url) {
    throw new ApiError(404, "missing_file", "This asset has no file attached.");
  }

  if (!wantsJson) {
    return NextResponse.redirect(asset.file_url, 302);
  }

  return NextResponse.json(
    {
      id: asset.id,
      title: asset.title,
      slug: asset.slug,
      url: asset.file_url,
      filename: `${asset.slug}-v${asset.version}.zip`,
      fileSize: Number(asset.file_size ?? 0),
      downloads: Number(asset.downloads ?? 0) + 1,
      license: asset.license,
    },
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      },
    },
  );
});

import { corsOptions } from "@/lib/api";

export const OPTIONS = corsOptions;
