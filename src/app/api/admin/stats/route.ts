import type { NextRequest } from "next/server";
import { jsonOk, requireAdmin, requireConfigured, withApi } from "@/lib/api";
import { getAdminStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

/** GET /api/admin/stats — admin Bearer JWT or X-API-Key. */
export const GET = withApi(async (req: NextRequest) => {
  requireConfigured();
  await requireAdmin(req);
  const stats = await getAdminStats();
  return jsonOk(stats, { headers: { "Cache-Control": "no-store" } });
});

import { corsOptions } from "@/lib/api";

export const OPTIONS = corsOptions;
