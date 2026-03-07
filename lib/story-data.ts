import { db } from "@/config/config";
import { StoryData } from "@/config/schema";
import { and, desc, eq, ne } from "drizzle-orm";
import { DEFAULT_OG_IMAGE, toAbsoluteUrl } from "@/lib/seo";
import { ensureStorySlug } from "@/lib/story-slug";

export type StoryRecord = typeof StoryData.$inferSelect;

const cleanText = (value: string) =>
  value
    .replace(/\{[^}]*\}/g, "")
    .replace(
      /(Water ?Color|Watercolor|Anime( style)?|3D ?Cartoon|Oil (Paint|painting)|Comic( book)?|Paper ?Cut|Papercut|Pixel ?Art)[\s\S]*/i,
      ""
    )
    .trim();

export const extractStorySummary = (story: StoryRecord | null | undefined) => {
  const output = story?.output as any;
  const chapterText =
    output?.chapters?.find((chapter: any) => chapter?.textPrompt)?.textPrompt ??
    "";
  const summary = cleanText(String(chapterText)).slice(0, 220);

  if (summary.length > 30) return summary;
  return `Read ${output?.title ?? "an AI-generated story"} on TaleCrafter AI.`;
};

export const storyOgImage = (story: StoryRecord | null | undefined) => {
  const coverImage = story?.coverImage?.trim();
  if (coverImage) return coverImage;
  return toAbsoluteUrl(DEFAULT_OG_IMAGE);
};

export const getStoryByStoryId = async (storyId: string) => {
  const result = await db
    .select()
    .from(StoryData)
    .where(eq(StoryData.storyId, storyId))
    .limit(1);
  return result[0] ?? null;
};

export const getStoryBySlug = async (slug: string) => {
  const result = await db
    .select()
    .from(StoryData)
    .where(eq(StoryData.slug, slug))
    .limit(1);
  return result[0] ?? null;
};

export const getStorySlug = async (story: StoryRecord | null | undefined) => {
  if (!story) return null;
  const slug = String(story.slug ?? "").trim();
  if (slug) return slug;
  return ensureStorySlug(story as any);
};

export const storyRoutePath = (story: StoryRecord | null | undefined) => {
  const slug = String(story?.slug ?? "").trim();
  const storyId = String(story?.storyId ?? "").trim();

  if (slug) return `/story/${slug}`;
  if (storyId) return `/view-story/${storyId}`;
  return "/explore";
};

export const getPublicStories = async () => {
  return db
    .select({
      storyId: StoryData.storyId,
      slug: StoryData.slug,
    })
    .from(StoryData)
    .orderBy(desc(StoryData.id));
};

export const getRelatedStories = async (storyId: string, storyType?: string) => {
  const filters = storyType
    ? and(eq(StoryData.storyType, storyType), ne(StoryData.storyId, storyId))
    : ne(StoryData.storyId, storyId);

  return db
    .select()
    .from(StoryData)
    .where(filters)
    .orderBy(desc(StoryData.id))
    .limit(6);
};
