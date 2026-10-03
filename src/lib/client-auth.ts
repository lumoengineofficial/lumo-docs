import { getBrowserClient, supabaseConfigured } from "@/lib/supabase";

/** Access token for the signed-in user — attached as `Authorization: Bearer …`. */
export async function getAccessToken(): Promise<string | null> {
  if (!supabaseConfigured) return null;
  try {
    const { data } = await getBrowserClient().auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  return fetch(path, { ...init, headers, credentials: "include" });
}

export async function readApiError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body?.error?.message ?? `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}
