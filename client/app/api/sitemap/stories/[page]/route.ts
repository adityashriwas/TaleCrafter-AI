import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/seo";
import { buildUrlSetXml, STORY_SITEMAP_PAGE_SIZE } from "@/lib/sitemap-xml";

export const revalidate = 3600;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type SitemapStory = {
  slug: string | null;
};

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
  const response = await fetch(
    `${API_BASE_URL}/stories/sitemap/page?limit=${STORY_SITEMAP_PAGE_SIZE}&offset=${offset}`,
    { next: { revalidate } }
  );

  if (!response.ok) {
    return new NextResponse("Sitemap page not found", { status: response.status });
  }

  const payload = (await response.json()) as ApiResponse<SitemapStory[]>;
  const rows = payload.success ? payload.data : [];

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
