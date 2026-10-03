import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
}

/** Consistent metadata + Open Graph / Twitter tags for every route. */
export function pageMeta({
  title,
  description,
  path,
  image,
  type = "website",
}: PageMetaInput): Metadata {
  const url = `${SITE.url}${path}`;
  const ogImage = image ?? `${SITE.url}/opengraph-image`;
  const fullTitle = title === SITE.name ? title : `${title} · ${SITE.name}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    keywords: [
      "Lumo Engine",
      "game assets",
      "3D models",
      "game engine",
      "asset store",
      "glTF",
      "open source",
    ],
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE.name,
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}
