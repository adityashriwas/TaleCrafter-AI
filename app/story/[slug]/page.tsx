import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StoryPageClient from "./StoryPageClient";
import { DEFAULT_OG_IMAGE, toAbsoluteUrl } from "@/lib/seo";
import { extractStorySummary, getStoryBySlug } from "@/lib/story-data";

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const slug = decodeURIComponent(resolvedParams.slug);
  const story = await getStoryBySlug(slug);

  if (!story) {
    return {
      title: "Story Not Found | TaleCrafter AI",
      description: "The requested story does not exist.",
      alternates: {
        canonical: "/story",
      },
    };
  }

  const output = (story?.output as any) ?? {};
  const title = String(output?.title ?? "AI Generated Story");
  const description = extractStorySummary(story);
  const storyType = String(story?.storyType ?? "").trim().toLowerCase();
  const ageGroup = String(story?.ageGroup ?? "").trim().toLowerCase();
  const canonicalPath = `/story/${slug}`;
  const dynamicKeywords = [
    "AI story",
    "AI generated story",
    "read online story",
    "interactive storybook",
    storyType ? `${storyType} story` : "",
    storyType ? `AI ${storyType} story` : "",
    ageGroup ? `${ageGroup} story` : "",
    "TaleCrafter AI",
  ].filter(Boolean);

  return {
    title: `${title} – AI Generated Story | TaleCrafter AI`,
    description,
    keywords: dynamicKeywords,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalPath,
      images: [story?.coverImage || DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [story?.coverImage || DEFAULT_OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
    },
    other: {
      keywords: dynamicKeywords.join(", "),
      "og:url": toAbsoluteUrl(canonicalPath),
    },
  };
}

export default async function StorySlugPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const slug = decodeURIComponent(resolvedParams.slug);
  const story = await getStoryBySlug(slug);

  if (!story) {
    notFound();
  }

  return <StoryPageClient initialStory={story} slug={slug} />;
}
