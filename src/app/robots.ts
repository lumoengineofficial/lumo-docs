import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

const base = SITE.url.replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/admin"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
