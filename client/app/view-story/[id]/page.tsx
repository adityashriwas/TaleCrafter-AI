import { notFound, permanentRedirect } from "next/navigation";
import { getStoryByStoryId } from "@/lib/story-data";

export default async function LegacyViewStoryPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const id = decodeURIComponent(resolvedParams.id);
  const story = await getStoryByStoryId(id);

  if (!story) {
    notFound();
  }

  const slug = String(story.slug ?? "").trim();

  if (!slug) {
    notFound();
  }

  permanentRedirect(`/story/${slug}`);
}
