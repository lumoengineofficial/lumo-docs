import { getServiceClient, getServerClient } from "@/lib/supabase";

const MAX_ZIP_BYTES = 50 * 1024 * 1024;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function safeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "file";
}

export interface UploadedFile {
  path: string;
  url: string;
  size: number;
  contentType: string;
}

export async function uploadToBucket(
  bucket: "assets" | "covers",
  file: File,
  ownerId: string,
): Promise<UploadedFile> {
  const isZip = bucket === "assets";
  const max = isZip ? MAX_ZIP_BYTES : MAX_IMAGE_BYTES;
  if (file.size > max) {
    throw new Error(
      `${isZip ? "Zip" : "Image"} files must be under ${Math.round(max / (1024 * 1024))}MB.`,
    );
  }

  const client = getServiceClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = safeName(file.name.split(".").pop() ?? "");
  const path = `${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${
    ext ? `.${ext}` : ""
  }`;

  const { error } = await client.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: file.type || (isZip ? "application/zip" : "image/png"),
      upsert: false,
      cacheControl: "3600",
    });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return { path, url: data.publicUrl, size: file.size, contentType: file.type };
}

/** Used when only metadata is sent — storage writes need the service key. */
export function storageAvailable(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export async function publicUrlFor(bucket: "assets" | "covers", path: string): Promise<string> {
  const client = getServerClient();
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
