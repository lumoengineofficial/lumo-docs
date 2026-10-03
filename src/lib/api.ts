import { NextRequest, NextResponse } from "next/server";
import { authenticateBearer } from "@/lib/auth";
import { supabaseConfigured } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

export type RouteHandler<Args extends unknown[] = [NextRequest]> = (
  ...args: Args
) => Promise<Response> | Response;

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function jsonOk(body: unknown, init: ResponseInit = {}): NextResponse {
  return NextResponse.json(body, { status: 200, ...init });
}

export function jsonError(
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
): NextResponse {
  return NextResponse.json(
    { error: { code, message, ...(details ? { details } : {}) } },
    { status },
  );
}

function allowedOrigin(req: NextRequest): string | null {
  const origin = req.headers.get("origin");
  const configured = process.env.CORS_ORIGINS?.trim();
  if (!origin) return null;
  if (!configured || configured === "*") return origin;
  const list = configured.split(",").map((o) => o.trim().toLowerCase());
  return list.includes(origin.toLowerCase()) ? origin : null;
}

function corsHeaders(req: NextRequest): Record<string, string> {
  const origin = allowedOrigin(req);
  return {
    ...(origin
      ? {
          "Access-Control-Allow-Origin": origin,
          Vary: "Origin",
        }
      : {}),
    "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-API-Key, Accept, Range",
    "Access-Control-Max-Age": "86400",
    "Access-Control-Expose-Headers": "Content-Length, Content-Range",
  };
}

function preflight(req: NextRequest): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

function withCors(req: NextRequest, res: Response): Response {
  const headers = new Headers(res.headers);
  const extra = corsHeaders(req);
  for (const [k, v] of Object.entries(extra)) headers.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

/** Wraps a route handler with CORS, preflight handling and JSON error mapping. */
export function withApi<Args extends unknown[]>(
  handler: RouteHandler<Args>,
): RouteHandler<Args> {
  return async (...args: Args) => {
    const req = args[0] as NextRequest;
    try {
      if (req.method === "OPTIONS") return preflight(req);
      const res = await handler(...args);
      return withCors(req, res);
    } catch (error) {
      if (error instanceof ApiError) {
        return withCors(req, jsonError(error.status, error.code, error.message, error.details));
      }
      if (isSupabaseAuthError(error)) {
        return withCors(req, jsonError(401, "unauthorized", error.message));
      }
      console.error("[api] unhandled error:", error);
      return withCors(req, jsonError(500, "internal_error", "Unexpected server error."));
    }
  };
}

function isSupabaseAuthError(error: unknown): error is { status?: number; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string" &&
    ["invalid", "token", "jwt", "session", "login", "credentials"].some((k) =>
      (error as { message: string }).message.toLowerCase().includes(k),
    )
  );
}

export type Principal =
  | { type: "anonymous" }
  | { type: "machine" }
  | { type: "user"; profile: Profile };

function machineKeyValid(req: NextRequest): boolean {
  const key = process.env.STORE_API_KEY;
  const provided = req.headers.get("x-api-key");
  if (!key || !provided) return false;
  return timingSafeEqual(provided.trim(), key.trim());
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Resolves the caller: `X-API-Key` (machine access) → `Authorization: Bearer <jwt>`
 * (Supabase access token) → anonymous.
 */
export async function getPrincipal(req: NextRequest): Promise<Principal> {
  if (machineKeyValid(req)) return { type: "machine" };
  const bearer = req.headers.get("authorization");
  if (bearer) {
    const profile = await authenticateBearer(bearer);
    if (profile) return { type: "user", profile };
    throw new ApiError(401, "unauthorized", "Invalid or expired access token.");
  }
  return { type: "anonymous" };
}

/** Requires a signed-in publisher (or machine key). */
export async function requireUser(req: NextRequest): Promise<Principal> {
  const principal = await getPrincipal(req);
  if (principal.type === "anonymous") {
    throw new ApiError(401, "unauthorized", "Authentication required. Send a Bearer token or X-API-Key.");
  }
  return principal;
}

/** Requires an admin profile (or machine key). */
export async function requireAdmin(req: NextRequest): Promise<Principal> {
  const principal = await getPrincipal(req);
  if (principal.type === "anonymous") {
    throw new ApiError(401, "unauthorized", "Authentication required. Send a Bearer token or X-API-Key.");
  }
  if (principal.type === "user" && principal.profile.role !== "admin") {
    throw new ApiError(403, "forbidden", "Admin role required.");
  }
  return principal;
}

/**
 * Attach to every route as `export { corsOptions as OPTIONS }` — Next.js would
 * otherwise answer preflight requests itself without CORS headers.
 */
export const corsOptions: (req: NextRequest) => Response | Promise<Response> = withApi(
  () => new Response(null, { status: 204 }),
);

export function requireConfigured(): void {
  if (!supabaseConfigured) {
    throw new ApiError(
      503,
      "not_configured",
      "Supabase environment variables are missing on this deployment.",
    );
  }
}

export function readString(formData: FormData | Record<string, unknown>, key: string): string {
  const raw = formData instanceof FormData ? formData.get(key) : formData[key];
  if (raw === null || raw === undefined) return "";
  if (typeof raw === "string") return raw.trim();
  if (raw instanceof File) return raw.name;
  return String(raw).trim();
}
