import { DEFAULT_OG_IMAGE, toAbsoluteUrl } from "@/lib/seo";
import type { StoryOutput } from "@/types/story";

export type StoryRecord = {
  id: number;
  storyId: string | null;
  slug: string | null;
  storySubject: string | null;
  storyType: string | null;
  ageGroup: string | null;
  imageStyle: string | null;
  coverImage: string | null;
  output: StoryOutput | null;
  userName: string | null;
  userImage: string | null;
  userEmail: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
};

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000/api/v1";

const backendFetch = async <T>(path: string): Promise<T | null> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Backend request failed: ${response.status}`);

  const payload = await response.json();
  return payload?.data ?? null;
};

const cleanText = (value: string) =>
  value
    .replace(/\{[^}]*\}/g, "")
    .replace(
      /(Water ?Color|Watercolor|Anime( style)?|3D ?Cartoon|Oil (Paint|painting)|Comic( book)?|Paper ?Cut|Papercut|Pixel ?Art)[\s\S]*/i,
      ""
    )
    .trim();

export const extractStorySummary = (story: StoryRecord | null | undefined) => {
  const output = story?.output;
  const chapterText =
    output?.chapters?.find((chapter) => chapter?.textPrompt)?.textPrompt ??
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
  return backendFetch<StoryRecord>(`/stories/id/${encodeURIComponent(storyId)}`);
};

export const getStoryBySlug = async (slug: string) => {
  return backendFetch<StoryRecord>(`/stories/slug/${encodeURIComponent(slug)}`);
};

export const getStorySlug = async (story: StoryRecord | null | undefined) => {
  if (!story) return null;
  const slug = String(story.slug ?? "").trim();
  if (slug) return slug;
  return null;
};

export const storyRoutePath = (story: StoryRecord | null | undefined) => {
  const slug = String(story?.slug ?? "").trim();
  const storyId = String(story?.storyId ?? "").trim();

  if (slug) return `/story/${slug}`;
  if (storyId) return `/view-story/${storyId}`;
  return "/explore";
};

export const getPublicStories = async () => {
  return (
    (await backendFetch<Array<{ storyId: string | null; slug: string | null }>>(
      "/stories/sitemap"
    )) ?? []
  );
};

export const getRelatedStories = async (storyId: string, storyType?: string) => {
  const params = new URLSearchParams({ limit: "6", offset: "0" });
  if (storyType) params.set("storyType", storyType);

  const result = await backendFetch<{ stories: StoryRecord[] }>(
    `/stories/${encodeURIComponent(storyId)}/related?${params.toString()}`
  );

  return result?.stories ?? [];
};
