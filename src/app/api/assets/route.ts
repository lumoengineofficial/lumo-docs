import type { NextRequest } from "next/server";
import {
  ApiError,
  jsonOk,
  readString,
  requireConfigured,
  requireUser,
  withApi,
} from "@/lib/api";
import { createAsset, listAssets } from "@/lib/queries";
import { publicAsset } from "@/lib/serialize";
import { storageAvailable, uploadToBucket } from "@/lib/storage";
import { placeholderImage, slugify } from "@/lib/utils";
import { parseAssetFields, pickFile } from "@/lib/validate";
import type { SortKey } from "@/lib/types";

export const dynamic = "force-dynamic";

const MAX_PER_PAGE = 48;

/**
 * GET /api/assets?category=&q=&page=&sort=&price=&perPage=
 * Public read — no authentication required.
 */
export const GET = withApi(async (req: NextRequest) => {
  requireConfigured();
  const params = req.nextUrl.searchParams;

  const sortParam = params.get("sort") ?? "newest";
  const sort: SortKey =
    sortParam === "popular" || sortParam === "rating" ? sortParam : "newest";
  const priceParam = params.get("price");
  const page = Math.max(1, Number(params.get("page") ?? 1) || 1);
  const perPage = Math.min(
    MAX_PER_PAGE,
    Math.max(1, Number(params.get("perPage") ?? 12) || 12),
  );

  const results = await listAssets({
    q: params.get("q") ?? undefined,
    category: params.get("category") ?? undefined,
    price: priceParam === "free" || priceParam === "paid" ? priceParam : undefined,
    sort,
    page,
    perPage,
  });

  return jsonOk(
    {
      items: results.items.map(publicAsset),
      total: results.total,
      page: results.page,
      perPage: results.perPage,
      pageCount: results.pageCount,
    },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
});

/**
 * POST /api/assets  (Bearer JWT or X-API-Key)
 * multipart/form-data: title, description, category, tags, license, version, price,
 * file (zip → bucket "assets"), thumbnail (image → bucket "covers").
 * JSON is also accepted when file_url / thumbnail_url are provided.
 */
export const POST = withApi(async (req: NextRequest) => {
  requireConfigured();
  const principal = await requireUser(req);
  if (principal.type === "anonymous") {
    throw new ApiError(401, "unauthorized", "Authentication required.");
  }

  const contentType = req.headers.get("content-type") ?? "";
  const isMultipart = contentType.includes("multipart/form-data");

  let source: FormData | Record<string, unknown>;
  let fields: ReturnType<typeof parseAssetFields>;
  let zipFile: File | null = null;
  let thumbFile: File | null = null;
  let fileUrl = "";
  let thumbUrl = "";
  let fileSize = 0;

  if (isMultipart) {
    const form = await req.formData();
    source = form;
    fields = parseAssetFields(form);
    zipFile = pickFile(form, "file");
    thumbFile = pickFile(form, "thumbnail");
    fileUrl = readString(form, "file_url");
    thumbUrl = readString(form, "thumbnail_url");
    fileSize = Number(readString(form, "file_size") || 0);
  } else {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) throw new ApiError(400, "invalid_body", "Expected a JSON or form body.");
    source = body;
    fields = parseAssetFields(body);
    fileUrl = String(body.file_url ?? "").trim();
    thumbUrl = String(body.thumbnail_url ?? "").trim();
    fileSize = Number(body.file_size ?? 0);
  }

  const authorId = principal.type === "user" ? principal.profile.id : null;
  if (!authorId && !zipFile && !fileUrl) {
    throw new ApiError(400, "missing_file", "A zip file (or file_url) is required.");
  }

  if ((zipFile || thumbFile) && !storageAvailable()) {
    throw new ApiError(
      503,
      "storage_unavailable",
      "SUPABASE_SERVICE_ROLE_KEY is required to upload files.",
    );
  }

  if (zipFile) {
    const uploaded = await uploadToBucket("assets", zipFile, authorId ?? "machine");
    fileUrl = uploaded.url;
    fileSize = uploaded.size;
  }

  if (thumbFile) {
    const uploaded = await uploadToBucket("covers", thumbFile, authorId ?? "machine");
    thumbUrl = uploaded.url;
  }

  if (!fileUrl) throw new ApiError(400, "missing_file", "A zip file (or file_url) is required.");
  if (!thumbUrl) thumbUrl = placeholderImage(slugify(fields.title), 1200, 750);

  if (!authorId) {
    throw new ApiError(
      400,
      "missing_author",
      "Machine-created assets need a JSON body with author_id.",
    );
  }

  const asset = await createAsset({
    author_id: authorId,
    title: fields.title,
    description: fields.description,
    category: fields.category,
    tags: fields.tags,
    price: fields.price,
    license: fields.license,
    version: fields.version,
    file_url: fileUrl,
    thumbnail_url: thumbUrl,
    file_size: fileSize,
    status: readString(source, "status") === "draft" ? "draft" : "pending",
  });

  return jsonOk({ asset: publicAsset(asset) }, { status: 201 });
});

import { corsOptions } from "@/lib/api";

export const OPTIONS = corsOptions;
