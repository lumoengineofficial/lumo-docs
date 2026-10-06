import fs from "node:fs/promises";
import path from "node:path";
import { loadDocs } from "@/lib/markdown";

export const dynamic = "force-dynamic";

export async function GET() {
  const dir = path.join(process.cwd(), "content", "docs");
  let files: string[] = [];
  let readError: string | null = null;
  try {
    files = await fs.readdir(dir);
  } catch (error) {
    readError = String(error);
  }
  const docs = await loadDocs().catch((error: unknown) => {
    readError = readError ?? `loadDocs: ${String(error)}`;
    return [];
  });
  return Response.json({
    cwd: process.cwd(),
    dir,
    files,
    readError,
    docsCount: docs.length,
    slugs: docs.map((doc) => doc.slug),
  });
}
