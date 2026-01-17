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
        lastStoryRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 300);
  };

  return (
    <div className="min-h-screen p-10 md:px-20 md:py-1 lg:px-40 bg-gradient-to-br from-black via-[#0a0f25] to-[#071340] flex flex-col">
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl block w-full bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-transparent text-center mb-4">
        Explore Stories
      </h2>

      {/* Image Unavailability Notice */}
      <div className="w-full max-w-4xl mx-auto mb-8 mt-4">
        <div className="relative overflow-hidden rounded-lg border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-yellow-200 font-medium">⚠️ Story images are currently unavailable due to API updates. Text content is still accessible.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8 flex-1">
        {storyList?.length > 0 ? (
          storyList?.map((item: StoryItemType, index: number) => (
            <div
              key={index}
              ref={index === storyList.length - 12 ? lastStoryRef : null}
            >
              <StoryItemCard story={item} currentUserEmail={""} />
            </div>
          ))
        ) : !loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16">
            <svg className="h-16 w-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C6.5 6.253 2 9.88 2 15.5S6.5 24.747 12 24.747s10-3.627 10-9.247S17.5 6.253 12 6.253z" />
            </svg>
            <p className="text-gray-400 text-lg">No stories available yet</p>
            <p className="text-gray-500 text-sm mt-1">Stories will appear here as creators share their works</p>
          </div>
        ) : null}
      </div>

      {/* Keep loader below the existing stories */}
      {loading && (
        <div className="flex justify-center mt-6">
          <CustomLoader isLoading={loading} />
        </div>
      )}

      {/* Load More Button (Only if more stories exist) */}
      {storyList?.length > 0 && hasMoreStories ? (
        <div className="text-center mt-10">
          <Button
            onClick={() => {
              GetAllStories(offset + 12);
            }}
            className="m-5 bg-gray-800 text-white shadow-md hover:bg-gray-700 transition"
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      ) : storyList?.length > 0 && !hasMoreStories ? (
        // Message when no more stories are available
        <div className="text-center w-full mt-10 text-gray-400">
          <p className="text-lg">✨ You've explored all available stories! ✨</p>
          <p className="text-sm text-gray-500 mt-2">Check back soon for more creative content</p>
        </div>
      ) : null}
    </div>
  );
};

export default ExploreMore;
