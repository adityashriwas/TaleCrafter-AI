import { NextResponse } from "next/server";
import { db } from "@/config/config";
import { StoryData } from "@/config/schema";
import { asc, isNull, sql } from "drizzle-orm";
import { ensureStorySlug } from "@/lib/story-slug";

const DEFAULT_BATCH_SIZE = 200;
const MAX_BATCH_SIZE = 1000;

export async function POST(request: Request) {
  const adminKey = process.env.ADMIN_BACKFILL_KEY;
  if (!adminKey) {
    return NextResponse.json(
      { error: "ADMIN_BACKFILL_KEY is not configured" },
      { status: 503 }
    );
  }

  const providedKey = request.headers.get("x-admin-key");
  if (providedKey !== adminKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const requestedLimit = Number(body?.limit ?? DEFAULT_BATCH_SIZE);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(1, requestedLimit), MAX_BATCH_SIZE)
    : DEFAULT_BATCH_SIZE;

  const targets = await db
    .select()
    .from(StoryData)
    .where(isNull(StoryData.slug))
    .orderBy(asc(StoryData.id))
    .limit(limit);

  let updated = 0;
  for (const story of targets) {
    const slug = await ensureStorySlug(story as any);
    if (slug) updated += 1;
  }

  const remainingRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(StoryData)
    .where(isNull(StoryData.slug));

  const remaining = Number(remainingRows?.[0]?.count ?? 0);

  return NextResponse.json({
    scanned: targets.length,
    updated,
    remaining,
  });
}
