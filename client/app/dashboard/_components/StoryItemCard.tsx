"use client";
import { Card, CardFooter } from "@nextui-org/card";
import { Button } from "@nextui-org/react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiFetch } from "@/lib/api-client";
import type { StoryItem } from "@/types/story";

type StoryItemType = {
  story: StoryItem;
  currentUserEmail: string;
  onDeleteSuccess?: (storyId: string) => void;
};

const removeStoryFromCachedLists = (storyId: string) => {
  if (typeof window === "undefined") return;

  const cacheKeys = ["explore_stories_cache_v1"];
  for (let index = 0; index < sessionStorage.length; index += 1) {
    const key = sessionStorage.key(index);
    if (key?.startsWith("dashboard_stories_cache_v1_")) {
      cacheKeys.push(key);
    }
  }

  cacheKeys.forEach((key) => {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed?.storyList)) return;

      parsed.storyList = parsed.storyList.filter(
        (item: { storyId?: string }) => item.storyId !== storyId
      );
      sessionStorage.setItem(key, JSON.stringify(parsed));
    } catch {
      // Ignore invalid cache entries.
    }
  });
};

const StoryItemCard = ({ story, currentUserEmail, onDeleteSuccess }: StoryItemType) => {
  const isOwner = story.userEmail === currentUserEmail;
  const [imgFailed, setImgFailed] = useState(false);
  const { getToken } = useAuth();
  const storyHref = story?.slug ? `/story/${story.slug}` : `/view-story/${story?.storyId}`;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // prevent navigating via <Link>
    try {
      const token = await getToken();
      await apiFetch(`/stories/${story.storyId}`, { method: "DELETE", token });
      toast.success("Story deleted successfully");
      removeStoryFromCachedLists(story.storyId);
      onDeleteSuccess?.(story.storyId);
    } catch {
      toast.error("Failed to delete story");
    }
  };

  return (
    <Link href={storyHref} prefetch={true}>
      <Card
        isFooterBlurred
        radius="lg"
        className="border-none hover:scale-105 transition-all cursor-pointer overflow-hidden"
      >
        {imgFailed || !story?.coverImage ? (
          <div className="flex h-[200px] w-full items-center justify-center bg-slate-100 px-4 text-center text-sm text-slate-600">
            Cover image is unavailable. You can still open and read this story.
          </div>
        ) : (
          <div className="relative h-[200px] w-full">
            <Image
              alt={story?.output?.title ?? "Book cover image"}
              className="object-cover"
              fill
              sizes="(max-width: 1024px) 100vw, 25vw"
              src={story?.coverImage}
              unoptimized
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          </div>
        )}
        <CardFooter className="justify-between bg-white/10 border-white/20 border-1 py-1 absolute rounded-xl w-full bottom-0 shadow-small z-10">
          <p className="text-xl text-black/80 truncate max-w-[80%]">
            {story?.output?.title}
          </p>
          {isOwner ? (
            <Button
              onClick={handleDelete}
              className="text-tiny text-white bg-black/20"
              variant="flat"
              radius="full"
              size="sm"
            >
              Delete
            </Button>
          ) : (
            <Button
              className="text-tiny text-white bg-black/20"
              variant="flat"
              radius="full"
              size="sm"
            >
              Read
            </Button>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
};

export default StoryItemCard;
