import type { NextRequest } from "next/server";
import { ApiError, corsOptions, jsonOk, requireConfigured, requireUser, withApi } from "@/lib/api";
import { searchProfiles } from "@/lib/queries";
import { publicUser } from "@/lib/serialize";

export const dynamic = "force-dynamic";

/**
 * GET /api/users/search?q=name  (Bearer JWT or X-API-Key)
 * Powers the collaborator picker on the publish form: active accounts
 * matching a username or handle, excluding the caller.
 */
export const GET = withApi(async (req: NextRequest) => {
  requireConfigured();
  const principal = await requireUser(req);
  if (principal.type === "anonymous") {
    throw new ApiError(401, "unauthorized", "Authentication required.");
  }

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (!q) return jsonOk({ items: [] });

  const excludeId = principal.type === "user" ? principal.profile.id : undefined;
  const people = await searchProfiles(q, excludeId);
  return jsonOk({ items: people.map(publicUser) });
});

export { corsOptions as OPTIONS };
