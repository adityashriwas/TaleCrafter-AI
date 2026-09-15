import { db } from "@/config/config";
import { StoryData } from "@/config/schema";
import { and, eq, like, ne } from "drizzle-orm";

const MAX_BASE_SLUG_LENGTH = 70;

export const slugifyStoryTitle = (title: string) => {
  const normalized = String(title ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_BASE_SLUG_LENGTH)
    .replace(/-+$/g, "");

  return normalized || "story";
};

export const extractStoryTitle = (story: { output?: any; storySubject?: string | null } | null | undefined) => {
  const output = story?.output as any;
  const title = String(output?.title ?? "").trim();
  if (title) return title;

  const subject = String(story?.storySubject ?? "").trim();
  if (subject) return subject;

  return "AI Generated Story";
};

const buildSlugFilter = (baseSlug: string, excludeStoryId?: string) => {
  if (!excludeStoryId) {
    return like(StoryData.slug, `${baseSlug}%`);
  }

  return and(
    like(StoryData.slug, `${baseSlug}%`),
    ne(StoryData.storyId, excludeStoryId)
  );
};

const getNextAvailableSlug = async (baseSlug: string, excludeStoryId?: string) => {
  const rows = await db
    .select({ slug: StoryData.slug })
    .from(StoryData)
    .where(buildSlugFilter(baseSlug, excludeStoryId));

  const used = new Set(
    rows
      .map((row) => String(row.slug ?? "").trim())
      .filter(Boolean)
  );

  if (!used.has(baseSlug)) return baseSlug;

  let maxSuffix = 1;
  for (const slug of used) {
    const match = slug.match(new RegExp(`^${baseSlug}-(\\d+)$`));
    if (!match) continue;
    const value = Number(match[1]);
    if (Number.isFinite(value) && value > maxSuffix) {
      maxSuffix = value;
    }
  }

  return `${baseSlug}-${maxSuffix + 1}`;
};

export const generateUniqueStorySlug = async (
  title: string,
  opts?: { excludeStoryId?: string }
) => {
  const baseSlug = slugifyStoryTitle(title);
  return getNextAvailableSlug(baseSlug, opts?.excludeStoryId);
};

export const ensureStorySlug = async (story: {
  id: number;
  storyId?: string | null;
  slug?: string | null;
  output?: any;
  storySubject?: string | null;
}) => {
  const currentSlug = String(story?.slug ?? "").trim();
  if (currentSlug) return currentSlug;

  const title = extractStoryTitle(story);

  for (let attempt = 0; attempt < 4; attempt++) {
    const candidate =
      attempt === 0
        ? await generateUniqueStorySlug(title, { excludeStoryId: story.storyId ?? undefined })
        : `${slugifyStoryTitle(title)}-${Math.floor(Date.now() / 1000)}-${attempt}`;

    try {
      await db
        .update(StoryData)
        .set({ slug: candidate })
        .where(eq(StoryData.id, story.id));
      return candidate;
    } catch {
      // Retry on uniqueness races.
    }
  }

  return "story";
};
