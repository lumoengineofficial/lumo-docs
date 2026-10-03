import type { NextRequest } from "next/server";
import {
  ApiError,
  jsonOk,
  readString,
  requireConfigured,
  withApi,
} from "@/lib/api";
import { getProfileForUser } from "@/lib/auth";
import { getAuthClient } from "@/lib/supabase";
import { publicUser } from "@/lib/serialize";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/login → { token, user }
 * The token is a Supabase access token; send it back as `Authorization: Bearer <token>`
 * (or use `X-API-Key` for machine access).
 */
export const POST = withApi(async (req: NextRequest) => {
  requireConfigured();

  const contentType = req.headers.get("content-type") ?? "";
  const body = contentType.includes("multipart")
    ? Object.fromEntries((await req.formData()).entries())
    : await req.json().catch(() => null);

  if (!body) throw new ApiError(400, "invalid_body", "Expected a JSON body.");

  const email = readString(body as Record<string, unknown>, "email").toLowerCase();
  const password = readString(body as Record<string, unknown>, "password");
  if (!email || !password) {
    throw new ApiError(400, "invalid_credentials", "Email and password are required.");
  }

  const client = getAuthClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    throw new ApiError(401, "invalid_credentials", error?.message ?? "Invalid credentials.");
  }

  const profile = await getProfileForUser(data.user.id);
  if (profile?.banned) {
    await client.auth.signOut();
    throw new ApiError(403, "account_banned", "This account has been suspended.");
  }

  return jsonOk(
    {
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
      user: profile
        ? publicUser(profile)
        : {
            id: data.user.id,
            email,
            username: email.split("@")[0],
            handle: email.split("@")[0],
            role: "user",
            banned: false,
            avatar: null,
            createdAt: data.user.created_at,
          },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
});

import { corsOptions } from "@/lib/api";

export const OPTIONS = corsOptions;
