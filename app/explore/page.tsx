"use client";
import { db } from "@/config/config";
import { StoryData } from "@/config/schema";
import { desc } from "drizzle-orm";
import React, { useCallback, useEffect, useRef, useState } from "react";
import StoryItemCard from "../dashboard/_components/StoryItemCard";
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

const PAGE_SIZE = 12;
const CACHE_KEY = "explore_stories_cache_v1";

type ExploreCache = {
  storyList: StoryItemType[];
  offset: number;
  hasMoreStories: boolean;
  scrollY: number;
};

const ExploreMore = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [offset, setOffset] = useState(0);
  const [storyList, setStoryList] = useState<StoryItemType[]>([]);
  const [hasMoreStories, setHasMoreStories] = useState(true);
  const [isRestored, setIsRestored] = useState(false);
  const initializedRef = useRef(false);
  const loadTriggerRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const offsetRef = useRef(0);
  const hasMoreRef = useRef(true);

  const fadeUp = {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0 },
  };

  const persistState = useCallback(
    (scrollY?: number) => {
      try {
        const cache: ExploreCache = {
          storyList,
          offset,
          hasMoreStories,
          scrollY: scrollY ?? window.scrollY ?? 0,
        };
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      } catch {
        // ignore storage failures
      }
    },
    [storyList, offset, hasMoreStories]
  );

  const GetAllStories = useCallback(async (newOffset: number) => {
    if (loadingRef.current || !hasMoreRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setOffset(newOffset);

    try {
      const result: any = await db
        .select()
        .from(StoryData)
        .orderBy(desc(StoryData.id))
        .limit(PAGE_SIZE)
        .offset(newOffset);

      setStoryList((prev) => {
        const merged =
          newOffset === 0 ? result : [...(prev || []), ...(result || [])];
        const uniqueById = new Map<string, StoryItemType>();
        merged.forEach((item: StoryItemType) => {
          uniqueById.set(item.storyId, item);
        });
        return Array.from(uniqueById.values());
      });

      const nextHasMore = result.length >= PAGE_SIZE;
      setHasMoreStories(nextHasMore);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  useEffect(() => {
    hasMoreRef.current = hasMoreStories;
  }, [hasMoreStories]);

  useEffect(() => {
    if (!initializedRef.current) return;
    persistState();
  }, [storyList, offset, hasMoreStories, persistState]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    let restored = false;
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed: ExploreCache = JSON.parse(raw);
        if (Array.isArray(parsed.storyList) && parsed.storyList.length > 0) {
          restored = true;
          setStoryList(parsed.storyList);
          setOffset(parsed.offset ?? 0);
          setHasMoreStories(parsed.hasMoreStories ?? true);
          requestAnimationFrame(() => {
            window.scrollTo({ top: parsed.scrollY ?? 0, behavior: "auto" });
          });
        }
      }
    } catch {
      // ignore invalid cache
    }

    if (!restored) {
      GetAllStories(0);
    }
    setIsRestored(true);

    const onPageHide = () => persistState();
    window.addEventListener("pagehide", onPageHide);
    return () => {
      persistState();
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [GetAllStories, persistState]);

  useEffect(() => {
    if (!isRestored) return;
    const trigger = loadTriggerRef.current;
    if (!trigger) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        if (loadingRef.current || !hasMoreRef.current) return;
        GetAllStories(offsetRef.current + PAGE_SIZE);
      },
      { root: null, rootMargin: "220px 0px", threshold: 0.01 }
    );

    observer.observe(trigger);
    return () => observer.disconnect();
  }, [GetAllStories, isRestored]);

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
            {storyList?.map((item: StoryItemType) => (
              <div key={item.storyId}>
                <StoryItemCard story={item} currentUserEmail={""} />
              </div>
            ))}
          </div>
        </MotionDiv>

        <div ref={loadTriggerRef} className="h-6" />

        {loading && (
          <div className="mt-5 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
          </div>
        )}

        {!hasMoreStories && storyList.length > 0 && (
          <div className="mt-10 w-full text-center">
            <p className="inline-flex rounded-xl border border-blue-300/20 bg-white/[0.04] px-5 py-3 text-blue-100/70">
              No more stories available right now. Check back later.
            </p>
          </div>
        )}

        {!loading && storyList.length === 0 && (
          <div className="mt-10 w-full text-center">
            <p className="inline-flex rounded-xl border border-blue-300/20 bg-white/[0.04] px-5 py-3 text-blue-100/70">
              No stories found yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreMore;
