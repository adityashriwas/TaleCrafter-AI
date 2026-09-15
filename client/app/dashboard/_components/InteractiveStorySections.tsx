"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useUser } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import { dbV2 } from "@/config/configV2";
import { InteractiveStories, InteractiveStoryNodes } from "@/config/schemaV2";

type InteractiveStory = {
  storyId: string;
  slug?: string;
  title: string;
  status: "draft" | "completed";
  totalPages: number;
  updatedAt: string;
  coverImage: string;
};

const SafeCover = ({ src, alt }: { src?: string; alt: string }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-44 w-full items-center justify-center rounded-lg border border-blue-300/20 bg-white/[0.04] px-3 text-center text-sm text-blue-100/70">
        Cover image is not available right now.
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-44 w-full rounded-lg object-cover"
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
};

const InteractiveStorySections = () => {
  const { user } = useUser();
  const [stories, setStories] = useState<InteractiveStory[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStories = async () => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return;

    setLoading(true);
    try {
      const result: any = await dbV2
        .select()
        .from(InteractiveStories)
        .where(eq(InteractiveStories.userEmail, email))
        .orderBy(desc(InteractiveStories.id));

      setStories(result ?? []);
    } catch {
      toast.error("Unable to load interactive stories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, [user?.id]);

  const draftStories = useMemo(
    () => stories.filter((story) => story.status === "draft"),
    [stories]
  );

  const onDeleteStory = async (storyId: string) => {
    try {
      await dbV2.delete(InteractiveStoryNodes).where(eq(InteractiveStoryNodes.storyId, storyId));
      await dbV2.delete(InteractiveStories).where(eq(InteractiveStories.storyId, storyId));
      setStories((prev) => prev.filter((story) => story.storyId !== storyId));
      toast.success("Interactive story deleted");
    } catch {
      toast.error("Failed to delete story");
    }
  };

  const renderCards = (list: InteractiveStory[], mode: "draft" | "completed") => {
    if (!list.length) {
      return (
        <p className="rounded-xl border border-blue-300/20 bg-white/[0.04] px-5 py-3 text-blue-100/70">
          {mode === "draft" ? "No draft stories yet." : "No completed interactive stories yet."}
        </p>
      );
    }

    return (
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((story) => (
          <div
            key={story.storyId}
            className="rounded-xl border border-blue-300/20 bg-white/[0.04] p-4"
          >
            {story.coverImage && (
              <SafeCover src={story.coverImage} alt={story.title} />
            )}
            <h4 className="mt-3 text-lg font-semibold text-white">{story.title}</h4>
            <p className="mt-1 text-sm text-blue-100/70">Pages: {story.totalPages ?? 0}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {mode === "draft" ? (
                <Link href={`/interactive-story/${story.storyId}`} className="tc-btn-primary px-4 py-2 text-sm">
                  Continue
                </Link>
              ) : (
                <Link href={story.slug ? `/story/${story.slug}` : `/view-story/${story.storyId}`} className="tc-btn-primary px-4 py-2 text-sm">
                  Read
                </Link>
              )}
              <button
                onClick={() => onDeleteStory(story.storyId)}
                className="tc-btn-ghost px-4 py-2 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-8">
      <div className="tc-glass-panel-soft p-5 md:p-7">
        <h3 className="tc-title-gradient text-2xl font-bold">Draft Stories</h3>
        {!loading && renderCards(draftStories, "draft")}
        {loading && <p className="mt-4 text-blue-100/70">Loading drafts...</p>}
      </div>
    </div>
  );
};

export default InteractiveStorySections;
