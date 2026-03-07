import { notFound, permanentRedirect } from "next/navigation";
import { getStoryByStoryId } from "@/lib/story-data";
import { ensureStorySlug } from "@/lib/story-slug";

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

  const slug = await ensureStorySlug(story as any);
  permanentRedirect(`/story/${slug}`);
}
