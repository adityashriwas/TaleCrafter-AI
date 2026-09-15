import { NextResponse } from "next/server";
import { buildUrlSetXml, staticSitemapEntries } from "@/lib/sitemap-xml";

export const revalidate = 3600;

export async function GET() {
  const xml = buildUrlSetXml(staticSitemapEntries());

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
