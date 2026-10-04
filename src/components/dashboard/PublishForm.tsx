"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, LICENSES } from "@/lib/constants";
import { apiFetch, readApiError } from "@/lib/client-auth";
import type { Asset } from "@/lib/types";
import { formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const MAX_ZIP = 50 * 1024 * 1024;
const MAX_IMAGE = 5 * 1024 * 1024;

export function PublishForm({ asset }: { asset?: Asset }) {
  const router = useRouter();
  const isEdit = Boolean(asset);

  const [title, setTitle] = useState(asset?.title ?? "");
  const [description, setDescription] = useState(asset?.description ?? "");
  const [category, setCategory] = useState(asset?.category ?? CATEGORIES[0]);
  const [tags, setTags] = useState((asset?.tags ?? []).join(", "));
  const [license, setLicense] = useState(asset?.license ?? LICENSES[3]);
  const [version, setVersion] = useState(asset?.version ?? "1.0.0");
  const [price, setPrice] = useState(asset && asset.price > 0 ? String(asset.price) : "0");
  const [zip, setZip] = useState<File | null>(null);
  const [thumb, setThumb] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const free = Number(price || 0) === 0;

  async function submit(status: "pending" | "draft") {
    setError("");

    if (!title.trim()) {
      setError("Give the asset a title.");
      return;
    }
    if (!isEdit && !zip) {
      setError("Attach the asset .zip file.");
      return;
    }
    if (zip && zip.size > MAX_ZIP) {
      setError(`Zip must be under ${formatBytes(MAX_ZIP)}.`);
      return;
    }
    if (thumb && thumb.size > MAX_IMAGE) {
      setError(`Thumbnail must be under ${formatBytes(MAX_IMAGE)}.`);
      return;
    }

    setBusy(true);
    try {
      const form = new FormData();
      form.set("title", title.trim());
      form.set("description", description.trim());
      form.set("category", category);
      form.set("tags", tags);
      form.set("license", license);
      form.set("version", version.trim() || "1.0.0");
      form.set("price", price.trim() || "0");
      form.set("status", status);
      if (zip) form.set("file", zip);
      if (thumb) form.set("thumbnail", thumb);

      const response = await apiFetch(isEdit ? `/api/assets/${asset!.id}` : "/api/assets", {
        method: isEdit ? "PATCH" : "POST",
        body: form,
      });

      if (!response.ok) {
        setError(await readApiError(response));
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel p-6" onSubmit={(e) => e.preventDefault()}>
      <div className="grid gap-5">
        <div>
          <label className="label-base" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            className="input-base"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Modular Sci-Fi Corridor Kit"
            maxLength={120}
            required
          />
        </div>

        <div>
          <label className="label-base" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className="input-base min-h-[140px] resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is inside the pack, poly counts, animation sets, attribution notes…"
            maxLength={5000}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label-base" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              className="input-base"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item} className="bg-panel">
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-base" htmlFor="license">
              License
            </label>
            <select
              id="license"
              className="input-base"
              value={license}
              onChange={(e) => setLicense(e.target.value)}
            >
              {LICENSES.map((item) => (
                <option key={item} value={item} className="bg-panel">
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-base" htmlFor="version">
              Version
            </label>
            <input
              id="version"
              className="input-base"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0.0"
            />
          </div>

          <div>
            <label className="label-base" htmlFor="tags">
              Tags <span className="normal-case text-muted/60">(comma separated)</span>
            </label>
            <input
              id="tags"
              className="input-base"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="scifi, modular, corridor"
            />
          </div>
        </div>

        <div>
          <span className="label-base">Price</span>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setPrice("0")}
              className={`rounded-lg border px-4 py-2 text-sm transition ${
                free
                  ? "border-accent bg-accent-soft text-accent-light"
                  : "border-line bg-ink text-muted hover:text-title"
              }`}
            >
              Free
            </button>
            <button
              type="button"
              onClick={() => setPrice(price === "0" ? "9.99" : price)}
              className={`rounded-lg border px-4 py-2 text-sm transition ${
                !free
                  ? "border-accent bg-accent-soft text-accent-light"
                  : "border-line bg-ink text-muted hover:text-title"
              }`}
            >
              Paid (USD)
            </button>
            {!free ? (
              <label className="flex items-center gap-2 text-sm text-muted">
                <span>$</span>
                <input
                  type="number"
                  min="0.5"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input-base w-28"
                  aria-label="Price in USD"
                />
              </label>
            ) : (
              <span className="text-xs text-muted">
                Paid assets are download-gated behind login in v1.
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label-base" htmlFor="zip">
              Asset .zip {isEdit ? "(optional — replaces current)" : ""}
            </label>
            <input
              id="zip"
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              onChange={(e) => setZip(e.target.files?.[0] ?? null)}
              className="input-base file:mr-3 file:rounded-md file:border-0 file:bg-panel2 file:px-3 file:py-1.5 file:text-xs file:text-mist hover:file:bg-accent hover:file:text-title"
            />
            <p className="mt-1.5 text-xs text-muted">
              Zip the asset folder (max {formatBytes(MAX_ZIP)}).
            </p>
          </div>

          <div>
            <label className="label-base" htmlFor="thumbnail">
              Thumbnail {isEdit ? "(optional — replaces current)" : ""}
            </label>
            <input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={(e) => setThumb(e.target.files?.[0] ?? null)}
              className="input-base file:mr-3 file:rounded-md file:border-0 file:bg-panel2 file:px-3 file:py-1.5 file:text-xs file:text-mist hover:file:bg-accent hover:file:text-title"
            />
            <p className="mt-1.5 text-xs text-muted">16:10 preview image (max {formatBytes(MAX_IMAGE)}).</p>
          </div>
        </div>

        {isEdit && !zip ? (
          <p className="rounded-lg border border-line bg-ink px-3 py-2.5 text-xs text-muted">
            Current file: <span className="text-mist">{asset?.file_url}</span> ·{" "}
            {formatBytes(asset?.file_size)}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" disabled={busy} onClick={() => submit("draft")}>
            {busy ? "Working…" : "Save as draft"}
          </Button>
          <Button type="button" disabled={busy} onClick={() => submit("pending")}>
            {isEdit ? "Save & resubmit" : "Submit for review"}
          </Button>
        </div>
      </div>
    </form>
  );
}
