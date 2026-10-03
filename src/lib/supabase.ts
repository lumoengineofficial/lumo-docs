import {
  createBrowserClient as createSsrBrowserClient,
  createServerClient as createSsrServerClient,
} from "@supabase/ssr";
import {
  createClient as createSupabaseClient,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabaseConfigured = Boolean(SUPABASE_URL && ANON_KEY);

export function assertSupabaseConfigured(): void {
  if (!supabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
}

let browserClient: SupabaseClient | null = null;

/** Browser client — session is stored in httpOnly cookies via @supabase/ssr. */
export function getBrowserClient(): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error("getBrowserClient() can only be used in the browser.");
  }
  assertSupabaseConfigured();
  if (!browserClient) {
    browserClient = createSsrBrowserClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return browserClient;
}

export interface CookieAdapter {
  getAll: () => { name: string; value: string }[];
  setAll: (cookies: { name: string; value: string; options?: unknown }[]) => void;
}

/** Server client bound to request cookies so server components can read the session. */
export function getCookieClient(adapter: CookieAdapter): SupabaseClient {
  assertSupabaseConfigured();
  return createSsrServerClient(SUPABASE_URL, ANON_KEY, {
    cookies: {
      getAll: () => adapter.getAll(),
      setAll: (items) => adapter.setAll(items as never),
    },
  });
}

/**
 * Server-side data client. Prefers the service role key so server components
 * and API routes are not limited by RLS session state; falls back to the anon
 * key (public RLS policies) when the service key is not configured.
 */
export function getServerClient(): SupabaseClient {
  assertSupabaseConfigured();
  if (SERVICE_KEY) {
    return createSupabaseClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return createSsrServerClient(SUPABASE_URL, ANON_KEY, {
    cookies: { getAll: () => [], setAll: () => {} },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/** Service-role client for privileged writes. Throws when the key is missing. */
export function getServiceClient(): SupabaseClient {
  if (!SERVICE_KEY || !SUPABASE_URL) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured for this server.");
  }
  return createSupabaseClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/** Stateless client used only to validate Bearer JWTs. */
export function getAuthClient(): SupabaseClient {
  assertSupabaseConfigured();
  return createSupabaseClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function verifyToken(token: string): Promise<User | null> {
  if (!token || !supabaseConfigured) return null;
  try {
    const client = getAuthClient();
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
}
