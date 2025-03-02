"use client";
import { db } from "@/config/config";
import { StoryData } from "@/config/schema";
import { desc } from "drizzle-orm";
import React, { useEffect, useRef, useState } from "react";
import StoryItemCard from "../dashboard/_components/StoryItemCard";
import { Button } from "@nextui-org/button";
import CustomLoader from "./CustomLoader";

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
  const [storyList, setStoryList] = useState<StoryItemType[]>([]);
  const [hasMoreStories, setHasMoreStories] = useState(true); // Track if more stories exist
  const lastStoryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    GetAllStories(0);
  }, []);

  const GetAllStories = async (newOffset: number) => {
    if (!hasMoreStories) return; // Stop fetching if no more stories are available

    setLoading(true);
    setOffset(newOffset);

    const result: any = await db
      .select()
      .from(StoryData)
      .orderBy(desc(StoryData.id))
      .limit(12)
      .offset(newOffset);

    if (result.length < 12) {
      setHasMoreStories(false); // No more stories to load
    }

    setStoryList((prev) => [...(prev || []), ...result]);
    setLoading(false);

    // Keep the previous stories in view while new ones load
    setTimeout(() => {
      if (lastStoryRef.current) {
        lastStoryRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);
  };

  return (
    <div className="min-h-screen p-10 md:px-20 md:py-1 lg:px-40 bg-[#0C0414]">
      <h2 className="font-bold text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl text-primary text-center">
        Explore Stories
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
        {storyList?.map((item: StoryItemType, index: number) => (
          <div key={index} ref={index === storyList.length - 12 ? lastStoryRef : null}>
            <StoryItemCard story={item} />
          </div>
        ))}
      </div>

      {/* Keep loader below the existing stories */}
      {loading && (
        <div className="flex justify-center mt-6">
          <CustomLoader isLoading={loading} />
        </div>
      )}

      {/* Load More Button (Only if more stories exist) */}
      {hasMoreStories ? (
        <div className="text-center mt-10">
          <Button
            onClick={() => {
              GetAllStories(offset + 12);
            }}
            className="mt-5"
            color="primary"
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      ) : (
        // Message when no more stories are available
        <div className="text-center mt-10 text-gray-400">
          <p>🎉 No more stories available! Check back later. 🎉</p>
        </div>
      )}
    </div>
  );
};

export default ExploreMore;
