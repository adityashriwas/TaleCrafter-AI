"use client";
import { Card, CardFooter } from "@nextui-org/card";
import { Button } from "@nextui-org/react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/config/config";
import { StoryData } from "@/config/schema";
import { eq } from "drizzle-orm";
import { toast } from "react-toastify";
import { useState } from "react";

type StoryItemType = {
  story: {
    id: string;
    storyType: string;
    ageGroup: string;
    storyId: string;
    storySubject: string;
    imageStyle: string;
    coverImage: string;
    userName: string;
    userImage: string;
    userEmail: string;
    output: [] | any;
  };
  currentUserEmail: string; // new prop
  onDeleteSuccess?: (storyId: string) => void;
};

const deleteStoryFromDB = async (storyId: string) => {
  try {
    const result = await db
      .delete(StoryData)
      .where(eq(StoryData.storyId, storyId));

    return result;
  } catch (error) {
    throw new Error("Failed to delete story.");
  }
};

const StoryItemCard = ({ story, currentUserEmail, onDeleteSuccess }: StoryItemType) => {
  const isOwner = story.userEmail === currentUserEmail;
  const [imgFailed, setImgFailed] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // prevent navigating via <Link>
    try {
      await deleteStoryFromDB(story.storyId);
      toast.success("Story deleted successfully");
      onDeleteSuccess?.(story.storyId);
    } catch (error) {
      toast.error("Failed to delete story");
    }
  };

  return (
    <Link href={"/view-story/" + story?.storyId} prefetch={true}>
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
