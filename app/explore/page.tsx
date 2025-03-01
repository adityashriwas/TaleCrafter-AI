"use client";
import { db } from "@/config/config";
import { StoryData } from "@/config/schema";
import { desc } from "drizzle-orm";
import { get } from "http";
import React, { useEffect, useState } from "react";
// import type { StoryItemType } from "../dashboard/_components/UserStoryList";
import StoryItemCard from "../dashboard/_components/StoryItemCard";
import { Button } from "@nextui-org/button";
import CustomLoader from "@/app/create-story/(component)/CustomLoader";

type StoryItemType = {
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

const ExploreMore = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [offset, setOffset] = useState(0);
  const [storyList, setStoryList] = useState<StoryItemType[]>();
  useEffect(() => {
    GetAllStories(0);
  }, []);

  const GetAllStories = async (offset: number) => {
    setOffset(offset);
    const result: any = await db
      .select()
      .from(StoryData)
      .orderBy(desc(StoryData.id))
      .limit(12)
      .offset(offset);
    setStoryList((prev) => [...(prev || []), ...result]);
  };

  return (
    <div className="min-h-screen p-10 md:px-20 md:py-1 lg:pd-40 bg-[#0C0414]">
      <h2 className="font-bold text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl text-primary text-center">
        Explore Stories
      </h2>

      {loading ? <CustomLoader /> :(
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
        {storyList?.map((item: StoryItemType, index: number) => (
          <StoryItemCard key={index} story={item} />
        ))}
      </div>)}


      <div className="text-center mt-10">
        <Button
          onClick={() => {
            GetAllStories(offset + 12);
          }}
          className="mt-5"
          color="primary"
        >
          Load More
        </Button>
      </div>
    </div>
  );
};

export default ExploreMore;
