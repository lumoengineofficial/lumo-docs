import { ApiError } from "@/lib/api";
import { getServerClient, supabaseConfigured } from "@/lib/supabase";

export const MAX_COLLABORATORS = 2;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Validates "id1,id2" from the publish form (publisher + up to 2 collaborators). */
export async function parseCollaboratorIds(raw: string, authorId: string): Promise<string[]> {
  const ids = Array.from(new Set(raw.split(",").map((value) => value.trim()).filter(Boolean)));
  for (const id of ids) {
    if (!UUID_RE.test(id)) {
      throw new ApiError(400, "invalid_collaborators", "collaborator_ids must be user UUIDs.");
    }
  }
  if (ids.includes(authorId)) {
    throw new ApiError(400, "invalid_collaborators", "You are already the publisher.");
  }
  if (ids.length > MAX_COLLABORATORS) {
    throw new ApiError(
      400,
      "too_many_collaborators",
      "An asset can have a publisher plus up to 2 collaborators.",
    );
  }
  if (ids.length > 0) {
    const client = getServerClient();
    const { data } = await client.from("users").select("id").in("id", ids).eq("banned", false);
    if ((data ?? []).length !== ids.length) {
      throw new ApiError(400, "unknown_collaborator", "One or more collaborators were not found.");
    }
  }
  return ids;
}

/** True when the asset_collaborators table (migration 0004) is available. */
export async function collaboratorsReady(): Promise<boolean> {
  if (!supabaseConfigured) return false;
  try {
    const client = getServerClient();
    const { error } = await client.from("asset_collaborators").select("asset_id").limit(1);
    return !error;
  } catch {
    return false;
  }
}

/** Replaces the collaborator list of an asset. Returns an error message on failure. */
export async function setAssetCollaborators(
  assetId: string,
  userIds: string[],
): Promise<string | null> {
  if (!supabaseConfigured) return "Supabase is not configured.";
  const client = getServerClient();
  try {
    const { data: existing, error: readError } = await client
      .from("asset_collaborators")
      .select("user_id")
      .eq("asset_id", assetId);
    if (readError) return readError.message;
    const current = (existing ?? []).map((row) => row.user_id as string);

    const remove = current.filter((id) => !userIds.includes(id));
    if (remove.length > 0) {
      const { error } = await client
        .from("asset_collaborators")
        .delete()
        .eq("asset_id", assetId)
        .in("user_id", remove);
      if (error) return error.message;
    }

    const add = userIds.filter((id) => !current.includes(id));
    if (add.length > 0) {
      const { error } = await client.from("asset_collaborators").upsert(
        add.map((user_id) => ({ asset_id: assetId, user_id })),
        { onConflict: "asset_id,user_id", ignoreDuplicates: true },
      );
      if (error) return error.message;
    }
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Could not save collaborators.";
  }
}
