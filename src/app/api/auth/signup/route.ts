import type { NextRequest } from "next/server";
import {
  ApiError,
  jsonOk,
  readString,
  requireConfigured,
  withApi,
} from "@/lib/api";
import { getProfileForUser } from "@/lib/auth";
import { getAuthClient, getServerClient } from "@/lib/supabase";
import { publicUser } from "@/lib/serialize";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/signup → { token, user }
 * Creates an email/password account and returns a Supabase access token.
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
  const username = readString(body as Record<string, unknown>, "username");
  const handle = readString(body as Record<string, unknown>, "handle")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 24);

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new ApiError(400, "invalid_email", "A valid email address is required.");
  }
  if (password.length < 8) {
    throw new ApiError(400, "weak_password", "Password must be at least 8 characters.");
  }
  if (!username) throw new ApiError(400, "invalid_username", "Username is required.");

  const client = getAuthClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: { username, handle: handle || username.toLowerCase().replace(/[^a-z0-9]/g, "") },
    },
  });

  if (error) throw new ApiError(400, "signup_failed", error.message);
  const user = data.user;
  if (!user) throw new ApiError(500, "signup_failed", "Account creation failed.");

  // The `users` row is normally created by a database trigger; fall back to a
  // direct insert when the trigger has not been installed yet.
  let profile = await getProfileForUser(user.id);
  if (!profile && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = getServerClient();
      await admin.from("users").upsert({
        id: user.id,
        email,
        username,
        handle: handle || username.toLowerCase().replace(/[^a-z0-9]/g, ""),
        role: "user",
      });
      profile = await getProfileForUser(user.id);
    } catch {
      // ignore — the response below still returns the auth user
    }
  }

  const token = data.session?.access_token ?? null;

  return jsonOk(
    {
      token,
      user: profile
        ? publicUser(profile)
        : {
            id: user.id,
            email,
            username,
            handle: handle || username.toLowerCase().replace(/[^a-z0-9]/g, ""),
            role: "user",
            banned: false,
            avatar: null,
            createdAt: user.created_at,
          },
      requiresConfirmation: !token,
      message: token
        ? "Account created."
        : "Account created. Confirm your email address to sign in.",
    },
    { status: 201 },
  );
});

import { corsOptions } from "@/lib/api";

export const OPTIONS = corsOptions;
