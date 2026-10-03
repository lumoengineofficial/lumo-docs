import type { NextRequest } from "next/server";
import { jsonOk, requireAdmin, requireConfigured, withApi } from "@/lib/api";
import { listUsers } from "@/lib/queries";
import { publicUser } from "@/lib/serialize";

export const dynamic = "force-dynamic";

/** GET /api/admin/users — admin Bearer JWT or X-API-Key. */
export const GET = withApi(async (req: NextRequest) => {
  requireConfigured();
  await requireAdmin(req);
  const users = await listUsers();
  return jsonOk({ items: users.map(publicUser), total: users.length });
});

import { corsOptions } from "@/lib/api";

export const OPTIONS = corsOptions;
