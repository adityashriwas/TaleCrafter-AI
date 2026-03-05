import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import {
  extractStorySummary,
  getStoryByStoryId,
  storyOgImage,
} from "@/lib/story-data";

export async function generateMetadata({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;
  const story = await getStoryByStoryId(id);
  const output = (story?.output as any) ?? {};
  const title = String(output?.title ?? "Read Story");
  const description = extractStorySummary(story);
  const image = storyOgImage(story);

  return {
    title,
    description,
    alternates: {
      canonical: `/view-story/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `/view-story/${id}`,
      type: "article",
      images: [image || DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image || DEFAULT_OG_IMAGE],
    },
  };
}

export default function ViewStoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
