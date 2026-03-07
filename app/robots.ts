import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/about", "/explore", "/create-story", "/story/", "/view-story/"],
      disallow: ["/admin", "/dashboard", "/users", "/buy-credits", "/sign-in", "/sign-up"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
