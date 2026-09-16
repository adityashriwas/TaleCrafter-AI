"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/nextjs";
import { apiFetch } from "@/lib/api-client";

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
    <div className="relative h-44 w-full overflow-hidden rounded-lg">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        className="object-cover"
        onError={() => setFailed(true)}
        unoptimized
      />
    </div>
  );
};

const InteractiveStorySections = () => {
  const { getToken, isLoaded, userId } = useAuth();
  const [stories, setStories] = useState<InteractiveStory[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStories = async () => {
    if (!isLoaded || !userId) return;

    setLoading(true);
    try {
      const token = await getToken();
      const result = await apiFetch<InteractiveStory[]>("/interactive-stories/me", {
        token,
      });

      setStories(result ?? []);
    } catch {
      toast.error("Unable to load interactive stories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, [isLoaded, userId]);

  const draftStories = useMemo(
    () => stories.filter((story) => story.status === "draft"),
    [stories]
  );

  const onDeleteStory = async (storyId: string) => {
    try {
      const token = await getToken();
      await apiFetch<{ storyId: string }>(`/interactive-stories/${storyId}`, {
        method: "DELETE",
        token,
      });
      setStories((prev) => prev.filter((story) => story.storyId !== storyId));
      toast.success("Interactive story deleted");
    } catch {
      toast.error("Failed to delete story");
    }
  };

  const renderCards = (list: InteractiveStory[], mode: "draft" | "completed") => {
    if (!list.length) {
      return (
        <p className="mt-4 text-blue-100/70">
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
