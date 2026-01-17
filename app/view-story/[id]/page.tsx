"use client";
import { db } from "@/config/config";
import { StoryData } from "@/config/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useRef, useState } from "react";
import BookCoverPage from "../_components/BookCoverPage";
import StoryPages from "../_components/StoryPages";
import HTMLFlipBook from "react-pageflip";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { IoIosArrowDropleftCircle } from "react-icons/io";
import { use } from "react";

function ViewStory({ params }: { params: Promise<{ id: any }> }) {
  const { id } = use(params);
  const bookRef = useRef<typeof HTMLFlipBook | null>(null);
  const [story, setStory] = useState<any>();
  const [count, setCount] = useState(0);
  useEffect(() => {
    // console.log(params.id);
    getStory();
  }, []);

  const getStory = async () => {
    const result = await db
      .select()
      .from(StoryData)
      .where(eq(StoryData.storyId, id));
    // console.log(result[0]);
    setStory(result[0]);
  };

  // share story
  // const storyUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen p-10 md:px-20 lg:px-40 flex items-center bg-gradient-to-br from-black via-[#0a0f25] to-[#071340] justify-evenly flex-col overflow-hidden">
      {/* Images Unavailable Notice */}
      <div className="w-full max-w-4xl mx-auto mb-6">
        <div className="relative overflow-hidden rounded-lg border border-red-500/30 bg-gradient-to-r from-red-500/10 to-pink-500/10 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 2.526a6 6 0 008.367 8.364zm1.414-1.414L2.05 4.05a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-red-200 font-medium">Story images are currently unavailable due to API updates. You can still read the story text.</p>
            </div>
          </div>
        </div>
      </div>
      <h2 className="text-3xl sm:text-4xl text-center py-4 min-w-full rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 shadow block bg-gradient-to-b from-white to-gray-400 bg-clip-text font-bold text-transparent">
        {story?.output?.title}
      </h2>
      {/* @ts-ignore */}
      <HTMLFlipBook
        className="mt-10 max-w-[80vw] sm:max-w-[80vw] md:max-w-[60vw] lg:max-w-[50vw]"
        width={330}
        height={620}
        showCover={true}
        useMouseEvents={false}
        ref={bookRef}
        style={{ height: "auto", maxHeight: "auto" }}
      >
        <div>
          <BookCoverPage imageUrl={story?.coverImage} />
        </div>
        {[...Array(story?.output?.chapters?.length)].map((item, index) => (
          <div key={index} className="bg-white p-4 md:p-5 border">
            <StoryPages
              storyChapter={story?.output?.chapters[index]}
            />
          </div>
        ))}
      </HTMLFlipBook>

      <div className="w-full flex justify-between items-center sm:mt-2 sm:px-40">
        {count != 0 && (
          <div
            className=""
            onClick={() => {
              // @ts-ignore
              bookRef.current.pageFlip().flipPrev();
              setCount(count - 1);
            }}
          >
            <IoIosArrowDropleftCircle className="text-4xl cursor-pointer text-gray-300" />
          </div>
        )}
        {/* <ShareButton storyTitle={story?.output?.title} storyUrl={storyUrl} /> */}

        {count != story?.output.chapters?.length - 1 && (
          <div
            className=""
            onClick={() => {
              // @ts-ignore
              bookRef.current.pageFlip().flipNext();
              setCount(count + 1);
            }}
          >
            <IoIosArrowDroprightCircle className="text-4xl cursor-pointer text-gray-300" />
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewStory;
