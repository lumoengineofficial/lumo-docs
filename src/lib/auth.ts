import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getCookieClient, getServerClient, verifyToken } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

export interface SessionContext {
  user: User | null;
  profile: Profile | null;
}

export async function getProfileForUser(id: string): Promise<Profile | null> {
  if (!id) return null;
  try {
    const client = getServerClient();
    const { data } = await client.from("users").select("*").eq("id", id).maybeSingle();
    return (data as unknown as Profile) ?? null;
  } catch {
    return null;
  }
}

/** Reads the signed-in user from Supabase session cookies (server components). */
export async function getSession(): Promise<SessionContext> {
  const profile = await getSessionProfile();
  if (!profile) return { user: null, profile: null };
  const cookieStore = await cookies();
  const client = getCookieClient({ getAll: () => cookieStore.getAll(), setAll: () => {} });
  const { data } = await client.auth.getUser();
  return { user: data.user ?? null, profile };
}

/** Cookie-session profile — usable in route handlers as well as pages. */
export async function getSessionProfile(): Promise<Profile | null> {
  try {
    const cookieStore = await cookies();
    if (cookieStore.getAll().length === 0) return null;
    const client = getCookieClient({ getAll: () => cookieStore.getAll(), setAll: () => {} });
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return null;
    return await getProfileForUser(data.user.id);
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<{ user: User; profile: Profile }> {
  const { user, profile } = await getSession();
  if (!user || !profile) redirect("/login?next=/dashboard");
  if (profile.banned) redirect("/login?error=banned");
  return { user, profile };
}

export async function requireAdmin(): Promise<{ user: User; profile: Profile }> {
  const { user, profile } = await requireUser();
  if (profile.role !== "admin") redirect("/403");
  return { user, profile };
}

/** Verifies a `Bearer <jwt>` access token issued by /api/auth/login. */
export async function authenticateBearer(headerValue: string | null): Promise<Profile | null> {
  if (!headerValue) return null;
  const token = headerValue.toLowerCase().startsWith("bearer ")
    ? headerValue.slice(7).trim()
    : headerValue.trim();
  if (!token) return null;
  const user = await verifyToken(token);
  if (!user) return null;
  const profile = await getProfileForUser(user.id);
  if (!profile || profile.banned) return null;
  return profile;
}
