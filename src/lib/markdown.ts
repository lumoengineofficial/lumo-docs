import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface DocMeta {
  slug: string;
  title: string;
  description: string;
  section?: string;
  order?: number;
}

export interface Doc extends DocMeta {
  html: string;
  toc: TocItem[];
  raw: string;
}

function docsDir(): string {
  return path.join(process.cwd(), "content", "docs");
}

function apiDir(): string {
  return path.join(process.cwd(), "content", "api");
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

function addHeadingIds(html: string): string {
  return html.replace(
    /<h([23])>([\s\S]*?)<\/h\1>/g,
    (_match, depth: string, inner: string) =>
      `<h${depth} id="${slugifyHeading(stripTags(inner))}">${inner}</h${depth}>`,
  );
}

function extractToc(markdown: string): TocItem[] {
  const toc: TocItem[] = [];
  const lines = markdown.split("\n");
  let inFence = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.*)$/.exec(line);
    if (match) {
      const text = match[2].replace(/`/g, "").trim();
      toc.push({ id: slugifyHeading(text), text, level: match[1].length });
    }
  }
  return toc;
}

marked.setOptions({ gfm: true, breaks: false });

export function renderMarkdown(markdown: string): { html: string; toc: TocItem[] } {
  const toc = extractToc(markdown);
  const html = addHeadingIds(marked.parse(markdown, { async: false }) as string);
  return { html, toc };
}

async function readMarkdownFile(filePath: string): Promise<{
  content: string;
  data: Record<string, unknown>;
} | null> {
  try {
    const source = await fs.readFile(filePath, "utf8");
    const { content, data } = matter(source);
    return { content, data };
  } catch {
    return null;
  }
}

async function listMarkdownFiles(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir);
    return entries.filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
  } catch {
    return [];
  }
}

function toMeta(slug: string, data: Record<string, unknown>): DocMeta {
  return {
    slug,
    title: typeof data.title === "string" ? data.title : slug,
    description: typeof data.description === "string" ? data.description : "",
    section: typeof data.section === "string" ? data.section : undefined,
    order: typeof data.order === "number" ? data.order : undefined,
  };
}

/** All documentation pages, ordered by frontmatter `order`. */
export async function loadDocs(): Promise<DocMeta[]> {
  const dir = docsDir();
  const files = await listMarkdownFiles(dir);
  const docs = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.mdx?$/, "");
      const parsed = await readMarkdownFile(path.join(dir, file));
      if (!parsed) return null;
      return toMeta(slug, parsed.data);
    }),
  );
  return docs
    .filter((d): d is DocMeta => Boolean(d))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.title.localeCompare(b.title));
}

export async function loadDoc(slug: string): Promise<Doc | null> {
  if (!/^[\w-]+$/.test(slug)) return null;
  const parsed = await readMarkdownFile(path.join(docsDir(), `${slug}.md`));
  if (!parsed) return null;
  const { html, toc } = renderMarkdown(parsed.content);
  return { ...toMeta(slug, parsed.data), html, toc, raw: parsed.content };
}

export interface ApiSection extends DocMeta {
  html: string;
  toc: TocItem[];
}

/** Sections rendered on /api-docs, ordered by frontmatter `order`. */
export async function loadApiSections(): Promise<ApiSection[]> {
  const dir = apiDir();
  const files = await listMarkdownFiles(dir);
  const sections = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.mdx?$/, "");
      const parsed = await readMarkdownFile(path.join(dir, file));
      if (!parsed) return null;
      const { html, toc } = renderMarkdown(parsed.content);
      return { ...toMeta(slug, parsed.data), html, toc };
    }),
  );
  return sections
    .filter((s): s is ApiSection => Boolean(s))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.title.localeCompare(b.title));
}
