import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadDoc, loadDocs } from "@/lib/markdown";
import { pageMeta } from "@/lib/seo";
import { DocsShell } from "@/components/docs/DocsShell";

interface DocPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const docs = await loadDocs();
  return docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await loadDoc(slug);
  if (!doc) return pageMeta({ title: "Documentation", description: "Lumo Engine documentation.", path: "/docs" });
  return pageMeta({
    title: doc.title,
    description: doc.description || "Lumo Engine documentation.",
    path: `/docs/${doc.slug}`,
  });
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const [doc, docs] = await Promise.all([loadDoc(slug), loadDocs()]);
  if (!doc) notFound();

  return (
    <DocsShell
      docs={docs}
      activeSlug={doc.slug}
      toc={doc.toc}
      title={doc.title}
      description={doc.description}
    >
      <div dangerouslySetInnerHTML={{ __html: doc.html }} />
    </DocsShell>
  );
}
