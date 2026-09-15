import { NextResponse } from "next/server";
import { getPublicStories } from "@/lib/story-data";
import { SITE_URL } from "@/lib/seo";
import { buildSitemapIndexXml, STORY_SITEMAP_PAGE_SIZE } from "@/lib/sitemap-xml";

export const revalidate = 3600;

export async function GET() {
  const stories = await getPublicStories();
  const validStoryCount = stories.filter((story) => !!String(story.slug ?? "").trim()).length;
  const storyPages = Math.ceil(validStoryCount / STORY_SITEMAP_PAGE_SIZE);

  const sitemapLocs = [
    `${SITE_URL}/sitemap-static.xml`,
    ...Array.from({ length: storyPages }, (_, index) => `${SITE_URL}/sitemap-stories-${index + 1}.xml`),
  ];

  const xml = buildSitemapIndexXml(sitemapLocs);
  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
