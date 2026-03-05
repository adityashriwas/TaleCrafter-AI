import type { MetadataRoute } from "next";
import { getPublicStories } from "@/lib/story-data";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/create-story`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
  ];

  try {
    const stories = await getPublicStories();
    const storyRoutes: MetadataRoute.Sitemap = stories
      .filter((story) => !!story.storyId)
      .map((story) => ({
        url: `${SITE_URL}/view-story/${story.storyId}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }));

    return [...staticRoutes, ...storyRoutes];
  } catch {
    return staticRoutes;
  }
}

