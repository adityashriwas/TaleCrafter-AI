"use client";
import { db } from "@/config/config";
import { StoryData } from "@/config/schema";
import { desc } from "drizzle-orm";
import React, { useEffect, useRef, useState } from "react";
import StoryItemCard from "../dashboard/_components/StoryItemCard";
import { Button } from "@nextui-org/button";
import CustomLoader from "./CustomLoader";
import { motion } from "framer-motion";
const MotionDiv: any = motion.div;

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
  const [hasMoreStories, setHasMoreStories] = useState(true);
  const lastStoryRef = useRef<HTMLDivElement | null>(null);

  const fadeUp = {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    GetAllStories(0);
  }, []);

  const GetAllStories = async (newOffset: number) => {
    if (!hasMoreStories) return;

    setLoading(true);
    setOffset(newOffset);

    const result: any = await db
      .select()
      .from(StoryData)
      .orderBy(desc(StoryData.id))
      .limit(12)
      .offset(newOffset);

    if (result.length < 12) {
      setHasMoreStories(false);
    }

    setStoryList((prev) => [...(prev || []), ...result]);
    setLoading(false);

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
    <div className="relative min-h-screen overflow-hidden bg-[#020b1f] px-5 py-8 md:px-16 lg:px-28 xl:px-40">
      <div className="tc-hero-grid absolute inset-0 opacity-35" />
      <div className="tc-hero-orb tc-hero-orb-one" />
      <div className="tc-hero-orb tc-hero-orb-two" />

      <div className="relative">
        <MotionDiv
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.55 }}
          className="rounded-2xl border border-blue-300/20 bg-white/[0.04] px-5 py-7 text-center shadow-[0_16px_45px_rgba(0,0,0,0.35)] backdrop-blur-md md:px-8"
        >
          <h2 className="bg-gradient-to-b from-white via-blue-100 to-blue-300 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl md:text-5xl">
            Explore Stories
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-blue-100/75 md:text-base">
            Discover storybooks created by the community across genres, styles,
            and age groups.
          </p>
        </MotionDiv>

        <MotionDiv
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeUp}
          transition={{ delay: 0.08, duration: 0.5 }}
          className="mt-8 rounded-2xl border border-blue-300/20 bg-white/[0.04] p-5 backdrop-blur-sm md:p-7"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {storyList?.map((item: StoryItemType, index: number) => (
              <div
                key={index}
                ref={index === storyList.length - 12 ? lastStoryRef : null}
              >
                <StoryItemCard story={item} currentUserEmail={""} />
              </div>
            ))}
          </div>
        </MotionDiv>

        {loading && (
          <div className="mt-6 flex justify-center">
            <CustomLoader isLoading={loading} />
          </div>
        )}

        {hasMoreStories ? (
          <div className="mt-8 text-center">
            <Button
              onClick={() => {
                GetAllStories(offset + 12);
              }}
              className="rounded-xl border border-blue-300/30 bg-gradient-to-r from-blue-500 to-cyan-400 px-7 py-6 text-base font-semibold text-white shadow-[0_0_30px_rgba(29,141,255,0.28)] transition hover:scale-[1.02] hover:from-blue-400 hover:to-cyan-300"
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More Stories"}
            </Button>
          </div>
        ) : (
          <div className="mt-10 w-full text-center">
            <p className="inline-flex rounded-xl border border-blue-300/20 bg-white/[0.04] px-5 py-3 text-blue-100/70">
              No more stories available right now. Check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreMore;
