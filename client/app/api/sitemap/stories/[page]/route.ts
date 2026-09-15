import { NextResponse } from "next/server";
import { db } from "@/config/config";
import { StoryData } from "@/config/schema";
import { desc, isNotNull } from "drizzle-orm";
import { SITE_URL } from "@/lib/seo";
import { buildUrlSetXml, STORY_SITEMAP_PAGE_SIZE } from "@/lib/sitemap-xml";

export const revalidate = 3600;

export async function GET(
  _request: Request,
  context: { params: Promise<{ page: string }> }
) {
  const { page } = await context.params;
  const pageNumber = Number(page);

  if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
    return new NextResponse("Invalid sitemap page", { status: 400 });
  }

  const offset = (pageNumber - 1) * STORY_SITEMAP_PAGE_SIZE;
  const rows = await db
    .select({
      slug: StoryData.slug,
    })
    .from(StoryData)
    .where(isNotNull(StoryData.slug))
    .orderBy(desc(StoryData.id))
    .limit(STORY_SITEMAP_PAGE_SIZE)
    .offset(offset);

  if (!rows.length) {
    return new NextResponse("Sitemap page not found", { status: 404 });
  }

  const now = new Date().toISOString();
  const entries = rows
    .map((row) => String(row.slug ?? "").trim())
    .filter(Boolean)
    .map((slugValue) => ({
      loc: `${SITE_URL}/story/${slugValue}`,
      lastmod: now,
      changefreq: "weekly",
      priority: 0.8,
    }));

  const xml = buildUrlSetXml(entries);
  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
