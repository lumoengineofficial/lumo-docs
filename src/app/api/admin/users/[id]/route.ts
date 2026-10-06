import type { NextRequest } from "next/server";
import { ApiError, jsonOk, readString, requireAdmin, requireConfigured, withApi } from "@/lib/api";
import { isBadgeKey } from "@/lib/constants";
import { getServerClient } from "@/lib/supabase";
import { publicUser } from "@/lib/serialize";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/users/[id]  { role?, banned?, badges?: string[] }
 * Admin Bearer JWT or X-API-Key required.
 */
export const PATCH = withApi(async (req: NextRequest, ctx: Ctx) => {
  requireConfigured();
  const principal = await requireAdmin(req);
  const { id } = await ctx.params;

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) throw new ApiError(400, "invalid_body", "Expected a JSON body.");

  const patch: Record<string, unknown> = {};
  const role = readString(body, "role").toLowerCase();
  if (role) {
    if (role !== "user" && role !== "admin") {
      throw new ApiError(400, "invalid_role", 'role must be "user" or "admin".');
    }
    patch.role = role;
  }
  if (typeof body.banned === "boolean") patch.banned = body.banned;

  if (body.badges !== undefined) {
    if (!Array.isArray(body.badges)) {
      throw new ApiError(400, "invalid_badges", "badges must be an array of badge keys.");
    }
    const keys: string[] = [];
    for (const raw of body.badges) {
      if (!isBadgeKey(raw)) {
        throw new ApiError(400, "invalid_badges", `Unknown badge: ${String(raw)}`);
      }
      if (!keys.includes(raw)) keys.push(raw);
    }
    patch.badges = keys;
  }

  if (Object.keys(patch).length === 0) {
    throw new ApiError(400, "nothing_to_update", "Provide role, banned and/or badges.");
  }

  // Never let an admin lock themselves out of their own account.
  if (principal.type === "user" && principal.profile.id === id) {
    if (patch.role === "user") {
      throw new ApiError(400, "self_demote", "You cannot remove your own admin role.");
    }
    if (patch.banned === true) {
      throw new ApiError(400, "self_ban", "You cannot ban your own account.");
    }
  }

  const client = getServerClient();
  const { data, error } = await client
    .from("users")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new ApiError(404, "not_found", error.message);
  return jsonOk({ user: publicUser(data as unknown as Profile) });
});

import { corsOptions } from "@/lib/api";

export const OPTIONS = corsOptions;
