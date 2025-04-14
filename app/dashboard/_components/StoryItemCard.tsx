"use client";
import React from "react";
import { Card, CardFooter } from "@nextui-org/card";
import { Button } from "@nextui-org/react";
import { Image } from "@nextui-org/react";
import Link from "next/link";
import { db } from "@/config/config";
import { StoryData } from "@/config/schema";
import { eq } from "drizzle-orm";
import { toast } from "react-toastify";

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
};

const deleteStoryFromDB = async (storyId: string) => {
  try {
    const result = await db
      .delete(StoryData)
      .where(eq(StoryData.storyId, storyId));

    return result;
  } catch (error) {
    console.error("Error deleting story:", error);
    throw new Error("Failed to delete story.");
  }
};

const StoryItemCard = ({ story, currentUserEmail }: StoryItemType) => {
  const isOwner = story.userEmail === currentUserEmail;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // prevent navigating via <Link>
    try {
      await deleteStoryFromDB(story.storyId);
      toast.success("Story deleted successfully");
    } catch (error) {
      toast.error("Failed to delete story");
    }
  };

  return (
    <Link href={"/view-story/" + story?.storyId}>
      <Card
        isFooterBlurred
        radius="lg"
        className="border-none hover:scale-105 transition-all cursor-pointer overflow-hidden"
      >
        <Image
          alt="BookCoverImage"
          className="object-cover w-full"
          height={200}
          src={story?.coverImage}
          width="100%"
        />
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
