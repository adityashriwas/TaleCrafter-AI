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
import { toast } from "react-toastify";

function ViewStory({ params }: { params: Promise<{ id: any }> }) {
  const { id } = use(params);
  const bookRef = useRef<typeof HTMLFlipBook | null>(null);
  const [story, setStory] = useState<any>();
  const [count, setCount] = useState(0);
  const chapters = story?.output?.chapters ?? [];
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getStory();
  }, []);

  const getStory = async () => {
    const result = await db
      .select()
      .from(StoryData)
      .where(eq(StoryData.storyId, id));
    setStory(result[0]);
  };

  const onShareStory = async () => {
    const storyUrl = typeof window !== "undefined" ? window.location.href : "";
    const storyTitle = story?.output?.title || "TaleCrafter Story";

    if (!storyUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: storyTitle,
          text: `Check out this story: ${storyTitle}`,
          url: storyUrl,
        });
      } catch {
        // user cancelled share flow
      }
      return;
    }

    await navigator.clipboard.writeText(storyUrl);
    setCopied(true);
    toast("Story link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020b1f] px-5 py-8 md:px-16 lg:px-28 xl:px-40">
      <div className="tc-hero-grid absolute inset-0 opacity-35" />
      <div className="tc-hero-orb tc-hero-orb-one" />
      <div className="tc-hero-orb tc-hero-orb-two" />

      <div className="relative">
        <div className="rounded-2xl border border-blue-300/20 bg-white/[0.04] px-5 py-6 text-center shadow-[0_16px_45px_rgba(0,0,0,0.35)] backdrop-blur-md md:px-8">
          <h2 className="bg-gradient-to-b from-white via-blue-100 to-blue-300 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl md:text-5xl">
            {story?.output?.title ?? "Loading story..."}
          </h2>
          <p className="mt-2 text-sm text-blue-100/75 md:text-base">
            Flip through chapters and listen with narration controls.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center">
          {/* @ts-ignore */}
          <HTMLFlipBook
            className="max-w-[84vw] md:max-w-[62vw] lg:max-w-[48vw]"
            width={330}
            height={620}
            showCover={true}
            useMouseEvents={false}
            ref={bookRef}
            style={{ height: "auto", maxHeight: "auto" }}
          >
            <div className="p-0">
              <BookCoverPage imageUrl={story?.coverImage} />
            </div>
            {chapters.map((chapter: any, index: number) => (
              <div key={index} className="bg-white p-4 md:p-5">
                <StoryPages storyChapter={chapter} />
              </div>
            ))}
          </HTMLFlipBook>
        </div>

        <div className="mt-7 flex w-full items-center justify-between">
          <button
            className={`rounded-xl border border-blue-300/20 bg-white/10 p-2 text-blue-100 transition hover:bg-white/20 ${
              count <= 0 ? "pointer-events-none opacity-40" : ""
            }`}
            onClick={() => {
              if (count <= 0) return;
              // @ts-ignore
              bookRef.current?.pageFlip().flipPrev();
              setCount((prev) => prev - 1);
            }}
            aria-label="Previous page"
          >
            <IoIosArrowDropleftCircle className="text-4xl" />
          </button>

          <button
            onClick={onShareStory}
            className="rounded-xl border border-blue-300/30 bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-2 text-sm font-semibold text-white transition hover:from-blue-400 hover:to-cyan-300"
          >
            {copied ? "Link Copied!" : "Share Story"}
          </button>

          <button
            className={`rounded-xl border border-blue-300/20 bg-white/10 p-2 text-blue-100 transition hover:bg-white/20 ${
              count >= chapters.length ? "pointer-events-none opacity-40" : ""
            }`}
            onClick={() => {
              if (count >= chapters.length) return;
              // @ts-ignore
              bookRef.current?.pageFlip().flipNext();
              setCount((prev) => prev + 1);
            }}
            aria-label="Next page"
          >
            <IoIosArrowDroprightCircle className="text-4xl" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewStory;
